import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDreamVisual } from '@/lib/ai/image-generation';
import { getImageQuota, recordImageGeneration } from '@/lib/billing/access';
import {
  dreamHasStoredImage,
  dreamImageProxyPath,
  resolveDreamImageUrl,
  uploadDreamImage,
} from '@/lib/storage/dream-images';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limited = rateLimit(`ai:image:${user.id}`, { limit: 10, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many image requests. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    const body = await request.json();
    const { dreamId, content, title, mood, forceRegenerate } = body;
    const wantsRegenerate = Boolean(forceRegenerate);

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Dream content is required' }, { status: 400 });
    }

    if (!dreamId || typeof dreamId !== 'string') {
      return NextResponse.json(
        { error: 'dreamId is required to store a dream image' },
        { status: 400 }
      );
    }

    let existing: {
      id: string;
      image_url?: string | null;
      image_path?: string | null;
      ai_analysis?: Record<string, unknown> | null;
      image_generation_count?: number | null;
    } | null = null;

    const { data: dreamWithColumns, error: colError } = await supabase
      .from('dreams')
      .select('id, image_url, image_path, ai_analysis, image_generation_count')
      .eq('id', dreamId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!colError && dreamWithColumns) {
      existing = dreamWithColumns;
    } else {
      // Fall back to base columns guaranteed in initial schema
      const { data: baseDream, error: baseError } = await supabase
        .from('dreams')
        .select('id, ai_analysis')
        .eq('id', dreamId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (baseError || !baseDream) {
        console.error('Dream lookup failed in generate-image:', baseError || 'No record found');
        return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
      }

      const analysisObj = (baseDream.ai_analysis as Record<string, unknown>) || {};
      existing = {
        id: baseDream.id,
        image_url: (analysisObj.image_url as string) || null,
        image_path: (analysisObj.image_path as string) || null,
        ai_analysis: analysisObj,
        image_generation_count:
          typeof analysisObj.image_generation_count === 'number'
            ? analysisObj.image_generation_count
            : 0,
      };
    }

    const dreamAlreadyHasImage = dreamHasStoredImage(existing);

    const quota = await getImageQuota(supabase, user.id, {
      isRegenerate: wantsRegenerate && dreamAlreadyHasImage,
      dreamAlreadyHasImage,
    });

    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            quota.reason === 'regeneration_not_allowed'
              ? 'Image regeneration is available on Pro'
              : 'Image generation limit reached for your plan',
          isQuotaExceeded: true,
          reason: quota.reason,
          limit: quota.limit,
          used: quota.used,
          remaining: quota.remaining,
          plan_tier: quota.planTier,
          kind: quota.kind,
        },
        { status: 403 }
      );
    }

    // Attempt to mark generating (non-blocking if column not yet migrated)
    try {
      await supabase
        .from('dreams')
        .update({ image_status: 'generating', updated_at: new Date().toISOString() })
        .eq('id', dreamId)
        .eq('user_id', user.id);
    } catch {
      // Non-fatal if image_status column does not exist
    }

    try {
      const visualResult = await generateDreamVisual(content, title, mood);

      let path: string | null = null;
      let displayUrl: string;
      const generatedAt = new Date().toISOString();
      const nextCount = (existing.image_generation_count || 0) + 1;

      try {
        const uploadResult = await uploadDreamImage(supabase, {
          userId: user.id,
          dreamId,
          bytes: visualResult.bytes,
          mimeType: visualResult.mimeType,
          previousPath: existing.image_path,
        });
        path = uploadResult.path;
        displayUrl = resolveDreamImageUrl({
          id: dreamId,
          image_path: path,
          image_generation_count: nextCount,
          image_generated_at: generatedAt,
        }) || dreamImageProxyPath(dreamId);
      } catch (storageErr) {
        console.warn('Storage upload fallback to data URL:', storageErr);
        const b64 = Buffer.from(visualResult.bytes).toString('base64');
        displayUrl = `data:${visualResult.mimeType};base64,${b64}`;
      }

      // Persist metadata
      const existingAnalysis = (existing.ai_analysis as Record<string, unknown>) || {};
      const { image_url: _legacyBlob, ...analysisWithoutBlob } = existingAnalysis as Record<
        string,
        unknown
      > & { image_url?: unknown };
      void _legacyBlob;

      const updatedAnalysis = {
        ...analysisWithoutBlob,
        image_url: displayUrl,
        image_status: 'completed',
        image_prompt: visualResult.prompt,
        image_generated_at: generatedAt,
        image_path: path,
        image_generation_count: nextCount,
      };

      const fullPayload: Record<string, unknown> = {
        ai_analysis: updatedAnalysis,
        image_url: displayUrl.startsWith('data:') ? displayUrl : dreamImageProxyPath(dreamId),
        image_path: path,
        image_status: 'completed',
        image_prompt: visualResult.prompt,
        image_generated_at: generatedAt,
        image_generation_count: nextCount,
        updated_at: generatedAt,
      };

      const { error: updateError } = await supabase
        .from('dreams')
        .update(fullPayload)
        .eq('id', dreamId)
        .eq('user_id', user.id);

      if (updateError) {
        // Fall back to ai_analysis JSON column if dedicated image columns are not yet in database
        console.warn('Column update fallback to ai_analysis:', updateError.message);
        const { error: fallbackUpdateError } = await supabase
          .from('dreams')
          .update({
            ai_analysis: updatedAnalysis,
            updated_at: generatedAt,
          })
          .eq('id', dreamId)
          .eq('user_id', user.id);

        if (fallbackUpdateError) {
          throw new Error(fallbackUpdateError.message || 'Failed to save image metadata');
        }
      }

      await recordImageGeneration(supabase, user.id, quota.planTier);

      return NextResponse.json({
        success: true,
        imageUrl: displayUrl,
        imagePath: path,
        structuredScene: visualResult.structuredScene,
        prompt: visualResult.prompt,
        quota: {
          plan_tier: quota.planTier,
          kind: quota.kind,
          used: quota.used + (quota.kind === 'monthly' ? 1 : 0),
          limit: quota.limit,
          remaining: Math.max(
            0,
            quota.remaining - (quota.kind === 'monthly' ? 1 : dreamAlreadyHasImage ? 0 : 1)
          ),
        },
      });
    } catch (genError) {
      console.error(
        'Visual generation failed:',
        genError instanceof Error ? genError.message : 'unknown'
      );

      // Keep prior image on failure; attempt status flip without throwing
      try {
        await supabase
          .from('dreams')
          .update({
            image_status: dreamAlreadyHasImage ? 'completed' : 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', dreamId)
          .eq('user_id', user.id);
      } catch {
        // Ignore column update error on failure
      }

      return NextResponse.json(
        {
          error: 'Failed to generate visual memory',
          message: genError instanceof Error ? genError.message : 'Unknown generation failure',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Image API error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Server error processing dream image' }, { status: 500 });
  }
}

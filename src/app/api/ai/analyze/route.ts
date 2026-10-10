import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { processDreamAnalysis } from '@/lib/ai/process-dream-analysis';
import { analyzeDream } from '@/lib/ai/analyze-dream';
import { getAiQuota, recordAiOperation } from '@/lib/billing';

// POST /api/ai/analyze - Analyze a dream with AI
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

    const limited = rateLimit(`ai:analyze:${user.id}`, {
      limit: 20,
      windowMs: 60_000,
    });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many analysis requests. Please wait a moment.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limited.retryAfterSec) },
        }
      );
    }

    const body = await request.json();
    const { dreamId, content, dream_date, mood, lucidity, rawTranscript, force } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Dream content is required' },
        { status: 400 }
      );
    }

    // If an existing dream record ID is provided, delegate to unified processing pipeline
    if (dreamId) {
      const result = await processDreamAnalysis(
        supabase,
        user.id,
        dreamId,
        content,
        {
          dreamDate: dream_date,
          mood,
          lucidity,
          rawTranscript,
          force: Boolean(force),
        }
      );

      if (!result.success) {
        return NextResponse.json(
          {
            error: result.error || 'Failed to analyze dream',
            code: result.code,
            isQuotaExceeded: result.isQuotaExceeded,
            ...result.quota,
          },
          { status: result.isQuotaExceeded ? 403 : 500 }
        );
      }

      return NextResponse.json(result);
    }

    // Fallback for draft/unpersisted preview:
    const quota = await getAiQuota(supabase, user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            'Monthly AI reflection allowance reached. Upgrade to Pro for 100 reflections/month and deep pattern analysis.',
          code: 'quota_exceeded',
          isQuotaExceeded: true,
          limit: quota.limit,
          used: quota.used,
          remaining: quota.remaining,
          planTier: quota.planTier,
        },
        { status: 403 }
      );
    }

    const analysis = await analyzeDream(
      content,
      dream_date || new Date().toISOString().split('T')[0],
      mood || 'neutral',
      lucidity || 'not_sure',
      undefined,
      rawTranscript
    );

    await recordAiOperation(supabase, user.id);

    return NextResponse.json({
      analysis,
      entities: analysis.entities || [],
      quota: {
        used: quota.used + 1,
        limit: quota.limit,
        remaining: Math.max(0, quota.remaining - 1),
        planTier: quota.planTier,
      },
    });
  } catch (error) {
    console.error('AI analysis route error:', error);
    const message =
      error instanceof Error ? error.message : 'AI analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

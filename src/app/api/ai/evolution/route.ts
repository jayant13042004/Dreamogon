import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeDreamEvolution } from '@/lib/ai/evolution';
import { rateLimit } from '@/lib/rate-limit';
import { getAiQuota, recordAiOperation } from '@/lib/billing';
import type { DreamEvolutionAnalysis } from '@/types/ai';

const EVOLUTION_INSIGHT_TITLE = 'dream_evolution_analysis';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // 1. Fetch count of user dreams
    const { count: dreamCount } = await supabase
      .from('dreams')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const totalDreams = dreamCount || 0;

    if (totalDreams < 3) {
      return NextResponse.json({
        available: false,
        totalDreams,
        message: 'Record at least 3 dreams in your archive to unlock temporal evolution analysis.',
      });
    }

    // 2. Check for cached insight if not forcing refresh
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('dream_insights')
        .select('id, description, created_at')
        .eq('user_id', user.id)
        .eq('title', EVOLUTION_INSIGHT_TITLE)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cached && cached.description) {
        try {
          const parsed = JSON.parse(cached.description) as DreamEvolutionAnalysis;
          // If cached when dream count was identical, use it
          if (parsed.totalDreamsAnalyzed === totalDreams) {
            return NextResponse.json({
              available: true,
              analysis: parsed,
              cached: true,
            });
          }
        } catch {
          // invalid cache, will regenerate
        }
      }
    }

    // 3. Rate limit and quota check for generating fresh analysis
    const limited = rateLimit(`ai:evolution:${user.id}`, { limit: 10, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    const quota = await getAiQuota(supabase, user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: 'Monthly AI allowance reached. Upgrade to Pro for deeper archive evolution analysis.',
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

    // 4. Fetch all dreams & artifacts for this user
    const [dreamsRes, artifactsRes] = await Promise.all([
      supabase
        .from('dreams')
        .select('id, title, content, dream_date, mood, lucidity, ai_themes, ai_symbols, ai_summary')
        .eq('user_id', user.id)
        .order('dream_date', { ascending: true }),
      supabase
        .from('dream_artifacts')
        .select('name, artifact_type, appearance_count, first_seen_at, last_seen_at')
        .eq('user_id', user.id)
        .order('appearance_count', { ascending: false })
        .limit(20)
    ]);

    const dreams = dreamsRes.data || [];
    const artifacts = artifactsRes.data || [];

    if (dreams.length < 3) {
      return NextResponse.json({
        available: false,
        totalDreams: dreams.length,
        message: 'Record at least 3 dreams in your archive to unlock temporal evolution analysis.',
      });
    }

    // 5. Generate Evolution Analysis
    const analysis = await analyzeDreamEvolution(dreams, artifacts);

    await recordAiOperation(supabase, user.id);

    // 6. Cache or update into dream_insights
    const relatedDreamIds = dreams.slice(-10).map((d) => d.id);

    const { data: existingInsight } = await supabase
      .from('dream_insights')
      .select('id')
      .eq('user_id', user.id)
      .eq('title', EVOLUTION_INSIGHT_TITLE)
      .maybeSingle();

    if (existingInsight) {
      await supabase
        .from('dream_insights')
        .update({
          description: JSON.stringify(analysis),
          related_dream_ids: relatedDreamIds,
          created_at: new Date().toISOString(),
        })
        .eq('id', existingInsight.id);
    } else {
      await supabase.from('dream_insights').insert({
        user_id: user.id,
        title: EVOLUTION_INSIGHT_TITLE,
        description: JSON.stringify(analysis),
        related_dream_ids: relatedDreamIds,
        is_pro_locked: false,
      });
    }

    return NextResponse.json({
      available: true,
      analysis,
      cached: false,
    });
  } catch (error) {
    console.error('Error generating dream evolution:', error);
    const msg = error instanceof Error ? error.message : 'Failed to analyze dream evolution';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Reuse the fresh generation flow
  return GET(new NextRequest(new URL(`${request.url}?refresh=true`), { headers: request.headers }));
}

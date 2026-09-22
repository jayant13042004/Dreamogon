import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeDreamPatterns } from '@/lib/ai/analyze-patterns';
import { getAiQuota, recordAiOperation } from '@/lib/billing';

// POST /api/ai/patterns - Analyze patterns across dreams
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quota = await getAiQuota(supabase, user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: 'Monthly AI allowance reached. Upgrade to Pro for 100 monthly operations and deep cross-dream pattern synthesis.',
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

    // Fetch all user's dreams
    const { data: dreams, error } = await supabase
      .from('dreams')
      .select('title, content, dream_date, mood, ai_themes, ai_emotions')
      .eq('user_id', user.id)
      .order('dream_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch dreams' }, { status: 500 });
    }

    if (!dreams || dreams.length < 3) {
      return NextResponse.json({
        error: 'Need at least 3 dreams for pattern analysis',
        insufficient: true,
      }, { status: 400 });
    }

    const dreamData = dreams.map(d => ({
      title: d.title,
      content: d.content.substring(0, 300),
      date: d.dream_date,
      mood: d.mood || 'neutral',
      ai_themes: d.ai_themes || undefined,
      ai_emotions: d.ai_emotions || undefined,
    }));

    const patterns = await analyzeDreamPatterns(dreamData);

    await recordAiOperation(supabase, user.id);

    return NextResponse.json({
      patterns,
      quota: {
        used: quota.used + 1,
        limit: quota.limit,
        remaining: Math.max(0, quota.remaining - 1),
        planTier: quota.planTier,
      },
    });
  } catch (error) {
    console.error('Pattern analysis error:', error);
    const message = error instanceof Error ? error.message : 'Pattern analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chatWithDreamHistory } from '@/lib/ai/chat';
import { rateLimit } from '@/lib/rate-limit';
import { getAiQuota, recordAiOperation } from '@/lib/billing';

// POST /api/ai/chat - Fast Dream Companion Chat
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limited = rateLimit(`ai:chat:${user.id}`, { limit: 30, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many chat messages. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    const quota = await getAiQuota(supabase, user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: 'Monthly AI Guide allowance reached. Upgrade to Pro for 100 monthly operations and deeper archive exploration.',
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

    const body = await request.json();
    const { message, history, conversationHistory } = body;
    const rawHistory = history || conversationHistory || [];

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch compact recent dream history
    const { data: dreams } = await supabase
      .from('dreams')
      .select('id, title, content, dream_date, mood, ai_themes, ai_summary')
      .eq('user_id', user.id)
      .order('dream_date', { ascending: false })
      .limit(15);

    const dreamContext = (dreams || []).map(d => ({
      id: d.id,
      title: d.title || 'Untitled Dream',
      content: d.content || '',
      date: d.dream_date || '',
      mood: d.mood || 'neutral',
      themes: d.ai_themes || [],
      summary: d.ai_summary || '',
    }));

    // Generate fast AI response
    const result = await chatWithDreamHistory(
      message,
      dreamContext,
      rawHistory
    );

    await recordAiOperation(supabase, user.id);

    // Save chat history asynchronously in background
    supabase.from('chat_messages').insert([
      {
        user_id: user.id,
        role: 'user',
        content: message,
        dream_references: [],
      },
      {
        user_id: user.id,
        role: 'assistant',
        content: result.response,
        dream_references: result.dreamReferences,
      },
    ]).then(({ error }) => {
      if (error) console.error('Background message save error:', error);
    });

    return NextResponse.json({
      response: result.response,
      reply: result.response,
      dreamReferences: result.dreamReferences,
      quota: {
        used: quota.used + 1,
        limit: quota.limit,
        remaining: Math.max(0, quota.remaining - 1),
        planTier: quota.planTier,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Chat failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

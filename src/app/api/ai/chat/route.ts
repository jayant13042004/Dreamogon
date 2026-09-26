import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chatWithDreamHistory, DreamContext, ArchiveContextMeta } from '@/lib/ai/chat';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { rateLimit } from '@/lib/rate-limit';
import { getAiQuota, recordAiOperation } from '@/lib/billing';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'about', 'and', 'or',
  'is', 'was', 'were', 'am', 'are', 'be', 'been', 'my', 'me', 'i', 'you', 'your',
  'did', 'do', 'does', 'have', 'had', 'has', 'what', 'when', 'why', 'how', 'where', 'who',
  'tell', 'show', 'any', 'ever', 'dream', 'dreams', 'dreamed', 'dreamt', 'night',
  'journal', 'log', 'subconscious', 'remember', 'recall', 'last', 'first',
  'recurring', 'recur', 'frequent', 'many', 'much', 'often', 'time', 'times', 'like', 'can'
]);

function extractKeywords(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    )
  );
}

// POST /api/ai/chat - Grounded Dream Archive Memory Chat
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

    // 1. Fetch User Archive Metadata & Boundaries
    const [countRes, earliestRes, latestRes, artifactsRes] = await Promise.all([
      supabase
        .from('dreams')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('dreams')
        .select('dream_date')
        .eq('user_id', user.id)
        .order('dream_date', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('dreams')
        .select('dream_date')
        .eq('user_id', user.id)
        .order('dream_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('dream_artifacts')
        .select('name, artifact_type, appearance_count')
        .eq('user_id', user.id)
        .order('appearance_count', { ascending: false })
        .limit(8)
    ]);

    const totalCount = countRes.count || 0;
    const earliestDate = earliestRes.data?.dream_date;
    const latestDate = latestRes.data?.dream_date;
    const topArtifacts = (artifactsRes.data || []).map((a) => ({
      name: a.name,
      type: a.artifact_type,
      count: a.appearance_count,
    }));

    if (totalCount === 0) {
      return NextResponse.json({
        response: "Your Subconscious Log archive is currently empty. Record your first dream in the morning to begin uncovering patterns, recurring symbols, and temporal connections.",
        reply: "Your Subconscious Log archive is currently empty. Record your first dream in the morning to begin uncovering patterns, recurring symbols, and temporal connections.",
        dreamReferences: [],
        provenance: {
          totalArchiveSearched: 0,
          matchedCount: 0,
        },
      });
    }

    // 2. Multi-strategy Grounded Retrieval
    const candidateIds = new Set<string>();
    const keywords = extractKeywords(message);
    const lowerMsg = message.toLowerCase();

    // A. Semantic Vector Search
    try {
      const queryVec = await generateEmbedding(message);
      const { data: vectorMatches } = await supabase.rpc('match_dreams', {
        query_embedding: queryVec,
        match_threshold: 0.35,
        match_count: 10,
        p_user_id: user.id,
      });

      if (vectorMatches) {
        vectorMatches.forEach((m: { id: string }) => candidateIds.add(m.id));
      }
    } catch (embErr) {
      console.warn('Semantic search fallback in chat route:', embErr);
    }

    // B. Entity & Keyword Search
    let keywordFoundAny = false;
    if (keywords.length > 0) {
      // Check dream_entities for specific names
      const { data: entityMatches } = await supabase
        .from('dream_entities')
        .select('dream_id, entity_name')
        .eq('user_id', user.id)
        .in('entity_name', keywords)
        .limit(20);

      if (entityMatches && entityMatches.length > 0) {
        keywordFoundAny = true;
        entityMatches.forEach((e) => candidateIds.add(e.dream_id));
      }

      // Check title and content matches
      for (const kw of keywords.slice(0, 3)) {
        const { data: textMatches } = await supabase
          .from('dreams')
          .select('id')
          .eq('user_id', user.id)
          .or(`title.ilike.%${kw}%,content.ilike.%${kw}%`)
          .limit(8);

        if (textMatches && textMatches.length > 0) {
          keywordFoundAny = true;
          textMatches.forEach((t) => candidateIds.add(t.id));
        }
      }
    }

    // C. Temporal Intent Search (Oldest vs Recent)
    const asksOldest = /\b(first|earliest|oldest|beginning|started|start)\b/.test(lowerMsg);
    const asksLatest = /\b(last|latest|recent|newest|yesterday)\b/.test(lowerMsg);

    if (asksOldest) {
      const { data: oldestDreams } = await supabase
        .from('dreams')
        .select('id')
        .eq('user_id', user.id)
        .order('dream_date', { ascending: true })
        .limit(4);
      oldestDreams?.forEach((d) => candidateIds.add(d.id));
    }

    if (asksLatest || candidateIds.size === 0) {
      const { data: recentDreams } = await supabase
        .from('dreams')
        .select('id')
        .eq('user_id', user.id)
        .order('dream_date', { ascending: false })
        .limit(8);
      recentDreams?.forEach((d) => candidateIds.add(d.id));
    }

    // 3. Fetch Full Details for Candidates
    const { data: retrievedDreams } = await supabase
      .from('dreams')
      .select('id, title, content, dream_date, mood, ai_themes, ai_summary')
      .eq('user_id', user.id)
      .in('id', Array.from(candidateIds))
      .order('dream_date', { ascending: false })
      .limit(18);

    const dreamContext: DreamContext[] = (retrievedDreams || []).map((d) => ({
      id: d.id,
      title: d.title || 'Untitled Dream',
      content: d.content || '',
      date: d.dream_date || '',
      mood: d.mood || 'neutral',
      themes: d.ai_themes || [],
      summary: d.ai_summary || '',
    }));

    // Detect negative search scenario: user searched for specific keywords but none were found in archive
    const isSubjectQuery = /\b(when|have|did|show|any|seen|search|find|about)\b/.test(lowerMsg);
    const zeroMatchesFound = keywords.length > 0 && !keywordFoundAny && isSubjectQuery;

    const archiveMeta: ArchiveContextMeta = {
      totalCount,
      earliestDate: earliestDate || undefined,
      latestDate: latestDate || undefined,
      searchedTopic: keywords.length > 0 ? keywords.join(', ') : undefined,
      zeroMatchesFound,
      topRecurringArtifacts: topArtifacts,
    };

    // 4. Generate Grounded AI Response
    const result = await chatWithDreamHistory(
      message,
      dreamContext,
      rawHistory,
      archiveMeta
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
        dream_references: result.dreamReferences.map((r) => r.id),
      },
    ]).then(({ error }) => {
      if (error) console.error('Background message save error:', error);
    });

    const provenance = {
      totalArchiveSearched: totalCount,
      earliestDate: earliestDate || undefined,
      latestDate: latestDate || undefined,
      matchedCount: dreamContext.length,
    };

    return NextResponse.json({
      response: result.response,
      reply: result.response,
      dreamReferences: result.dreamReferences,
      provenance,
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

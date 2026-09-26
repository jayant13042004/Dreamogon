import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { sanitizePostgrestSearch } from '@/lib/utils/search';

// POST /api/dreams/search - Semantic + text search
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, limit = 10 } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const sanitizedQuery = sanitizePostgrestSearch(query);

    // Try semantic search first
    let semanticResults: Array<Record<string, unknown>> = [];
    try {
      const embedding = await generateEmbedding(query);
      const { data } = await supabase.rpc('match_dreams', {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: limit,
        p_user_id: user.id,
      });
      semanticResults = data || [];
    } catch (embeddingError) {
      console.error('Semantic search failed, falling back to text search:', embeddingError);
    }

    // Also do text search as fallback/supplement
    let textResults: Array<Record<string, unknown>> = [];
    if (sanitizedQuery.length > 0) {
      const { data: matchedText } = await supabase
        .from('dreams')
        .select('id, title, content, dream_date, mood, ai_summary, ai_themes')
        .eq('user_id', user.id)
        .or(`title.ilike.%${sanitizedQuery}%,content.ilike.%${sanitizedQuery}%,ai_summary.ilike.%${sanitizedQuery}%`)
        .order('dream_date', { ascending: false })
        .limit(limit);
      textResults = matchedText || [];
    }

    // Merge results, preferring semantic matches
    const seenIds = new Set<string>();
    const mergedResults: Array<Record<string, unknown>> = [];

    for (const result of semanticResults) {
      const id = result.id as string;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        mergedResults.push({ ...result, matchType: 'semantic' });
      }
    }

    for (const result of (textResults || [])) {
      const id = String(result.id);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        mergedResults.push({ ...result, matchType: 'text', similarity: 0 });
      }
    }

    return NextResponse.json({
      results: mergedResults.slice(0, limit),
      total: mergedResults.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

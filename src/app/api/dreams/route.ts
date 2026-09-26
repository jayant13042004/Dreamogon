import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveDreamImageUrl } from '@/lib/storage/dream-images';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { sanitizePostgrestSearch } from '@/lib/utils/search';

// GET /api/dreams - List user's dreams
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const mood = searchParams.get('mood');
    const lucidity = searchParams.get('lucidity');
    const theme = searchParams.get('theme');
    const entityType = searchParams.get('entityType');
    const entityName = searchParams.get('entityName');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'dream_date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const offset = (page - 1) * limit;

    // Optional entity filter → constrain dream IDs first
    let entityDreamIds: string[] | null = null;
    if (entityType && entityName) {
      const { data: entityRows, error: entityError } = await supabase
        .from('dream_entities')
        .select('dream_id')
        .eq('user_id', user.id)
        .eq('entity_type', entityType)
        .ilike('entity_name', entityName);

      if (entityError) {
        console.error('Error filtering entities');
        return NextResponse.json({ error: 'Failed to fetch dreams' }, { status: 500 });
      }

      entityDreamIds = [...new Set((entityRows || []).map((r) => r.dream_id))];
      if (entityDreamIds.length === 0) {
        return NextResponse.json({
          dreams: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        });
      }
    }

    let query = supabase
      .from('dreams')
      .select('*, dream_tags(tag), dream_entities(id, entity_type, entity_name, confidence)', {
        count: 'exact',
      })
      .eq('user_id', user.id);

    if (entityDreamIds) {
      query = query.in('id', entityDreamIds);
    }

    if (mood) {
      query = query.eq('mood', mood);
    }

    if (lucidity) {
      query = query.eq('lucidity', lucidity);
    }

    if (theme) {
      query = query.contains('ai_themes', [theme]);
    }

    if (search && search.trim().length > 0) {
      const sanitizedSearch = sanitizePostgrestSearch(search);
      let semanticIds: string[] = [];
      try {
        const queryEmbedding = await generateEmbedding(search.trim());
        const { data: semData } = await supabase.rpc('match_dreams', {
          query_embedding: queryEmbedding,
          match_threshold: 0.38,
          match_count: 40,
          p_user_id: user.id,
        });
        if (semData && semData.length > 0) {
          semanticIds = semData.map((r: any) => r.id);
        }
      } catch (embErr) {
        console.warn('Semantic vector search fallback in list query:', embErr);
      }

      if (sanitizedSearch && semanticIds.length > 0) {
        query = query.or(
          `title.ilike.%${sanitizedSearch}%,content.ilike.%${sanitizedSearch}%,ai_summary.ilike.%${sanitizedSearch}%,id.in.(${semanticIds.join(',')})`
        );
      } else if (sanitizedSearch) {
        query = query.or(
          `title.ilike.%${sanitizedSearch}%,content.ilike.%${sanitizedSearch}%,ai_summary.ilike.%${sanitizedSearch}%`
        );
      } else if (semanticIds.length > 0) {
        query = query.in('id', semanticIds);
      }
    }

    if (startDate) {
      query = query.gte('dream_date', startDate);
    }

    if (endDate) {
      query = query.lte('dream_date', endDate);
    }

    const validSortColumns = ['dream_date', 'created_at', 'title', 'mood'];
    const column = validSortColumns.includes(sortBy) ? sortBy : 'dream_date';
    const ascending = sortOrder === 'asc';

    query = query.order(column, { ascending }).range(offset, offset + limit - 1);

    const { data: dreams, error, count } = await query;

    if (error) {
      console.error('Error fetching dreams:', error);
      return NextResponse.json({ error: 'Failed to fetch dreams' }, { status: 500 });
    }

    const resolvedDreams = (dreams || []).map((d: any) => ({
      ...d,
      image_url: resolveDreamImageUrl(d),
    }));

    return NextResponse.json({
      dreams: resolvedDreams,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/dreams - Create a new dream
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, dream_date, date, mood, lucidity, tags } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Dream content is required' }, { status: 400 });
    }

    const finalDate = dream_date || date || new Date().toISOString().split('T')[0];

    const cleanContent = content.trim();
    const finalTitle = (title && title.trim().length > 0)
      ? title.trim()
      : (() => {
          const firstSentence = cleanContent.split(/[.!?\n]/)[0].trim();
          if (firstSentence && firstSentence.length >= 4 && firstSentence.length <= 50) {
            return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
          }
          const words = cleanContent.split(/\s+/).slice(0, 6).join(' ');
          if (words.length >= 3) {
            const formatted = words.charAt(0).toUpperCase() + words.slice(1);
            return formatted.length < cleanContent.length ? `${formatted}…` : formatted;
          }
          return `Dream · ${finalDate}`;
        })();

    // Create the dream
    const { data: dream, error } = await supabase
      .from('dreams')
      .insert({
        user_id: user.id,
        title: finalTitle,
        content: cleanContent,
        dream_date: finalDate,
        mood: mood || null,
        lucidity: lucidity || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dream:', error);
      return NextResponse.json({ error: 'Failed to create dream' }, { status: 500 });
    }

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagRecords = tags.map((tag: string) => ({
        dream_id: dream.id,
        user_id: user.id,
        tag: tag.trim(),
      }));

      await supabase.from('dream_tags').insert(tagRecords);
    }

    return NextResponse.json({ dream }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

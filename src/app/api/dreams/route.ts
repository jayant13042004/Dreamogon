import { NextRequest, NextResponse, after } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveDreamImageUrl } from '@/lib/storage/dream-images';
import { uploadDreamAudio } from '@/lib/storage/dream-audio';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { sanitizePostgrestSearch } from '@/lib/utils/search';
import { executeDreamTranscriptionPipeline } from '@/lib/ai/transcribe-dream';

export const maxDuration = 60;

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
      .select('*, dream_tags(tag), dream_entities(id, entity_type, entity_name, confidence), dream_segments(*)', {
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

// POST /api/dreams - Create a new dream with optional audio persistence and duplicate prevention
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let title: string | undefined;
    let content = '';
    let dream_date: string | undefined;
    let date: string | undefined;
    let mood: string | null = null;
    let lucidity: string | null = null;
    let tags: string[] = [];
    let local_id: string | null = null;
    let raw_transcript: string | null = null;
    let durationSeconds: number | null = null;
    let audioBytes: Buffer | null = null;
    let audioMimeType = 'audio/webm';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = (formData.get('title') as string) || undefined;
      content = (formData.get('content') as string) || '';
      dream_date = (formData.get('dream_date') as string) || undefined;
      date = (formData.get('date') as string) || undefined;
      mood = (formData.get('mood') as string) || null;
      lucidity = (formData.get('lucidity') as string) || null;
      local_id = (formData.get('local_id') as string) || null;
      raw_transcript = (formData.get('raw_transcript') as string) || null;
      const rawDuration = formData.get('duration') || formData.get('audio_duration_seconds');
      if (rawDuration) durationSeconds = parseFloat(rawDuration as string);

      const rawTags = formData.get('tags');
      if (rawTags) {
        try {
          tags = typeof rawTags === 'string' ? JSON.parse(rawTags) : [];
        } catch {
          tags = [];
        }
      }

      const file = formData.get('file') as File | null;
      if (file && file.size > 0) {
        audioMimeType = file.type || 'audio/webm';
        const arrayBuf = await file.arrayBuffer();
        audioBytes = Buffer.from(arrayBuf);
      }
    } else {
      const body = await request.json();
      title = body.title;
      content = body.content || '';
      dream_date = body.dream_date;
      date = body.date;
      mood = body.mood || null;
      lucidity = body.lucidity || null;
      tags = body.tags || [];
      local_id = body.local_id || null;
      raw_transcript = body.raw_transcript || null;
      if (body.duration || body.audio_duration_seconds) {
        durationSeconds = parseFloat(body.duration || body.audio_duration_seconds);
      }

      if (body.audio_base64) {
        audioMimeType = body.audio_mime_type || 'audio/webm';
        audioBytes = Buffer.from(body.audio_base64, 'base64');
      }
    }

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

    // ─────────────────────────────────────────────────────────────
    // Idempotency Protection: If a dream with this client_local_id exists,
    // prevent duplicate creation and handle missing audio attachment safely.
    // ─────────────────────────────────────────────────────────────
    if (local_id) {
      const { data: existingDream } = await supabase
        .from('dreams')
        .select('*, dream_tags(tag)')
        .eq('user_id', user.id)
        .eq('client_local_id', local_id)
        .maybeSingle();

      if (existingDream) {
        // If audio was provided on retry and not yet stored on the existing dream
        if (audioBytes && audioBytes.length > 0 && !existingDream.audio_path) {
          try {
            const { path, size } = await uploadDreamAudio(supabase, {
              userId: user.id,
              dreamId: existingDream.id,
              localId: local_id,
              bytes: audioBytes,
              mimeType: audioMimeType,
            });

            const { data: updatedDream } = await supabase
              .from('dreams')
              .update({
                audio_path: path,
                audio_duration_seconds: durationSeconds,
                audio_mime_type: audioMimeType,
                audio_file_size_bytes: size,
                transcription_status: 'none',
              })
              .eq('id', existingDream.id)
              .select('*, dream_tags(tag)')
              .maybeSingle();
            if (updatedDream) {
              const dreamIdToProcess = updatedDream.id;
              const userIdToProcess = user.id;
              after(async () => {
                try {
                  await executeDreamTranscriptionPipeline({
                    supabase,
                    userId: userIdToProcess,
                    dreamId: dreamIdToProcess,
                    language: 'en-US',
                  });
                } catch (bgErr) {
                  console.error('[DreamsAPI:after] Retry background transcription error:', bgErr);
                }
              });
            }

            return NextResponse.json({ dream: updatedDream || existingDream }, { status: 200 });
          } catch (audioErr) {
            console.error('[DreamsAPI] Failed to attach audio on retry:', audioErr);
          }
        }

        return NextResponse.json({ dream: existingDream }, { status: 200 });
      }
    }

    // Create the dream in Postgres
    const { data: dream, error: insertError } = await supabase
      .from('dreams')
      .insert({
        user_id: user.id,
        title: finalTitle,
        content: cleanContent,
        dream_date: finalDate,
        mood: mood || null,
        lucidity: lucidity || null,
        client_local_id: local_id,
        raw_transcript: raw_transcript || cleanContent,
        transcription_status: 'none',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating dream:', insertError);
      return NextResponse.json({ error: 'Failed to create dream' }, { status: 500 });
    }

    // If audio is attached, upload directly to the private dream-audio bucket
    let finalDream = dream;
    if (audioBytes && audioBytes.length > 0) {
      try {
        const { path, size } = await uploadDreamAudio(supabase, {
          userId: user.id,
          dreamId: dream.id,
          localId: local_id || dream.id,
          bytes: audioBytes,
          mimeType: audioMimeType,
        });

        const hasRealTranscript = Boolean(
          raw_transcript &&
          raw_transcript.trim() &&
          raw_transcript !== 'Voice recording captured'
        );

        // If client already had transcript, mark completed; otherwise mark none so it is transcribed separately
        const transcriptionStatus = hasRealTranscript ? 'completed' : 'none';

        const { data: dreamWithAudio, error: updateError } = await supabase
          .from('dreams')
          .update({
            audio_path: path,
            audio_duration_seconds: durationSeconds,
            audio_mime_type: audioMimeType,
            audio_file_size_bytes: size,
            raw_transcript: hasRealTranscript ? raw_transcript : null,
            content: cleanContent,
            transcription_status: transcriptionStatus,
          })
          .eq('id', dream.id)
          .select()
          .single();

        if (!updateError && dreamWithAudio) {
          finalDream = dreamWithAudio;

          if (transcriptionStatus === 'none') {
            const dreamIdToProcess = dreamWithAudio.id;
            const userIdToProcess = user.id;
            after(async () => {
              try {
                await executeDreamTranscriptionPipeline({
                  supabase,
                  userId: userIdToProcess,
                  dreamId: dreamIdToProcess,
                  language: 'en-US',
                });
              } catch (bgErr) {
                console.error('[DreamsAPI:after] Background transcription error:', bgErr);
              }
            });
          }
        }
      } catch (uploadErr) {
        console.error('[DreamsAPI] Audio upload error (dream created):', uploadErr);
        // We do NOT fail the whole dream save; the dream is preserved, audio retryable via local queue
      }
    }

    // Phase 7: Automatically record initial segment 0 in dream_segments
    try {
      await supabase.from('dream_segments').insert({
        dream_id: dream.id,
        user_id: user.id,
        segment_index: 0,
        segment_type: audioBytes && audioBytes.length > 0 ? 'voice' : 'text',
        content: cleanContent,
        raw_transcript: raw_transcript || (audioBytes && audioBytes.length > 0 ? null : cleanContent),
        audio_path: finalDream.audio_path || null,
        audio_duration_seconds: durationSeconds,
        audio_mime_type: audioBytes && audioBytes.length > 0 ? audioMimeType : null,
        audio_file_size_bytes: finalDream.audio_file_size_bytes || null,
        transcription_status: finalDream.transcription_status || 'none',
        client_local_id: local_id ? `${local_id}-seg-0` : null,
      });
    } catch (segErr) {
      console.warn('[DreamsAPI] Segment 0 creation warning (non-critical):', segErr);
    }

    return NextResponse.json({ dream: finalDream }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/dreams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

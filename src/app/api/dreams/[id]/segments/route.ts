import { NextRequest, NextResponse, after } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadDreamSegmentAudio, downloadDreamAudio } from '@/lib/storage/dream-audio';
import { transcribeAudioBuffer } from '@/lib/ai/transcribe-audio';
import { processDreamAnalysis } from '@/lib/ai/process-dream-analysis';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET /api/dreams/[id]/segments
 * Retrieves all chronological segments for a dream.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: segments, error } = await supabase
      .from('dream_segments')
      .select('*')
      .eq('dream_id', id)
      .eq('user_id', user.id)
      .order('segment_index', { ascending: true });

    if (error) {
      console.error('[DreamSegments] Error fetching segments:', error);
      return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 });
    }

    return NextResponse.json({ segments: segments || [] });
  } catch (err: any) {
    console.error('[DreamSegments] Unexpected error in GET:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/dreams/[id]/segments
 * Appends a follow-up voice or text memory segment to an existing dream.
 * Guarantees:
 * 1. Original recording and prior segments are never overwritten.
 * 2. Idempotent: client_local_id prevents duplicate segment creation on retry.
 * 3. Coalesced re-analysis: full dream narrative is re-evaluated without duplicate AI burn.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Verify parent dream ownership
    const { data: dream, error: dreamErr } = await supabase
      .from('dreams')
      .select('id, user_id, content, dream_date, mood, lucidity')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (dreamErr || !dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    // 2. Parse request payload
    const contentType = request.headers.get('content-type') || '';
    let segment_type: 'voice' | 'text' = 'text';
    let content = '';
    let raw_transcript: string | null = null;
    let client_local_id: string | null = null;
    let durationSeconds: number | null = null;
    let audioBytes: Buffer | null = null;
    let audioMimeType = 'audio/webm';
    let language = 'en-US';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      segment_type = (formData.get('segment_type') as 'voice' | 'text') || (formData.get('type') as 'voice' | 'text') || 'voice';
      content = (formData.get('content') as string) || '';
      raw_transcript = (formData.get('raw_transcript') as string) || null;
      client_local_id = (formData.get('client_local_id') as string) || null;
      const rawDur = formData.get('duration') || formData.get('audio_duration_seconds');
      if (rawDur) durationSeconds = parseFloat(rawDur as string);
      language = (formData.get('language') as string) || 'en-US';

      const file = formData.get('file') as File | null;
      if (file && file.size > 0) {
        audioMimeType = file.type || 'audio/webm';
        const arrayBuf = await file.arrayBuffer();
        audioBytes = Buffer.from(arrayBuf);
      }
    } else {
      const body = await request.json().catch(() => ({}));
      segment_type = body.segment_type || body.type || (body.audio_base64 ? 'voice' : 'text');
      content = body.content || '';
      raw_transcript = body.raw_transcript || null;
      client_local_id = body.client_local_id || null;
      if (body.duration || body.audio_duration_seconds) {
        durationSeconds = parseFloat(body.duration || body.audio_duration_seconds);
      }
      language = body.language || 'en-US';
      if (body.audio_base64) {
        audioMimeType = body.audio_mime_type || 'audio/webm';
        audioBytes = Buffer.from(body.audio_base64, 'base64');
      }
    }

    const cleanContent = content.trim() || (segment_type === 'voice' ? 'Follow-up voice recording' : '');
    if (!cleanContent && !audioBytes) {
      return NextResponse.json({ error: 'Segment content or audio is required' }, { status: 400 });
    }

    // 3. Idempotency Check: if segment with client_local_id already exists for this dream
    if (client_local_id) {
      const { data: existingSeg } = await supabase
        .from('dream_segments')
        .select('*')
        .eq('dream_id', id)
        .eq('client_local_id', client_local_id)
        .maybeSingle();

      if (existingSeg) {
        return NextResponse.json({ segment: existingSeg, alreadyExists: true }, { status: 200 });
      }
    }

    // 4. Determine next segment index
    const { data: lastSeg } = await supabase
      .from('dream_segments')
      .select('segment_index')
      .eq('dream_id', id)
      .order('segment_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextIndex = lastSeg && typeof lastSeg.segment_index === 'number' ? lastSeg.segment_index + 1 : 1;

    // 5. If audio is attached, upload to private bucket
    let audioPath: string | null = null;
    let audioSizeBytes: number | null = null;

    if (audioBytes && audioBytes.length > 0) {
      try {
        const { path, size } = await uploadDreamSegmentAudio(supabase, {
          userId: user.id,
          dreamId: id,
          segmentIndex: nextIndex,
          clientLocalId: client_local_id || crypto.randomUUID(),
          bytes: audioBytes,
          mimeType: audioMimeType,
        });
        audioPath = path;
        audioSizeBytes = size;
      } catch (uploadErr) {
        console.error('[DreamSegments] Audio upload failed:', uploadErr);
        return NextResponse.json({ error: 'Failed to upload segment audio' }, { status: 500 });
      }
    }

    const initialStatus = segment_type === 'voice' && !raw_transcript ? 'none' : 'completed';

    // 6. Insert new segment record
    const { data: segment, error: insertErr } = await supabase
      .from('dream_segments')
      .insert({
        dream_id: id,
        user_id: user.id,
        segment_index: nextIndex,
        segment_type,
        content: cleanContent,
        raw_transcript: raw_transcript || (segment_type === 'text' ? cleanContent : null),
        audio_path: audioPath,
        audio_duration_seconds: durationSeconds,
        audio_mime_type: audioBytes ? audioMimeType : null,
        audio_file_size_bytes: audioSizeBytes,
        transcription_status: initialStatus,
        client_local_id: client_local_id || null,
      })
      .select()
      .single();

    if (insertErr || !segment) {
      console.error('[DreamSegments] Error inserting segment:', insertErr);
      return NextResponse.json({ error: 'Failed to save segment' }, { status: 500 });
    }

    // 7. Append new memory to parent dream content
    const existingContent = (dream.content || '').trim();
    const updatedContent = existingContent
      ? `${existingContent}\n\n${cleanContent}`
      : cleanContent;

    await supabase
      .from('dreams')
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // 8. Background processing via Next.js after()
    // Transcribe segment if needed, then run coalesced re-analysis across the full dream
    after(async () => {
      try {
        let finalSegmentText = cleanContent;
        let finalRawTranscript = raw_transcript;

        // Step A: Transcribe segment audio if voice without transcript
        if (segment.audio_path && segment.transcription_status === 'none') {
          await supabase
            .from('dream_segments')
            .update({ transcription_status: 'transcribing', updated_at: new Date().toISOString() })
            .eq('id', segment.id);

          try {
            const file = await downloadDreamAudio(supabase, segment.audio_path);
            if (file && file.bytes && file.bytes.byteLength > 0) {
              const { rawTranscript: tRaw, cleanedTranscript: tClean } = await transcribeAudioBuffer(
                Buffer.from(file.bytes),
                segment.audio_mime_type || file.contentType || 'audio/webm',
                language
              );

              finalRawTranscript = tRaw;
              finalSegmentText = tClean || tRaw;

              await supabase
                .from('dream_segments')
                .update({
                  content: finalSegmentText,
                  raw_transcript: finalRawTranscript,
                  transcription_status: 'completed',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', segment.id);

              // Re-fetch all completed segments to construct the definitive consolidated text
              const { data: allSegs } = await supabase
                .from('dream_segments')
                .select('content, segment_index')
                .eq('dream_id', id)
                .order('segment_index', { ascending: true });

              if (allSegs && allSegs.length > 0) {
                const combined = allSegs
                  .map((s) => s.content.trim())
                  .filter(Boolean)
                  .join('\n\n');

                await supabase
                  .from('dreams')
                  .update({ content: combined, updated_at: new Date().toISOString() })
                  .eq('id', id);
              }
            }
          } catch (transErr) {
            console.error(`[DreamSegments:after] Transcription failed for segment ${segment.id}:`, transErr);
            await supabase
              .from('dream_segments')
              .update({ transcription_status: 'failed', updated_at: new Date().toISOString() })
              .eq('id', segment.id);
          }
        }

        // Step B: Coalesced Re-Analysis
        // Check if any other segment is currently actively transcribing
        const { data: activeSegments } = await supabase
          .from('dream_segments')
          .select('id')
          .eq('dream_id', id)
          .eq('transcription_status', 'transcribing');

        if (!activeSegments || activeSegments.length === 0) {
          // Fetch final consolidated dream content
          const { data: refreshedDream } = await supabase
            .from('dreams')
            .select('content, dream_date, mood, lucidity, raw_transcript')
            .eq('id', id)
            .single();

          if (refreshedDream && refreshedDream.content && refreshedDream.content.length > 10) {
            await processDreamAnalysis(supabase, user.id, id, refreshedDream.content, {
              dreamDate: refreshedDream.dream_date,
              mood: refreshedDream.mood,
              lucidity: refreshedDream.lucidity,
              rawTranscript: refreshedDream.raw_transcript,
              force: true, // Force update across the full updated multi-segment narrative
            });
          }
        }
      } catch (bgErr) {
        console.error(`[DreamSegments:after] Background pipeline error for dream ${id}:`, bgErr);
      }
    });

    return NextResponse.json({ success: true, segment }, { status: 201 });
  } catch (error: any) {
    console.error('[DreamSegments] Unexpected error in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

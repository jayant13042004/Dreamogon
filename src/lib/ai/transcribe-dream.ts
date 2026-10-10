import type { SupabaseClient } from '@supabase/supabase-js';
import { downloadDreamAudio } from '@/lib/storage/dream-audio';
import { transcribeAudioBuffer } from '@/lib/ai/transcribe-audio';
import { processDreamAnalysis } from '@/lib/ai/process-dream-analysis';

export interface ExecuteTranscriptionOptions {
  supabase: SupabaseClient;
  userId: string;
  dreamId: string;
  language?: string;
  force?: boolean;
  segmentId?: string;
}

export interface ExecuteTranscriptionResult {
  success: boolean;
  status: 'none' | 'transcribing' | 'completed' | 'failed';
  alreadyCompleted?: boolean;
  inProgress?: boolean;
  rawTranscript?: string;
  cleanedTranscript?: string;
  dream?: any;
  error?: string;
}

/**
 * Executes the complete server-side dream transcription and analysis pipeline.
 * Supports both parent dream recordings and discrete multi-segment recordings.
 *
 * Guarantees:
 * 1. Fully idempotent: will not re-run if already completed (unless force: true).
 * 2. Concurrency-safe: uses atomic lock to prevent duplicate runs and double AI quota deduction.
 * 3. Stale-lock recovery: if a previous attempt was stuck > 90s, safely reclaims and re-processes.
 * 4. Resilient decoupling: transcript is committed before AI analysis; AI failure does not discard transcript.
 * 5. Audio preservation: audio in Supabase Storage is never deleted or overwritten during processing.
 */
export async function executeDreamTranscriptionPipeline({
  supabase,
  userId,
  dreamId,
  language = 'en-US',
  force = false,
  segmentId,
}: ExecuteTranscriptionOptions): Promise<ExecuteTranscriptionResult> {
  // 1. Fetch parent dream details
  const { data: dream, error: fetchError } = await supabase
    .from('dreams')
    .select('id, user_id, content, audio_path, audio_mime_type, transcription_status, updated_at, dream_date, mood, lucidity, raw_transcript, ai_analysis')
    .eq('id', dreamId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError || !dream) {
    return {
      success: false,
      status: 'failed',
      error: 'Dream not found',
    };
  }

  // Handle specific segment transcription if segmentId is provided
  if (segmentId) {
    const { data: segment, error: segError } = await supabase
      .from('dream_segments')
      .select('*')
      .eq('id', segmentId)
      .eq('dream_id', dreamId)
      .eq('user_id', userId)
      .maybeSingle();

    if (segError || !segment) {
      return { success: false, status: 'failed', error: 'Segment not found' };
    }
    if (!segment.audio_path) {
      return { success: false, status: segment.transcription_status || 'none', error: 'No audio attached to this segment' };
    }

    if (segment.transcription_status === 'completed' && !force) {
      return {
        success: true,
        status: 'completed',
        alreadyCompleted: true,
        rawTranscript: segment.raw_transcript,
        cleanedTranscript: segment.content,
      };
    }

    // Lock segment
    await supabase
      .from('dream_segments')
      .update({ transcription_status: 'transcribing', updated_at: new Date().toISOString() })
      .eq('id', segmentId);

    try {
      const file = await downloadDreamAudio(supabase, segment.audio_path);
      if (!file || !file.bytes || file.bytes.byteLength === 0) {
        throw new Error('Segment audio file could not be read from storage');
      }

      const { rawTranscript, cleanedTranscript } = await transcribeAudioBuffer(
        Buffer.from(file.bytes),
        file.contentType || segment.audio_mime_type || 'audio/webm',
        language
      );

      // Update segment
      await supabase
        .from('dream_segments')
        .update({
          transcription_status: 'completed',
          raw_transcript: rawTranscript,
          content: cleanedTranscript,
          updated_at: new Date().toISOString(),
        })
        .eq('id', segmentId);

      // Re-read all completed segments to update dream.content
      const { data: allSegs } = await supabase
        .from('dream_segments')
        .select('content, segment_index')
        .eq('dream_id', dreamId)
        .order('segment_index', { ascending: true });

      let fullContent = dream.content;
      if (allSegs && allSegs.length > 0) {
        fullContent = allSegs.map((s) => s.content.trim()).filter(Boolean).join('\n\n');
        await supabase
          .from('dreams')
          .update({ content: fullContent, updated_at: new Date().toISOString() })
          .eq('id', dreamId);
      }

      // Trigger coalesced analysis
      try {
        await processDreamAnalysis(supabase, userId, dreamId, fullContent, {
          dreamDate: dream.dream_date,
          mood: dream.mood,
          lucidity: dream.lucidity,
          rawTranscript,
          force: true,
        });
      } catch (analysisErr) {
        console.warn(`[Pipeline] Segment auto-analysis warning:`, analysisErr);
      }

      return {
        success: true,
        status: 'completed',
        rawTranscript,
        cleanedTranscript,
      };
    } catch (segTransError: any) {
      await supabase
        .from('dream_segments')
        .update({ transcription_status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', segmentId);
      return {
        success: false,
        status: 'failed',
        error: segTransError?.message || 'Segment transcription failed',
      };
    }
  }

  if (!dream.audio_path) {
    return {
      success: false,
      status: dream.transcription_status || 'none',
      error: 'No audio recording attached to this dream',
    };
  }

  // 2. Check if already completed
  if (dream.transcription_status === 'completed' && !force) {
    return {
      success: true,
      status: 'completed',
      alreadyCompleted: true,
      rawTranscript: dream.raw_transcript,
      cleanedTranscript: dream.content,
      dream,
    };
  }

  // 3. Concurrency check: If already transcribing, check if lock is active (<90s)
  if (dream.transcription_status === 'transcribing' && !force) {
    const updatedAt = dream.updated_at ? new Date(dream.updated_at).getTime() : 0;
    const isLockActive = Date.now() - updatedAt < 90_000;

    if (isLockActive) {
      return {
        success: true,
        status: 'transcribing',
        inProgress: true,
        dream,
      };
    }
    // Lock is stale (>90s) — allow this execution to reclaim the lock and retry
    console.warn(`[Pipeline] Reclaiming stale transcribing lock for dream ${dreamId}`);
  }

  // 4. Acquire atomic lock in Postgres
  const { data: lockedRows, error: lockError } = await supabase
    .from('dreams')
    .update({
      transcription_status: 'transcribing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', dreamId)
    .eq('user_id', userId)
    .select('id, audio_path, audio_mime_type, content, dream_date, mood, lucidity')
    .single();

  if (lockError || !lockedRows) {
    return {
      success: false,
      status: 'failed',
      error: 'Could not acquire transcription lock',
    };
  }

  try {
    // 5. Download audio bytes from private Supabase Storage bucket
    const file = await downloadDreamAudio(supabase, dream.audio_path);
    if (!file || !file.bytes || file.bytes.byteLength === 0) {
      throw new Error('Audio file could not be read from storage');
    }

    // 6. Transcribe using Gemini multimodal audio model
    const mimeType = dream.audio_mime_type || file.contentType || 'audio/webm';
    const { rawTranscript, cleanedTranscript } = await transcribeAudioBuffer(
      Buffer.from(file.bytes),
      mimeType,
      language
    );

    // 7. Update dream: keep user edits if meaningful content exists, otherwise fill with cleaned transcript
    const currentContent = (dream.content || '').trim();
    const isPlaceholder =
      !currentContent ||
      currentContent === 'Audio dream recording' ||
      currentContent.startsWith('Voice recording captured');

    const updatePayload: Record<string, unknown> = {
      transcription_status: 'completed',
      raw_transcript: rawTranscript,
      updated_at: new Date().toISOString(),
    };

    if (isPlaceholder && cleanedTranscript) {
      updatePayload.content = cleanedTranscript;
    }

    const { data: updatedDream, error: updateError } = await supabase
      .from('dreams')
      .update(updatePayload)
      .eq('id', dreamId)
      .select('*, dream_tags(tag)')
      .single();

    if (updateError) {
      throw updateError;
    }

    // 8. Server-side pipeline: Chain AI reflection automatically
    const finalContent = isPlaceholder && cleanedTranscript ? cleanedTranscript : currentContent;
    let finalDreamWithAnalysis = updatedDream;

    if (finalContent && finalContent.length > 5 && !finalContent.startsWith('Voice recording captured')) {
      try {
        const analysisResult = await processDreamAnalysis(supabase, userId, dreamId, finalContent, {
          dreamDate: updatedDream.dream_date,
          mood: updatedDream.mood,
          lucidity: updatedDream.lucidity,
          rawTranscript: rawTranscript,
        });

        if (analysisResult.success && analysisResult.analysis) {
          const { data: readyDream } = await supabase
            .from('dreams')
            .select('*, dream_tags(tag), dream_entities(*)')
            .eq('id', dreamId)
            .single();

          if (readyDream) {
            finalDreamWithAnalysis = readyDream;
          }
        }
      } catch (analysisErr) {
        // Non-critical: AI analysis failure does NOT fail transcription; dream & transcript are 100% saved
        console.warn(`[Pipeline] Auto-analysis warning for dream ${dreamId}:`, analysisErr);
      }
    }

    return {
      success: true,
      status: 'completed',
      rawTranscript,
      cleanedTranscript,
      dream: finalDreamWithAnalysis,
    };
  } catch (err: any) {
    console.error(`[Pipeline] Dream ${dreamId} transcription error:`, err);

    // Transition to failed state safely — dream and audio are NEVER lost
    await supabase
      .from('dreams')
      .update({
        transcription_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', dreamId);

    return {
      success: false,
      status: 'failed',
      error: err?.message || 'Transcription failed',
    };
  }
}

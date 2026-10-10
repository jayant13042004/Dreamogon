import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { executeDreamTranscriptionPipeline } from '@/lib/ai/transcribe-dream';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/dreams/[id]/transcribe
 * Re-runs or initial-runs server-side transcription from the stored audio_path in Supabase Storage.
 * Fully idempotent: will return existing completed transcription unless force: true is passed.
 * Concurrency protected: active runs (<90s) return inProgress without duplicate work or quota burn.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse optional language, force, and segmentId preference from request body
  let language = 'en-US';
  let force = false;
  let segmentId: string | undefined = undefined;
  try {
    const body = await request.json().catch(() => ({}));
    if (body.language) language = body.language;
    if (typeof body.force === 'boolean') force = body.force;
    if (body.segmentId) segmentId = body.segmentId;
  } catch {
    // defaults
  }

  const result = await executeDreamTranscriptionPipeline({
    supabase,
    userId: user.id,
    dreamId: id,
    language,
    force,
    segmentId,
  });

  if (!result.success && result.error === 'Dream not found') {
    return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
  }

  if (!result.success && result.error === 'No audio recording attached to this dream') {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error || 'Transcription failed',
        status: result.status,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    dream: result.dream,
    rawTranscript: result.rawTranscript,
    cleanedTranscript: result.cleanedTranscript,
    status: result.status,
    alreadyCompleted: result.alreadyCompleted,
    inProgress: result.inProgress,
  });
}

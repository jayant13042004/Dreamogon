import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDreamAudioSignedUrl, downloadDreamAudio } from '@/lib/storage/dream-audio';

export const runtime = 'nodejs';

/**
 * GET /api/dreams/[id]/audio
 * Authenticated audio delivery for private dream voice recordings.
 *
 * Security:
 * 1. Requires valid user session.
 * 2. Confirms dream belongs to the caller.
 * 3. Never exposes permanent or public bucket URLs.
 * 4. Issues short-lived signed URLs (5 min expiry) or direct byte streams.
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

    // Verify ownership and fetch audio path
    const { data: dream, error: dreamError } = await supabase
      .from('dreams')
      .select('id, user_id, audio_path, audio_mime_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (dreamError || !dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format');
    const stream = searchParams.get('stream') === '1';
    const segmentId = searchParams.get('segmentId');

    let targetAudioPath = dream.audio_path;
    let targetMimeType = dream.audio_mime_type || 'audio/webm';

    if (segmentId) {
      const { data: segment } = await supabase
        .from('dream_segments')
        .select('id, audio_path, audio_mime_type')
        .eq('id', segmentId)
        .eq('dream_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (segment?.audio_path) {
        targetAudioPath = segment.audio_path;
        targetMimeType = segment.audio_mime_type || targetMimeType;
      } else {
        return NextResponse.json({ error: 'No audio recorded for this segment' }, { status: 404 });
      }
    }

    if (!targetAudioPath) {
      return NextResponse.json({ error: 'No audio recorded for this dream' }, { status: 404 });
    }

    // Return JSON with signed URL if requested
    if (format === 'json') {
      const signedUrl = await createDreamAudioSignedUrl(supabase, targetAudioPath, 300);
      if (!signedUrl) {
        return NextResponse.json({ error: 'Failed to generate audio playback link' }, { status: 500 });
      }
      return NextResponse.json({ url: signedUrl, mimeType: targetMimeType });
    }

    // Direct stream if explicitly asked
    if (stream) {
      const file = await downloadDreamAudio(supabase, targetAudioPath);
      if (!file) {
        return NextResponse.json({ error: 'Audio file missing from storage' }, { status: 404 });
      }

      return new NextResponse(file.bytes, {
        status: 200,
        headers: {
          'Content-Type': targetMimeType,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    // Default: Redirect to short-lived signed URL (enables HTTP byte ranges for seek/scrub in browsers)
    const signedUrl = await createDreamAudioSignedUrl(supabase, targetAudioPath, 300);
    if (!signedUrl) {
      return NextResponse.json({ error: 'Failed to access audio' }, { status: 500 });
    }

    return NextResponse.redirect(signedUrl, 307);
  } catch (error: any) {
    console.error('[DreamAudioProxy] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve audio' },
      { status: 500 }
    );
  }
}

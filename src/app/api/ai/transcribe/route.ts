import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudioBuffer } from '@/lib/ai/transcribe-audio';

export const runtime = 'nodejs';

/**
 * POST /api/ai/transcribe
 * Transcribes audio via Gemini with model fallback and raw/clean dual transcripts.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let audioBytes: Buffer | null = null;
    let mimeType = 'audio/webm';
    let language = 'en-US';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      language = (formData.get('language') as string) || 'en-US';

      if (!file) {
        return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
      }

      mimeType = file.type || 'audio/webm';
      const arrayBuffer = await file.arrayBuffer();
      audioBytes = Buffer.from(arrayBuffer);
    } else {
      const body = await request.json();
      if (!body.audio) {
        return NextResponse.json({ error: 'No base64 audio provided' }, { status: 400 });
      }
      audioBytes = Buffer.from(body.audio, 'base64');
      mimeType = body.mimeType || 'audio/webm';
      language = body.language || 'en-US';
    }

    if (!audioBytes || audioBytes.length === 0) {
      return NextResponse.json({ error: 'Empty audio data' }, { status: 400 });
    }

    const { rawTranscript, cleanedTranscript } = await transcribeAudioBuffer(
      audioBytes,
      mimeType,
      language
    );

    return NextResponse.json({
      transcript: cleanedTranscript,
      rawTranscript: rawTranscript,
      success: true,
    });
  } catch (error: any) {
    console.error('Voice transcription API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal transcription error' },
      { status: 500 }
    );
  }
}

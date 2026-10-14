import { getAIClient, GENERATION_MODELS, shouldFallbackToNextModel } from '@/lib/ai/client';
import { detectAudioFormatFromBytes } from '@/lib/utils/voice';

export interface TranscriptionResult {
  rawTranscript: string;
  cleanedTranscript: string;
}

/**
 * Transcribe raw audio bytes using Gemini multimodal audio model with fallback.
 * Produces both a verbatim raw transcript and a clean structured transcript.
 */
export async function transcribeAudioBuffer(
  audioBytes: Buffer | Uint8Array,
  mimeType = 'audio/webm',
  language = 'en-US'
): Promise<TranscriptionResult> {
  const detected = detectAudioFormatFromBytes(audioBytes, mimeType);
  const cleanMimeType = detected.mimeType;
  const base64Audio = Buffer.from(audioBytes).toString('base64');

  const ai = getAIClient();

  const prompt = `You are a high-fidelity speech-to-text transcription engine for morning dream journals.
The attached audio is a person recalling their dream upon waking.
Target / Expected language: ${language}.

Instructions:
1. Transcribe the audio faithfully in the language spoken.
2. If Hindi or other regional languages are spoken in Hinglish or native script, transcribe naturally.
3. Provide both a raw verbatim transcript and a clean readable transcript.
4. Output strictly a JSON object with this exact shape:
{
  "raw_transcript": "Every spoken word verbatim, with no alterations, speaker tags, or omissions.",
  "cleaned_transcript": "Natural punctuation, capitalization, and readable paragraphs. Remove accidental stutters while preserving 100% of authentic dream meaning."
}
5. If the audio is silent or only background noise, return empty strings for both.
Output ONLY the JSON object. Do not wrap in markdown or backticks if possible.`;

  let lastError: unknown = null;

  for (const model of GENERATION_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: cleanMimeType,
                  data: base64Audio,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      const responseText = response.text ? response.text.trim() : '';
      if (!responseText) {
        return { rawTranscript: '', cleanedTranscript: '' };
      }

      // Try parsing JSON response
      try {
        const cleanedJson = responseText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/, '')
          .replace(/\s*```$/, '')
          .trim();
        const parsed = JSON.parse(cleanedJson);
        const raw = (parsed.raw_transcript || '').trim();
        const clean = (parsed.cleaned_transcript || raw).trim();
        return {
          rawTranscript: raw || clean,
          cleanedTranscript: clean || raw,
        };
      } catch {
        // If not valid JSON, treat entire responseText as both transcripts
        return {
          rawTranscript: responseText,
          cleanedTranscript: responseText,
        };
      }
    } catch (err: unknown) {
      console.warn(`[TranscribeAudio] Model ${model} failed:`, err);
      lastError = err;
      if (!shouldFallbackToNextModel(err)) {
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini transcription models failed to process audio');
}

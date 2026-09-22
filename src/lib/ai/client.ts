import { GoogleGenAI } from '@google/genai';

export const GENERATION_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
] as const;

export const GENERATION_MODEL = GENERATION_MODELS[0];

export const EMBEDDING_MODEL = 'gemini-embedding-001';

export function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from .env.local');
  }

  return new GoogleGenAI({
    apiKey,
    vertexai: false,
  });
}

/**
 * Returns true for temporary Gemini/API availability errors
 * where trying another model makes sense.
 */
export function shouldFallbackToNextModel(error: unknown): boolean {
  const err = error as {
    status?: number;
    code?: number;
    message?: string;
  };

  const status = err?.status ?? err?.code;

  return (
    status === 404 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}
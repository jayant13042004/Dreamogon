import type { SupabaseClient } from '@supabase/supabase-js';

export const DREAM_IMAGES_BUCKET = 'dream-images';

const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

export function extensionForMime(mimeType: string): string {
  return MIME_EXTENSION[mimeType.toLowerCase()] || 'jpg';
}

/** Stable same-origin URL used in <img src> — never stores bytes in Postgres */
export function dreamImageProxyPath(dreamId: string): string {
  return `/api/dreams/${dreamId}/image`;
}

export type DreamImageRef = {
  id: string;
  image_path?: string | null;
  image_url?: string | null;
  image_generated_at?: string | null;
  image_generation_count?: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai_analysis?: any;
};

export function dreamHasStoredImage(dream: {
  image_path?: string | null;
  image_url?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai_analysis?: any;
}): boolean {
  const analysisUrl =
    dream.ai_analysis && typeof dream.ai_analysis.image_url === 'string'
      ? dream.ai_analysis.image_url
      : null;
  return !!(dream.image_path || dream.image_url || analysisUrl);
}

/**
 * Resolve a displayable URL for list/detail views.
 * Prefer Storage-backed proxy; fall back to legacy data URLs / external URLs.
 */
export function resolveDreamImageUrl(dream: DreamImageRef): string | null {
  if (dream.image_path) {
    const version = dream.image_generation_count ?? dream.image_generated_at ?? '';
    const base = dreamImageProxyPath(dream.id);
    return version ? `${base}?v=${encodeURIComponent(String(version))}` : base;
  }
  // Already a proxy path stored in image_url
  if (dream.image_url?.startsWith('/api/dreams/')) {
    return dream.image_url;
  }
  const analysisUrl =
    dream.ai_analysis && typeof dream.ai_analysis.image_url === 'string'
      ? dream.ai_analysis.image_url
      : null;
  return dream.image_url || analysisUrl || null;
}

export function buildDreamImageObjectPath(
  userId: string,
  dreamId: string,
  mimeType: string
): string {
  const ext = extensionForMime(mimeType);
  const stamp = Date.now();
  return `${userId}/${dreamId}/${stamp}.${ext}`;
}

export async function uploadDreamImage(
  supabase: SupabaseClient,
  args: {
    userId: string;
    dreamId: string;
    bytes: Buffer | Uint8Array;
    mimeType: string;
    previousPath?: string | null;
  }
): Promise<{ path: string }> {
  const path = buildDreamImageObjectPath(args.userId, args.dreamId, args.mimeType);
  const body = args.bytes instanceof Buffer ? args.bytes : Buffer.from(args.bytes);

  const { error } = await supabase.storage.from(DREAM_IMAGES_BUCKET).upload(path, body, {
    contentType: args.mimeType,
    upsert: false,
    cacheControl: '31536000',
  });

  if (error) {
    throw new Error(error.message || 'Failed to upload dream image');
  }

  if (args.previousPath && args.previousPath !== path) {
    await supabase.storage.from(DREAM_IMAGES_BUCKET).remove([args.previousPath]).catch(() => {
      // non-fatal: orphan cleanup best-effort
    });
  }

  return { path };
}

export async function downloadDreamImage(
  supabase: SupabaseClient,
  path: string
): Promise<{ bytes: ArrayBuffer; contentType: string } | null> {
  const { data, error } = await supabase.storage.from(DREAM_IMAGES_BUCKET).download(path);
  if (error || !data) return null;

  const bytes = await data.arrayBuffer();
  const contentType = data.type || mimeFromPath(path);
  return { bytes, contentType };
}

function mimeFromPath(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
}

/** Parse a data URL into raw bytes (used if a provider still returns data URLs). */
export function parseDataUrl(dataUrl: string): { bytes: Buffer; mimeType: string } | null {
  const match = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/.exec(dataUrl);
  if (!match) return null;
  const mimeType = match[1] || 'application/octet-stream';
  const isBase64 = Boolean(match[2]);
  const payload = match[3];
  try {
    const bytes = isBase64
      ? Buffer.from(payload, 'base64')
      : Buffer.from(decodeURIComponent(payload), 'utf8');
    return { bytes, mimeType };
  } catch {
    return null;
  }
}

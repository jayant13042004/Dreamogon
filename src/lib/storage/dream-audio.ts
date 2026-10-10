import type { SupabaseClient } from '@supabase/supabase-js';

export const DREAM_AUDIO_BUCKET = 'dream-audio';

const AUDIO_MIME_EXTENSION: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
};

export function extensionForAudioMime(mimeType: string): string {
  const cleanMime = mimeType.split(';')[0].trim().toLowerCase();
  return AUDIO_MIME_EXTENSION[cleanMime] || 'webm';
}

/** Stable same-origin URL for authenticated playback */
export function dreamAudioProxyPath(dreamId: string): string {
  return `/api/dreams/${dreamId}/audio`;
}

/** Path convention: {user_id}/{dream_id}/{localId_or_timestamp}.{ext} */
export function buildDreamAudioObjectPath(
  userId: string,
  dreamId: string,
  localId: string,
  mimeType: string
): string {
  const ext = extensionForAudioMime(mimeType);
  const safeFilename = localId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${userId}/${dreamId}/${safeFilename}.${ext}`;
}

export function buildDreamSegmentAudioObjectPath(
  userId: string,
  dreamId: string,
  segmentIndex: number,
  clientLocalId: string,
  mimeType: string
): string {
  const ext = extensionForAudioMime(mimeType);
  const safeFilename = clientLocalId
    ? clientLocalId.replace(/[^a-zA-Z0-9_-]/g, '_')
    : `${Date.now()}`;
  return `${userId}/${dreamId}/seg_${segmentIndex}_${safeFilename}.${ext}`;
}

export async function uploadDreamAudio(
  supabase: SupabaseClient,
  args: {
    userId: string;
    dreamId: string;
    localId: string;
    bytes: Buffer | Uint8Array;
    mimeType: string;
  }
): Promise<{ path: string; size: number }> {
  const path = buildDreamAudioObjectPath(args.userId, args.dreamId, args.localId, args.mimeType);
  const body = args.bytes instanceof Buffer ? args.bytes : Buffer.from(args.bytes);

  const cleanMime = args.mimeType.split(';')[0].trim() || 'audio/webm';

  const { error } = await supabase.storage.from(DREAM_AUDIO_BUCKET).upload(path, body, {
    contentType: cleanMime,
    upsert: true, // Allow upsert for retries with same localId
    cacheControl: '31536000',
  });

  if (error) {
    throw new Error(error.message || 'Failed to upload dream audio');
  }

  return { path, size: body.byteLength };
}

export async function uploadDreamSegmentAudio(
  supabase: SupabaseClient,
  args: {
    userId: string;
    dreamId: string;
    segmentIndex: number;
    clientLocalId: string;
    bytes: Buffer | Uint8Array;
    mimeType: string;
  }
): Promise<{ path: string; size: number }> {
  const path = buildDreamSegmentAudioObjectPath(
    args.userId,
    args.dreamId,
    args.segmentIndex,
    args.clientLocalId,
    args.mimeType
  );
  const body = args.bytes instanceof Buffer ? args.bytes : Buffer.from(args.bytes);
  const cleanMime = args.mimeType.split(';')[0].trim() || 'audio/webm';

  const { error } = await supabase.storage.from(DREAM_AUDIO_BUCKET).upload(path, body, {
    contentType: cleanMime,
    upsert: true,
    cacheControl: '31536000',
  });

  if (error) {
    throw new Error(error.message || 'Failed to upload dream segment audio');
  }

  return { path, size: body.byteLength };
}

export async function createDreamAudioSignedUrl(
  supabase: SupabaseClient,
  path: string,
  expiresInSeconds = 300
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(DREAM_AUDIO_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.warn('[DreamAudio] Failed to generate signed URL:', error?.message);
    return null;
  }

  return data.signedUrl;
}

export async function downloadDreamAudio(
  supabase: SupabaseClient,
  path: string
): Promise<{ bytes: ArrayBuffer; contentType: string } | null> {
  const { data, error } = await supabase.storage.from(DREAM_AUDIO_BUCKET).download(path);
  if (error || !data) return null;

  const bytes = await data.arrayBuffer();
  const contentType = data.type || 'audio/webm';
  return { bytes, contentType };
}

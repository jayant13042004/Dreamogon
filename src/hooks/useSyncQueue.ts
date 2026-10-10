'use client';

/**
 * useSyncQueue — Phase 2 sync engine
 *
 * Watches for local dreams with status 'captured' or 'failed' and uploads them
 * to the server. Handles:
 *   - Automatic retry with exponential backoff
 *   - Network detection before attempting
 *   - Duplicate upload prevention (idempotency via localId check before creating)
 *   - Per-item locking (prevents concurrent uploads of same dream)
 *   - Clean deletion ONLY after server confirms dream.id
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  LocalDream,
  getLocalDreamsByStatus,
  updateLocalDream,
  confirmAndDeleteLocalDream,
  base64ToBlob,
} from '@/lib/local-dreams';

interface UseSyncQueueOptions {
  userId: string | null | undefined;
  /** Called when any pending dream is successfully uploaded */
  onDreamUploaded?: (serverDreamId: string, localId: string) => void;
  /** Called when the pending count changes */
  onPendingCountChange?: (count: number) => void;
  /** Poll interval in ms (default: 8000) */
  pollIntervalMs?: number;
  /** Whether syncing is enabled (disable while recording) */
  enabled?: boolean;
}

const MAX_ATTEMPTS = 5;
/** Exponential backoff delays: 2s, 8s, 30s, 120s, 300s */
const RETRY_DELAYS_MS = [2_000, 8_000, 30_000, 120_000, 300_000];

/** Track which localIds are currently being uploaded (per hook instance) */
const activeUploads = new Set<string>();

async function isOnline(): Promise<boolean> {
  if (typeof navigator === 'undefined') return true;
  if (!navigator.onLine) return false;
  // Quick lightweight check
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 3000);
    const resp = await fetch('/api/health', { method: 'HEAD', signal: ctrl.signal });
    clearTimeout(tid);
    return resp.ok || resp.status < 500;
  } catch {
    // If the health endpoint doesn't exist, assume online if navigator.onLine
    return navigator.onLine;
  }
}

function shouldRetry(dream: LocalDream): boolean {
  if (dream.uploadAttempts >= MAX_ATTEMPTS) return false;
  if (!dream.lastAttemptAt) return true;
  const delayMs = RETRY_DELAYS_MS[Math.min(dream.uploadAttempts - 1, RETRY_DELAYS_MS.length - 1)] ?? 300_000;
  const nextAttempt = new Date(dream.lastAttemptAt).getTime() + delayMs;
  return Date.now() >= nextAttempt;
}

async function uploadDream(dream: LocalDream): Promise<string> {
  let response: Response;
  const initialSeg = dream.segments && dream.segments.length > 1 ? dream.segments[0] : null;
  const initialContent = initialSeg ? initialSeg.content : dream.content;
  const initialRaw = initialSeg ? (initialSeg.rawTranscript || initialSeg.content) : dream.content;
  const initialAudioB64 = (initialSeg && initialSeg.audioBlobBase64) ? initialSeg.audioBlobBase64 : dream.audioBlobBase64;
  const initialMime = (initialSeg && initialSeg.audioMimeType) ? initialSeg.audioMimeType : (dream.audioMimeType || 'audio/webm');

  if (initialAudioB64) {
    const blob = base64ToBlob(initialAudioB64, initialMime);
    const formData = new FormData();
    formData.append('file', blob, `recording.${initialMime?.includes('mp4') ? 'mp4' : 'webm'}`);
    if (dream.title) formData.append('title', dream.title);
    formData.append('content', initialContent);
    formData.append('dream_date', dream.date);
    if (dream.mood) formData.append('mood', dream.mood);
    if (dream.lucidity) formData.append('lucidity', dream.lucidity);
    if (dream.tags) formData.append('tags', JSON.stringify(dream.tags));
    formData.append('local_id', dream.localId);
    formData.append('raw_transcript', initialRaw);

    response = await fetch('/api/dreams', {
      method: 'POST',
      body: formData,
    });
  } else {
    response = await fetch('/api/dreams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: dream.title,
        content: initialContent,
        dream_date: dream.date,
        mood: dream.mood || null,
        lucidity: dream.lucidity || null,
        tags: dream.tags || [],
        local_id: dream.localId,
        raw_transcript: initialRaw,
      }),
    });
  }

  if (response.status === 401) {
    throw new Error('AUTH_EXPIRED');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data?.dream?.id) {
    throw new Error('No dream ID in server response');
  }

  return data.dream.id as string;
}

export function useSyncQueue({
  userId,
  onDreamUploaded,
  onPendingCountChange,
  pollIntervalMs = 8_000,
  enabled = true,
}: UseSyncQueueOptions) {
  const runningRef = useRef(false);

  const runSync = useCallback(async () => {
    if (!userId || !enabled || runningRef.current) return;
    runningRef.current = true;

    try {
      const online = await isOnline();
      if (!online) return;

      const [captured, failed] = await Promise.all([
        getLocalDreamsByStatus(userId, 'captured'),
        getLocalDreamsByStatus(userId, 'failed'),
      ]);

      const queue = [
        ...captured,
        ...failed.filter(shouldRetry),
      ];

      // Update pending count (exclude items already locked in upload)
      const stillPending = queue.filter((d) => !activeUploads.has(d.localId));
      onPendingCountChange?.(captured.length + failed.length);

      for (const dream of stillPending) {
        if (activeUploads.has(dream.localId)) continue;
        activeUploads.add(dream.localId);

        // Mark as uploading
        await updateLocalDream(dream.localId, {
          status: 'uploading',
          lastAttemptAt: new Date().toISOString(),
          uploadAttempts: dream.uploadAttempts + 1,
        });

        try {
          const serverDreamId = await uploadDream(dream);

          // Phase 7: Upload any follow-up segments saved in offline IndexedDB
          if (dream.segments && dream.segments.length > 1) {
            const followUps = dream.segments.slice(1);
            for (const seg of followUps) {
              if (seg.audioBlobBase64) {
                const blob = base64ToBlob(seg.audioBlobBase64, seg.audioMimeType || 'audio/webm');
                const segFormData = new FormData();
                segFormData.append('file', blob, `segment_${seg.segmentIndex}.${seg.audioMimeType?.includes('mp4') ? 'mp4' : 'webm'}`);
                segFormData.append('client_local_id', seg.localSegmentId);
                segFormData.append('type', 'voice');
                segFormData.append('content', seg.content || '');
                segFormData.append('raw_transcript', seg.rawTranscript || seg.content || '');
                if (seg.durationSeconds) segFormData.append('duration_seconds', String(seg.durationSeconds));
                if (seg.audioLang) segFormData.append('language', seg.audioLang);

                const segRes = await fetch(`/api/dreams/${serverDreamId}/segments`, {
                  method: 'POST',
                  body: segFormData,
                });
                if (!segRes.ok) {
                  const errData = await segRes.json().catch(() => ({}));
                  throw new Error(errData?.error || `Segment sync failed (HTTP ${segRes.status})`);
                }
              } else if (seg.content?.trim()) {
                const segRes = await fetch(`/api/dreams/${serverDreamId}/segments`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    client_local_id: seg.localSegmentId,
                    type: 'text',
                    content: seg.content,
                    raw_transcript: seg.rawTranscript || seg.content,
                  }),
                });
                if (!segRes.ok) {
                  const errData = await segRes.json().catch(() => ({}));
                  throw new Error(errData?.error || `Segment sync failed (HTTP ${segRes.status})`);
                }
              }
            }
          }

          // Confirmed server-side → safe to delete local copy
          await confirmAndDeleteLocalDream(dream.localId, serverDreamId);
          onDreamUploaded?.(serverDreamId, dream.localId);

          // If the synced dream had audio and no transcript yet, trigger background transcribe
          if (dream.audioBlobBase64 && (!dream.content || dream.content === 'Voice recording captured')) {
            fetch(`/api/dreams/${serverDreamId}/transcribe`, { method: 'POST' }).catch(() => {});
          }
        } catch (err: any) {
          const errorMsg = err?.message || 'Unknown upload error';
          const attempts = dream.uploadAttempts + 1;

          if (errorMsg === 'AUTH_EXPIRED') {
            // Don't retry auth failures — mark failed but preserve
            await updateLocalDream(dream.localId, {
              status: 'failed',
              lastError: 'Session expired. Please sign in again.',
              uploadAttempts: attempts,
            });
          } else if (attempts >= MAX_ATTEMPTS) {
            await updateLocalDream(dream.localId, {
              status: 'failed',
              lastError: `Upload failed after ${MAX_ATTEMPTS} attempts: ${errorMsg}`,
              uploadAttempts: attempts,
            });
          } else {
            await updateLocalDream(dream.localId, {
              status: 'failed',
              lastError: errorMsg,
              uploadAttempts: attempts,
            });
          }
        } finally {
          activeUploads.delete(dream.localId);
        }
      }
    } catch (err) {
      console.error('[SyncQueue] Unexpected error:', err);
    } finally {
      runningRef.current = false;
    }
  }, [userId, enabled, onDreamUploaded, onPendingCountChange]);

  // Poll sync loop
  useEffect(() => {
    if (!userId || !enabled) return;

    // Run immediately on mount/enable
    runSync();

    const interval = setInterval(runSync, pollIntervalMs);

    // Also sync on online event
    const handleOnline = () => setTimeout(runSync, 500);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, [userId, enabled, pollIntervalMs, runSync]);

  return { runSync };
}

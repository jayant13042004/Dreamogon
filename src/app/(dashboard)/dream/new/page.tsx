'use client';

import React, { useRef, useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DreamCapture, type CapturePayload } from '@/components/dreams/DreamCapture';
import { PendingDreamsBanner } from '@/components/dreams/PendingDreamsBanner';
import { useAuth } from '@/hooks/useAuth';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { toast } from '@/components/ui/Toast';
import { Analytics } from '@/lib/analytics';
import { clearDreamDraft } from '@/lib/drafts';
import { Spinner } from '@/components/ui/Spinner';
import {
  saveLocalDream,
  updateLocalDream,
  confirmAndDeleteLocalDream,
  generateLocalId,
  requestPersistentStorage,
  blobToBase64,
} from '@/lib/local-dreams';

function NewDreamInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  /** localId of the current draft being worked on (set on first save attempt) */
  const currentLocalIdRef = useRef<string | null>(null);
  const savingLock = useRef(false);
  const initialDate = searchParams.get('date') || undefined;
  const autoRecord = searchParams.get('record') === '1';

  useEffect(() => {
    Analytics.dreamCreateStarted();
    // Request durable storage to prevent eviction (especially iOS Safari)
    requestPersistentStorage();
  }, []);

  const handleSyncSuccess = useCallback(
    (serverDreamId: string, localId: string) => {
      // If this was the current draft's upload succeeding via background sync
      if (localId === currentLocalIdRef.current) {
        setSaveSuccess(true);
        clearDreamDraft(user?.id);
        Analytics.dreamCreated(1, true);
        setTimeout(() => {
          router.push(`/dream/${serverDreamId}?analyzing=1`);
        }, 700);
      }
    },
    [router, user?.id]
  );

  // Background sync queue — runs automatically, retries failed uploads
  const { runSync } = useSyncQueue({
    userId: user?.id,
    onDreamUploaded: handleSyncSuccess,
    onPendingCountChange: setPendingCount,
    enabled: !saving, // pause sync while actively saving to avoid race
  });

  /**
   * Phase 2 save flow:
   * 1. Immediately save to IndexedDB (local capture)
   * 2. Attempt direct upload to server
   * 3. If upload succeeds → delete local copy
   * 4. If upload fails → leave in IndexedDB for queue retry
   */
  const executeSave = useCallback(
    async (payload: CapturePayload, audioBlob?: Blob, audioMimeType?: string, audioLang?: string) => {
      if (!user) {
        toast.error('Please sign in to save your dream.');
        router.push('/login');
        return;
      }

      if (savingLock.current) return;
      savingLock.current = true;
      setSaving(true);
      setSaveError(null);

      // Step 1: Write to IndexedDB immediately (before any network attempt)
      const localId = currentLocalIdRef.current ?? generateLocalId();
      currentLocalIdRef.current = localId;

      let audioBlobBase64: string | undefined;
      if (audioBlob && audioBlob.size > 800) {
        try {
          audioBlobBase64 = await blobToBase64(audioBlob);
        } catch {
          // Non-critical — audio blob storage is best-effort
        }
      }

      // Phase 7: Store all captured segments locally in IndexedDB before network
      let localSegments: any = undefined;
      if (payload.segments && payload.segments.length > 0) {
        try {
          localSegments = await Promise.all(
            payload.segments.map(async (seg, idx) => {
              let segB64: string | undefined;
              if (seg.audioBlob && seg.audioBlob.size > 800) {
                try {
                  segB64 = await blobToBase64(seg.audioBlob);
                } catch {}
              }
              return {
                localSegmentId: seg.id,
                type: seg.type,
                content: seg.content,
                rawTranscript: seg.rawTranscript,
                audioBlobBase64: segB64,
                audioMimeType: seg.audioMimeType,
                audioLang: seg.audioLang,
                durationSeconds: seg.durationSeconds,
                segmentIndex: idx,
              };
            })
          );
        } catch (segErr) {
          console.warn('[Phase7] Segment serialization warning:', segErr);
        }
      }

      try {
        await saveLocalDream({
          localId,
          userId: user.id,
          content: payload.content,
          date: payload.date,
          title: payload.title,
          mood: payload.mood,
          lucidity: payload.lucidity,
          tags: payload.tags,
          memoryType: payload.memoryType,
          usedVoice: payload.usedVoice,
          audioBlobBase64,
          audioMimeType,
          audioLang,
          segments: localSegments,
        });
      } catch (idbErr) {
        // IndexedDB save failed (e.g., private mode, storage full)
        console.warn('[Phase2] IndexedDB save failed:', idbErr);
        // Continue anyway — will still try the network upload
      }

      // Step 2: Attempt direct network upload
      try {
        await updateLocalDream(localId, { status: 'uploading' });

        let response: Response;
        const initialSeg = payload.segments && payload.segments.length > 1 ? payload.segments[0] : null;
        const initialContent = initialSeg ? initialSeg.content : payload.content;
        const initialRaw = initialSeg ? (initialSeg.rawTranscript || initialSeg.content) : (payload.rawTranscript || payload.content);
        const effectiveAudioBlob = (initialSeg && initialSeg.audioBlob) ? initialSeg.audioBlob : audioBlob;
        const effectiveAudioMime = (initialSeg && initialSeg.audioMimeType) ? initialSeg.audioMimeType : audioMimeType;

        if (effectiveAudioBlob && effectiveAudioBlob.size > 800) {
          const formData = new FormData();
          formData.append('file', effectiveAudioBlob, `recording.${effectiveAudioMime?.includes('mp4') ? 'mp4' : 'webm'}`);
          if (payload.title) formData.append('title', payload.title);
          formData.append('content', initialContent);
          formData.append('dream_date', payload.date);
          if (payload.mood) formData.append('mood', payload.mood);
          if (payload.lucidity) formData.append('lucidity', payload.lucidity);
          if (payload.tags) formData.append('tags', JSON.stringify(payload.tags));
          formData.append('local_id', localId);
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
              title: payload.title,
              content: initialContent,
              dream_date: payload.date,
              mood: payload.mood || null,
              lucidity: payload.lucidity || null,
              tags: payload.tags || [],
              local_id: localId,
              raw_transcript: initialRaw,
            }),
          });
        }

        if (response.status === 401) {
          await updateLocalDream(localId, {
            status: 'failed',
            lastError: 'Session expired',
          });
          toast.error('Session expired. Please sign in again.');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          const errorMsg =
            errData?.error || 'Could not save to server. Captured locally — will retry when connected.';
          await updateLocalDream(localId, { status: 'failed', lastError: errorMsg });
          setSaveError(errorMsg);
          toast.error('Saved locally. Will sync when connected.');
          return;
        }

        const { dream } = await response.json();
        if (!dream?.id) {
          await updateLocalDream(localId, {
            status: 'failed',
            lastError: 'No dream ID returned',
          });
          setSaveError('Unexpected server response. Captured locally — tap retry.');
          return;
        }

        // Step 3: Confirmed on server → upload any follow-up segments
        if (payload.segments && payload.segments.length > 1) {
          const followUps = payload.segments.slice(1);
          for (let i = 0; i < followUps.length; i++) {
            const seg = followUps[i];
            try {
              if (seg.audioBlob && seg.audioBlob.size > 800) {
                const segFormData = new FormData();
                segFormData.append('file', seg.audioBlob, `segment_${i + 1}.${seg.audioMimeType?.includes('mp4') ? 'mp4' : 'webm'}`);
                segFormData.append('client_local_id', seg.id);
                segFormData.append('type', 'voice');
                segFormData.append('content', seg.content || '');
                segFormData.append('raw_transcript', seg.rawTranscript || seg.content || '');
                if (seg.durationSeconds) segFormData.append('duration_seconds', String(seg.durationSeconds));
                if (seg.audioLang) segFormData.append('language', seg.audioLang);

                await fetch(`/api/dreams/${dream.id}/segments`, {
                  method: 'POST',
                  body: segFormData,
                });
              } else if (seg.content?.trim()) {
                await fetch(`/api/dreams/${dream.id}/segments`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    client_local_id: seg.id,
                    type: 'text',
                    content: seg.content,
                    raw_transcript: seg.rawTranscript || seg.content,
                  }),
                });
              }
            } catch (segErr) {
              console.warn('[Phase7] Follow-up segment upload error:', segErr);
            }
          }
        }

        // Delete local copy now that parent and follow-up segments have been processed
        await confirmAndDeleteLocalDream(localId, dream.id);
        currentLocalIdRef.current = null;

        // If audio was uploaded without completed transcript (e.g. user tapped save immediately),
        // trigger background transcription with keepalive so it completes even if user closes the app immediately
        if (dream.audio_path && dream.transcription_status !== 'completed') {
          fetch(`/api/dreams/${dream.id}/transcribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: audioLang || 'en-US' }),
            keepalive: true,
          }).catch(() => {});
        }

        setSaveSuccess(true);
        clearDreamDraft(user.id);
        Analytics.dreamCreated(1, payload.usedVoice);

        setTimeout(() => {
          router.push(`/dream/${dream.id}?analyzing=1`);
        }, 700);
      } catch (err: any) {
        const errorMsg = 'Network error — dream saved locally. Will sync when reconnected.';
        await updateLocalDream(localId, {
          status: 'failed',
          lastError: err?.message || 'Network error',
        });
        setSaveError(errorMsg);
        toast.error(errorMsg);
      } finally {
        savingLock.current = false;
        setSaving(false);
      }
    },
    [user, router]
  );

  const handleRetrySave = useCallback(() => {
    runSync();
    if (!currentLocalIdRef.current) return;
    // Reset status so sync picks it up
    updateLocalDream(currentLocalIdRef.current, {
      status: 'captured',
      lastError: undefined,
    }).then(() => {
      setSaveError(null);
      runSync();
    }).catch(() => {});
  }, [runSync]);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-3xl text-[var(--text-primary)]">Sign in to record</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Your dreams stay completely private to your personal archive.
        </p>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="mt-6 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-6 py-3.5 text-sm font-semibold text-[var(--bg-primary)] transition-colors shadow-sm cursor-pointer"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="morning-capture-page py-2 sm:py-6">
      {/* Pending / unsynced dreams banner */}
      {pendingCount > 0 && (
        <div className="max-w-2xl mx-auto px-2 sm:px-4">
          <PendingDreamsBanner
            userId={user.id}
            onRequestSync={runSync}
          />
        </div>
      )}

      <DreamCapture
        userId={user.id}
        onSave={executeSave}
        saving={saving}
        saveSuccess={saveSuccess}
        saveError={saveError}
        onRetrySave={handleRetrySave}
        initialDate={initialDate}
        autoRecord={autoRecord}
      />
    </div>
  );
}

export default function NewDreamPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <NewDreamInner />
    </Suspense>
  );
}

'use client';

import React, { useRef, useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DreamCapture, type CapturePayload } from '@/components/dreams/DreamCapture';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/Toast';
import { Analytics } from '@/lib/analytics';
import { clearDreamDraft } from '@/lib/drafts';
import { Spinner } from '@/components/ui/Spinner';

function NewDreamInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const lastPayloadRef = useRef<CapturePayload | null>(null);
  const savingLock = useRef(false);
  const initialDate = searchParams.get('date') || undefined;

  useEffect(() => {
    Analytics.dreamCreateStarted();
  }, []);

  const executeSave = useCallback(
    async (payload: CapturePayload) => {
      if (!user) {
        toast.error('Please sign in to save your dream.');
        router.push('/login');
        return;
      }

      if (savingLock.current) return;
      savingLock.current = true;
      setSaving(true);
      setSaveError(null);
      lastPayloadRef.current = payload;

      try {
        const response = await fetch('/api/dreams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: payload.title,
            content: payload.content,
            dream_date: payload.date,
            mood: payload.mood || null,
            lucidity: payload.lucidity || null,
            tags: payload.tags || [],
          }),
        });

        if (response.status === 401) {
          toast.error('Session expired. Please sign in again.');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          const errorMsg =
            errData?.error || 'Could not save your dream. Your words are held safely on this device.';
          setSaveError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        const { dream } = await response.json();
        if (!dream?.id) {
          setSaveError('Unexpected server response. Please tap to retry.');
          toast.error('Dream may not have saved. Please retry.');
          return;
        }

        // Successfully saved to database!
        setSaveSuccess(true);
        clearDreamDraft(user.id);
        Analytics.dreamCreated(1, payload.usedVoice);

        // Allow user to register the reassuring "Saved" confirmation
        setTimeout(() => {
          router.push(`/dream/${dream.id}?analyzing=1`);
        }, 700);
      } catch (err) {
        console.error('Save dream network error:', err);
        setSaveError('Network interrupted. Your words are safely preserved here.');
        toast.error('Network error — tap retry when back online.');
      } finally {
        savingLock.current = false;
        setSaving(false);
      }
    },
    [user, router]
  );

  const handleRetrySave = () => {
    if (lastPayloadRef.current) {
      executeSave(lastPayloadRef.current);
    }
  };

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
          className="mt-6 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-6 py-3.5 text-sm font-semibold text-[var(--bg-primary)] transition-colors shadow-sm"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="morning-capture-page py-2 sm:py-6">
      <DreamCapture
        userId={user.id}
        onSave={executeSave}
        saving={saving}
        saveSuccess={saveSuccess}
        saveError={saveError}
        onRetrySave={handleRetrySave}
        initialDate={initialDate}
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

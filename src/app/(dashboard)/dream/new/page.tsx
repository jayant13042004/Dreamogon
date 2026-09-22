'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
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
  const savingLock = useRef(false);
  const initialDate = searchParams.get('date') || undefined;

  useEffect(() => {
    Analytics.dreamCreateStarted();
  }, []);

  const handleSave = async (payload: CapturePayload) => {
    if (!user) {
      toast.error('Please sign in to save your dream.');
      router.push('/login');
      return;
    }

    if (savingLock.current) return;
    savingLock.current = true;
    setSaving(true);

    try {
      const response = await fetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title || 'Untitled Dream',
          content: payload.content,
          dream_date: payload.date,
          mood: payload.mood || null,
          lucidity: payload.lucidity || null,
          tags: payload.tags || [],
        }),
      });

      if (response.status === 401) {
        toast.error('Your session expired. Please sign in again.');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        toast.error('Could not save your dream. Check your connection and try again.');
        return;
      }

      const { dream } = await response.json();
      if (!dream?.id) {
        toast.error('Dream may not have saved. Please try again.');
        return;
      }

      clearDreamDraft(user.id);
      Analytics.dreamCreated(1, payload.usedVoice);
      toast.success('Dream saved');
      router.push(`/dream/${dream.id}?analyzing=1`);
    } catch {
      toast.error('Network error — your dream was not saved. Please try again.');
    } finally {
      savingLock.current = false;
      setSaving(false);
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
        <h1 className="font-display text-2xl text-[var(--text-primary)]">Sign in to record</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Your dreams stay private to your account.</p>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="mt-6 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-5 py-3 text-sm font-semibold text-[var(--bg-primary)] transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="morning-capture-page py-4 sm:py-8">
      <DreamCapture
        userId={user.id}
        onSave={handleSave}
        saving={saving}
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

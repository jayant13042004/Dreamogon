'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp, Mic, Save } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { MoodSelector } from './MoodSelector';
import { LuciditySelector } from './LuciditySelector';
import { TagInput } from './TagInput';
import { Mood, Lucidity, Dream } from '@/types/dream';
import {
  clearDreamDraft,
  draftHasSubstance,
  readDreamDraft,
  writeDreamDraft,
} from '@/lib/drafts';
import { toDateKey } from '@/lib/utils/date';

export type CapturePayload = {
  title?: string;
  date: string;
  content: string;
  mood?: Mood | null;
  lucidity?: Lucidity | null;
  tags?: string[];
  usedVoice: boolean;
};

interface DreamCaptureProps {
  userId: string | null | undefined;
  onSave: (payload: CapturePayload) => Promise<void> | void;
  saving?: boolean;
  initialDate?: string;
  initialDream?: Partial<Dream> | null;
  isEditing?: boolean;
  onCancel?: () => void;
}

export function DreamCapture({
  userId,
  onSave,
  saving = false,
  initialDate,
  initialDream,
  isEditing = false,
  onCancel,
}: DreamCaptureProps) {
  const [content, setContent] = useState(initialDream?.content || '');
  const [date, setDate] = useState(() => {
    if (initialDream?.dream_date) return toDateKey(initialDream.dream_date);
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) return initialDate;
    return toDateKey(new Date());
  });
  const [title, setTitle] = useState(initialDream?.title || '');
  const [mood, setMood] = useState<Mood | null>(initialDream?.mood || null);
  const [lucidity, setLucidity] = useState<Lucidity | null>(initialDream?.lucidity || null);
  const [tags, setTags] = useState<string[]>(() => {
    if (!initialDream?.dream_tags) return [];
    return (initialDream.dream_tags as Array<{ tag?: string } | string>).map((t) =>
      typeof t === 'string' ? t : t.tag || ''
    ).filter(Boolean);
  });
  const [detailsOpen, setDetailsOpen] = useState(
    () => isEditing && Boolean(initialDream?.title || initialDream?.mood || initialDream?.lucidity || (initialDream?.dream_tags && (initialDream.dream_tags as unknown[]).length > 0))
  );
  const [hasDraft, setHasDraft] = useState(false);
  const [usedVoice, setUsedVoice] = useState(false);
  const [emptyError, setEmptyError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedRef = useRef(false);

  // Detect draft presence (only when creating new dream, do not auto-inject)
  useEffect(() => {
    if (!userId || isEditing) return;
    const draft = readDreamDraft(userId);
    setHasDraft(draftHasSubstance(draft));
  }, [userId, isEditing]);

  // Autosave draft (only when creating a new dream, user-scoped)
  useEffect(() => {
    if (!userId || isEditing || saving || savedRef.current) return;

    const timer = setTimeout(() => {
      writeDreamDraft(userId, {
        title,
        date,
        content,
        mood,
        lucidity,
        tags,
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [userId, title, date, content, mood, lucidity, tags, saving]);

  // Grow textarea with content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 220)}px`;
  }, [content]);

  // Focus content on mount for morning speed
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(
      () => {
        textareaRef.current?.focus();
      },
      prefersReduced ? 0 : 80
    );
    return () => clearTimeout(t);
  }, []);

  const loadDraft = () => {
    if (!userId) return;
    const draft = readDreamDraft(userId);
    if (!draft) return;
    if (draft.title) setTitle(draft.title);
    if (draft.date) setDate(draft.date);
    if (draft.content) setContent(draft.content);
    if (draft.mood) setMood(draft.mood as Mood);
    if (draft.lucidity) setLucidity(draft.lucidity as Lucidity);
    if (draft.tags) setTags(draft.tags);
    setHasDraft(false);
    setEmptyError(false);
  };

  const discardDraft = () => {
    if (!userId) return;
    clearDreamDraft(userId);
    setHasDraft(false);
  };

  const handleVoiceTranscript = useCallback((text: string) => {
    setUsedVoice(true);
    setEmptyError(false);
    setContent((prev) => {
      const needsSpace = prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n');
      return prev + (needsSpace ? ' ' : '') + text.trim();
    });
  }, []);

  const handleSave = async () => {
    if (saving) return;
    const trimmed = content.trim();
    if (!trimmed) {
      setEmptyError(true);
      textareaRef.current?.focus();
      return;
    }

    setEmptyError(false);
    await onSave({
      title: title.trim() || undefined,
      date,
      content: trimmed,
      mood,
      lucidity,
      tags,
      usedVoice,
    });
    savedRef.current = true;
  };

  return (
    <div className="morning-capture mx-auto w-full max-w-2xl px-1 sm:px-2">
      {hasDraft && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--text-secondary)]">You have an unsaved draft from earlier.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={loadDraft}
              className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-colors"
            >
              Restore
            </button>
          </div>
        </div>
      )}

      <header className="mb-6 space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
          {isEditing ? 'Journal record' : 'Morning journal'}
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--text-primary)] sm:text-4xl">
          {isEditing ? 'Edit dream entry' : 'What do you remember?'}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
          {isEditing
            ? 'Update your recorded memory, emotions, or themes.'
            : 'Capture the dream now. Details and analysis can wait.'}
        </p>
      </header>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-mono">
            <span>{date === toDateKey(new Date()) ? 'Today · ' : ''}</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border-0 bg-transparent py-0.5 px-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:text-[var(--text-primary)] focus:outline-none focus:ring-0 cursor-pointer font-mono"
              aria-label="Dream date"
            />
          </div>
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            disabled={saving}
            size="lg"
            label="Tap to speak"
          />
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (e.target.value.trim()) setEmptyError(false);
          }}
          placeholder="Type what you remember…"
          disabled={saving}
          className={`morning-capture-textarea w-full resize-none rounded-2xl border bg-[var(--bg-card)] px-5 py-5 text-lg leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-1 sm:text-xl transition-colors ${
            emptyError
              ? 'border-rose-400/50 focus:ring-rose-400/30'
              : 'border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-[var(--accent-soft)]'
          }`}
          rows={8}
          aria-label="Dream content"
        />

        {emptyError && (
          <p className="text-sm text-rose-500" role="alert">
            Write or speak a little of the dream before saving.
          </p>
        )}

        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl px-1 py-2 text-left text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span>Optional details (title, mood, tags)</span>
          {detailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {detailsOpen && (
          <div className="space-y-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full border-0 bg-transparent text-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none"
            />
            <MoodSelector value={mood} onChange={setMood} />
            <LuciditySelector value={lucidity} onChange={setLucidity} />
            <TagInput tags={tags} onChange={setTags} />
          </div>
        )}
      </div>

      <div className="sticky bottom-20 z-20 mt-8 pb-[env(safe-area-inset-bottom)] md:static md:bottom-auto md:mt-10 md:pb-0 flex flex-col sm:flex-row items-center gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--accent-soft)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-5 py-3.5 text-sm font-semibold text-[var(--bg-primary)] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            'Saving…'
          ) : (
            <>
              <Save size={16} />
              {isEditing ? 'Save changes' : 'Save dream'}
            </>
          )}
        </button>
      </div>
      <p className="mt-2.5 text-center text-[11px] text-[var(--text-muted)]">
        {isEditing ? 'Changes update immediately in your journal.' : 'Saves immediately. Reflection runs quietly afterward.'}
      </p>

      {/* Decorative mic affordance hint for thumb reach — mobile only visual cue */}
      <div className="pointer-events-none sr-only">
        <Mic aria-hidden />
      </div>
    </div>
  );
}

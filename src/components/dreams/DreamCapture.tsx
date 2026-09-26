'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  Heart,
  Tag,
  Eye,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { MorningRecorder } from './MorningRecorder';
import { MoodSelector } from './MoodSelector';
import { LuciditySelector } from './LuciditySelector';
import { TagInput } from './TagInput';
import { Mood, Lucidity, Dream } from '@/types/dream';
import {
  clearDreamDraft,
  draftHasSubstance,
  readDreamDraft,
  writeDreamDraft,
  MemoryType,
} from '@/lib/drafts';
import { toDateKey } from '@/lib/utils/date';
import { motion, AnimatePresence } from 'framer-motion';

export type CapturePayload = {
  title?: string;
  date: string;
  content: string;
  mood?: Mood | null;
  lucidity?: Lucidity | null;
  tags?: string[];
  usedVoice: boolean;
  memoryType?: MemoryType;
};

interface DreamCaptureProps {
  userId: string | null | undefined;
  onSave: (payload: CapturePayload) => Promise<void> | void;
  saving?: boolean;
  saveSuccess?: boolean;
  saveError?: string | null;
  onRetrySave?: () => void;
  initialDate?: string;
  initialDream?: Partial<Dream> | null;
  isEditing?: boolean;
  onCancel?: () => void;
}

const MEMORY_TYPES: Array<{ id: MemoryType; label: string; hint: string }> = [
  { id: 'fragment', label: 'Fragment', hint: 'A fleeting image, phrase, or vague impression' },
  { id: 'scene', label: 'Single Scene', hint: 'One vivid moment or location' },
  { id: 'feeling', label: 'Feeling / Mood', hint: 'An emotion or sensation upon waking' },
  { id: 'full', label: 'Full Dream', hint: 'A connected sequence of events' },
];

export function DreamCapture({
  userId,
  onSave,
  saving = false,
  saveSuccess = false,
  saveError = null,
  onRetrySave,
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
  const [memoryType, setMemoryType] = useState<MemoryType>('fragment');
  const [tags, setTags] = useState<string[]>(() => {
    if (!initialDream?.dream_tags) return [];
    return (initialDream.dream_tags as Array<{ tag?: string } | string>)
      .map((t) => (typeof t === 'string' ? t : t.tag || ''))
      .filter(Boolean);
  });
  const [detailsOpen, setDetailsOpen] = useState(
    () =>
      isEditing &&
      Boolean(
        initialDream?.title ||
          initialDream?.mood ||
          initialDream?.lucidity ||
          (initialDream?.dream_tags && (initialDream.dream_tags as unknown[]).length > 0)
      )
  );

  const [hasDraft, setHasDraft] = useState(false);
  const [usedVoice, setUsedVoice] = useState(false);
  const [liveInterim, setLiveInterim] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [emptyError, setEmptyError] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedRef = useRef(false);

  // Detect draft presence (only when creating new dream)
  useEffect(() => {
    if (!userId || isEditing) return;
    const draft = readDreamDraft(userId);
    setHasDraft(draftHasSubstance(draft));
  }, [userId, isEditing]);

  // Autosave draft (debounced, only when creating new entry)
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
        memoryType,
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [userId, title, date, content, mood, lucidity, tags, memoryType, saving, isEditing]);

  // Auto-resize textarea to fit waking memory comfortably
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, isEditing ? 220 : 180)}px`;
  }, [content, liveInterim, isEditing]);

  // Focus content on mount for fast morning entry
  useEffect(() => {
    if (isEditing) return;
    const timer = setTimeout(() => {
      // Don't steal focus on mobile if they want to tap voice first
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      if (!isMobile) {
        textareaRef.current?.focus();
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [isEditing]);

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
    if (draft.memoryType) setMemoryType(draft.memoryType);
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
    if (saving || saveSuccess) return;
    const trimmed = content.trim();
    if (!trimmed) {
      setEmptyError(true);
      textareaRef.current?.focus();
      return;
    }

    setEmptyError(false);
    savedRef.current = true;

    // Softly add memory type tag if selected and not full
    const finalTags = [...tags];
    if (memoryType && memoryType !== 'full' && !finalTags.includes(memoryType)) {
      finalTags.push(memoryType);
    }

    await onSave({
      title: title.trim() || undefined,
      date,
      content: trimmed,
      mood,
      lucidity,
      tags: finalTags,
      usedVoice,
      memoryType,
    });
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // ─────────────────────────────────────────────────────────────
  // EDITING MODE (when editing an existing dream record)
  // ─────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="mx-auto w-full max-w-2xl px-2 sm:px-4 space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--accent)] font-mono">
            Journal Record
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-[var(--text-primary)]">
            Edit Dream Entry
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Update your recorded words, emotions, or reflections.
          </p>
        </header>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-muted)] font-mono">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Calendar size={13} className="text-[var(--accent)]" />
              <span>Date:</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border border-[var(--border-default)] bg-[var(--bg-card)] py-1 px-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer font-mono"
              />
            </label>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:border-[var(--accent)] focus:outline-none"
          />

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full resize-none rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 text-base sm:text-lg leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:border-[var(--accent)] focus:outline-none"
          />

          <div className="space-y-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
            <MoodSelector value={mood} onChange={setMood} />
            <LuciditySelector value={lucidity} onChange={setLucidity} />
            <TagInput tags={tags} onChange={setTags} />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-5 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-5 py-3 text-sm font-semibold text-[var(--bg-primary)] transition disabled:opacity-50"
          >
            {saving ? 'Saving changes…' : 'Save changes'}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // SUBCONSCIOUS LOG MORNING CAPTURE MODE (Hero Flow)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="subconscious-capture mx-auto w-full max-w-2xl px-2 sm:px-4 pb-28 sm:pb-24">
      {/* Draft Recovery Notification */}
      <AnimatePresence>
        {hasDraft && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[var(--accent)]/30 bg-[var(--bg-card)] p-4 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw size={16} className="text-[var(--accent)] shrink-0" />
              <p className="text-xs sm:text-sm text-[var(--text-primary)]">
                You have an unsaved dream memory from earlier.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
                className="rounded-xl bg-[var(--accent)] px-3.5 py-1.5 text-xs font-medium text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] transition-colors"
              >
                Restore memory
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network Save Error & Instant Retry Banner */}
      {saveError && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            <span>Connection issue — your words are safely preserved here.</span>
          </div>
          {onRetrySave && (
            <button
              type="button"
              onClick={onRetrySave}
              className="rounded-xl bg-rose-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-rose-600 transition-colors shrink-0"
            >
              Retry saving
            </button>
          )}
        </div>
      )}

      {/* Hero Header for Sleepy Morning Minds */}
      <header className="mb-5 sm:mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-soft)] transition-colors"
              title="Return to Dashboard"
              aria-label="Back to journal"
            >
              <ArrowLeft size={14} />
            </Link>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)] font-mono">
              Morning Archive
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border-0 bg-transparent py-0.5 px-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none cursor-pointer font-mono"
              aria-label="Dream date"
            />
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[var(--text-primary)]">
          What do you remember?
        </h1>
        <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] max-w-lg">
          Speak or type before it fades. A single fragment, emotion, or scene is enough.
        </p>
      </header>

      {/* Quick Fragment Framing Chips — Welcoming Incomplete Memories */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-[var(--text-muted)] font-mono mr-1">Capture type:</span>
        {MEMORY_TYPES.map((type) => {
          const isSelected = memoryType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setMemoryType(type.id)}
              title={type.hint}
              className={`rounded-full px-3 py-1 text-xs transition-all font-medium ${
                isSelected
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-sm'
                  : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-soft)]'
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Primary Hero Voice Recorder */}
      <div className="mb-5">
        <MorningRecorder
          onTranscript={handleVoiceTranscript}
          onInterimText={setLiveInterim}
          onRecordingChange={setIsVoiceRecording}
          disabled={saving || saveSuccess}
        />
      </div>

      {/* Spacious Sleepy-Eye Text Canvas */}
      <div className="relative space-y-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (e.target.value.trim()) setEmptyError(false);
            }}
            placeholder={
              memoryType === 'fragment'
                ? 'Type or speak a fragment… "I was in an unfamiliar room… there was water on the floor…"'
                : memoryType === 'feeling'
                  ? 'Describe the feeling or atmosphere upon waking…'
                  : 'Record what you remember…'
            }
            disabled={saving || saveSuccess}
            rows={7}
            aria-label="Dream memory words"
            className={`w-full resize-none rounded-2xl border bg-[var(--bg-card)] px-5 py-5 text-lg sm:text-xl md:text-2xl leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/45 focus:outline-none transition-colors ${
              emptyError
                ? 'border-rose-400/60 focus:ring-2 focus:ring-rose-400/20'
                : isVoiceRecording
                  ? 'border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]'
                  : 'border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-soft)]'
            }`}
          />

          {/* Active Voice Live Indicator in bottom right of textarea */}
          {liveInterim && (
            <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
              <p className="text-xs sm:text-sm italic text-[var(--accent)]/90 truncate font-serif">
                transcribing: “{liveInterim}”
              </p>
            </div>
          )}
        </div>

        {/* Word count and reassurance */}
        <div className="flex items-center justify-between px-1 text-[11px] text-[var(--text-muted)] font-mono">
          <span>
            {wordCount > 0
              ? `${wordCount} ${wordCount === 1 ? 'word' : 'words'} captured`
              : 'Speak or type as much or as little as you recall'}
          </span>
          {usedVoice && <span className="text-[var(--accent)]">Voice dictation active</span>}
        </div>

        {emptyError && (
          <p className="text-xs text-rose-400 pt-1" role="alert">
            Please speak or type a little of what you remember before saving.
          </p>
        )}
      </div>

      {/* Optional Details Accordion — Never Required Before Saving */}
      <div className="mt-6 pt-2">
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--accent)]" />
            <span>Optional details (title, mood, tags)</span>
          </span>
          {detailsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {detailsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5"
          >
            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">
                Title (Optional — auto-generated from your memory if omitted)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this memory a name…"
                className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
            <MoodSelector value={mood} onChange={setMood} />
            <LuciditySelector value={lucidity} onChange={setLucidity} />
            <TagInput tags={tags} onChange={setTags} />
          </motion.div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          THUMB-FRIENDLY FIXED/STICKY BOTTOM ACTION BAR (MOBILE FIRST)
         ───────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-t border-[var(--border-default)] p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:static md:bottom-auto md:mt-8 md:p-0 md:bg-transparent md:border-0 md:backdrop-blur-none">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || saveSuccess || !content.trim()}
            className={`w-full flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-base font-semibold transition-all active:scale-[0.98] ${
              saveSuccess
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : saving
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] opacity-80 cursor-wait'
                  : 'bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] shadow-lg shadow-[var(--accent-soft)]'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 size={18} className="text-white" />
                <span>Saved to your archive</span>
              </>
            ) : saving ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                <span>Saving to archive…</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save to archive</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-2 text-center text-[11px] text-[var(--text-muted)]">
          {saveSuccess
            ? 'Raw memory preserved safely. Observing connections in background…'
            : 'Saves immediately to your archive. AI reflection runs quietly afterward.'}
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Save, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MoodSelector } from './MoodSelector';
import { LuciditySelector } from './LuciditySelector';
import { TagInput } from './TagInput';
import { VoiceInput } from './VoiceInput';
import { Dream, Mood, Lucidity } from '@/types/dream';
import { useAuth } from '@/hooks/useAuth';
import {
  clearDreamDraft,
  draftHasSubstance,
  readDreamDraft,
  writeDreamDraft,
} from '@/lib/drafts';

interface DreamEditorProps {
  initialDream?: Partial<Dream>;
  onSave: (dream: {
    title: string;
    date: string;
    content: string;
    mood: Mood | null;
    lucidity: Lucidity | null;
    tags: string[];
  }, analyze: boolean) => void | Promise<void>;
  isEditing?: boolean;
  saving?: boolean;
}

export function DreamEditor({
  initialDream,
  onSave,
  isEditing = false,
  saving = false,
}: DreamEditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialDream?.title || '');
  const [date, setDate] = useState(
    initialDream?.dream_date || new Date().toISOString().split('T')[0]
  );
  const [content, setContent] = useState(initialDream?.content || '');
  const [mood, setMood] = useState<Mood | null>(initialDream?.mood || null);
  const [lucidity, setLucidity] = useState<Lucidity | null>(initialDream?.lucidity || null);
  const [tags, setTags] = useState<string[]>(
    initialDream?.dream_tags
      ? (initialDream.dream_tags as { tag?: string }[] | string[]).map((t) =>
          typeof t === 'string' ? t : t.tag || ''
        )
      : []
  );
  const [hasDraft, setHasDraft] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isEditing || !user) return;
    const draft = readDreamDraft(user.id);
    setHasDraft(draftHasSubstance(draft));
  }, [isEditing, user]);

  const loadDraft = () => {
    if (!user) return;
    const parsed = readDreamDraft(user.id);
    if (!parsed) return;
    if (parsed.title) setTitle(parsed.title);
    if (parsed.date) setDate(parsed.date);
    if (parsed.content) setContent(parsed.content);
    if (parsed.mood) setMood(parsed.mood as Mood);
    if (parsed.lucidity) setLucidity(parsed.lucidity as Lucidity);
    if (parsed.tags) setTags(parsed.tags);
    setHasDraft(false);
  };

  const clearDraft = () => {
    if (!user) return;
    clearDreamDraft(user.id);
    setHasDraft(false);
  };

  useEffect(() => {
    if (isEditing || !user || saving) return;

    const timer = setTimeout(() => {
      writeDreamDraft(user.id, { title, date, content, mood, lucidity, tags });
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, date, content, mood, lucidity, tags, isEditing, user, saving]);

  const handleVoiceTranscript = useCallback((text: string) => {
    setContent((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + text);
  }, []);

  const handleSubmit = async (analyze: boolean) => {
    if (!content.trim() || saving) return;

    await onSave(
      {
        title: title.trim() || 'Untitled Dream',
        date,
        content: content.trim(),
        mood,
        lucidity,
        tags,
      },
      analyze
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      {hasDraft && !isEditing && (
        <div className="bg-[var(--accent-soft)] border border-[var(--accent)] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Info className="text-[var(--accent)] shrink-0" size={20} />
            <span className="text-[var(--text-primary)] text-sm">
              You have an unsaved dream draft. Restore it?
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={clearDraft}>
              Discard
            </Button>
            <Button size="sm" onClick={loadDraft}>
              Restore
            </Button>
          </div>
        </div>
      )}

      <form ref={formRef} className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your dream a name..."
            className="w-full text-3xl md:text-4xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm bg-transparent border-none text-[var(--text-secondary)] focus:outline-none cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">The Dream</label>
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={saving} />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write everything you remember..."
            disabled={saving}
            className="w-full min-h-[300px] p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] resize-y text-[var(--text-primary)] text-lg leading-relaxed shadow-inner transition-colors"
          />
          <div className="text-right text-xs text-[var(--text-muted)]">{content.length} characters</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MoodSelector value={mood} onChange={setMood} />
          <LuciditySelector value={lucidity} onChange={setLucidity} />
        </div>

        <div className="max-w-md">
          <TagInput tags={tags} onChange={setTags} />
        </div>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 items-center justify-end border-t border-[var(--border-default)]">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={() => handleSubmit(false)}
            disabled={!content.trim() || saving}
          >
            <Save size={18} />
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Save'}
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={() => handleSubmit(true)}
            disabled={!content.trim() || saving}
          >
            <Sparkles size={18} />
            {saving ? 'Saving…' : isEditing ? 'Save & re-explore' : 'Save & explore'}
          </Button>
        </div>
      </form>
    </div>
  );
}

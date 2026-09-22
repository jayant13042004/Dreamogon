'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { EmptyState, Spinner } from '@/components/ui';
import {
  BookOpen,
  TrendingUp,
  Users,
  MapPin,
  Heart,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Dream, DreamEntity } from '@/types/dream';
import {
  aggregateEntitiesByType,
  aggregateMoods,
  aggregateThemes,
  buildQuietPatternNotes,
  recurringOnly,
  type CountedItem,
} from '@/lib/patterns';

function PatternList({
  title,
  icon: Icon,
  items,
  empty,
  hrefBase,
}: {
  title: string;
  icon: LucideIcon;
  items: CountedItem[];
  empty: string;
  hrefBase: string;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-[var(--text-muted)]" />
        <h2 className="text-sm font-medium text-[var(--text-primary)]">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 8).map((item) => (
            <li key={`${item.type}-${item.name}`} className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-[var(--bg-elevated)] transition-colors group">
              <Link
                href={hrefBase.replace('{name}', encodeURIComponent(item.name))}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] truncate flex-1"
              >
                {item.name}
              </Link>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  {item.count}×
                </span>
                <Link
                  href={`/chat?q=${encodeURIComponent(`Tell me about the pattern of "${item.name}" in my dreams.`)}`}
                  className="opacity-0 group-hover:opacity-100 text-[11px] text-[var(--accent)] hover:underline transition-opacity hidden sm:inline"
                  title={`Reflect on ${item.name}`}
                >
                  Discuss
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function InsightsPage() {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [entities, setEntities] = useState<DreamEntity[]>([]);
  const [aiNotes, setAiNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);

      const [dreamsRes, entitiesRes] = await Promise.all([
        supabase
          .from('dreams')
          .select('id, title, dream_date, mood, ai_themes, ai_summary, ai_analysis')
          .eq('user_id', user.id)
          .order('dream_date', { ascending: true }),
        supabase.from('dream_entities').select('*').eq('user_id', user.id),
      ]);

      if (dreamsRes.data) setDreams(dreamsRes.data as Dream[]);
      if (entitiesRes.data) setEntities(entitiesRes.data as DreamEntity[]);
      setLoading(false);
    }

    fetchData();
  }, [user, supabase]);

  useEffect(() => {
    async function fetchAiPatterns() {
      if (dreams.length < 3) return;
      setInsightsLoading(true);
      try {
        const response = await fetch('/api/ai/patterns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dreams: dreams.map((d) => ({
              id: d.id,
              title: d.title,
              dream_date: d.dream_date,
              mood: d.mood,
              ai_themes: d.ai_themes,
              ai_summary: d.ai_summary,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const patternsObj = data.patterns;
          if (patternsObj) {
            setAiNotes([
              ...(patternsObj.interesting_observations || []),
              ...(patternsObj.emotional_patterns || []),
            ]);
          }
        }
      } catch {
        console.error('Failed to fetch insights');
      } finally {
        setInsightsLoading(false);
      }
    }

    if (dreams.length >= 3 && aiNotes.length === 0) {
      fetchAiPatterns();
    }
  }, [dreams, aiNotes.length]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const themes = aggregateThemes(dreams);
  const moods = aggregateMoods(dreams);
  const people = aggregateEntitiesByType(entities, 'person');
  const places = aggregateEntitiesByType(entities, 'place');
  const quietNotes = buildQuietPatternNotes({
    dreamCount: dreams.length,
    themes,
    people,
    places,
    moods,
  });

  if (dreams.length < 2) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-medium mb-2 text-[var(--text-primary)]">Insights</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Patterns appear after a few dreams. Keep recording when you remember something.
        </p>
        <EmptyState
          title="Not enough dreams yet"
          description="Record at least a couple of dreams to start noticing recurring themes, people, and places."
          icon={TrendingUp}
          action={{ label: 'Record a dream', onClick: () => (window.location.href = '/dream/new') }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium text-[var(--text-primary)]">Insights</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Recurring threads across {dreams.length} dreams — framed as possibilities, not conclusions.
          </p>
        </div>
        <Link
          href="/dreams"
          className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <BookOpen size={14} />
          Browse journal
        </Link>
      </div>

      {(quietNotes.length > 0 || insightsLoading || aiNotes.length > 0) && (
        <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--text-muted)]" />
              <h2 className="text-sm font-medium text-[var(--text-primary)]">What keeps returning</h2>
            </div>
            <Link
              href={`/chat?q=${encodeURIComponent('What recurring patterns or themes appear most frequently across my dreams?')}`}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
            >
              <span>Reflect on patterns with Dreamogon</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <ul className="space-y-3">
            {quietNotes.map((note, i) => (
              <li key={`q-${i}`} className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {note}
              </li>
            ))}
            {insightsLoading && (
              <li className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                <Spinner size="sm" /> Looking for quieter cross-dream patterns...
              </li>
            )}
            {aiNotes.slice(0, 4).map((note, i) => (
              <li key={`a-${i}`} className="text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                {note}
                <span className="block text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  Reflective suggestion
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PatternList
          title="Recurring themes"
          icon={TrendingUp}
          items={recurringOnly(themes)}
          empty="Themes will appear here after dreams are analyzed."
          hrefBase="/dreams?theme={name}"
        />
        <PatternList
          title="Emotions you marked"
          icon={Heart}
          items={recurringOnly(moods)}
          empty="Add a mood when you record to see emotional patterns."
          hrefBase="/dreams?mood={name}"
        />
        <PatternList
          title="People who return"
          icon={Users}
          items={recurringOnly(people)}
          empty="People extracted from analyzed dreams will show here."
          hrefBase="/dreams?entityType=person&entityName={name}"
        />
        <PatternList
          title="Places that return"
          icon={MapPin}
          items={recurringOnly(places)}
          empty="Places extracted from analyzed dreams will show here."
          hrefBase="/dreams?entityType=place&entityName={name}"
        />
      </div>

      <p className="text-[11px] text-[var(--text-muted)] text-center max-w-lg mx-auto leading-relaxed">
        These lists are built from your journal and AI extractions labels. They are for self-reflection —
        not medical or psychological diagnosis.
      </p>
    </div>
  );
}

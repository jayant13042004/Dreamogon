'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DreamFilters,
  DreamFiltersState,
  EMPTY_DREAM_FILTERS,
} from '@/components/dreams/DreamFilters';
import { DreamList } from '@/components/dreams/DreamList';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Plus, BookOpen, AlertCircle, CalendarDays, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Dream, DreamEntity } from '@/types/dream';
import { useAuth } from '@/hooks/useAuth';
import {
  aggregateEntitiesByType,
  aggregateThemes,
} from '@/lib/patterns';
import Link from 'next/link';

function DreamsListContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [filters, setFilters] = useState<DreamFiltersState>({
    ...EMPTY_DREAM_FILTERS,
    search: searchParams.get('search') || '',
    mood: searchParams.get('mood') || null,
    lucidity: searchParams.get('lucidity') || null,
    theme: searchParams.get('theme') || null,
    entityType: (searchParams.get('entityType') as 'person' | 'place' | null) || null,
    entityName: searchParams.get('entityName') || null,
    startDate: searchParams.get('startDate') || null,
    endDate: searchParams.get('endDate') || null,
    sort: (searchParams.get('sort') as DreamFiltersState['sort']) || 'newest',
  });

  const [dreams, setDreams] = useState<Dream[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [themeOptions, setThemeOptions] = useState<string[]>([]);
  const [personOptions, setPersonOptions] = useState<string[]>([]);
  const [placeOptions, setPlaceOptions] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => clearTimeout(handler);
  }, [filters.search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filters.mood) params.set('mood', filters.mood);
    if (filters.lucidity) params.set('lucidity', filters.lucidity);
    if (filters.theme) params.set('theme', filters.theme);
    if (filters.entityType && filters.entityName) {
      params.set('entityType', filters.entityType);
      params.set('entityName', filters.entityName);
    }
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.sort !== 'newest') params.set('sort', filters.sort);

    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '/dreams', { scroll: false });
  }, [
    debouncedSearch,
    filters.mood,
    filters.lucidity,
    filters.theme,
    filters.entityType,
    filters.entityName,
    filters.startDate,
    filters.endDate,
    filters.sort,
    router,
  ]);

  // Facet options from user's journal (not only current page)
  useEffect(() => {
    async function loadFacets() {
      if (!user) return;
      const [dreamsRes, entitiesRes] = await Promise.all([
        supabase
          .from('dreams')
          .select('ai_themes')
          .eq('user_id', user.id)
          .not('ai_themes', 'is', null)
          .limit(200),
        supabase.from('dream_entities').select('*').eq('user_id', user.id).limit(500),
      ]);

      const themeAgg = aggregateThemes((dreamsRes.data || []) as Dream[]);
      setThemeOptions(themeAgg.slice(0, 30).map((t) => t.name));

      const entities = (entitiesRes.data || []) as DreamEntity[];
      setPersonOptions(aggregateEntitiesByType(entities, 'person').slice(0, 40).map((p) => p.name));
      setPlaceOptions(aggregateEntitiesByType(entities, 'place').slice(0, 40).map((p) => p.name));
    }
    if (user) void loadFacets();
  }, [user, supabase]);

  const fetchDreams = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', '40');
      params.set('page', '1');
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filters.mood) params.set('mood', filters.mood);
      if (filters.lucidity) params.set('lucidity', filters.lucidity);
      if (filters.theme) params.set('theme', filters.theme);
      if (filters.entityType && filters.entityName) {
        params.set('entityType', filters.entityType);
        params.set('entityName', filters.entityName);
      }
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      if (filters.sort === 'oldest') {
        params.set('sortBy', 'dream_date');
        params.set('sortOrder', 'asc');
      } else if (filters.sort === 'a-z') {
        params.set('sortBy', 'title');
        params.set('sortOrder', 'asc');
      } else {
        params.set('sortBy', 'dream_date');
        params.set('sortOrder', 'desc');
      }

      const res = await fetch(`/api/dreams?${params.toString()}`);
      if (res.status === 401) {
        setError('Please sign in to view your journal.');
        setDreams([]);
        return;
      }
      if (!res.ok) throw new Error('Failed to load dreams');

      const data = await res.json();
      setDreams((data.dreams || []) as Dream[]);
      setTotalCount(data.total || 0);
    } catch {
      setError('Could not load your dreams. Check your connection and try again.');
      setDreams([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, debouncedSearch, filters, supabase]);

  useEffect(() => {
    if (!authLoading && user) fetchDreams();
    if (!authLoading && !user) {
      setIsLoading(false);
      setError('Please sign in to view your journal.');
    }
  }, [fetchDreams, authLoading, user]);

  if (authLoading) {
    return <div className="p-8 text-center text-[var(--text-muted)]">Loading journal…</div>;
  }

  const hasFilters =
    Boolean(debouncedSearch) ||
    Boolean(filters.mood) ||
    Boolean(filters.lucidity) ||
    Boolean(filters.theme) ||
    Boolean(filters.entityName) ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[var(--text-primary)]">Dream Archive</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            {totalCount} {totalCount === 1 ? 'dream' : 'dreams'} in your private archive
          </p>
        </div>
        <Button onClick={() => router.push('/dream/new')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Record Dream
        </Button>
      </div>

      {totalCount >= 2 && (
        <div className="mb-6 flex flex-wrap gap-2 text-xs">
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)] transition-colors"
          >
            <TrendingUp size={12} />
            Patterns & insights
          </Link>
          <Link
            href="/dreams?view=calendar"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)] transition-colors"
          >
            <CalendarDays size={12} />
            Browse by calendar
          </Link>
        </div>
      )}

      {(filters.entityName || filters.theme) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] font-mono">Filtering by:</span>
          {filters.entityName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--border-default)] px-3 py-1 text-xs text-[var(--accent)] font-medium">
              <span>{filters.entityType ? `${filters.entityType}: ` : ''}<strong>{filters.entityName}</strong></span>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, entityType: null, entityName: null }))}
                className="hover:text-[var(--text-primary)] transition-colors cursor-pointer text-[10px]"
                title="Clear entity filter"
              >
                ✕
              </button>
            </span>
          )}
          {filters.theme && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--border-default)] px-3 py-1 text-xs text-[var(--accent)] font-medium">
              <span>Theme: <strong>{filters.theme}</strong></span>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, theme: null }))}
                className="hover:text-[var(--text-primary)] transition-colors cursor-pointer text-[10px]"
                title="Clear theme filter"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      <DreamFilters
        filters={filters}
        onFilterChange={setFilters}
        themeOptions={themeOptions}
        personOptions={personOptions}
        placeOptions={placeOptions}
      />

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            <Button size="sm" variant="secondary" className="mt-3" onClick={() => fetchDreams()}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {!error && dreams.length === 0 && !isLoading ? (
        <div className="mt-12">
          <EmptyState
            icon={BookOpen}
            title={hasFilters ? 'No matching dreams' : 'No dreams yet'}
            description={
              hasFilters
                ? 'Try clearing filters or searching different words.'
                : 'Record what you remember when you wake — even a few lines help.'
            }
            action={
              !hasFilters
                ? {
                    label: 'Record your first dream',
                    onClick: () => router.push('/dream/new'),
                  }
                : {
                    label: 'Clear filters',
                    onClick: () => setFilters({ ...EMPTY_DREAM_FILTERS }),
                  }
            }
          />
        </div>
      ) : (
        !error && (
          <DreamList
            dreams={dreams}
            isLoading={isLoading}
            initialView={searchParams.get('view') === 'calendar' ? 'calendar' : 'grid'}
          />
        )
      )}
    </div>
  );
}

export default function DreamsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[var(--text-muted)]">Loading dreams…</div>}>
      <DreamsListContainer />
    </Suspense>
  );
}

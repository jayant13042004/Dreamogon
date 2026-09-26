'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, List as ListIcon, Calendar as CalendarIcon, CalendarDays, ArrowRight, Image as ImageIcon, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dream } from '@/types/dream';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDreamDate, getRelativeDate, toDateKey } from '@/lib/utils/date';
import { MOODS } from '@/lib/utils/constants';
import { resolveDreamImageUrl } from '@/lib/storage/dream-images';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { EmptyState } from '@/components/ui/EmptyState';

interface DreamListProps {
  dreams: Dream[];
  isLoading: boolean;
  initialView?: 'grid' | 'list' | 'timeline' | 'calendar';
}

export function DreamList({ dreams, isLoading, initialView = 'grid' }: DreamListProps) {
  const router = useRouter();
  const [view, setView] = useState<'grid' | 'list' | 'timeline' | 'calendar'>(initialView);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [calendarDirection, setCalendarDirection] = useState(0);

  const handlePrevMonth = () => {
    setCalendarDirection(-1);
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDirection(1);
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== calendarMonth.getMonth()) {
      setCalendarDirection(date.getMonth() > calendarMonth.getMonth() ? 1 : -1);
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;
  const selectedDreams = selectedKey
    ? dreams.filter((d) => toDateKey(d.dream_date) === selectedKey)
    : [];
  const todayKey = toDateKey(new Date());
  const canRecordForSelected = Boolean(selectedKey && selectedKey <= todayKey);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full mt-6">
      {/* View Toggle */}
      <div className="flex justify-end mb-6 gap-1.5 sm:gap-2">
        <button
          onClick={() => setView('grid')}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
            view === 'grid'
              ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--bg-primary)]'
              : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
          title="Grid View (Visual Memories)"
        >
          <LayoutGrid size={14} />
          <span className="hidden sm:inline">Grid</span>
        </button>

        <button
          onClick={() => setView('list')}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
            view === 'list'
              ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--bg-primary)]'
              : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
          title="List View"
        >
          <ListIcon size={14} />
          <span className="hidden sm:inline">List</span>
        </button>

        <button
          onClick={() => setView('timeline')}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
            view === 'timeline'
              ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--bg-primary)]'
              : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
          title="Timeline View"
        >
          <CalendarIcon size={14} />
          <span className="hidden sm:inline">Timeline</span>
        </button>

        <button
          onClick={() => setView('calendar')}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
            view === 'calendar'
              ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--bg-primary)]'
              : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
          title="Calendar Month View"
        >
          <CalendarDays size={14} />
          <span className="hidden sm:inline">Calendar</span>
        </button>
      </div>

      {/* ─── GRID VIEW (VISUAL ARCHIVE) ─── */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dreams.map((dream) => {
            const moodInfo = MOODS.find(m => m.value === dream.mood);
            const visualUrl = resolveDreamImageUrl(dream);
            return (
              <Link key={dream.id} href={`/dream/${dream.id}`} className="group block h-full">
                <div className="h-full flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-all duration-300 overflow-hidden">
                  
                  {/* Visual Impression Header if present */}
                  {visualUrl ? (
                    <div className="relative w-full h-44 overflow-hidden bg-[var(--bg-secondary)] border-b border-[var(--border-default)]">
                      <img
                        src={visualUrl}
                        alt={dream.title || 'Dream impression'}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-20 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between px-5">
                      <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
                        <ImageIcon size={14} className="opacity-70" />
                        <span className="text-[10px] uppercase font-mono tracking-wider">Dream Record</span>
                      </div>
                      {moodInfo && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-muted)] uppercase tracking-wider">
                          {moodInfo.label}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-display font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1 mb-1">
                      {dream.title || 'Untitled Dream'}
                    </h3>
                    <p className="text-[var(--text-muted)] text-xs font-mono mb-3">
                      {getRelativeDate(dream.dream_date)}
                    </p>
                    {/* Entities & Themes — Living Archive Connections */}
                    {((dream.dream_entities && dream.dream_entities.length > 0) || (dream.ai_themes && dream.ai_themes.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {dream.dream_entities?.slice(0, 3).map((ent) => (
                          <span
                            key={ent.id || `${ent.entity_type}-${ent.entity_name}`}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              ent.entity_type === 'person'
                                ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                                : ent.entity_type === 'place'
                                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                                  : 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-muted)]'
                            }`}
                          >
                            {ent.entity_name}
                          </span>
                        ))}
                        {dream.ai_themes?.slice(0, (dream.dream_entities?.length ? 1 : 2)).map((theme) => (
                          <span
                            key={theme}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-muted)]"
                          >
                            {theme}
                          </span>
                        ))}
                        {(dream.dream_entities?.length || 0) > 3 && (
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            +{(dream.dream_entities?.length || 0) - 3}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[var(--text-secondary)] text-sm line-clamp-2 leading-relaxed mb-4 flex-grow">
                      {dream.content}
                    </p>

                    <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
                      <span>Open entry</span>
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ─── LIST VIEW ─── */}
      {view === 'list' && (
        <div className="space-y-3">
          {dreams.map((dream) => {
            const moodInfo = MOODS.find(m => m.value === dream.mood);
            const visualUrl = resolveDreamImageUrl(dream);
            return (
              <Link key={dream.id} href={`/dream/${dream.id}`} className="block group">
                <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-all flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {visualUrl ? (
                      <img
                        src={visualUrl}
                        alt="thumbnail"
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[var(--border-default)]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] shrink-0 border border-[var(--border-default)]">
                        <ImageIcon size={16} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="font-display font-medium text-[var(--text-primary)] text-base group-hover:text-[var(--accent)] transition-colors truncate">
                        {dream.title || 'Untitled Dream'}
                      </h3>
                      <p className="text-[var(--text-secondary)] text-xs truncate max-w-xl mt-0.5">
                        {dream.content}
                      </p>
                      {dream.dream_entities && dream.dream_entities.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          {dream.dream_entities.slice(0, 3).map((ent) => (
                            <span
                              key={ent.id || `${ent.entity_type}-${ent.entity_name}`}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-muted)]"
                            >
                              {ent.entity_name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[var(--text-muted)] font-mono hidden sm:inline">
                      {getRelativeDate(dream.dream_date)}
                    </span>
                    {moodInfo && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-muted)] uppercase tracking-wider hidden md:inline">
                        {moodInfo.label}
                      </span>
                    )}
                    <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ─── TIMELINE VIEW ─── */}
      {view === 'timeline' && (
        <div className="relative pl-6 md:pl-0 space-y-7">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-[var(--border-default)] transform md:-translate-x-1/2" />

          {dreams.map((dream, index) => {
            return (
              <div
                key={dream.id}
                className={`relative flex items-center justify-between md:justify-normal w-full ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Center Node dot */}
                <div className="absolute left-0 md:left-1/2 w-3 h-3 bg-[var(--accent)] rounded-full transform -translate-x-1.5 md:-translate-x-1.5 ring-4 ring-[var(--bg-primary)] z-10" />

                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] ml-8 md:ml-0 group">
                  <Link href={`/dream/${dream.id}`} className="block">
                    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-all space-y-2.5">
                      
                      {dream.image_url && (
                        <div className="w-full h-36 rounded-xl overflow-hidden mb-2.5 border border-[var(--border-default)]">
                          <img
                            src={dream.image_url}
                            alt="Milestone visual"
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className="text-xs text-[var(--text-muted)] font-mono font-medium">
                        {formatDreamDate(new Date(dream.dream_date))}
                      </div>

                      <h3 className="text-lg font-display font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {dream.title || 'Untitled Dream'}
                      </h3>

                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                        "{dream.content}"
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── CALENDAR VIEW ─── */}
      {view === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative min-h-[500px]">
            <CalendarGrid
              currentMonth={calendarMonth}
              dreams={dreams}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              direction={calendarDirection}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6 pb-4 border-b border-[var(--border-default)]">
                {selectedDate ? formatDreamDate(selectedDate) : 'Select a date'}
              </h3>

              {selectedDreams.length > 0 ? (
                <div className="space-y-3">
                  {selectedDreams.map((dream) => {
                    const moodInfo = MOODS.find((m) => m.value === dream.mood);
                    return (
                      <Link href={`/dream/${dream.id}`} key={dream.id} className="block group">
                        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-transparent group-hover:border-[var(--accent)] transition-colors">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h4 className="font-medium text-[var(--text-primary)] line-clamp-1">
                              {dream.title || 'Untitled Dream'}
                            </h4>
                            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0" />
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
                            {dream.content}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {moodInfo && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                                {moodInfo.label}
                              </span>
                            )}
                            {(dream.ai_themes || []).slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-muted)]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="No dreams this day"
                  description={
                    canRecordForSelected
                      ? 'Nothing recorded for this date yet.'
                      : 'Future dates have no entries yet.'
                  }
                  action={
                    canRecordForSelected
                      ? {
                          label: 'Record for this date',
                          onClick: () =>
                            router.push(`/dream/new?date=${selectedKey}`),
                        }
                      : undefined
                  }
                  className="py-8"
                />
              )}

              {canRecordForSelected && selectedDreams.length > 0 && (
                <button
                  type="button"
                  onClick={() => router.push(`/dream/new?date=${selectedKey}`)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--border-default)]"
                >
                  <Plus size={14} />
                  Add another dream this day
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MOODS, LUCIDITY_OPTIONS } from '@/lib/utils/constants';

export interface DreamFiltersState {
  search: string;
  mood: string | null;
  lucidity: string | null;
  theme: string | null;
  entityType: 'person' | 'place' | null;
  entityName: string | null;
  startDate: string | null;
  endDate: string | null;
  sort: 'newest' | 'oldest' | 'a-z';
}

export const EMPTY_DREAM_FILTERS: DreamFiltersState = {
  search: '',
  mood: null,
  lucidity: null,
  theme: null,
  entityType: null,
  entityName: null,
  startDate: null,
  endDate: null,
  sort: 'newest',
};

interface DreamFiltersProps {
  filters: DreamFiltersState;
  onFilterChange: (filters: DreamFiltersState) => void;
  themeOptions?: string[];
  personOptions?: string[];
  placeOptions?: string[];
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'a-z', label: 'Title A–Z' },
];

const selectClass =
  'w-full md:w-auto bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

export function DreamFilters({
  filters,
  onFilterChange,
  themeOptions = [],
  personOptions = [],
  placeOptions = [],
}: DreamFiltersProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleChange = <K extends keyof DreamFiltersState>(key: K, value: DreamFiltersState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleClear = () => onFilterChange({ ...EMPTY_DREAM_FILTERS });

  const hasActive =
    Boolean(filters.search) ||
    Boolean(filters.mood) ||
    Boolean(filters.lucidity) ||
    Boolean(filters.theme) ||
    Boolean(filters.entityName) ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate) ||
    filters.sort !== 'newest';

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <Input
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search dream text…"
            className="pl-10 w-full"
            aria-label="Search dreams"
          />
        </div>
        <Button
          variant="secondary"
          className="md:hidden flex items-center gap-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div
        className={`
        flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 p-4 md:p-0
        bg-[var(--bg-card)] md:bg-transparent rounded-lg md:rounded-none
        border md:border-none border-[var(--border-default)]
        ${isMobileMenuOpen ? 'block' : 'hidden md:flex'}
      `}
      >
        <select
          value={filters.mood || ''}
          onChange={(e) => handleChange('mood', e.target.value || null)}
          className={selectClass}
          aria-label="Filter by emotion"
        >
          <option value="">All emotions</option>
          {MOODS.map((mood) => (
            <option key={mood.value} value={mood.value}>
              {mood.label}
            </option>
          ))}
        </select>

        <select
          value={filters.lucidity || ''}
          onChange={(e) => handleChange('lucidity', e.target.value || null)}
          className={selectClass}
          aria-label="Filter by lucidity"
        >
          <option value="">All lucidity</option>
          {LUCIDITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {themeOptions.length > 0 && (
          <select
            value={filters.theme || ''}
            onChange={(e) => handleChange('theme', e.target.value || null)}
            className={selectClass}
            aria-label="Filter by theme"
          >
            <option value="">All themes</option>
            {themeOptions.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        )}

        {personOptions.length > 0 && (
          <select
            value={filters.entityType === 'person' ? filters.entityName || '' : ''}
            onChange={(e) => {
              const name = e.target.value || null;
              onFilterChange({
                ...filters,
                entityType: name ? 'person' : null,
                entityName: name,
              });
            }}
            className={selectClass}
            aria-label="Filter by person"
          >
            <option value="">All people</option>
            {personOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}

        {placeOptions.length > 0 && (
          <select
            value={filters.entityType === 'place' ? filters.entityName || '' : ''}
            onChange={(e) => {
              const name = e.target.value || null;
              onFilterChange({
                ...filters,
                entityType: name ? 'place' : null,
                entityName: name,
              });
            }}
            className={selectClass}
            aria-label="Filter by place"
          >
            <option value="">All places</option>
            {placeOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value || null)}
            className="w-full md:w-auto"
            aria-label="Start date"
          />
          <span className="text-[var(--text-muted)]">–</span>
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value || null)}
            className="w-full md:w-auto"
            aria-label="End date"
          />
        </div>

        <select
          value={filters.sort}
          onChange={(e) => handleChange('sort', e.target.value as DreamFiltersState['sort'])}
          className={`${selectClass} md:ml-auto`}
          aria-label="Sort dreams"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasActive && (
          <Button
            variant="ghost"
            onClick={handleClear}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui';
import { 
  Sparkles, X, ArrowRight, Compass, Search, BookOpen, Share2, 
  ChevronRight, MessageSquare, Users, MapPin, Lightbulb, Shapes,
  Calendar, Layers, ChevronDown, ChevronUp
} from 'lucide-react';
import { DreamArtifact, TemporalStatus, EntityType } from '@/types/dream';
import { DreamWorldCanvas } from '@/components/world/DreamWorldCanvas';
import { fetchCompleteDreamWorldData, DreamWorldData } from '@/lib/dreamWorld';
import { ShareableDiscoveriesModal } from '@/components/world/ShareableDiscoveriesModal';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'All Landmarks' },
  { id: 'person', label: 'People' },
  { id: 'place', label: 'Places' },
  { id: 'theme', label: 'Themes' },
  { id: 'symbols', label: 'Symbols & Entities' },
];

const TEMPORAL_LENSES = [
  { id: 'all', label: 'All States' },
  { id: 'anchor', label: 'Anchors' },
  { id: 'recurring', label: 'Recurring' },
  { id: 'emerging', label: 'Emerging' },
  { id: 'dormant', label: 'Dormant' },
];

function DreamWorldContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') === 'map' ? 'map' : 'overview';
  const [view, setView] = useState<'overview' | 'map'>(initialView);

  const { user } = useAuth();
  const [worldData, setWorldData] = useState<DreamWorldData>({
    artifacts: [],
    connections: [],
    insights: [],
    dreamCount: 0,
    topThemes: [],
    mostRecurringElement: null,
    topEmotion: null,
    hasUnfamiliarConnection: false,
    totalMilestone: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedArtifact, setSelectedArtifact] = useState<DreamArtifact | null>(null);
  const [showDiscoveriesModal, setShowDiscoveriesModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [temporalFilter, setTemporalFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const data = await fetchCompleteDreamWorldData(supabase, user.id);
        setWorldData(data);
      } catch (err) {
        console.error('Failed to load Dream World data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, supabase]);

  const { artifacts, connections, dreamCount, topThemes, mostRecurringElement, topEmotion } = worldData;

  // Filter artifacts
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((art) => {
      const matchesCat = (() => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'person') return art.artifact_type === 'person';
        if (selectedCategory === 'place') return art.artifact_type === 'place';
        if (selectedCategory === 'theme') return art.artifact_type === 'theme';
        if (selectedCategory === 'symbols') {
          return ['symbol', 'object', 'animal', 'emotion', 'activity'].includes(art.artifact_type);
        }
        return art.artifact_type === selectedCategory;
      })();

      const matchesTemporal = temporalFilter === 'all' || art.temporal_status === temporalFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        art.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.artifact_type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesTemporal && matchesSearch;
    });
  }, [artifacts, selectedCategory, temporalFilter, searchQuery]);

  // Group into core sections
  const people = useMemo(() => filteredArtifacts.filter((a) => a.artifact_type === 'person'), [filteredArtifacts]);
  const places = useMemo(() => filteredArtifacts.filter((a) => a.artifact_type === 'place'), [filteredArtifacts]);
  const themes = useMemo(() => filteredArtifacts.filter((a) => a.artifact_type === 'theme'), [filteredArtifacts]);
  const symbols = useMemo(
    () => filteredArtifacts.filter((a) => ['symbol', 'object', 'animal', 'emotion', 'activity'].includes(a.artifact_type)),
    [filteredArtifacts]
  );

  const recurringArtifactsCount = useMemo(
    () => artifacts.filter((a) => a.appearance_count > 1 || a.temporal_status === 'anchor').length,
    [artifacts]
  );

  const emergingArtifactsCount = useMemo(
    () => artifacts.filter((a) => a.temporal_status === 'emerging').length,
    [artifacts]
  );

  const toggleSectionExpand = (sectionKey: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const getProgressionMessage = () => {
    if (dreamCount === 0) {
      return {
        title: 'Your dream world is waiting.',
        subtitle: 'Record your first dream to begin mapping recurring figures, places, and themes.',
      };
    } else if (dreamCount <= 3) {
      return {
        title: 'Initial motifs forming.',
        subtitle: `${dreamCount} entries recorded. Recurring patterns emerge as you continue capturing dreams.`,
      };
    } else {
      return {
        title: 'Your Subconscious Landscape',
        subtitle: `${dreamCount} dreams • ${recurringArtifactsCount} recurring motifs • ${connections.length} resonant connections`,
      };
    }
  };

  const progression = getProgressionMessage();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Helper renderer for entity card
  const renderArtifactCard = (art: DreamArtifact) => {
    const isRecurring = art.appearance_count > 1 || art.temporal_status === 'anchor';
    const connectedNeighbors = (art.connected_artifact_ids || [])
      .map((id) => artifacts.find((a) => a.id === id))
      .filter((a): a is DreamArtifact => Boolean(a))
      .slice(0, 3);

    return (
      <motion.div
        key={art.id}
        whileHover={{ y: -2 }}
        onClick={() => setSelectedArtifact(art)}
        className="p-4 md:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--accent)] cursor-pointer transition-all shadow-2xs flex flex-col justify-between group"
      >
        <div>
          {/* Top Row: Type & Temporal Badge */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--accent)] font-semibold">
              {art.artifact_type}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                  art.temporal_status === 'anchor'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : art.temporal_status === 'emerging'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : art.temporal_status === 'dormant'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-default)]'
                }`}
              >
                {art.temporal_status === 'anchor'
                  ? 'Anchor'
                  : art.temporal_status === 'emerging'
                  ? 'Emerging'
                  : art.temporal_status === 'dormant'
                  ? 'Dormant'
                  : 'Recurring'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] font-mono font-medium">
                {art.appearance_count}×
              </span>
            </div>
          </div>

          {/* Landmark Name */}
          <h3 className="text-base font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
            {art.name}
          </h3>

          {/* Temporal Recurrence Details */}
          <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5 font-sans">
            <span>Seen in {art.appearance_count} {art.appearance_count === 1 ? 'dream' : 'dreams'}</span>
            <span>•</span>
            <span>Recent: {new Date(art.last_seen_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
          </p>

          {/* Meaningful Connected Relationships */}
          {connectedNeighbors.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider block mb-1.5">
                Echoes with
              </span>
              <div className="flex flex-wrap gap-1">
                {connectedNeighbors.map((neighbor) => (
                  <button
                    key={neighbor.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArtifact(neighbor);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-[var(--text-secondary)] transition-colors truncate max-w-[130px]"
                    title={`Inspect ${neighbor.name}`}
                  >
                    {neighbor.name}
                  </button>
                ))}
                {(art.connected_artifact_ids?.length || 0) > 3 && (
                  <span className="text-[10px] text-[var(--text-muted)] self-center ml-0.5">
                    +{(art.connected_artifact_ids!.length - 3)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer: First Seen */}
        <div className="mt-4 pt-2.5 border-t border-[var(--border-default)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>First: {new Date(art.first_seen_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]" />
        </div>
      </motion.div>
    );
  };

  // Helper renderer for categorical section
  const renderCategorySection = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    items: DreamArtifact[],
    sectionKey: string
  ) => {
    if (items.length === 0) return null;

    // Sort by count descending, then last seen
    const sorted = [...items].sort((a, b) => {
      if (b.appearance_count !== a.appearance_count) {
        return b.appearance_count - a.appearance_count;
      }
      return new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime();
    });

    const recurring = sorted.filter((a) => a.appearance_count > 1 || a.temporal_status === 'anchor');
    const singletons = sorted.filter((a) => a.appearance_count <= 1 && a.temporal_status !== 'anchor');
    const isExpanded = expandedSections[sectionKey] || false;

    // Display set: if there are recurring items, display recurring + optionally singletons
    const primaryDisplay = recurring.length > 0 ? recurring : singletons;
    const secondaryDisplay = recurring.length > 0 ? singletons : [];

    return (
      <section className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 border-b border-[var(--border-default)] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-display font-semibold text-[var(--text-primary)]">
                  {title}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] font-mono">
                  {recurring.length > 0 ? `${recurring.length} recurring · ${items.length} total` : `${items.length} total`}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-light mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {primaryDisplay.map(renderArtifactCard)}
        </div>

        {/* Expandable Single-Appearance Fragments */}
        {secondaryDisplay.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => toggleSectionExpand(sectionKey)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-[var(--bg-card)] cursor-pointer"
            >
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <span>
                {isExpanded
                  ? `Hide ${secondaryDisplay.length} single-appearance ${title.toLowerCase()}`
                  : `Show ${secondaryDisplay.length} single-appearance ${title.toLowerCase()}...`}
              </span>
            </button>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 mt-3 pt-1 border-t border-dashed border-[var(--border-default)]"
              >
                {secondaryDisplay.map(renderArtifactCard)}
              </motion.div>
            )}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-75px)] max-w-7xl mx-auto w-full p-4 md:p-6 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP HEADER & VIEW TOGGLES
      ───────────────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 z-20 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Subconscious Log
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-[var(--text-primary)] tracking-tight">
            {progression.title}
          </h1>
          <p className="text-[var(--text-secondary)] text-xs md:text-sm mt-0.5">
            {progression.subtitle}
          </p>
        </div>

        {/* View Mode & Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          {/* Primary View Switcher: Overview vs Explore Map */}
          <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-1 shadow-2xs">
            <button
              onClick={() => setView('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                view === 'overview'
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Layers size={13} />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                view === 'map'
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Compass size={13} />
              <span>Explore Map</span>
            </button>
          </div>

          {/* Share Discoveries Button */}
          {dreamCount >= 1 && (
            <button
              onClick={() => setShowDiscoveriesModal(true)}
              className="px-3.5 py-2 bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:border-[var(--accent)] text-[var(--text-primary)] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View shareable milestone cards"
            >
              <Share2 size={13} className="text-[var(--accent)]" />
              <span>Share Discoveries</span>
            </button>
          )}

          <Link
            href="/dream/new"
            className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>Record dream</span>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. VIEW: EXPLORE MAP (SECONDARY INTERACTIVE EXPERIENCE)
      ───────────────────────────────────────────────────────────── */}
      {view === 'map' ? (
        <div className="flex-1 w-full relative min-h-[580px] rounded-2xl overflow-hidden">
          <DreamWorldCanvas
            artifacts={artifacts}
            connections={connections}
            onSelectArtifact={(art) => setSelectedArtifact(art)}
            highlightedArtifactId={selectedArtifact?.id}
            temporalFilter={temporalFilter}
            onBackToOverview={() => setView('overview')}
          />
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            3. VIEW: OVERVIEW (DEFAULT INSIGHTS EXPERIENCE)
        ───────────────────────────────────────────────────────────── */
        <div className="flex-1 w-full flex flex-col space-y-6 pt-1 pb-24">
          
          {/* A. Subconscious Summary Strip */}
          {dreamCount > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Archive Anchor
                </span>
                <p className="text-sm md:text-base font-semibold text-[var(--text-primary)] truncate">
                  {mostRecurringElement || 'Forming...'}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">Most enduring memory constant</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Central Theme
                </span>
                <p className="text-sm md:text-base font-semibold text-[var(--text-primary)] truncate">
                  {topThemes[0] || 'Forming...'}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">Dominant narrative undercurrent</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Emerging Threads
                </span>
                <p className="text-sm md:text-base font-semibold text-[var(--text-primary)] truncate">
                  {emergingArtifactsCount} newly appearing
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">Forming in recent entries</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Recurring Motifs
                </span>
                <p className="text-sm md:text-base font-semibold text-[var(--text-primary)] truncate">
                  {recurringArtifactsCount} / {artifacts.length} landmarks
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">Across {connections.length} resonant links</p>
              </div>
            </div>
          )}

          {/* B. Filter & Search Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-semibold shadow-xs'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Right: Search & Temporal Lens */}
            <div className="flex items-center gap-2">
              {/* Temporal Lens Selector */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {TEMPORAL_LENSES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemporalFilter(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                      temporalFilter === t.id
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold border border-[var(--accent)]/30'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-default)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-56">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search landmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* C. The 4 Categorical Sections: People, Places, Themes, Symbols */}
          {filteredArtifacts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[var(--border-default)] rounded-3xl my-8">
              <BookOpen size={32} className="mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">No landmarks match your filter</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
                {searchQuery || temporalFilter !== 'all' || selectedCategory !== 'all'
                  ? 'Try selecting "All Landmarks" or resetting your search query.'
                  : 'Record morning dreams to begin discovering your recurring subconscious landscape.'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 1. Recurring People */}
              {(selectedCategory === 'all' || selectedCategory === 'person') &&
                renderCategorySection(
                  'Recurring People',
                  'The persistent presences, figures, and characters inhabiting your dream world.',
                  <Users size={15} />,
                  people,
                  'people'
                )}

              {/* 2. Recurring Places */}
              {(selectedCategory === 'all' || selectedCategory === 'place') &&
                renderCategorySection(
                  'Recurring Places',
                  'The geography, rooms, architectures, and landscapes your subconscious repeatedly visits.',
                  <MapPin size={15} />,
                  places,
                  'places'
                )}

              {/* 3. Recurring Themes */}
              {(selectedCategory === 'all' || selectedCategory === 'theme') &&
                renderCategorySection(
                  'Recurring Themes',
                  'The overarching narrative questions and existential threads returning over time.',
                  <Lightbulb size={15} />,
                  themes,
                  'themes'
                )}

              {/* 4. Recurring Symbols & Entities */}
              {(selectedCategory === 'all' || selectedCategory === 'symbols') &&
                renderCategorySection(
                  'Recurring Symbols & Entities',
                  'The atmospheric motifs, significant objects, animals, and emotional anchors.',
                  <Shapes size={15} />,
                  symbols,
                  'symbols'
                )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. ARTIFACT DETAIL SLIDE-OVER / MODAL
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedArtifact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
            <motion.div
              key={`artifact-detail-modal-${selectedArtifact.id}`}
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 shadow-2xl z-50 text-[var(--text-primary)] relative max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                      {selectedArtifact.artifact_type}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">•</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        selectedArtifact.temporal_status === 'emerging'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : selectedArtifact.temporal_status === 'anchor'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : selectedArtifact.temporal_status === 'dormant'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                      }`}
                    >
                      {selectedArtifact.temporal_status === 'emerging'
                        ? 'Emerging Motif'
                        : selectedArtifact.temporal_status === 'anchor'
                        ? 'Archive Anchor'
                        : selectedArtifact.temporal_status === 'dormant'
                        ? 'Dormant Memory'
                        : 'Recurring Motif'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-[var(--text-primary)]">
                    {selectedArtifact.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedArtifact(null)}
                  className="p-1.5 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                {/* Stats overview */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-0.5">Presence</div>
                    <div className="font-semibold text-sm text-[var(--text-primary)]">
                      Appeared in {selectedArtifact.appearance_count} dream{selectedArtifact.appearance_count > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right text-xs text-[var(--text-muted)]">
                    <div>First: {new Date(selectedArtifact.first_seen_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div>Last: {new Date(selectedArtifact.last_seen_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* Connected Motifs in Subconscious */}
                {(selectedArtifact.connected_artifact_ids || []).length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[var(--accent)]" />
                      <span>Connected Motifs in Subconscious</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedArtifact.connected_artifact_ids || []).map((connId) => {
                        const neighbor = artifacts.find((a) => a.id === connId);
                        if (!neighbor) return null;
                        return (
                          <button
                            key={neighbor.id}
                            onClick={() => setSelectedArtifact(neighbor)}
                            className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] transition-all flex items-center gap-1 cursor-pointer"
                            title={`Navigate to ${neighbor.name}`}
                          >
                            <span>{neighbor.name}</span>
                            <span className="text-[9px] text-[var(--text-muted)] font-mono">({neighbor.artifact_type})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Connected Dreams */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Connected Dreams in Archive
                  </h4>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {(selectedArtifact.metadata?.relatedDreams || []).map((d: any, i: number) => (
                      <Link
                        key={i}
                        href={`/dream/${d.id}`}
                        className="block p-3 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] border border-[var(--border-default)] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)] shrink-0">
                            <BookOpen size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate">
                                {d.title}
                              </span>
                              <ArrowRight size={12} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors ml-1 shrink-0" />
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5 font-mono">
                              {new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {(!selectedArtifact.metadata?.relatedDreams || selectedArtifact.metadata.relatedDreams.length === 0) && (
                      <p className="text-xs text-[var(--text-muted)] italic">
                        Linked across your recorded journal entries.
                      </p>
                    )}
                  </div>
                </div>

                {/* Deep Link to Ask Dream History */}
                <div className="pt-2 border-t border-[var(--border-subtle)]">
                  <Link
                    href={`/chat?q=${encodeURIComponent(`Tell me about the motif "${selectedArtifact.name}" across my dream archive.`)}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[var(--accent-soft)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white transition-colors text-xs font-semibold"
                  >
                    <MessageSquare size={13} />
                    <span>Ask Dream History about &quot;{selectedArtifact.name}&quot;</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shareable Discoveries Modal */}
      <ShareableDiscoveriesModal
        isOpen={showDiscoveriesModal}
        onClose={() => setShowDiscoveriesModal(false)}
        worldData={worldData}
      />
    </div>
  );
}

export default function DreamWorldPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
          <Spinner size="lg" />
        </div>
      }
    >
      <DreamWorldContent />
    </Suspense>
  );
}

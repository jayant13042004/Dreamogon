'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui';
import { 
  Sparkles, X, ArrowRight, Layers, Compass, Search, BookOpen, Share2, ChevronRight, MessageSquare
} from 'lucide-react';
import { DreamArtifact, TemporalStatus } from '@/types/dream';
import { DreamWorldCanvas } from '@/components/world/DreamWorldCanvas';
import { fetchCompleteDreamWorldData, DreamWorldData } from '@/lib/dreamWorld';
import { ShareableDiscoveriesModal } from '@/components/world/ShareableDiscoveriesModal';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'All Types' },
  { id: 'place', label: 'Places' },
  { id: 'person', label: 'People' },
  { id: 'theme', label: 'Themes' },
  { id: 'object', label: 'Objects' },
  { id: 'emotion', label: 'Emotions' },
  { id: 'animal', label: 'Animals' },
];

const TEMPORAL_LENSES = [
  { id: 'all', label: 'All States' },
  { id: 'emerging', label: 'Emerging' },
  { id: 'anchor', label: 'Anchors' },
  { id: 'recurring', label: 'Recurring' },
  { id: 'dormant', label: 'Dormant' },
];

function DreamWorldContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') === 'list' ? 'list' : 'map';
  const [view, setView] = useState<'map' | 'list'>(initialView);

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDiscoveriesModal, setShowDiscoveriesModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [temporalFilter, setTemporalFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size="lg" />
      </div>
    );
  }

  const { artifacts, connections, dreamCount, topThemes, mostRecurringElement, topEmotion } = worldData;

  const filteredArtifacts = artifacts.filter((art) => {
    const matchesCat = selectedCategory === 'all' || art.artifact_type === selectedCategory;
    const matchesTemporal = temporalFilter === 'all' || art.temporal_status === temporalFilter;
    const matchesSearch = art.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesTemporal && matchesSearch;
  });

  const getProgressionMessage = () => {
    if (dreamCount === 0) {
      return {
        title: "Your world is waiting.",
        subtitle: "Record your first dream and give it a place in your universe."
      };
    } else if (dreamCount === 1) {
      return {
        title: "Your first dream has found a place.",
        subtitle: "This world will grow and connect with every dream you remember."
      };
    } else if (dreamCount === 2) {
      return {
        title: "Subconscious connections forming.",
        subtitle: "Relationships and shared motifs are taking shape across your entries."
      };
    } else if (dreamCount <= 5) {
      return {
        title: "A living dream universe.",
        subtitle: `Patterns are emerging: ${topThemes[0] ? `Persistent themes of ${topThemes[0]}` : 'Connections forming between people and places'}.`
      };
    } else {
      return {
        title: "Your Personal Dream Universe.",
        subtitle: `${dreamCount} dreams • ${artifacts.length} subconscious landmarks • ${connections.length} resonant connections.`
      };
    }
  };

  const progression = getProgressionMessage();

  return (
    <div className="flex flex-col h-[calc(100vh-75px)] max-w-7xl mx-auto w-full p-4 md:p-6 overflow-hidden select-none">
      
      {/* Top Header Bar */}
      <div className="mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 z-20 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Dream World
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
          {/* Spatial / List Toggle */}
          <div className="flex items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-0.5">
            <button
              onClick={() => setView('map')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                view === 'map'
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Compass size={13} />
              <span>Spatial Map</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                view === 'list'
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Layers size={13} />
              <span>Archive ({artifacts.length})</span>
            </button>
          </div>

          {/* Share Discoveries Button */}
          {dreamCount >= 1 && (
            <button
              onClick={() => setShowDiscoveriesModal(true)}
              className="px-3.5 py-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:border-[var(--accent)] text-[var(--text-primary)] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="View shareable milestone cards"
            >
              <Share2 size={13} className="text-[var(--accent)]" />
              <span>Share Discoveries</span>
            </button>
          )}

          <Link
            href="/dream/new"
            className="px-4 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>Record dream</span>
          </Link>
        </div>
      </div>

      {/* Temporal Lens Bar */}
      <div className="mb-3 flex items-center justify-between gap-2 z-10 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mr-1 hidden sm:inline">
            Temporal Lens:
          </span>
          {TEMPORAL_LENSES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemporalFilter(t.id)}
              className={`px-2.5 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
                temporalFilter === t.id
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold border border-[var(--accent)]/30 shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-default)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {view === 'map' && (
          <div className="text-[11px] text-[var(--text-muted)] hidden md:block">
            {connections.length} subconscious relationship filaments
          </div>
        )}
      </div>

      {/* Main Content: Spatial Map or Archive List */}
      {view === 'map' ? (
        <div className="flex-1 w-full relative min-h-0">
          <DreamWorldCanvas
            artifacts={artifacts}
            connections={connections}
            onSelectArtifact={(art) => setSelectedArtifact(art)}
            highlightedArtifactId={selectedArtifact?.id}
            temporalFilter={temporalFilter}
          />
        </div>
      ) : (
        <div className="flex-1 w-full flex flex-col min-h-0 overflow-y-auto pt-2 pb-28">
          {/* Category Pills & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search artifacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-full text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* Artifacts Grid */}
          {filteredArtifacts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[var(--border-default)] rounded-3xl my-auto">
              <BookOpen size={32} className="mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">No artifacts found</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {searchQuery || temporalFilter !== 'all' || selectedCategory !== 'all'
                  ? 'Try selecting a different category or temporal lens.'
                  : 'Record dreams to extract subconscious artifacts.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredArtifacts.map((art) => (
                <motion.div
                  key={art.id}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedArtifact(art)}
                  className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--accent)] cursor-pointer transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)]">
                        {art.artifact_type}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                            art.temporal_status === 'emerging'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : art.temporal_status === 'anchor'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : art.temporal_status === 'dormant'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                          }`}
                        >
                          {art.temporal_status === 'emerging'
                            ? 'Emerging'
                            : art.temporal_status === 'anchor'
                              ? 'Anchor'
                              : art.temporal_status === 'dormant'
                                ? 'Dormant'
                                : 'Recurring'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] font-mono">
                          {art.appearance_count}×
                        </span>
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {art.name}
                    </h3>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>First: {new Date(art.first_seen_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Artifact Detail Slide-Over / Modal */}
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
                  className="p-1.5 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
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
                            className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] transition-all flex items-center gap-1"
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

                {/* Related Dreams */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Connected Dreams & Visual Memories
                  </h4>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {(selectedArtifact.metadata?.relatedDreams || []).map((d: any, i: number) => (
                      <Link
                        key={i}
                        href={`/dream/${d.id}`}
                        className="block p-3 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] border border-[var(--border-default)] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {d.imageUrl ? (
                            <img
                              src={d.imageUrl}
                              alt="Visual memory"
                              className="w-10 h-10 rounded-xl object-cover border border-[var(--border-default)] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)] shrink-0">
                              <Sparkles size={14} />
                            </div>
                          )}
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

                {/* Deep Link to Chat */}
                <div className="pt-2 border-t border-[var(--border-subtle)]">
                  <Link
                    href={`/chat?q=${encodeURIComponent(`Tell me about the motif "${selectedArtifact.name}" across my dream archive.`)}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[var(--accent-soft)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white transition-colors text-xs font-semibold"
                  >
                    <MessageSquare size={13} />
                    <span>Ask Dream History about "{selectedArtifact.name}"</span>
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
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size="lg" />
      </div>
    }>
      <DreamWorldContent />
    </Suspense>
  );
}


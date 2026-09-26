'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Compass,
  Clock,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import type { DreamEvolutionAnalysis, MotifShift } from '@/types/ai';

interface DreamEvolutionSectionProps {
  analysis: DreamEvolutionAnalysis | null;
  loading: boolean;
  onRefresh: () => void;
  dreamCount: number;
}

function TrajectoryBadge({ type }: { type: MotifShift['type'] }) {
  switch (type) {
    case 'emerging':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Emerging Motif
        </span>
      );
    case 'fading':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Fading Motif
        </span>
      );
    case 'transforming':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          Transforming
        </span>
      );
    case 'stabilizing':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          Constant Anchor
        </span>
      );
  }
}

export function DreamEvolutionSection({
  analysis,
  loading,
  onRefresh,
  dreamCount,
}: DreamEvolutionSectionProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  if (dreamCount < 3) {
    return (
      <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-[var(--text-muted)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Dream Evolution Timeline</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          As your archive grows beyond 3 recorded dreams, Subconscious Log automatically compares your earlier dreams
          with your recent entries to illuminate subtle motif shifts, fading symbols, and emerging emotional patterns.
        </p>
        <div className="pt-2">
          <Link
            href="/dream/new"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] font-medium hover:underline"
          >
            <span>Record your next dream</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    );
  }

  if (loading && !analysis) {
    return (
      <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 text-center space-y-4">
        <Spinner size="md" className="mx-auto text-[var(--accent)]" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">Uncovering Dream Evolution...</p>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Comparing chronological periods across your {dreamCount} dreams to track motif trajectories.
          </p>
        </div>
      </section>
    );
  }

  if (!analysis) {
    return null;
  }

  const { temporalComparison, shifts, emotionalTrajectory, narrativeAgency, reflectionPrompt } = analysis;

  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden shadow-xs space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
              <TrendingUp size={16} />
            </span>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              How Your Dream World Is Evolving
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Longitudinal pattern analysis across {analysis.totalDreamsAnalyzed} dreams in your archive.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshClick}
            disabled={refreshing || loading}
            className="h-8 text-xs font-medium border-[var(--border-default)] hover:text-[var(--accent)]"
            title="Re-analyze evolution with latest entries"
          >
            <RefreshCw size={13} className={`mr-1.5 ${refreshing || loading ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </Button>

          <Link
            href={`/chat?q=${encodeURIComponent('How have my dreams changed between earlier and recent entries?')}`}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
          >
            <MessageSquare size={13} className="mr-1" />
            <span>Ask History</span>
          </Link>
        </div>
      </div>

      {/* Temporal Comparison Cards: Earlier vs Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Earlier Period */}
        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Earlier Archive Era
              </span>
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                {temporalComparison.earlierPeriod.dateRange}
              </span>
            </div>
            <p className="text-xs italic text-[var(--text-secondary)] leading-relaxed mb-3">
              "{temporalComparison.earlierPeriod.characteristicAtmosphere}"
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-[var(--text-muted)]">Common moods:</span>
              {temporalComparison.earlierPeriod.dominantMoods.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)]"
                >
                  {m}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-[var(--text-muted)]">Core motifs:</span>
              {temporalComparison.earlierPeriod.keyMotifs.map((motif, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] bg-[var(--accent-soft)] text-[var(--accent)] font-medium"
                >
                  {motif}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Period */}
        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1">
                Recent Archive Era
              </span>
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                {temporalComparison.recentPeriod.dateRange}
              </span>
            </div>
            <p className="text-xs italic text-[var(--text-secondary)] leading-relaxed mb-3">
              "{temporalComparison.recentPeriod.characteristicAtmosphere}"
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-[var(--text-muted)]">Common moods:</span>
              {temporalComparison.recentPeriod.dominantMoods.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)]"
                >
                  {m}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-[var(--text-muted)]">Core motifs:</span>
              {temporalComparison.recentPeriod.keyMotifs.map((motif, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] bg-[var(--accent-soft)] text-[var(--accent)] font-medium"
                >
                  {motif}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Longitudinal Summary */}
      {temporalComparison.summary && (
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed flex items-start gap-2.5">
          <Compass size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <p>{temporalComparison.summary}</p>
        </div>
      )}

      {/* Motif Trajectory Shifts */}
      {shifts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Motif Trajectories & Shifts
            </h3>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              {shifts.length} {shifts.length === 1 ? 'shift' : 'shifts'} observed
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {shifts.map((shift, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--accent-soft)] transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[var(--text-primary)]">
                      {shift.motif}
                    </span>
                    <TrajectoryBadge type={shift.type} />
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      {shift.category}
                    </span>
                  </div>

                  <Link
                    href={`/chat?q=${encodeURIComponent(`Tell me about how "${shift.motif}" has evolved across my dream archive.`)}`}
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    <span>Discuss shift</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2.5">
                  {shift.observation}
                </p>

                {(shift.earlierContext || shift.recentContext) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[var(--border-subtle)] text-[var(--text-muted)]">
                    {shift.earlierContext && (
                      <div>
                        <span className="font-semibold text-[var(--text-secondary)]">Earlier: </span>
                        {shift.earlierContext}
                      </div>
                    )}
                    {shift.recentContext && (
                      <div>
                        <span className="font-semibold text-[var(--accent)]">Recent: </span>
                        {shift.recentContext}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Emotional & Narrative Agency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emotionalTrajectory && (
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] space-y-1.5">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Emotional Direction
            </span>
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">
              {emotionalTrajectory.direction}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {emotionalTrajectory.observation}
            </p>
          </div>
        )}

        {narrativeAgency && (
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] space-y-1.5">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Dreamer Agency & Lucidity
            </span>
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">
              Stance in Narrative
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {narrativeAgency.observation}
            </p>
          </div>
        )}
      </div>

      {/* Gentle Morning Reflection Prompt */}
      {reflectionPrompt && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--accent-soft)]/30 to-transparent border border-[var(--accent-soft)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} />
              Morning Inward Inquiry
            </span>
            <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed italic">
              "{reflectionPrompt}"
            </p>
          </div>

          <Link
            href={`/chat?q=${encodeURIComponent(`Reflect with me on this question: "${reflectionPrompt}"`)}`}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors self-start sm:self-auto"
          >
            <span>Explore in Chat</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Observational Notice */}
      <div className="pt-2 text-center">
        <p className="text-[10px] text-[var(--text-muted)]">
          Evolution observations are derived from your longitudinal entries. They are reflective signposts, not diagnostic claims.
        </p>
      </div>
    </section>
  );
}

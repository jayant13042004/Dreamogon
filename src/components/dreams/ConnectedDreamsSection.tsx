'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  MapPin,
  Package,
  Heart,
  Sparkles,
  ArrowRight,
  GitFork,
  Compass,
  Calendar,
  Layers,
  Repeat
} from 'lucide-react';
import type { EntityContinuity, RelatedDreamConnection, EntityType } from '@/types/dream';
import { getRelativeDate } from '@/lib/utils/date';
import { Skeleton } from '@/components/ui/Skeleton';

interface ConnectedDreamsSectionProps {
  dreamId: string;
}

function getEntityIcon(type: EntityType) {
  switch (type) {
    case 'person':
      return <Users size={14} className="text-amber-400" />;
    case 'place':
      return <MapPin size={14} className="text-emerald-400" />;
    case 'emotion':
      return <Heart size={14} className="text-rose-400" />;
    case 'object':
      return <Package size={14} className="text-sky-400" />;
    case 'theme':
    case 'symbol':
    default:
      return <Sparkles size={14} className="text-[var(--accent)]" />;
  }
}

export function ConnectedDreamsSection({ dreamId }: ConnectedDreamsSectionProps) {
  const [continuityCards, setContinuityCards] = useState<EntityContinuity[]>([]);
  const [relatedDreams, setRelatedDreams] = useState<RelatedDreamConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadConnections() {
      try {
        setLoading(true);
        const res = await fetch(`/api/dreams/${dreamId}/related`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setContinuityCards(data.continuityCards || []);
          setRelatedDreams(data.relatedDreams || []);
        }
      } catch (err) {
        console.warn('Failed to load related dreams:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadConnections();

    return () => {
      isMounted = false;
    };
  }, [dreamId]);

  if (loading) {
    return (
      <div className="space-y-6 pt-4 border-t border-[var(--border-default)]">
        <Skeleton className="h-6 w-48 rounded-lg bg-[var(--bg-card)]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)]" />
          ))}
        </div>
      </div>
    );
  }

  const hasContinuity = continuityCards.length > 0;
  const hasRelated = relatedDreams.length > 0;

  if (!hasContinuity && !hasRelated) {
    return (
      <div className="pt-6 border-t border-[var(--border-default)]">
        <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-card)]/60 p-6 text-center space-y-2">
          <Compass size={24} className="mx-auto text-[var(--accent)]/70" />
          <h4 className="text-sm font-medium text-[var(--text-primary)]">
            Archive continuity forming
          </h4>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            As you record more dreams, Subconscious Log will discover recurring people, places, and motifs connecting this entry across your history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pt-8 border-t border-[var(--border-default)]">
      {/* 1. Entity Continuity Cards */}
      {hasContinuity && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Repeat size={14} className="text-[var(--accent)]" />
                <h3 className="font-display text-lg sm:text-xl font-medium text-[var(--text-primary)]">
                  Entity Continuity
                </h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                How elements in this dream have appeared across your archive over time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {continuityCards.map((entity, i) => (
              <Link
                key={`${entity.type}-${entity.name}-${i}`}
                href={`/dreams?entityType=${entity.type}&entityName=${encodeURIComponent(entity.name)}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 hover:border-[var(--accent)] hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      {getEntityIcon(entity.type)}
                      <span>{entity.type}</span>
                    </span>
                    {entity.appearanceCount > 1 && (
                      <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-mono font-semibold text-[var(--accent)]">
                        {entity.appearanceCount}× recurring
                      </span>
                    )}
                  </div>

                  <h4 className="font-display text-base sm:text-lg font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {entity.name}
                  </h4>
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="text-[11px] truncate">{entity.continuityBadge}</span>
                  <ArrowRight
                    size={13}
                    className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 2. Connected Dreams (Related Entries) */}
      {hasRelated && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <GitFork size={15} className="text-[var(--accent)]" />
                <h3 className="font-display text-lg sm:text-xl font-medium text-[var(--text-primary)]">
                  Connected Dreams
                </h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Earlier entries in your archive connected through shared people, places, or narrative motifs.
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {relatedDreams.length} {relatedDreams.length === 1 ? 'connection' : 'connections'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedDreams.map((related) => (
              <Link
                key={related.id}
                href={`/dream/${related.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 hover:border-[var(--accent)] hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-2.5">
                  {/* Connection Reason Badge */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] px-2.5 py-0.5 text-[10px] font-mono text-[var(--accent)]">
                      <Sparkles size={10} />
                      <span>{related.primaryReason}</span>
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                      · {getRelativeDate(related.dream_date)}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-display text-lg font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                    {related.title || 'Untitled Dream'}
                  </h4>

                  {/* Summary / Excerpt */}
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {related.ai_summary || related.content}
                  </p>
                </div>

                {/* Specific reason chips if multiple */}
                {related.reasons.length > 1 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    {related.reasons.slice(1, 3).map((r, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-full"
                      >
                        • {r}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                  <span>View connected dream</span>
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

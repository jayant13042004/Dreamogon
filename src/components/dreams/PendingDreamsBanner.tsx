'use client';

/**
 * PendingDreamsBanner — Phase 2
 *
 * Shows unsynced local dreams to the user with their status.
 * Appears on the dashboard and capture page.
 *
 * States shown per dream:
 *   captured  → "Captured locally, waiting to sync"
 *   uploading → "Uploading…" (spinner)
 *   failed    → "Sync failed — tap to retry" (retry button)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ChevronDown,
  ChevronUp,
  Clock,
  Trash2,
} from 'lucide-react';
import {
  LocalDream,
  LocalDreamStatus,
  getAllLocalDreams,
  deleteLocalDream,
  updateLocalDream,
} from '@/lib/local-dreams';

interface PendingDreamsBannerProps {
  userId: string;
  /** Called to trigger an immediate sync attempt */
  onRequestSync: () => void;
}

function statusLabel(dream: LocalDream): string {
  switch (dream.status) {
    case 'captured':
      return 'Captured locally';
    case 'uploading':
      return 'Uploading…';
    case 'failed':
      if (dream.uploadAttempts >= 5) return 'Upload failed — will retry when you reconnect';
      return `Sync failed — will retry (attempt ${dream.uploadAttempts}/5)`;
    case 'uploaded':
      return 'Synced ✓';
    default:
      return 'Pending';
  }
}

function statusColor(status: LocalDreamStatus): string {
  switch (status) {
    case 'captured':
      return 'text-[var(--accent)]';
    case 'uploading':
      return 'text-blue-400';
    case 'failed':
      return 'text-amber-400';
    case 'uploaded':
      return 'text-emerald-400';
    default:
      return 'text-[var(--text-muted)]';
  }
}

function formatAge(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(ms / 60_000);
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(ms / 86_400_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function PendingDreamsBanner({ userId, onRequestSync }: PendingDreamsBannerProps) {
  const [dreams, setDreams] = useState<LocalDream[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [discarding, setDiscarding] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const all = await getAllLocalDreams(userId);
      // Filter out fully uploaded (they get deleted, but just in case)
      const pending = all.filter((d) => d.status !== 'uploaded');
      setDreams(pending);
    } catch {
      // Silent — IndexedDB might not be available
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    // Re-check every 3 seconds to reflect upload progress
    const interval = setInterval(refresh, 3_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleDiscard = async (localId: string) => {
    setDiscarding(localId);
    try {
      await deleteLocalDream(localId);
      await refresh();
    } finally {
      setDiscarding(null);
    }
  };

  const handleRetry = async (dream: LocalDream) => {
    try {
      await updateLocalDream(dream.localId, {
        status: 'captured',
        lastError: undefined,
      });
      onRequestSync();
      await refresh();
    } catch {
      // ignore
    }
  };

  if (dreams.length === 0) return null;

  const uploadingCount = dreams.filter((d) => d.status === 'uploading').length;
  const failedCount = dreams.filter((d) => d.status === 'failed').length;
  const pendingCount = dreams.filter((d) => d.status === 'captured').length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="mb-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-sm overflow-hidden"
      >
        {/* Summary header */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {uploadingCount > 0 ? (
              <RefreshCw size={16} className="text-blue-400 animate-spin" />
            ) : failedCount > 0 ? (
              <AlertTriangle size={16} className="text-amber-400" />
            ) : (
              <CloudOff size={16} className="text-[var(--accent)]" />
            )}
            <div>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {dreams.length} {dreams.length === 1 ? 'dream' : 'dreams'} captured locally
              </span>
              <span className="ml-2 text-xs text-[var(--text-muted)]">
                {uploadingCount > 0 && `${uploadingCount} syncing…`}
                {uploadingCount > 0 && (failedCount > 0 || pendingCount > 0) && ' · '}
                {failedCount > 0 && `${failedCount} failed`}
                {failedCount > 0 && pendingCount > 0 && ' · '}
                {pendingCount > 0 && `${pendingCount} waiting`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {failedCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestSync();
                }}
                className="text-xs text-[var(--accent)] hover:underline font-medium cursor-pointer"
              >
                Retry all
              </button>
            )}
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </button>

        {/* Expanded detail view */}
        {expanded && (
          <div className="border-t border-[var(--border-default)] divide-y divide-[var(--border-subtle)]">
            {dreams.map((dream) => (
              <div key={dream.localId} className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)] truncate">
                    {dream.content.slice(0, 80) || '(empty)'}
                    {dream.content.length > 80 ? '…' : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {dream.status === 'uploading' && (
                      <RefreshCw size={11} className="text-blue-400 animate-spin shrink-0" />
                    )}
                    {dream.status === 'failed' && (
                      <AlertTriangle size={11} className="text-amber-400 shrink-0" />
                    )}
                    {dream.status === 'captured' && (
                      <Clock size={11} className="text-[var(--accent)] shrink-0" />
                    )}
                    <span className={`text-[11px] font-mono ${statusColor(dream.status)}`}>
                      {statusLabel(dream)}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      · {formatAge(dream.capturedAt)}
                    </span>
                  </div>
                  {dream.lastError && dream.status === 'failed' && (
                    <p className="text-[11px] text-amber-400/80 mt-0.5 truncate">{dream.lastError}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {dream.status === 'failed' && (
                    <button
                      type="button"
                      onClick={() => handleRetry(dream)}
                      className="p-1.5 rounded-lg text-[var(--accent)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                      title="Retry sync"
                    >
                      <Upload size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDiscard(dream.localId)}
                    disabled={discarding === dream.localId || dream.status === 'uploading'}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-40"
                    title="Discard local copy"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {/* Honest disclaimer */}
            <div className="px-4 py-2.5 bg-[var(--bg-secondary)]/50">
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Dreams captured here persist in your browser's local storage. They will sync when connected.
                Clearing browser data or using private mode will remove them before syncing.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

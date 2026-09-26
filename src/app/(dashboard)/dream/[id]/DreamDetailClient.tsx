'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DreamAnalysis } from '@/components/dreams/DreamAnalysis';
import { ConnectedDreamsSection } from '@/components/dreams/ConnectedDreamsSection';
import { DreamCapture, type CapturePayload } from '@/components/dreams/DreamCapture';
import { Dream } from '@/types/dream';
import { Button } from '@/components/ui/Button';
import { formatDreamDate, getRelativeDate } from '@/lib/utils/date';
import {
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Compass,
  ArrowLeft,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MOODS } from '@/lib/utils/constants';
import { toast } from '@/components/ui/Toast';
import { Analytics } from '@/lib/analytics';
import Link from 'next/link';
import { resolveDreamImageUrl } from '@/lib/storage/dream-images';

type AnalysisUiState = 'idle' | 'analyzing' | 'complete' | 'failed';

export default function DreamDetailClient({ dreamId }: { dreamId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisUi, setAnalysisUi] = useState<AnalysisUiState>('idle');
  const [showDeeperDetails, setShowDeeperDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'quota_exceeded' | 'regeneration_not_allowed'>(
    'quota_exceeded'
  );
  const supabase = createClient();
  const analysisLock = useRef(false);
  const autoAnalyzeStarted = useRef(false);

  const fetchDream = useCallback(async () => {
    try {
      const { data: dreamData, error } = await supabase
        .from('dreams')
        .select('*, dream_tags(tag), dream_entities(*)')
        .eq('id', dreamId)
        .single();

      if (error) throw error;
      setDream({
        ...dreamData,
        image_url: resolveDreamImageUrl(dreamData),
      });
      return dreamData as Dream;
    } catch {
      console.error('Error fetching dream');
      toast.error('Failed to load dream.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [dreamId, supabase]);

  useEffect(() => {
    fetchDream();
  }, [fetchDream]);

  const runAnalysis = useCallback(
    async (id: string, content: string, opts?: { silent?: boolean }) => {
      if (analysisLock.current) return;
      analysisLock.current = true;
      setAnalyzing(true);
      setAnalysisUi('analyzing');

      try {
        const aiResponse = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dreamId: id, content }),
        });

        if (!aiResponse.ok) {
          setAnalysisUi('failed');
          if (!opts?.silent) {
            toast.error('Analysis could not finish. Your dream is still saved.');
          }
          return;
        }

        const analysisData = await aiResponse.json();
        const entityCount = Array.isArray(analysisData.entities) ? analysisData.entities.length : 0;
        Analytics.dreamAnalysisCompleted(1, entityCount);

        await fetchDream();
        setAnalysisUi('complete');
        if (!opts?.silent) toast.success('Your dream has been explored.');

        if (searchParams.get('analyzing') === '1') {
          router.replace(`/dream/${id}`, { scroll: false });
        }
      } catch {
        setAnalysisUi('failed');
        if (!opts?.silent) {
          toast.error('Analysis could not finish. Your dream is still saved.');
        }
      } finally {
        analysisLock.current = false;
        setAnalyzing(false);
      }
    },
    [fetchDream, router, searchParams]
  );

  useEffect(() => {
    if (!dream || loading) return;

    const wantsAnalyze = searchParams.get('analyzing') === '1';
    if (!wantsAnalyze) {
      if ((dream.ai_analysis || dream.ai_summary) && analysisUi === 'idle') {
        setAnalysisUi('complete');
      }
      return;
    }

    if (autoAnalyzeStarted.current || analysisLock.current) return;
    autoAnalyzeStarted.current = true;
    void runAnalysis(dream.id, dream.content, { silent: true });
  }, [dream, loading, searchParams, runAnalysis, analysisUi]);

  useEffect(() => {
    if (searchParams.get('edit') === '1') {
      setIsEditing(true);
    }
  }, [searchParams]);

  const handleSaveEditedDream = async (payload: CapturePayload) => {
    if (!dream) return;
    setSavingEdit(true);
    try {
      const response = await fetch(`/api/dreams/${dream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title || 'Untitled Dream',
          content: payload.content,
          dream_date: payload.date,
          mood: payload.mood || null,
          lucidity: payload.lucidity || null,
          tags: payload.tags || [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update dream');
      }

      await fetchDream();
      toast.success('Dream updated');
      setIsEditing(false);
      if (searchParams.get('edit') === '1') {
        router.replace(`/dream/${dream.id}`, { scroll: false });
      }
    } catch {
      toast.error('Failed to update dream.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('dreams').delete().eq('id', dreamId);
      if (error) throw error;
      toast.success('Dream deleted');
      router.push('/dashboard');
    } catch {
      console.error('Error deleting dream');
      toast.error('Failed to delete dream.');
    }
  };

  const handleAnalyze = async () => {
    if (!dream) return;
    await runAnalysis(dream.id, dream.content);
  };


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-pulse space-y-8">
        <div className="h-64 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl w-full"></div>
        <div className="h-10 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-2/3"></div>
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dream Not Found</h1>
        <p className="text-[var(--text-secondary)]">
          The dream you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>
        <Button onClick={() => router.push('/dashboard')}>Back to Sanctuary</Button>
      </div>
    );
  }

  const moodData = MOODS.find((m) => m.value === dream.mood);
  const analysis = dream.ai_analysis;
  const showAnalyzingBanner = analyzing || analysisUi === 'analyzing';
  const showFailedBanner = analysisUi === 'failed' && !analysis;
  const showCompleteBanner = analysisUi === 'complete' && Boolean(analysis);
  const analysisImageUrl =
    dream.image_url ||
    (dream.ai_analysis as { image_url?: string } | null)?.image_url ||
    null;
  const hasImage = Boolean(dream.image_url || dream.image_path || analysisImageUrl);

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6 pb-24 text-[var(--text-primary)]">
        <DreamCapture
          userId={dream.user_id}
          initialDream={dream}
          isEditing={true}
          saving={savingEdit}
          onCancel={() => {
            setIsEditing(false);
            if (searchParams.get('edit') === '1') {
              router.replace(`/dream/${dream.id}`, { scroll: false });
            }
          }}
          onSave={handleSaveEditedDream}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-12 pb-24 text-[var(--text-primary)]">
      {(showAnalyzingBanner || showFailedBanner || showCompleteBanner) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            showAnalyzingBanner
              ? 'border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)]'
              : showFailedBanner
                ? 'border-amber-400/25 bg-amber-400/10 text-amber-900 dark:text-amber-100'
                : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-900 dark:text-emerald-100'
          }`}
          role="status"
        >
          {showAnalyzingBanner && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <p>Saved to your archive. Analyzing patterns in the background… You can keep browsing.</p>
            </div>
          )}
          {showFailedBanner && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>AI reflection didn&apos;t finish. Your dream is safely preserved in your archive.</p>
              <Button size="sm" variant="secondary" onClick={handleAnalyze} disabled={analyzing}>
                Retry reflection
              </Button>
            </div>
          )}
          {showCompleteBanner && !showAnalyzingBanner && <p>Your dream is safely archived and explored.</p>}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Journal</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 size={14} className="mr-1.5" />
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-rose-500 hover:text-rose-600 dark:text-rose-400"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* 1. Original Dream */}
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Original dream
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-semibold text-[var(--text-primary)] tracking-tight leading-tight">
            {dream.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <Calendar size={13} />
              {formatDreamDate(new Date(dream.dream_date))}
            </span>
            <span>&bull;</span>
            <span>{getRelativeDate(new Date(dream.dream_date))}</span>
            {moodData && (
              <>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                  {moodData.emoji} {moodData.label}
                </span>
              </>
            )}
          </div>
        </div>

        {(dream as { dream_tags?: { tag: string }[] }).dream_tags &&
          (dream as { dream_tags: { tag: string }[] }).dream_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(dream as { dream_tags: { tag: string }[] }).dream_tags.map((t) => (
                <span
                  key={t.tag}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)]"
                >
                  #{t.tag}
                </span>
              ))}
            </div>
          )}

        <div className="p-8 md:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xs leading-relaxed text-[var(--text-secondary)] font-normal text-base md:text-lg whitespace-pre-wrap">
          {dream.content}
        </div>
      </section>

      {/* 2. AI Reflection */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)] mb-1">
              AI reflection
            </p>
            <h2 className="text-2xl font-display font-semibold text-[var(--text-primary)]">
              Possibilities, not diagnoses
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Separate from your original words above
            </p>
          </div>
          {!analysis && (
            <Button onClick={handleAnalyze} disabled={analyzing} className="flex items-center gap-2 text-xs">
              <Sparkles size={14} />
              {analyzing ? 'Exploring...' : 'Explore dream'}
            </Button>
          )}
        </div>

        {analysis ? (
          <>
            <DreamAnalysis analysis={analysis} dream={dream} />
            <div className="pt-2">
              <Link
                href={`/chat?dreamId=${dream.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:border-[var(--accent)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              >
                <Sparkles size={14} className="text-[var(--accent)]" />
                <span>Reflect with Subconscious Log on this dream</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-default)] space-y-4">
            <Sparkles size={32} className="mx-auto text-[var(--text-muted)]" />
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-medium text-[var(--text-primary)]">
                {analyzing ? 'Analyzing dream...' : 'Reflective insights'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Possible themes, emotions, and questions — framed as possibilities, not diagnoses.
              </p>
            </div>
            {!analyzing && (
              <Button onClick={handleAnalyze} disabled={analyzing} size="sm">
                <Sparkles size={14} className="mr-1.5" />
                Explore dream
              </Button>
            )}
          </div>
        )}
      </section>

      {/* 3. Living Archive Connections & Entity Continuity */}
      <ConnectedDreamsSection dreamId={dream.id} />

      {/* 4. Deeper Exploration (Collapsed by default: entities, landmarks, world) */}
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => setShowDeeperDetails((v) => !v)}
          className="flex w-full items-center justify-between p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-left transition-colors cursor-pointer"
        >
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              Deeper exploration
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Extracted entities, visual memories, and Dream World connections
            </p>
          </div>
          <div className="p-1 rounded-lg text-[var(--text-muted)]">
            {showDeeperDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {showDeeperDetails && (
          <div className="space-y-8 pt-2">
            {/* Extracted from this dream */}
            {((dream.dream_entities && dream.dream_entities.length > 0) ||
              (dream.ai_themes && dream.ai_themes.length > 0)) && (
              <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
                    Extracted from this dream
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Labels SUBCONSCIOUS LOG noticed — useful for search and patterns, not definitive meanings.
                  </p>
                </div>

                {(dream.ai_themes?.length || 0) > 0 && (
                  <div>
                    <h3 className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2 font-mono">
                      Themes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dream.ai_themes!.map((theme) => (
                        <Link
                          key={theme}
                          href={`/dreams?theme=${encodeURIComponent(theme)}`}
                          className="text-xs px-2.5 py-1 rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                        >
                          {theme}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {dream.dream_entities && dream.dream_entities.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(['person', 'place', 'object', 'emotion'] as const).map((type) => {
                      const items = dream.dream_entities!.filter((e) => e.entity_type === type);
                      if (items.length === 0) return null;
                      return (
                        <div key={type}>
                          <h3 className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2 capitalize font-mono">
                            {type === 'person' ? 'People' : type === 'place' ? 'Places' : `${type}s`}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {items.map((e) => (
                              <Link
                                key={e.id}
                                href={
                                  type === 'person' || type === 'place'
                                    ? `/dreams?entityType=${type}&entityName=${encodeURIComponent(e.entity_name)}`
                                    : '/dreams'
                                }
                                className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                              >
                                {e.entity_name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Archived Visual Impression (if previously recorded) */}
            {hasImage && (dream.image_url || analysisImageUrl) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Archived Visual Impression
                  </p>
                </div>
                <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-default)]">
                  <img
                    src={dream.image_url || analysisImageUrl || ''}
                    alt={dream.title ? `Visual impression of ${dream.title}` : 'Dream visual impression'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[11px] text-white/80 max-w-sm">
                      Archived visual impression from this entry.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dream World connection */}
            <div className="p-6 md:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                  <Compass size={22} />
                </div>
                <div>
                  <h4 className="text-base font-medium text-[var(--text-primary)]">Dream World</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Themes and people from this entry appear as connected nodes in your world.
                  </p>
                </div>
              </div>
              <Link
                href="/world"
                className="px-5 py-2.5 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--accent-soft)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-medium whitespace-nowrap transition-all text-center"
              >
                Open Dream World
              </Link>
            </div>
          </div>
        )}
      </section>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-8 rounded-3xl max-w-md w-full text-[var(--text-primary)] shadow-2xl space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent)]">
              <Lock size={22} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-semibold text-[var(--text-primary)]">
                AI reflection allowance reached
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-normal">
                Free includes your monthly allowance of AI dream reflections. Pro unlocks 100 monthly reflections, deep cross-dream pattern synthesis, and grounded memory retrieval across your full archive. Your private journal entries remain unlimited either way.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowUpgradeModal(false)}>
                Not now
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const checkoutRes = await fetch('/api/billing/checkout', { method: 'POST' });
                    const checkoutData = await checkoutRes.json();
                    if (checkoutRes.ok && checkoutData.url) {
                      window.location.href = checkoutData.url;
                      return;
                    }
                    if (checkoutData.code === 'billing_not_configured') {
                      toast.error('Billing is being set up. Try again soon.');
                    } else {
                      toast.error(checkoutData.error || 'Could not start checkout');
                    }
                  } catch {
                    toast.error('Could not start checkout');
                  }
                }}
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-6 text-[var(--text-primary)]">
            <div>
              <h3 className="text-xl font-display font-semibold text-[var(--text-primary)] mb-2">Delete Dream?</h3>
              <p className="text-[var(--text-muted)] text-sm">
                Are you sure you want to delete this dream entry? This cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

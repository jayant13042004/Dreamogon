'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Dream } from '@/types/dream';
import { Greeting } from '@/components/dashboard/Greeting';
import { RecentDreams } from '@/components/dashboard/RecentDreams';
import { AIInsight } from '@/components/dashboard/AIInsight';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchCompleteDreamWorldData, DreamWorldData } from '@/lib/dreamWorld';
import { Compass, Plus, ArrowRight, Mic } from 'lucide-react';
import { FirstTimeOnboardingModal } from '@/components/dashboard/FirstTimeOnboardingModal';
import { PendingDreamsBanner } from '@/components/dreams/PendingDreamsBanner';
import { useSyncQueue } from '@/hooks/useSyncQueue';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    
    const supabase = createClient();
    
    try {
      const [dreamsResponse, worldRes] = await Promise.all([
        supabase
          .from('dreams')
          .select('*, dream_tags(tag)')
          .eq('user_id', user.id)
          .order('dream_date', { ascending: false })
          .limit(12),
        fetchCompleteDreamWorldData(supabase, user.id)
      ]);
      
      const userDreams = (dreamsResponse?.data || []) as Dream[];
      setDreams(userDreams);

      if (userDreams.length === 0) {
        const dismissed =
          typeof window !== 'undefined' &&
          localStorage.getItem('subconsciouslog_onboarding_dismissed');
        if (!dismissed) {
          setShowOnboarding(true);
        }
      }

      if (worldRes) {
        setWorldData(worldRes);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading, fetchDashboardData]);

  const { runSync } = useSyncQueue({
    userId: user?.id,
    onDreamUploaded: () => {
      fetchDashboardData();
    },
  });

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 w-full space-y-8 animate-pulse">
        <Skeleton className="h-16 w-80 rounded-2xl bg-[var(--bg-card)]" />
        <Skeleton className="h-32 rounded-2xl bg-[var(--bg-card)]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-44 rounded-2xl bg-[var(--bg-card)]" />
          <Skeleton className="h-44 rounded-2xl bg-[var(--bg-card)]" />
          <Skeleton className="h-44 rounded-2xl bg-[var(--bg-card)]" />
        </div>
      </div>
    );
  }

  const { artifacts, dreamCount } = worldData;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 w-full space-y-9 relative">
      {/* 1. Calm Greeting & Header */}
      <div className="border-b border-[var(--border-default)] pb-7">
        <Greeting profile={profile} dreams={dreams} />
      </div>

      {/* Pending / Unsynced Local Dreams Banner */}
      {user?.id && (
        <PendingDreamsBanner
          userId={user.id}
          onRequestSync={runSync}
        />
      )}

      {/* 2. Primary Morning Record Callout — High Priority on Mobile */}
      <div className="relative overflow-hidden p-6 sm:p-7 md:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)] font-mono">
                Morning Dictation
              </span>
            </div>
            <h2 className="text-2xl sm:text-2xl md:text-3xl font-display font-medium text-[var(--text-primary)] tracking-tight">
              What stayed with you upon waking?
            </h2>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed max-w-md mx-auto sm:mx-0">
              Speak or type before it fades. A single fragment, emotion, or scene is enough.
            </p>
          </div>

          {/* Action Area: Expansive, instant-tap trigger on mobile */}
          <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
            <Link
              href="/dream/new?record=1"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-3.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] text-base sm:text-sm font-semibold tracking-wide transition-all shadow-xl shadow-[var(--accent-soft)] active:scale-95 cursor-pointer"
            >
              <Mic size={22} className="shrink-0" />
              <span>Record with Voice</span>
            </Link>
            <Link
              href="/dream/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Or type notes manually</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Recent Dreams Stream */}
      <RecentDreams dreams={dreams} />

      {/* 4. Small / Quiet Insights & Continuity Section */}
      <AIInsight dreams={dreams} />

      {/* 5. Subtle Dream World Discovery Note */}
      <div className="pt-2 pb-4 border-t border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <Compass size={14} className="text-[var(--text-muted)] shrink-0" />
          <span>A spatial dream topography builds quietly as you record entries.</span>
        </div>
        <Link
          href="/world"
          className="inline-flex items-center gap-1 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span>Explore Dream World</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      <FirstTimeOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}

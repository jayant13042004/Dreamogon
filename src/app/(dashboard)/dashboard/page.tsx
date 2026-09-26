'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Dream } from '@/types/dream';
import { Greeting } from '@/components/dashboard/Greeting';
import { RecentDreams } from '@/components/dashboard/RecentDreams';
import { AIInsight } from '@/components/dashboard/AIInsight';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchCompleteDreamWorldData, DreamWorldData } from '@/lib/dreamWorld';
import { Compass, Plus, ArrowRight } from 'lucide-react';
import { FirstTimeOnboardingModal } from '@/components/dashboard/FirstTimeOnboardingModal';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [worldData, setWorldData] = useState<DreamWorldData>({
    artifacts: [],
    insights: [],
    dreamCount: 0,
    topThemes: [],
    mostRecurringElement: null,
    topEmotion: null,
    hasUnfamiliarConnection: false
  });
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
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
            (localStorage.getItem('subconsciouslog_onboarding_dismissed') ||
              localStorage.getItem('dreamogon_onboarding_dismissed') ||
              localStorage.getItem('lucida_onboarding_dismissed'));
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
    }

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [user?.id, authLoading]);

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

      {/* 2. Primary Morning Record Callout */}
      <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Quick Capture
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-medium text-[var(--text-primary)]">
            What stayed with you upon waking?
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Record raw fragments, emotions, or scenes now. Analysis and reflection can unfold later.
          </p>
        </div>

        <Link
          href="/dream/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] text-xs font-semibold tracking-wide transition-colors shrink-0"
        >
          <Plus size={15} />
          <span>Record a dream</span>
        </Link>
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

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Moon, Sparkles, Feather } from 'lucide-react';
import type { Dream } from '@/types/dream';
import { DreamCard } from './DreamCard';

interface RecentDreamsProps {
  dreams: Dream[];
}

export function RecentDreams({ dreams }: RecentDreamsProps) {
  const router = useRouter();

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-1">
            Recorded Memories
          </span>
          <h2 className="text-2xl font-display font-medium text-[var(--text-primary)]">
            Recent Dreams
          </h2>
        </div>

        {dreams.length > 0 && (
          <Link 
            href="/dreams" 
            className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors group"
          >
            <span>View all ({dreams.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {dreams.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] mb-3">
            <Moon className="w-5 h-5 opacity-70" />
          </div>
          <h3 className="text-lg font-display font-medium text-[var(--text-primary)]">Your journal is quiet</h3>
          <p className="text-[var(--text-secondary)] text-xs md:text-sm mt-1 max-w-sm leading-relaxed">
            Record a dream upon waking. Your words will stay preserved here.
          </p>
          <button
            onClick={() => router.push('/dream/new')}
            className="mt-5 px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] text-xs font-medium transition-all"
          >
            Record your first dream
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dreams.slice(0, 6).map((dream, index) => (
            <DreamCard key={dream.id} dream={dream} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Dream } from '@/types/dream';
import { aggregateThemes } from '@/lib/patterns';

interface AIInsightProps {
  dreams: Dream[];
}

export function AIInsight({ dreams }: AIInsightProps) {
  const router = useRouter();

  if (dreams.length < 2) {
    return (
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)]">
        <h3 className="font-display font-medium text-[var(--text-primary)] mb-1">Patterns take a few dreams</h3>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xl">
          After you record a couple of entries, Dreamogon can surface recurring themes and motifs here and
          on Insights.
        </p>
        <button
          onClick={() => router.push('/dream/new')}
          className="mt-3 text-xs font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1.5"
        >
          Record another dream <ArrowRight size={12} />
        </button>
      </div>
    );
  }

  const themes = aggregateThemes(dreams);
  const top = themes.find((t) => t.count >= 2);

  const insightText = top
    ? `"${top.name}" appears across ${top.count} recent dreams — a recurring thread to reflect on when you have a quiet moment.`
    : 'Your recent dreams cover varied themes. Open Insights when you want to browse what tends to return.';

  return (
    <div className="p-6 md:p-7 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
          <BookOpen size={18} />
        </div>
        <div>
          <h3 className="font-display font-medium text-lg text-[var(--text-primary)]">Something to notice</h3>
          <p className="text-[var(--text-secondary)] text-sm mt-1 max-w-2xl leading-relaxed">{insightText}</p>
          <p className="text-[10px] font-mono text-[var(--text-muted)] mt-2 uppercase tracking-wider">
            Reflective observation — not a diagnosis
          </p>
        </div>
      </div>

      <button
        onClick={() => router.push('/insights')}
        className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent-soft)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-medium inline-flex items-center gap-2 shrink-0 transition-colors"
      >
        Open insights
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

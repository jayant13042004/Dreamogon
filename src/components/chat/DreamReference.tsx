import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface DreamReferenceProps {
  dreamId: string;
  title?: string;
  date?: string;
}

export function DreamReference({ dreamId, title, date }: DreamReferenceProps) {
  let formattedDate = '';
  if (date) {
    try {
      formattedDate = new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      formattedDate = date;
    }
  }

  return (
    <Link href={`/dream/${dreamId}`} className="inline-block mt-1">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:border-[var(--accent)] hover:bg-[var(--bg-card)] transition-all cursor-pointer group shadow-2xs">
        <BookOpen className="w-3.5 h-3.5 text-[var(--accent)] group-hover:scale-105 transition-transform" />
        <div className="flex flex-col text-left">
          <span className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            {title || 'View Dream Memory'}
          </span>
          {formattedDate && (
            <span className="text-[10px] text-[var(--text-muted)] font-mono">{formattedDate}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

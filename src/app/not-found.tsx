import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { ArrowRight, BookOpen } from 'lucide-react';
import { DreamogonSymbol } from '@/components/ui/BrandLogo';

export const metadata = constructMetadata({
  title: 'Lost in a Dream (404) — DREAMOGON',
  description: 'The oneiric path you are searching for does not exist or has drifted away.',
  path: '/404',
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent)]/20">
      <PublicNavbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] mb-6 shadow-sm">
          <DreamogonSymbol size={36} />
        </div>

        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[var(--accent)] mb-2 block">
          Error 404 · Void
        </span>

        <h1 className="text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)] tracking-tight mb-3">
          Lost in a Dream?
        </h1>

        <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-light mb-8">
          The page or memory you are looking for does not seem to exist in this subconscious realm.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
          >
            Return to Sanctuary
          </Link>

          <Link
            href="/dream-symbols"
            className="px-6 py-3 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-medium tracking-wider uppercase transition-all"
          >
            Explore Dream Symbols
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

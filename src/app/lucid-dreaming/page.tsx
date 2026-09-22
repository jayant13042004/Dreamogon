import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Sparkles, Eye, Compass, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Lucid Dreaming — Techniques, Reality Checks, & Journaling Protocols',
  description: 'Master lucid dreaming with evidence-based techniques: MILD, WBTB, reality testing protocols, and dream recall stabilization.',
  path: '/lucid-dreaming',
  keywords: ['lucid dreaming', 'how to lucid dream', 'lucid dreaming techniques', 'MILD technique', 'WBTB technique', 'reality checks'],
});

export default function LucidDreamingPillarPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Lucid Dreaming', url: '/lucid-dreaming' },
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent)]/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />

      <PublicNavbar />

      <main className="pt-32 pb-24 max-w-5xl mx-auto px-6 md:px-8 w-full space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-mono uppercase tracking-widest">
            <Eye size={14} />
            <span>Oneiric Awareness</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-tight">
            The Science & Practice of Lucid Dreaming
          </h1>

          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-light">
            Awaken inside your dreams with full conscious clarity. Discover how consistent dream journaling forms the foundational cognitive anchor for sustained oneiric awareness.
          </p>
        </div>

        {/* 3 Core Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">MILD Method</h3>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-light">
              Mnemonic Induction of Lucid Dreams: cultivating prospective memory through bedtime affirmation and visualization of recurring dream signs.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">WBTB Protocol</h3>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-light">
              Wake-Back-to-Bed: briefly awakening after 5 hours of sleep to prime cortical awareness before entering your deepest, longest REM cycles.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">Critical Reality Tests</h3>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-light">
              Conditioning waking habits of questioning reality (finger through palm, reading digital text twice) that naturally trigger inside dreams.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-10 md:p-14 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] text-center space-y-6 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-[var(--text-primary)]">
            Journaling is the Foundation of Lucidity
          </h2>
          <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-lg mx-auto font-light">
            You cannot become lucid if you cannot remember your dreams. Start building your recall practice with DREAMOGON today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
          >
            Start Free Lucid Sanctuary <ArrowRight size={14} />
          </Link>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}

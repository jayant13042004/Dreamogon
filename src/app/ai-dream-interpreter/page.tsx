import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Sparkles, Bot, ShieldCheck, ArrowRight, Lock, Eye, CheckCircle } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'AI Dream Interpreter — Cognitive Pattern Analysis & Spatial Modeling',
  description: 'Experience private AI dream interpretation that extracts entities, identifies recurring motifs, and maps your subconscious into an evolving 2.5D world.',
  path: '/ai-dream-interpreter',
  keywords: ['AI dream interpreter', 'AI dream analysis', 'AI dream journal', 'artificial intelligence dream meaning', 'subconscious AI pattern detection'],
});

export default function AIDreamInterpreterPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'AI Dream Interpreter', url: '/ai-dream-interpreter' },
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
            <Bot size={14} />
            <span>Subconscious Architecture</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-tight">
            AI Dream Interpretation That Respects Privacy & Psychological Nuance
          </h1>

          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-light">
            Most &ldquo;AI dream apps&rdquo; are shallow wrappers that spit out generic horoscope summaries. DREAMOGON is an end-to-end cognitive architecture that extracts persistent spatial artifacts and tracks emotional evolution over time.
          </p>
        </div>

        {/* Technical Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <span className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-mono text-xs">
              01
            </span>
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">Spatial Entity Extraction</h3>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-light">
              Automatically identifies meaningful vehicles, places, characters, and emotions—converting them into persistent visual artifacts.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <span className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-mono text-xs">
              02
            </span>
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">Cross-Dream Synthesis</h3>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-light">
              Discovers hidden correlations across non-consecutive journal entries: connecting recurring water dreams with changes in workload or relationships.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <span className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-mono text-xs">
              03
            </span>
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">Private by Design</h3>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-light">
              Your dreams are private. DREAMOGON guarantees zero public indexing, zero advertising data brokers, and does not train internal public foundation models on your entries.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-10 md:p-14 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] text-center space-y-6 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-[var(--text-primary)]">
            Analyze Your First Dream Today
          </h2>
          <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-lg mx-auto font-light">
            Record a dream and watch your first subconscious artifact materialize in real time.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
          >
            Try Free AI Interpretation <ArrowRight size={14} />
          </Link>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}

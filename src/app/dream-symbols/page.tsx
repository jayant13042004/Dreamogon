import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { DREAM_SYMBOLS } from '@/lib/seo/symbols';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Sparkles, ArrowRight, Compass, Search, Layers } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Dream Symbols & Meanings Dictionary',
  description: 'Explore universal dream symbols: water, flying, falling, teeth falling out, being chased, and their psychological reflections.',
  path: '/dream-symbols',
  keywords: ['dream symbols', 'dream meanings dictionary', 'what do dreams mean', 'dream interpretation symbols'],
});

export default function DreamSymbolsHubPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Dream Symbols', url: '/dream-symbols' },
  ]);

  const categories = Array.from(new Set(DREAM_SYMBOLS.map((s) => s.category)));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent)]/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />

      <PublicNavbar />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-12 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-mono uppercase tracking-widest mb-4">
            <Compass size={14} />
            <span>Symbol Index</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-tight">
            Universal Dream Symbols & Meanings
          </h1>
          <p className="text-[var(--text-secondary)] text-base md:text-lg mt-4 leading-relaxed font-light">
            Evidence-informed explorations of common oneiric motifs. Understand how symbols reflect emotional state, waking challenges, and psychological transitions.
          </p>
        </div>

        {/* Categories & Symbols Grid */}
        <div className="space-y-16">
          {categories.map((category) => {
            const symbols = DREAM_SYMBOLS.filter((s) => s.category === category);
            return (
              <section key={category} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[var(--border-default)] pb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  <h2 className="text-xl font-display font-medium text-[var(--text-primary)]">
                    {category}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {symbols.map((sym) => (
                    <Link key={sym.slug} href={`/dream-symbols/${sym.slug}`} className="group block">
                      <div className="h-full p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] group-hover:border-[var(--accent)]/40 transition-all duration-300 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--accent)] block mb-2">
                            {sym.category}
                          </span>
                          <h3 className="text-2xl font-display font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-3">
                            {sym.name}
                          </h3>
                          <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-light line-clamp-3">
                            {sym.quickAnswer}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--accent)] font-medium font-mono">
                          <span>Explore Symbol Analysis</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}

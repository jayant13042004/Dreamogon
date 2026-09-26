import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo/metadata';
import { DREAM_SYMBOLS } from '@/lib/seo/symbols';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { ArrowLeft, Sparkles, HelpCircle, Brain, ArrowRight, ShieldCheck, Compass } from 'lucide-react';

interface DreamSymbolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DREAM_SYMBOLS.map((sym) => ({
    slug: sym.slug,
  }));
}

export async function generateMetadata({ params }: DreamSymbolPageProps) {
  const resolvedParams = await params;
  const symbol = DREAM_SYMBOLS.find((s) => s.slug === resolvedParams.slug);
  if (!symbol) return {};

  return constructMetadata({
    title: `What Does Dreaming About ${symbol.name} Mean? (Psychological Analysis)`,
    description: `Understand the meaning of ${symbol.name.toLowerCase()} in dreams: common emotional contexts, psychological interpretations, and questions to ask yourself.`,
    path: `/dream-symbols/${symbol.slug}`,
    keywords: [
      `${symbol.name.toLowerCase()} dream meaning`,
      `dreaming about ${symbol.name.toLowerCase()}`,
      `what does ${symbol.name.toLowerCase()} in a dream mean`,
      'dream symbol interpretation',
    ],
  });
}

export default async function DreamSymbolDetailPage({ params }: DreamSymbolPageProps) {
  const resolvedParams = await params;
  const symbol = DREAM_SYMBOLS.find((s) => s.slug === resolvedParams.slug);

  if (!symbol) {
    notFound();
  }

  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Dream Symbols', url: '/dream-symbols' },
    { name: symbol.name, url: `/dream-symbols/${symbol.slug}` },
  ]);

  const relatedSymbols = DREAM_SYMBOLS.filter((s) => symbol.relatedSymbolSlugs?.includes(s.slug));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent)]/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />

      <PublicNavbar />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6 md:px-8 w-full space-y-12">
        {/* Back Link */}
        <Link
          href="/dream-symbols"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)] hover:underline transition-colors"
        >
          <ArrowLeft size={14} />
          <span>All Dream Symbols</span>
        </Link>

        {/* Hero Section */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-mono uppercase tracking-widest">
            <span>Symbol Exploration · {symbol.category}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-tight">
            What Does Dreaming About {symbol.name} Mean?
          </h1>

          {/* Quick Answer Summary Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--accent)] mb-2">
              <Sparkles size={14} />
              <span>Reflexive Summary</span>
            </div>
            <p className="text-[var(--text-primary)] text-base md:text-lg leading-relaxed font-light">
              {symbol.quickAnswer}
            </p>
          </div>
        </header>

        {/* Common Scenarios */}
        <section className="space-y-6">
          <h2 className="text-2xl font-display font-medium text-[var(--text-primary)]">
            Common {symbol.name} Dream Scenarios & Interpretations
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {symbol.commonInterpretations.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2">
                <h3 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  {item.scenario}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light pl-3.5">
                  {item.meaning}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Emotional & Scientific Context */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <h3 className="text-lg font-display font-medium text-[var(--text-primary)] flex items-center gap-2">
              <Compass size={18} className="text-[var(--accent)]" />
              <span>Emotional Resonance</span>
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">
              {symbol.emotionalContext}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <h3 className="text-lg font-display font-medium text-[var(--text-primary)] flex items-center gap-2">
              <Brain size={18} className="text-[var(--accent)]" />
              <span>Neuroscience & Memory</span>
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">
              {symbol.scientificContext}
            </p>
          </div>
        </section>

        {/* Self-Reflection Prompt Questions */}
        <section className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-4">
          <h3 className="text-xl font-display font-medium text-[var(--text-primary)] flex items-center gap-2">
            <HelpCircle size={18} className="text-[var(--accent)]" />
            <span>Questions to Ask Yourself</span>
          </h3>
          <ul className="space-y-3">
            {symbol.questionsToAsk.map((q, i) => (
              <li key={i} className="text-[var(--text-secondary)] text-sm leading-relaxed font-light flex items-start gap-2.5">
                <span className="text-[var(--accent)] font-mono font-bold mt-0.5">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* How SUBCONSCIOUS LOG Tracks This Symbol */}
        <section className="p-8 md:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xl text-center space-y-6">
          <h3 className="text-2xl md:text-3xl font-display font-medium text-[var(--text-primary)]">
            Discover How {symbol.name} Recurs Across Your Dreams
          </h3>
          <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed">
            Record your dreams in SUBCONSCIOUS LOG. Our system identifies {symbol.name.toLowerCase()} as a subconscious motif and traces its emotional connections over time.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
          >
            Start Tracking {symbol.name} Dreams <ArrowRight size={14} />
          </Link>
        </section>

        {/* Related Symbols */}
        {relatedSymbols.length > 0 && (
          <section className="pt-8 border-t border-[var(--border-default)] space-y-6">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">
              Related Dream Symbols
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedSymbols.map((rel) => (
                <Link key={rel.slug} href={`/dream-symbols/${rel.slug}`} className="group block">
                  <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] group-hover:border-[var(--accent)]/40 transition-all flex items-center justify-between">
                    <span className="font-display font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {rel.name}
                    </span>
                    <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      <PublicFooter />
    </div>
  );
}

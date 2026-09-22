import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { RotateCw, Sparkles, Brain, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Recurring Dreams — Meaning, Causes, & How to Break the Cycle',
  description: 'Understand why the brain repeats dreams: emotional conflict, stress signals, threat simulation, and how journaling helps resolve repetitive themes.',
  path: '/recurring-dreams',
  keywords: ['recurring dreams', 'why do i have recurring dreams', 'repetitive dreams meaning', 'recurring nightmares', 'recurring dream themes'],
});

export default function RecurringDreamsPillarPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Recurring Dreams', url: '/recurring-dreams' },
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
            <RotateCw size={14} />
            <span>Recurring Feedback</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-tight">
            Why Do I Keep Having the Same Dream?
          </h1>

          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-light">
            Recurring dreams occur in up to 75% of people. Rather than mysterious prophecies, they are the mind's way of repeatedly highlighting unresolved emotional friction, unexpressed needs, or persistent waking stress.
          </p>
        </div>

        {/* 4 Most Frequent Recurring Themes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">01. Being Chased / Pursued</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">
              Frequently signals emotional avoidance: fleeing an uncomfortable conversation, neglected responsibility, or unacknowledged waking fear.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">02. Losing Teeth / Crumbling Teeth</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">
              Deeply tied to vulnerability, communication anxiety, fear of public judgment, or major life transition stress.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">03. Unprepared for an Exam</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">
              Common in high-achievers: reflects internalized performance anxiety, impostor syndrome, or fear of being evaluated.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">04. Vehicle Brakes Not Working</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">
              Symbolizes perceived loss of control over personal life direction or feeling powerless to prevent an impending outcome.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-10 md:p-14 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] text-center space-y-6 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-[var(--text-primary)]">
            Trace Your Recurring Subconscious Patterns
          </h2>
          <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-lg mx-auto font-light">
            DREAMOGON cross-correlates your entries over time to help you identify what waking triggers precede your recurring dreams.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
          >
            Start Tracking Recurring Dreams <ArrowRight size={14} />
          </Link>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}

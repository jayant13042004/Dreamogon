import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema, generateOrganizationSchema } from '@/lib/seo/structuredData';
import { Compass, ShieldCheck, Sparkles, Feather, ArrowRight, Lock, Eye, BookOpen } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'About SUBCONSCIOUS LOG — Philosophy, Architecture & Subconscious Archive',
  description:
    'Learn about SUBCONSCIOUS LOG: our philosophy of self-awareness through morning dream journaling, cognitive science principles, zero-data-sharing privacy standards, and calm design.',
  path: '/about',
  keywords: [
    'about SUBCONSCIOUS LOG',
    'dream journal philosophy',
    'SUBCONSCIOUS LOG mission',
    'privacy first AI dream journal',
    'cognitive science dream recall',
  ],
});

export default function AboutPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ]);

  const orgSchema = generateOrganizationSchema();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-soft)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <PublicNavbar />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6 md:px-10 w-full space-y-20">
        {/* Header */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Philosophy & Principles
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium tracking-tight text-[var(--text-primary)] leading-[1.1]">
            A private sanctuary for your subconscious mind.
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            Humans spend approximately a third of their lives asleep, traversing rich, surreal interior landscapes. Yet within ten minutes of waking, morning neurochemistry shifts and up to ninety percent of dream recall dissolves into silence.
          </p>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            SUBCONSCIOUS LOG exists to provide an unhurried, respectful sanctuary for those fleeting dawn moments—capturing raw memory without friction, reflecting through contemplative inquiry, and mapping your recurring motifs across years.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="space-y-8">
          <h2 className="text-2xl font-display font-medium text-[var(--text-primary)]">
            Our Guiding Principles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent)]">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-display font-medium text-[var(--text-primary)]">
                1. Absolute Privacy
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                Dreams are among the most intimate expressions of human consciousness. We operate on a strict zero-data-selling architecture. Your entries are protected by Row Level Security and are never indexed on public search engines or used by SUBCONSCIOUS LOG to train public foundation models.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent)]">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-display font-medium text-[var(--text-primary)]">
                2. Contemplative Inquiry
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                We reject mystical fortune-telling, horoscope gimmicks, and pseudo-clinical diagnosis. SUBCONSCIOUS LOG operates as a Socratic mirror: offering thoughtful inquiries that invite your own reflection, while keeping your authentic unedited words pristine.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent)]">
                <Compass size={20} />
              </div>
              <h3 className="text-lg font-display font-medium text-[var(--text-primary)]">
                3. Spatial Memory Topography
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                Linear lists fail to convey how memories relate to one another. SUBCONSCIOUS LOG organizes your subconscious motifs into an interconnected constellation—allowing you to navigate themes of water, thresholds, and recurring figures as a living landscape.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent)]">
                <Feather size={20} />
              </div>
              <h3 className="text-lg font-display font-medium text-[var(--text-primary)]">
                4. Quiet Luxury & Calm
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                No loud neon gradients, no gamification badges, no streaks designed to trigger anxiety. Every pixel of SUBCONSCIOUS LOG is crafted with restrained typography, warm obsidian or parchment palettes, and generous whitespace.
              </p>
            </div>
          </div>
        </div>

        {/* Product Architecture */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] block">
            Data Architecture & Independence
          </span>
          <h3 className="text-2xl font-display font-medium text-[var(--text-primary)]">
            Built for lifelong permanence.
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light leading-relaxed">
            SUBCONSCIOUS LOG is engineered with open, standardized data structures. Every dream entry belongs entirely to you. You can export your complete archive in JSON or Markdown at any time, ensuring that your dream history remains your personal property indefinitely.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
            <Link href="/how-it-works" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1">
              <span>Read the full product architecture</span>
              <ArrowRight size={12} />
            </Link>
            <Link href="/privacy" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Privacy Standards &rarr;
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 pt-6 border-t border-[var(--border-subtle)]">
          <h3 className="text-2xl sm:text-3xl font-display font-medium text-[var(--text-primary)]">
            Begin your journal today.
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light max-w-md mx-auto leading-relaxed">
            A permanent archive of what the morning forgets. Start recording free.
          </p>
          <div className="flex justify-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all shadow-md"
            >
              Begin your journal
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

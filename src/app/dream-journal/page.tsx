import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { BookOpen, Sparkles, ArrowRight, ShieldCheck, Compass, CheckCircle } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Dream Journal — The Mindful AI Dream Diary for Pattern Discovery',
  description: 'Learn why dream journaling transforms self-awareness. Discover how SUBCONSCIOUS LOG maps morning dream recall into recurring themes and emotional insights.',
  path: '/dream-journal',
  keywords: ['dream journal', 'dream diary', 'how to keep a dream journal', 'best dream journal app', 'dream journaling benefits'],
});

export default function DreamJournalPillarPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Dream Journal', url: '/dream-journal' },
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
            <BookOpen size={14} />
            <span>The Practice</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-tight">
            The Transformative Practice of Dream Journaling
          </h1>

          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-light">
            Every night, your subconscious processes waking dilemmas, emotional transitions, and creative connections. A dream journal is the bridge that keeps those insights from dissolving upon waking.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <span className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-mono text-xs">
              01
            </span>
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">Halts Memory Decay</h3>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-light">
              90% of dream memories vanish within 10 minutes. Morning recording captures elusive imagery before waking neurochemistry washes it away.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <span className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-mono text-xs">
              02
            </span>
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">Uncovers Hidden Patterns</h3>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-light">
              Isolated dreams feel random. Tracking multiple entries reveals recurring motifs, emotional rhythms, and subconscious triggers.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <span className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-mono text-xs">
              03
            </span>
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">Enhances Lucidity</h3>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-light">
              Journaling trains conscious awareness to recognize recurring dream signs, accelerating your ability to achieve lucid dreaming.
            </p>
          </div>
        </div>

        {/* How SUBCONSCIOUS LOG Revolutionizes the Journal */}
        <section className="p-10 md:p-14 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xl relative overflow-hidden space-y-8">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent)]">
              The SUBCONSCIOUS LOG Evolution
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-[var(--text-primary)]">
              Not Just a Blank Page. A Living Subconscious Realm.
            </h2>
            <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-light">
              Traditional paper notebooks gather dust on nightstands. SUBCONSCIOUS LOG transforms every dream you record into a spatial visual artifact—creating a personal world that grows, connects, and deepens over time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]">
              <CheckCircle size={18} className="text-[var(--accent)] shrink-0" />
              <span>Zero public model training — private by design</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]">
              <CheckCircle size={18} className="text-[var(--accent)] shrink-0" />
              <span>Voice-to-text recording in the dark</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]">
              <CheckCircle size={18} className="text-[var(--accent)] shrink-0" />
              <span>Automatic spatial entity & motif clustering</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]">
              <CheckCircle size={18} className="text-[var(--accent)] shrink-0" />
              <span>Free tier with complete first 5-dream journey</span>
            </div>
          </div>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
          >
            Create Your Free Dream Journal <ArrowRight size={14} />
          </Link>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}

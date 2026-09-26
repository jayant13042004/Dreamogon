'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, MessageSquare, Compass, ShieldCheck } from 'lucide-react';

export function RecurringPatternsSection() {
  return (
    <section id="patterns" className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/30">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Pattern Recognition &amp; Continuity
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-[1.12]">
            See what keeps returning across your dreams.
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed max-w-2xl">
            A single dream feels random. Twenty dreams reveal a recurring geography. Subconscious Log quietly organizes your entries to reveal the persistent people, places, and motifs that shape your interior world.
          </p>
        </div>

        {/* Two-Column Layout: Real Product Intelligence + Supporting Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column (lg:col-span-7): Real Product UI Demonstrations */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Subconscious Landmarks Card */}
            <div className="p-6 md:p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Detected Subconscious Landmarks
                </span>
                <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider">
                  Archive Intelligence
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      Place · Anchor
                    </span>
                    <span className="text-[10px] font-mono font-medium text-[var(--accent)]">7×</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">The Coastal Highway</h4>
                  <p className="text-[11px] text-[var(--text-muted)] font-light">
                    Enduring constant · First recorded in October
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      Person · Recurring
                    </span>
                    <span className="text-[10px] font-mono font-medium text-[var(--accent)]">4×</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">The Silent Passenger</h4>
                  <p className="text-[11px] text-[var(--text-muted)] font-light">
                    Frequently co-occurs with ocean mist
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      Theme · Emerging
                    </span>
                    <span className="text-[10px] font-mono font-medium text-[var(--accent)]">3×</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">Unopened Letters</h4>
                  <p className="text-[11px] text-[var(--text-muted)] font-light">
                    Newly appeared in recent spring entries
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      Emotion · Climate
                    </span>
                    <span className="text-[10px] font-mono font-medium text-[var(--accent)]">62%</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">Solitary Contemplation</h4>
                  <p className="text-[11px] text-[var(--text-muted)] font-light">
                    Predominant waking emotional resonance
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Ask Your Dream History (Grounded Retrieval) */}
            <div className="p-5 md:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                <MessageSquare size={13} className="text-[var(--accent)]" />
                <span className="uppercase tracking-wider">Ask Your Dream History</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] italic">
                &ldquo;When did I last dream about waiting at an airport?&rdquo;
              </div>

              <div className="space-y-1.5 pl-2 border-l-2 border-[var(--accent)]/40 text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                <p>
                  Found in <strong>3 entries</strong> between November and February. In each dream, departure was delayed by rising water, and a shared feeling of relief rather than panic was recorded upon waking.
                </p>
                <p className="text-[10px] font-mono text-[var(--text-muted)]">
                  Strict provenance across your private archive · Never hallucinated
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)] hover:underline"
              >
                <span>Discover the recurring motifs in your archive</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right Column (lg:col-span-5): Supporting Atmospheric Visual (1:1 Aspect Ratio) */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative aspect-square w-full max-w-[420px] rounded-3xl overflow-hidden border border-[var(--border-default)] shadow-2xl bg-[var(--bg-card)] group"
            >
              <Image
                src="/visuals/landing/recurring-patterns.png"
                alt="Recurring patterns visual atmosphere"
                fill
                quality={90}
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {/* Quiet, calm vignette framing */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Minimal caption */}
              <div className="absolute bottom-5 left-5 right-5 text-center pointer-events-none">
                <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/90">
                  Subconscious Filaments &amp; Motifs
                </p>
                <p className="text-xs text-white/70 font-light mt-0.5">
                  Connections forming between people, places, and memory.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

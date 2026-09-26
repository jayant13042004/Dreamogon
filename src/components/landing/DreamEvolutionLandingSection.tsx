'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Compass, TrendingUp, Sparkles } from 'lucide-react';

export function DreamEvolutionLandingSection() {
  return (
    <section id="evolution" className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)]">
      <div className="max-w-5xl mx-auto space-y-14">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Temporal Trajectory &amp; Evolution
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-[1.12]">
            How your dreams change over time.
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed max-w-2xl">
            Your dream world is not static. As your waking life shifts, earlier themes drift into dormancy and new psychological landscapes emerge. Subconscious Log compares earlier and recent eras to reveal your subconscious evolution.
          </p>
        </div>

        {/* Supporting Atmospheric Visual (16:9 Aspect Ratio) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative aspect-video w-full rounded-3xl overflow-hidden border border-[var(--border-default)] shadow-2xl bg-[var(--bg-card)] group"
        >
          <Image
            src="/visuals/landing/dream-evolution.png"
            alt="Dream evolution progression from earlier to recent eras"
            fill
            quality={90}
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover object-center transition-transform duration-1000 group-hover:scale-[1.01]"
          />

          {/* Minimal soft bottom gradient to preserve the composition while keeping timeline markers clear */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

          {/* Chronological Era Indicators */}
          <div className="absolute bottom-4 sm:bottom-6 left-5 sm:left-8 right-5 sm:right-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] block">
                Earlier Dreams
              </span>
              <p className="text-xs sm:text-sm text-white/90 font-display font-light">
                Nocturnal mist, enclosed corridors, solitary transit
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-xs border border-white/10 text-white/70 text-[10px] font-mono uppercase tracking-wider">
              <span>Temporal Arc</span>
              <ArrowRight size={12} className="text-[var(--accent)]" />
            </div>

            <div className="space-y-0.5 sm:text-right">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/90 block">
                Recent Dreams
              </span>
              <p className="text-xs sm:text-sm text-white/90 font-display font-light">
                Awakening horizon, open water, grounded resolution
              </p>
            </div>
          </div>
        </motion.div>

        {/* Grounded Real Product Insights (3 Editorial Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-medium">
                Emerging Landmarks
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
            </div>
            <h4 className="text-base font-semibold text-[var(--text-primary)]">Newly Appearing Motifs</h4>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              Detects symbols, people, and architectures that have entered your dream world over the last 30 to 90 days.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-medium">
                Dormant Memories
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500/80" />
            </div>
            <h4 className="text-base font-semibold text-[var(--text-primary)]">Motifs at Rest</h4>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              Surfaces figures and places that defined earlier periods of your life but have quietly faded from recent nights.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-medium">
                Atmospheric Shift
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-500/80" />
            </div>
            <h4 className="text-base font-semibold text-[var(--text-primary)]">Emotional Climate Drift</h4>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              Tracks the gradual transition of emotional tone—from urgent anxiety to contemplative peace across milestones.
            </p>
          </div>

        </div>

        {/* Narrative Callout */}
        <div className="pt-2 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)] hover:underline"
          >
            <span>Start archiving to watch your dream world evolve</span>
            <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </section>
  );
}

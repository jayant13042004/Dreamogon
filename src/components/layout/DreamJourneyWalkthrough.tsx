'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, TrendingUp, BookOpen, ArrowRight, Check } from 'lucide-react';

const STAGES = [
  {
    id: 'dream',
    step: '01',
    label: 'Dream',
    title: 'Raw Morning Words',
    tagline: 'What stayed with you upon waking',
    icon: BookOpen,
  },
  {
    id: 'memory',
    step: '02',
    label: 'Memory',
    title: 'Visual Memory',
    tagline: 'Preserving atmosphere before it dissolves',
    icon: Sparkles,
  },
  {
    id: 'pattern',
    step: '03',
    label: 'Pattern',
    title: 'Recurring Threads',
    tagline: 'What your subconscious returns to over time',
    icon: TrendingUp,
  },
  {
    id: 'world',
    step: '04',
    label: 'World',
    title: 'Dream Topography',
    tagline: 'A gentle spatial map of your memories',
    icon: Compass,
  },
];

export function DreamJourneyWalkthrough() {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      {/* 1. Stage Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAGES.map((s, index) => {
          const isActive = activeStage === index;
          const isPassed = activeStage > index;
          const Icon = s.icon;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStage(index)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative ${
                isActive
                  ? 'bg-[var(--bg-card)] border-[var(--accent)] shadow-md'
                  : 'bg-[var(--bg-card)]/50 border-[var(--border-default)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-mono uppercase tracking-[0.2em] ${
                    isActive ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Stage {s.step}
                </span>
                <Icon
                  size={14}
                  className={isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] opacity-60'}
                />
              </div>
              <p
                className={`font-display text-lg font-medium leading-tight ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {s.label}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1 truncate">{s.tagline}</p>
            </button>
          );
        })}
      </div>

      {/* 2. Interactive Stage Display Container */}
      <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden shadow-xl min-h-[420px] flex flex-col justify-between">
        <div className="p-6 md:p-10 flex-1">
          <AnimatePresence mode="wait">
            {activeStage === 0 && (
              <motion.div
                key="stage-dream"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] block mb-1">
                      Step 1 &middot; The Morning Journal Entry
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl text-[var(--text-primary)] font-medium">
                      The Wet Road at Dusk
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)]">
                    <span>Recorded 06:14 AM</span>
                    <span>&bull;</span>
                    <span>48 words</span>
                  </div>
                </div>

                {/* Raw entry representation */}
                <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-4">
                  <p className="text-base md:text-lg text-[var(--text-primary)] font-light leading-relaxed whitespace-pre-line italic">
                    &ldquo;I was driving alone on a wet two-lane road at dusk. The headlights reflected across the asphalt like dark liquid. Every few miles, the road dipped down toward an inlet of cold, silent water. I wasn&apos;t lost, but I knew I wouldn&apos;t arrive anywhere I recognized.&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                      Initial tags:
                    </span>
                    {['driving', 'rain', 'water', 'highway'].map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-[var(--border-default)] text-[var(--text-secondary)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                  <Check size={14} className="text-[var(--accent)]" />
                  Your words are preserved intact. No AI alteration or speculative summaries overwrite your memory.
                </p>
              </motion.div>
            )}

            {activeStage === 1 && (
              <motion.div
                key="stage-memory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] block mb-1">
                      Step 2 &middot; Atmospheric Memory
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl text-[var(--text-primary)] font-medium">
                      Visual Resonance
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] font-mono text-[10px]">
                      MOOD: MYSTICAL
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] font-mono text-[10px]">
                      VIVID
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Visual memory card */}
                  <div className="md:col-span-7 relative rounded-2xl overflow-hidden border border-[var(--border-default)] h-64 bg-[#0A0908] flex flex-col justify-end p-6">
                    {/* Atmospheric artwork backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0908] via-[#141210]/70 to-[#221F1B]/40" />
                    <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 600 300">
                      <line x1="0" y1="200" x2="600" y2="200" stroke="#C8B89E" strokeWidth="1" opacity="0.4" />
                      <polygon points="260,200 340,200 480,300 120,300" fill="#141210" />
                      <line x1="300" y1="210" x2="300" y2="290" stroke="#C8B89E" strokeWidth="2" strokeDasharray="8 12" />
                      <ellipse cx="420" cy="180" rx="90" ry="25" fill="#C8B89E" opacity="0.1" />
                    </svg>

                    <div className="relative z-10 space-y-1.5">
                      <p className="text-[10px] font-mono text-[var(--accent)] tracking-[0.2em] uppercase">
                        Cinematic Still #241
                      </p>
                      <p className="font-display text-lg text-white font-medium">
                        Two-lane highway disappearing into twilight tide
                      </p>
                      <p className="text-xs text-white/70 font-light">
                        Distilled from your descriptions of wet asphalt and cold coastal air.
                      </p>
                    </div>
                  </div>

                  {/* Summary & reflection cues */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-1.5">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                        Core Emotional Tone
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Solitary contemplation, sensory vividness, gentle detachment.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-1.5">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                        Reflective Inquiry
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)] italic">
                        &ldquo;Where did the road feel like it was leading you, even without a named destination?&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStage === 2 && (
              <motion.div
                key="stage-pattern"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] block mb-1">
                      Step 3 &middot; Cross-Dream Intelligence
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl text-[var(--text-primary)] font-medium">
                      What Keeps Returning
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    Across 18 recorded dreams
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pattern Highlight 1 */}
                  <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)]">
                        Dominant Motif
                      </span>
                      <span className="text-xs font-mono text-[var(--accent)] font-semibold">7&times;</span>
                    </div>
                    <h4 className="text-lg font-display text-[var(--text-primary)] font-medium">
                      Water & Tidal Edges
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Water has appeared in 7 of your last 18 dreams — rain, tidal shallows, deep reservoirs, and misty shorelines.
                    </p>
                  </div>

                  {/* Pattern Highlight 2 */}
                  <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)]">
                        Recurring Motion
                      </span>
                      <span className="text-xs font-mono text-[var(--accent)] font-semibold">5&times;</span>
                    </div>
                    <h4 className="text-lg font-display text-[var(--text-primary)] font-medium">
                      Solitary Vehicles
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Trains at dusk, solitary night drives, and quiet river ferries without passengers.
                    </p>
                  </div>

                  {/* Pattern Highlight 3 */}
                  <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)]">
                        Atmospheric State
                      </span>
                      <span className="text-xs font-mono text-[var(--accent)] font-semibold">8&times;</span>
                    </div>
                    <h4 className="text-lg font-display text-[var(--text-primary)] font-medium">
                      Twilight & Dusk
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Your dreams consistently take place during transitions of light rather than midday or complete darkness.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-start gap-3">
                  <Sparkles size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-[var(--text-primary)] font-medium">Quiet Observation:</strong> Subconscious Log notes when motifs reoccur without diagnosing you. You decide what recurring symbols mean for your own waking life.
                  </p>
                </div>
              </motion.div>
            )}

            {activeStage === 3 && (
              <motion.div
                key="stage-world"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] block mb-1">
                      Step 4 &middot; Your Subconscious Topography
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl text-[var(--text-primary)] font-medium">
                      The Living Dream World
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[var(--accent)] uppercase tracking-wider">
                    Optional Exploration
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Subtle Node Constellation Visualization */}
                  <div className="md:col-span-7 relative h-64 rounded-2xl border border-[var(--border-default)] bg-[#0C0B0A] p-6 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-radial from-[#1E1A16]/50 via-[#0E0D0B] to-[#0A0908]" />

                    {/* Constellation lines */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240">
                      <line x1="120" y1="120" x2="220" y2="70" stroke="#C8B89E" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
                      <line x1="220" y1="70" x2="310" y2="130" stroke="#C8B89E" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
                      <line x1="120" y1="120" x2="190" y2="180" stroke="#C8B89E" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
                      <line x1="190" y1="180" x2="310" y2="130" stroke="#C8B89E" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />

                      {/* Nodes */}
                      <circle cx="120" cy="120" r="14" fill="#1C1916" stroke="#C8B89E" strokeWidth="1.5" />
                      <circle cx="220" cy="70" r="18" fill="#25201A" stroke="#C8B89E" strokeWidth="2" />
                      <circle cx="310" cy="130" r="12" fill="#1C1916" stroke="#C8B89E" strokeWidth="1.5" />
                      <circle cx="190" cy="180" r="15" fill="#1C1916" stroke="#C8B89E" strokeWidth="1.5" />
                    </svg>

                    {/* Node labels */}
                    <div className="relative z-10 w-full h-full text-[10px] font-mono pointer-events-none">
                      <div className="absolute left-6 top-[42%] text-white/90">
                        <span className="text-[var(--accent)] font-bold">&bull; </span> Tidal Road
                      </div>
                      <div className="absolute left-[44%] top-[16%] text-white/90">
                        <span className="text-[var(--accent)] font-bold">&bull; </span> The Water Inlet
                      </div>
                      <div className="absolute right-8 top-[46%] text-white/90">
                        <span className="text-[var(--accent)] font-bold">&bull; </span> Solitary Vehicle
                      </div>
                      <div className="absolute left-[38%] bottom-[12%] text-white/90">
                        <span className="text-[var(--accent)] font-bold">&bull; </span> Twilight Horizon
                      </div>
                    </div>
                  </div>

                  {/* Descriptive narrative */}
                  <div className="md:col-span-5 space-y-4">
                    <h4 className="text-base font-display text-[var(--text-primary)] font-medium">
                      Not a game. A spatial memory palace.
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">
                      As dreams accumulate, entities connect across time. You can wander through recurring places, meet recurring figures, and watch the landscape of your mind evolve month by month.
                    </p>
                    <p className="text-xs text-[var(--text-muted)] italic">
                      Always optional — your journal remains completely functional as a pure text archive if you prefer simplicity.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Bottom controls */}
        <div className="p-4 md:px-10 md:py-4 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {STAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveStage(i)}
                aria-label={`Go to stage ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  activeStage === i ? 'w-8 bg-[var(--accent)]' : 'w-2 bg-[var(--border-default)] hover:bg-[var(--text-muted)]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActiveStage((prev) => (prev + 1) % STAGES.length)}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
          >
            <span>{activeStage === STAGES.length - 1 ? 'Start over' : 'Next stage'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

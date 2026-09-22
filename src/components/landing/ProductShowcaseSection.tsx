'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  PenLine,
  Sparkles,
  Search,
  SlidersHorizontal,
  Calendar as CalendarIcon,
  TrendingUp,
  Compass,
  ArrowRight,
  Check,
  Brain,
  Layers,
  ChevronRight,
  ShieldCheck,
  Eye,
  Clock,
  Tag,
  Smile,
} from 'lucide-react';
import Link from 'next/link';

interface ShowcaseTab {
  id: string;
  step: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

const TABS: ShowcaseTab[] = [
  {
    id: 'capture',
    step: '01',
    label: 'Morning Capture',
    title: 'Designed for half-closed eyes.',
    subtitle: 'Type or speak stream-of-consciousness before dawn thoughts evaporate.',
    description:
      'Waking memory decays in minutes. Dreamogon strips away all cognitive friction: one tap voice recording, continuous background auto-save, and gentle prompts that trigger instant recall.',
    features: [
      'One-tap voice capture & speech transcription',
      'Zero-lag continuous autosave draft protection',
      'Distraction-free typewriter typography',
      'Optional mood, lucidity & sensory tags',
    ],
  },
  {
    id: 'reflection',
    step: '02',
    label: 'AI Reflection',
    title: 'Socratic inquiries, never clinical diagnoses.',
    subtitle: 'Authentic words preserved forever, paired with thoughtful self-inquiry.',
    description:
      'Dreamogon strictly separates your authentic morning words from interpretive possibilities. The AI acts as a patient contemplative companion, offering questions that prompt your own journaling rather than pseudo-scientific labels.',
    features: [
      'Strict separation of authentic memory and AI notes',
      'Contemplative inquiries tailored to your symbols',
      'Emotional spectrum & mood resonance analysis',
      'Private visual memory canvas generated from your words',
    ],
  },
  {
    id: 'archive',
    step: '03',
    label: 'Search & Archive',
    title: 'Your complete subconscious timeline.',
    subtitle: 'Fast full-text search, calendar grids, and deep symbolic filters.',
    description:
      'Every dream you record becomes part of a searchable, chronological repository. Instantly find every entry involving water, track your most vivid nights across the calendar, and rediscover forgotten dreams years later.',
    features: [
      'Instant search across dream text, symbols, and emotions',
      'Interactive month-by-month calendar view',
      'Filter by lucidity score, mood, or custom tags',
      'Full export options with end-to-end data ownership',
    ],
  },
  {
    id: 'patterns',
    step: '04',
    label: 'Recurring Patterns',
    title: 'Discover what your mind returns to.',
    subtitle: 'Synthesized insights revealing motifs across weeks, months, and seasons.',
    description:
      'Dreams rarely exist in isolation. Dreamogon connects recurring symbols across your life—identifying when certain archetypes, emotional climates, or lucidity surges emerge.',
    features: [
      'Automatic recurring symbol detection across entries',
      'Monthly Lucidity Index progression metrics',
      'Emotional resonance distribution radar',
      'Time-of-month and sleep correlation tracking',
    ],
  },
  {
    id: 'world',
    step: '05',
    label: 'Dream World',
    title: 'A living spatial constellation.',
    subtitle: 'Explore your subconscious mind as an interconnected landscape.',
    description:
      'Move beyond linear lists into a spatial memory map. Dreams cluster into thematic territories—The Coastline of Memory, The Forgotten Cities, The High Bridges—connected by faint filaments of shared meaning.',
    features: [
      'Interactive 2D/3D semantic constellation map',
      'Thematic realm clustering based on emotional affinity',
      'Direct node inspection with entry deep-links',
      'A quiet, contemplative visualization of interior space',
    ],
  },
];

export function ProductShowcaseSection() {
  const [activeTab, setActiveTab] = useState(0);

  const current = TABS[activeTab];

  return (
    <section id="showcase" className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/30">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Inside Dreamogon
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            A quiet sanctuary for your interior life.
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            Every screen is crafted for calm focus. No gamification streaks, no social vanity metrics, no loud notifications.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--border-default)]">
          {TABS.map((tab, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-medium shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <span className={isActive ? 'opacity-90' : 'text-[var(--accent)] opacity-70'}>{tab.step}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Showcase Canvas & Editorial Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Editorial Context */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent)]">
                {current.step} / {current.label}
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-medium text-[var(--text-primary)] leading-tight">
                {current.title}
              </h3>
              <p className="text-sm font-display text-[var(--text-secondary)] italic">
                {current.subtitle}
              </p>
              <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed pt-2">
                {current.description}
              </p>
            </div>

            {/* Feature Checkpoints */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
              {current.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-[var(--text-primary)]">
                  <div className="w-4 h-4 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} />
                  </div>
                  <span className="font-light">{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)] hover:underline"
              >
                <span>Experience this in your journal</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right: High-Fidelity Interactive App Screen */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-2xl overflow-hidden transition-all duration-300">
              {/* Browser Window Header */}
              <div className="px-5 py-3.5 bg-[var(--bg-elevated)] border-b border-[var(--border-default)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-default)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-default)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-default)]" />
                  <span className="ml-3 font-mono text-[11px] text-[var(--text-muted)]">
                    dreamogon.com/{current.id === 'capture' ? 'dream/new' : current.id === 'reflection' ? 'dreams/d_8829' : current.id}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                  Interactive Demo · Illustrative Data
                </span>
              </div>

              {/* View Contents */}
              <div className="p-6 sm:p-8 min-h-[440px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full space-y-6"
                  >
                    {/* 01. CAPTURE VIEW */}
                    {current.id === 'capture' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                              06:22 AM · Saturday
                            </span>
                            <h4 className="text-xl font-display font-medium text-[var(--text-primary)]">
                              New Morning Entry
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Autosaved
                          </span>
                        </div>

                        {/* Voice recording strip */}
                        <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] flex items-center justify-center animate-pulse">
                              <Mic size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[var(--text-primary)]">Voice Capture Active</p>
                              <p className="text-[11px] text-[var(--text-muted)]">Transcribing with half-closed eyes...</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-[var(--accent)] font-semibold">01:14</span>
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          </div>
                        </div>

                        {/* Stream of consciousness content */}
                        <div className="space-y-2 p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-default)]">
                          <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                            Raw morning stream:
                          </p>
                          <p className="text-sm font-serif text-[var(--text-primary)] leading-relaxed italic">
                            &ldquo;I woke up on a wooden ferry crossing an inland lake. The sky was neither day nor night, just an immense pearl gray. The ticket conductor was someone I knew from secondary school, but he didn&rsquo;t speak—only handed me a pocket watch with no hands...&rdquo;
                          </p>
                        </div>

                        {/* Metadata selector pills */}
                        <div className="flex flex-wrap gap-2 pt-1 text-xs">
                          <span className="px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] font-mono text-[11px]">
                            Mood: Serene Wonder
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] font-mono text-[11px]">
                            Lucidity: Moderate (50%)
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 font-mono text-[11px]">
                            Tag: Water, Time, Ferry
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 02. REFLECTION VIEW */}
                    {current.id === 'reflection' && (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)]">
                              Entry #8829 · 2 days ago
                            </span>
                            <h4 className="text-xl font-display font-medium text-[var(--text-primary)]">
                              The Ferry with the Handless Watch
                            </h4>
                          </div>
                          <span className="text-xs font-mono text-[var(--text-muted)]">7 min read</span>
                        </div>

                        {/* Split: Authentic Ground Truth vs AI Inquiry */}
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-default)] space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                              Authentic Words (Ground Truth)
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                              &ldquo;The ferry had no motor noise, only the sound of water parting. When I looked down at the watch, the crystal was cold.&rdquo;
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
                              <Brain size={12} />
                              Socratic Inquiries (For Your Journal)
                            </div>
                            <ul className="space-y-2 text-xs text-[var(--text-primary)] font-light">
                              <li className="flex items-start gap-2">
                                <span className="text-[var(--accent)] mt-0.5">·</span>
                                <span>When the conductor handed you the handless watch, did you feel urgency, or relief that time had stopped?</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-[var(--accent)] mt-0.5">·</span>
                                <span>Ferries often symbolize transitions between life chapters. What boundary are you currently crossing?</span>
                              </li>
                            </ul>
                          </div>

                          <div className="p-3 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/15 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                            <span className="flex items-center gap-1.5">
                              <ShieldCheck size={13} className="text-[var(--accent)]" />
                              Ethical boundary: Subjective inquiry, not diagnosis.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 03. ARCHIVE VIEW */}
                    {current.id === 'archive' && (
                      <div className="space-y-4">
                        {/* Search header */}
                        <div className="p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center gap-3">
                          <Search size={15} className="text-[var(--text-muted)] ml-2" />
                          <span className="text-xs font-mono text-[var(--text-primary)]">water or ferry</span>
                          <span className="ml-auto text-[10px] font-mono text-[var(--text-muted)] mr-2">
                            Showing 8 entries
                          </span>
                        </div>

                        {/* List entries */}
                        <div className="space-y-2.5">
                          {[
                            {
                              title: 'The Ferry with the Handless Watch',
                              date: 'Oct 14, 2026',
                              snippet: 'Crossing an inland lake at dawn. A conductor handed me a brass clock...',
                              tag: 'Lucid 50%',
                            },
                            {
                              title: 'The Black Salt Coastline',
                              date: 'Sep 29, 2026',
                              snippet: 'Walking on dark volcanic sands where the surf receded faster than running...',
                              tag: 'Lucid 80%',
                            },
                            {
                              title: 'Submerged Library in the Atrium',
                              date: 'Sep 12, 2026',
                              snippet: 'Looking through glass tiles into water where antique leather volumes floated...',
                              tag: 'Symbol: Water',
                            },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--border-hover)] flex items-center justify-between gap-4 transition-colors"
                            >
                              <div className="space-y-1 max-w-sm">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-medium text-[var(--text-primary)]">{item.title}</h5>
                                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{item.date}</span>
                                </div>
                                <p className="text-[11px] text-[var(--text-secondary)] font-light truncate">
                                  {item.snippet}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent)] shrink-0">
                                {item.tag}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
                          <span>Total Archive: 42 recorded dreams</span>
                          <span className="text-[var(--accent)]">Sort: Chronological ↓</span>
                        </div>
                      </div>
                    )}

                    {/* 04. PATTERNS VIEW */}
                    {current.id === 'patterns' && (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                          <h4 className="text-base font-display font-medium text-[var(--text-primary)]">
                            Subconscious Pattern Radar
                          </h4>
                          <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider">
                            Last 90 Days
                          </span>
                        </div>

                        {/* Metrics grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-default)] space-y-1">
                            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Lucidity Trend</span>
                            <p className="text-2xl font-display font-medium text-[var(--text-primary)]">38%</p>
                            <p className="text-[10px] font-mono text-emerald-500">+14% vs last month</p>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-default)] space-y-1">
                            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Top Archetype</span>
                            <p className="text-2xl font-display font-medium text-[var(--text-primary)]">Thresholds</p>
                            <p className="text-[10px] font-mono text-[var(--accent)]">Appeared in 12 dreams</p>
                          </div>
                        </div>

                        {/* Motif frequency bars */}
                        <div className="space-y-2.5 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                            Recurring Motif Distribution
                          </span>
                          {[
                            { name: 'Water & Tides', count: '14 entries', pct: '82%' },
                            { name: 'Lost Architecture & Rooms', count: '9 entries', pct: '56%' },
                            { name: 'Timepieces & Clocks', count: '6 entries', pct: '38%' },
                            { name: 'Bridges & High Passes', count: '5 entries', pct: '28%' },
                          ].map((motif, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-[var(--text-primary)]">{motif.name}</span>
                                <span className="text-[var(--text-muted)] text-[10px]">{motif.count}</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-[var(--bg-primary)] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[var(--accent)]"
                                  style={{ width: motif.pct }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 05. DREAM WORLD VIEW */}
                    {current.id === 'world' && (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                          <h4 className="text-base font-display font-medium text-[var(--text-primary)]">
                            Topography of Memory
                          </h4>
                          <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider">
                            32 Connected Nodes
                          </span>
                        </div>

                        {/* Interactive Constellation Preview */}
                        <div className="relative h-56 rounded-2xl bg-[#090807] border border-[var(--border-default)] overflow-hidden flex items-center justify-center p-4">
                          {/* Radial ambient glow */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(200,184,158,0.12),transparent_70%)]" />

                          {/* SVG constellation lines */}
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                            <line x1="80" y1="60" x2="160" y2="110" stroke="#C8B89E" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="160" y1="110" x2="240" y2="70" stroke="#C8B89E" strokeOpacity="0.35" strokeWidth="1.2" />
                            <line x1="240" y1="70" x2="320" y2="130" stroke="#C8B89E" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="160" y1="110" x2="190" y2="165" stroke="#C8B89E" strokeOpacity="0.2" strokeWidth="1" />
                            <line x1="80" y1="60" x2="190" y2="165" stroke="#C8B89E" strokeOpacity="0.15" strokeWidth="0.8" strokeDasharray="2 2" />

                            {/* Nodes */}
                            <circle cx="80" cy="60" r="5" fill="#C8B89E" />
                            <circle cx="160" cy="110" r="7" fill="#E8DFD3" />
                            <circle cx="240" cy="70" r="6" fill="#C8B89E" />
                            <circle cx="320" cy="130" r="4" fill="#A89F91" />
                            <circle cx="190" cy="165" r="5" fill="#C8B89E" />
                          </svg>

                          {/* Floating realm badges */}
                          <div className="absolute top-4 left-6 px-2.5 py-1 rounded-full bg-black/60 border border-[#C8B89E]/20 text-[10px] font-mono text-[#DDD4C7] backdrop-blur-sm">
                            The Inland Ferry
                          </div>
                          <div className="absolute top-10 right-14 px-2.5 py-1 rounded-full bg-black/60 border border-[#C8B89E]/20 text-[10px] font-mono text-[#DDD4C7] backdrop-blur-sm">
                            The Birch Lighthouse
                          </div>
                          <div className="absolute bottom-4 left-1/3 px-2.5 py-1 rounded-full bg-black/60 border border-[#C8B89E]/20 text-[10px] font-mono text-[#DDD4C7] backdrop-blur-sm">
                            The Sunken Library
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1">
                          <span className="flex items-center gap-1.5">
                            <Compass size={13} className="text-[var(--accent)]" />
                            Spatial layout grouped by subconscious affinity
                          </span>
                          <span className="text-[var(--accent)]">Explore Topography →</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Bottom Status Bar in Mockup */}
                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span>Illustrative Journal Scenario</span>
                  <span className="text-[var(--accent)] font-medium">Architecture: Private by Design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

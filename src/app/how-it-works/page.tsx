import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  Mic,
  PenLine,
  Brain,
  TrendingUp,
  Compass,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronRight,
  Clock,
  BookOpen,
} from 'lucide-react';

export const metadata = constructMetadata({
  title: 'How SUBCONSCIOUS LOG Works — From Dawn Capture to Subconscious Constellation',
  description:
    'Discover how SUBCONSCIOUS LOG preserves morning dream fragments, reflects through Socratic inquiry, reveals recurring subconscious patterns, and maps your interior world.',
  path: '/how-it-works',
  keywords: [
    'how dream journaling works',
    'how SUBCONSCIOUS LOG works',
    'AI dream reflection process',
    'dream recall morning routine',
    'subconscious pattern tracking',
    'dream world architecture',
  ],
});

export default function HowItWorksPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'How It Works', url: '/how-it-works' },
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-soft)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />

      <PublicNavbar />

      <main className="pt-32 pb-24 max-w-5xl mx-auto px-6 md:px-10 w-full space-y-24">
        {/* Hero */}
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Product Architecture
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium tracking-tight text-[var(--text-primary)] leading-[1.1]">
            How SUBCONSCIOUS LOG Works.
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-secondary)] font-light leading-relaxed">
            Dreams dissolve in the morning light within ten minutes of waking. SUBCONSCIOUS LOG provides an effortless contemplative ritual: capture raw fragments before they fade, reflect with respectful AI inquiry, uncover recurring motifs across seasons, and map your interior life.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider bg-[var(--accent)] text-[var(--bg-primary)] px-7 py-3.5 rounded-full hover:bg-[var(--accent-hover)] transition-all shadow-sm"
            >
              <span>Begin free journal</span>
              <ChevronRight size={14} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider border border-[var(--border-default)] hover:border-[var(--text-muted)] bg-[var(--bg-card)] px-6 py-3.5 rounded-full transition-all"
            >
              <span>View transparent pricing</span>
            </Link>
          </div>
        </div>

        {/* The 4 Core Stages */}
        <div className="space-y-20">
          {/* Stage 1: Capture */}
          <section id="capture" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-24">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] uppercase tracking-widest">
                <span>Stage 01</span>
                <span>/</span>
                <span>Dawn Capture</span>
              </div>
              <h2 className="text-3xl font-display font-medium text-[var(--text-primary)]">
                Built for half-closed eyes and fading memories.
              </h2>
              <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">
                When you wake up, neurological shifts trigger rapid memory decay. Motor movements and cognitive friction accelerate this loss. SUBCONSCIOUS LOG eliminates every distraction:
              </p>
              <div className="space-y-3 pt-2">
                {[
                  {
                    title: 'One-Tap Voice Dictation',
                    desc: 'Whisper raw sentences directly into your microphone without opening your eyes fully.',
                  },
                  {
                    title: 'Continuous Background Autosave',
                    desc: 'Every keystroke is saved instantaneously to encrypted draft storage. Never lose a sentence to an accidental swipe.',
                  },
                  {
                    title: 'Asynchronous Processing',
                    desc: 'Save immediately and go about your morning. Subconscious reflection and cross-dream connections run quietly in the background without holding you hostage.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)]">
                    <h3 className="text-xs font-medium text-[var(--text-primary)] font-mono uppercase tracking-wider">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-light mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    06:08 AM · Audio Memo
                  </span>
                  <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Transcribing
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm font-serif italic text-[var(--text-primary)] leading-relaxed">
                  &ldquo;We were walking through an orchard of gray apple trees beside a railway line. The train passed without any sound, but the ground vibrated through our boots...&rdquo;
                </div>
                <div className="flex gap-2 text-[10px] font-mono">
                  <span className="px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent)]">
                    Mood: Peaceful
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    Lucidity: Partial
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Stage 2: Reflection */}
          <section id="reflection" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-24">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xl space-y-4">
                <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-default)] space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                    Authentic Memory (Unedited Ground Truth)
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                    &ldquo;The train passed without any sound, but the ground vibrated through our boots.&rdquo;
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                    <Sparkles size={12} />
                    Contemplative Inquiries
                  </span>
                  <p className="text-xs text-[var(--text-primary)] font-light leading-relaxed">
                    &bull; The silent train suggests power without voice. Is there an impending event in waking life that feels inevitable yet unspoken?
                  </p>
                  <p className="text-xs text-[var(--text-primary)] font-light leading-relaxed">
                    &bull; Feeling vibrations in your feet often anchors physical grounding. Did you feel fear or reassurance when the ground shook?
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20 text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[var(--accent)] shrink-0" />
                  <span>Possibilities for personal reflection, never medical diagnosis.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] uppercase tracking-widest">
                <span>Stage 02</span>
                <span>/</span>
                <span>Ethical AI Reflection</span>
              </div>
              <h2 className="text-3xl font-display font-medium text-[var(--text-primary)]">
                A quiet mirror, never a pseudo-scientific oracle.
              </h2>
              <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">
                Most AI tools attempt to pretend they know the secret future or offer medical diagnostic labels. SUBCONSCIOUS LOG adheres to a strict ethical standard:
              </p>
              <ul className="space-y-2.5 text-xs text-[var(--text-primary)] font-light">
                <li className="flex items-start gap-2.5">
                  <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>Preserved Authenticity:</strong> Your authentic words are never rewritten, condensed, or replaced.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>Socratic Inquiries:</strong> The AI acts as a patient journaling partner, asking questions that prompt your own introspection.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>Entity Continuity Tracking:</strong> Automatically connects recurring people, places, and motifs across your archive over time.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Stage 3: Patterns */}
          <section id="patterns" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-24">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] uppercase tracking-widest">
                <span>Stage 03</span>
                <span>/</span>
                <span>Subconscious Patterns</span>
              </div>
              <h2 className="text-3xl font-display font-medium text-[var(--text-primary)]">
                Discover what your mind returns to over time.
              </h2>
              <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">
                A single dream is an isolated vignette. A year of dreams is an interior autobiography. SUBCONSCIOUS LOG synthesizes your archive into longitudinal insights:
              </p>
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)]">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                    Recurring Motif Tracking
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-light mt-1 leading-relaxed">
                    Identify recurring motifs—water bodies, stairways, airports, childhood figures—and observe when they surge or recede in relation to waking events.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)]">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                    Lucidity Index Progression
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-light mt-1 leading-relaxed">
                    Track changes in your dream awareness. Measure how reality checks, wake-back-to-bed protocols, and regular journaling improve lucid frequency.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 text-xs font-mono">
                  <span className="text-[var(--text-primary)]">Subconscious Resonance</span>
                  <span className="text-[var(--accent)]">90-Day Synthesis</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Water & Coastlines', count: '12 dreams', pct: '78%' },
                    { label: 'Moving Vehicles (Trains / Cars)', count: '8 dreams', pct: '52%' },
                    { label: 'Unfamiliar Houses & Corridors', count: '6 dreams', pct: '38%' },
                  ].map((m, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[var(--text-primary)]">{m.label}</span>
                        <span className="text-[var(--text-muted)] text-[10px]">{m.count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[var(--bg-primary)] overflow-hidden">
                        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: m.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Stage 4: World */}
          <section id="world" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-24">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="h-64 rounded-3xl bg-[#090807] border border-[var(--border-default)] relative overflow-hidden flex items-center justify-center p-6 shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(200,184,158,0.12),transparent_70%)]" />
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                  <line x1="70" y1="80" x2="160" y2="120" stroke="#C8B89E" strokeOpacity="0.3" strokeWidth="1" />
                  <line x1="160" y1="120" x2="250" y2="60" stroke="#C8B89E" strokeOpacity="0.4" strokeWidth="1.2" />
                  <line x1="250" y1="60" x2="330" y2="140" stroke="#C8B89E" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="70" cy="80" r="5" fill="#C8B89E" />
                  <circle cx="160" cy="120" r="7" fill="#E8DFD3" />
                  <circle cx="250" cy="60" r="6" fill="#C8B89E" />
                  <circle cx="330" cy="140" r="4" fill="#A89F91" />
                </svg>
                <div className="relative z-10 text-center space-y-1">
                  <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent)]">Spatial Topography</p>
                  <p className="text-sm font-display text-[#E8DFD3]">The Constellation of Memory</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] uppercase tracking-widest">
                <span>Stage 04</span>
                <span>/</span>
                <span>The Dream World</span>
              </div>
              <h2 className="text-3xl font-display font-medium text-[var(--text-primary)]">
                An interconnected spatial memory landscape.
              </h2>
              <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">
                Rather than storing memories as cold static database rows, SUBCONSCIOUS LOG places dreams into a visual 2D/3D constellation. Dreams that share emotional resonance or symbols drift toward each other, forming thematic territories that reflect your personal mythology.
              </p>
              <div className="pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)] hover:underline"
                >
                  <span>Explore your personal dream world</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] text-center space-y-6">
          <h3 className="text-2xl sm:text-4xl font-display font-medium text-[var(--text-primary)]">
            Begin your morning archive tomorrow.
          </h3>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light max-w-xl mx-auto leading-relaxed">
            Tonight's dreams are already taking shape. Prepare your private sanctuary before you sleep.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all shadow-md"
            >
              Begin your journal free
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Sparkles, Brain, Compass, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Dream Interpretation — Science, Psychology, & Personal Context',
  description: 'Learn how to interpret dreams responsibly. Explore Jungian archetypes, neuroscience-backed cognitive consolidation, and why dream meanings are deeply personal.',
  path: '/dream-interpretation',
  keywords: ['dream interpretation', 'how to interpret dreams', 'what do dreams mean', 'psychology of dreams', 'Jungian dream analysis'],
});

export default function DreamInterpretationPillarPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Dream Interpretation', url: '/dream-interpretation' },
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
            <Brain size={14} />
            <span>Reflexive Inquiry</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-tight">
            How to Interpret Dreams: Beyond ClichÃ©s & Rigid Dictionaries
          </h1>

          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-light">
            Dreams do not have static, one-size-fits-all definitions. Responsible interpretation weaves neuroscience, emotional resonance, and your unique waking context into meaningful self-awareness.
          </p>
        </div>

        {/* The 4 Principles of Responsible Interpretation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>Personal Association Over Fixed Rules</span>
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">
              Dreaming about a dog means something completely different to a veterinarian than to someone who was bitten as a child. Your personal history is the primary decoder.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>Feelings are More Honest Than Plots</span>
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">
              The bizarre sequence of events in REM sleep is often a narrative scaffold built around a genuine emotion: anxiety, triumph, grief, or longing.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>Recurring Patterns Hold the Key</span>
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">
              A single dream is an isolated data point. Patterns that repeat across weeks or months highlight areas where your subconscious is seeking resolution.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <h3 className="text-xl font-display font-medium text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>Neuroscience of Overnight Therapy</span>
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">
              REM sleep recalibrates the emotional circuits of the brain, softening the visceral sting of distressing memories while extracting key lessons.
            </p>
          </div>
        </div>

        {/* Educational Disclaimer */}
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-start gap-4 text-xs text-[var(--text-secondary)]">
          <ShieldCheck size={24} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-medium text-[var(--text-primary)] block text-sm">The DREAMOGON Ethical Standard</span>
            <p className="leading-relaxed font-light">
              DREAMOGON explicitly rejects dogmatic claims and fortune-telling. We provide reflective, cognitive prompts and spatial mapping to help you reflect on your own thoughts and emotional patterns.
            </p>
          </div>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}

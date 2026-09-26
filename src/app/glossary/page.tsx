import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { BookOpen, Compass, ArrowRight, Hash } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Dream Psychology & Sleep Science Glossary',
  description: 'A comprehensive glossary of terms related to dream journaling, sleep architecture, lucid dreaming, oneirology, and cognitive memory consolidation.',
  path: '/glossary',
  keywords: ['dream glossary', 'dream terminology', 'REM sleep meaning', 'lucid dreaming glossary', 'oneirology definitions'],
});

const GLOSSARY_TERMS = [
  {
    term: 'Oneirology',
    definition: 'The scientific study of dreams, examining the neurological, cognitive, and psychological mechanisms occurring during sleep states.'
  },
  {
    term: 'REM Sleep (Rapid Eye Movement)',
    definition: 'A unique phase of mammalian sleep characterized by rapid random eye movements, desynchronized cortical EEG brain waves, low muscle tone, and vivid dreaming.'
  },
  {
    term: 'Lucid Dream',
    definition: 'A dream in which the sleeper is consciously aware that they are dreaming and may exert volitional control over dream characters, physics, or environments.'
  },
  {
    term: 'Dream Recall',
    definition: 'The ability to consciously retrieve and articulate oneiric experiences, emotional memories, and imagery upon awakening.'
  },
  {
    term: 'Hypnagogia',
    definition: 'The transitional state of consciousness leading from wakefulness into sleep, often characterized by sensory hallucinations and spontaneous visual motifs.'
  },
  {
    term: 'Threat Simulation Theory (TST)',
    definition: 'An evolutionary neurocognitive hypothesis proposing that dreaming functions as an ancient biological defense mechanism to rehearse survival and conflict strategies.'
  },
  {
    term: 'MILD (Mnemonic Induction of Lucid Dreams)',
    definition: 'A prospective memory technique developed by Dr. Stephen LaBerge where sleepers rehearse waking intentions to recognize that they are dreaming during upcoming REM periods.'
  },
  {
    term: 'Dream Artifact (SUBCONSCIOUS LOG Framework)',
    definition: 'A persistent conceptual entity (place, character, vehicle, or emotion) extracted from dream text and spatially mapped into an evolving visual Dream World.'
  }
];

export default function GlossaryPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Glossary', url: '/glossary' },
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent)]/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />

      <PublicNavbar />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6 md:px-8 w-full space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-mono uppercase tracking-widest">
            <BookOpen size={14} />
            <span>Terminology Archive</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-tight">
            Dream & Sleep Science Glossary
          </h1>

          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-light">
            Clear definitions of core concepts spanning sleep neurobiology, psychoanalysis, cognitive science, and the SUBCONSCIOUS LOG spatial mapping architecture.
          </p>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GLOSSARY_TERMS.map((item, idx) => (
            <div key={idx} className="p-6 md:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <Hash size={16} />
                <h3 className="font-display font-medium text-lg md:text-xl text-[var(--text-primary)]">
                  {item.term}
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">
                {item.definition}
              </p>
            </div>
          ))}
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}

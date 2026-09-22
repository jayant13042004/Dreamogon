'use client';

import React from 'react';
import { Check, X, Shield, Sparkles, Compass, Eye, Smartphone, Infinity as InfinityIcon } from 'lucide-react';

interface ComparisonRow {
  dimension: string;
  dreamogon: string;
  traditionalApps: string;
  genericAi: string;
  highlight?: boolean;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    dimension: 'Reflection Philosophy',
    dreamogon: 'Socratic self-inquiry & possibilities ("What did the water evoke?")',
    traditionalApps: 'Dogmatic horoscope/mystical fortunes ("A snake means fake friends")',
    genericAi: 'Generic text summary with clinical or pseudo-medical tone',
    highlight: true,
  },
  {
    dimension: 'Integrity of Authentic Memory',
    dreamogon: 'Strictly preserved untouched; AI inquiries kept distinct',
    traditionalApps: 'Crowded with ads, pop-ups, and pre-selected keyword tags',
    genericAi: 'Rewrites user text or replaces it with synthesized summaries',
  },
  {
    dimension: 'Cross-Dream Subconscious Graph',
    dreamogon: '3D Spatial Constellation (Dream World) & co-occurring entity map',
    traditionalApps: 'Flat chronological note list or basic tag counts',
    genericAi: 'Stateless; forgets previous dreams once session closes',
    highlight: true,
  },
  {
    dimension: 'Data Privacy & Ethics',
    dreamogon: 'Row Level Security; zero ad profiling, never trains public models',
    traditionalApps: 'Frequently sells anonymous behavioral data to ad networks',
    genericAi: 'User inputs often logged for public foundation model retraining',
    highlight: true,
  },
  {
    dimension: 'Bedside Morning Usability',
    dreamogon: 'Dark ambient UI, 1-tap multilingual voice capture, PWA installable',
    traditionalApps: 'Cluttered UI with banner ads interrupting dawn recall',
    genericAi: 'Requires typing complex conversational prompts in bright UI',
  },
  {
    dimension: 'Visual Memory Generation',
    dreamogon: 'Cinematic, memory-like art directive avoiding cartoonish clichés',
    traditionalApps: 'Generic stock art or no visual memory',
    genericAi: 'Uncontrolled commercial art style with cartoon elements',
  },
  {
    dimension: 'Ownership Model',
    dreamogon: 'Free forever core + Fair-use Lifetime option ($149) or Annual',
    traditionalApps: 'Aggressive recurring paywalls or ad-supported degradation',
    genericAi: '$20/month recurring subscription with zero dream tooling',
    highlight: true,
  },
];

export function CompetitiveMatrixSection() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/30">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Objective Comparison
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)]">
            Why Dreamogon vs. Traditional Apps or Generic AI
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            Most dream apps treat the subconscious like casual entertainment or horoscope superstition. Generic AI chatbots lack memory, spatial context, and psychological boundaries. Dreamogon was engineered for depth.
          </p>
        </div>

        {/* Matrix Table for Desktop & Tablet */}
        <div className="hidden md:block rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-elevated)]/60 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                <th className="py-5 px-6 font-medium w-1/4">Dimension</th>
                <th className="py-5 px-6 font-semibold text-[var(--accent)] bg-[var(--accent)]/5 w-1/3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[var(--accent)]" />
                    <span>Dreamogon</span>
                  </div>
                </th>
                <th className="py-5 px-6 font-medium w-1/4">Traditional Dream Apps</th>
                <th className="py-5 px-6 font-medium w-1/4">Generic AI Chatbots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
              {COMPARISON_DATA.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    row.highlight ? 'bg-[var(--accent)]/[0.02]' : 'hover:bg-[var(--bg-secondary)]/40'
                  }`}
                >
                  <td className="py-4 px-6 font-medium text-[var(--text-primary)] align-top">
                    {row.dimension}
                  </td>
                  <td className="py-4 px-6 text-[var(--text-primary)] bg-[var(--accent)]/5 font-medium leading-relaxed align-top border-x border-[var(--accent)]/15">
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                      <span>{row.dreamogon}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[var(--text-muted)] leading-relaxed align-top">
                    <div className="flex items-start gap-2">
                      <X size={14} className="text-rose-400/80 shrink-0 mt-0.5" />
                      <span>{row.traditionalApps}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[var(--text-muted)] leading-relaxed align-top">
                    <div className="flex items-start gap-2">
                      <X size={14} className="text-rose-400/80 shrink-0 mt-0.5" />
                      <span>{row.genericAi}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="space-y-4 md:hidden">
          {COMPARISON_DATA.map((row, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3"
            >
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                {row.dimension}
              </h3>
              <div className="p-3 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] font-semibold flex items-center gap-1">
                  <Sparkles size={11} /> Dreamogon
                </span>
                <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed">
                  {row.dreamogon}
                </p>
              </div>
              <div className="space-y-2 text-xs text-[var(--text-muted)] pt-1">
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] block">Traditional Apps:</span>
                  <p className="text-xs leading-relaxed">{row.traditionalApps}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] block">Generic AI:</span>
                  <p className="text-xs leading-relaxed">{row.genericAi}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

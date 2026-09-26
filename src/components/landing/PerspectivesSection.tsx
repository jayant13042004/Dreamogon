'use client';

import React from 'react';
import { Quote, Clock, Brain, Compass, Smartphone } from 'lucide-react';

const PERSPECTIVES = [
  {
    quote:
      'Dreams are the guiding words of the soul. Why should I henceforth not love my dreams and not make their riddling images into objects of my daily work?',
    author: 'C.G. Jung',
    title: 'Psychiatrist & Founder of Analytical Psychology',
  },
  {
    quote:
      'Within five minutes of waking, half of the dream is forgotten. Within ten minutes, 90% is gone. The brain shifts rapidly from cholinergic dream synthesis to prefrontal waking logic.',
    author: 'Sleep Neuroscience Consensus',
    title: 'The Waking Memory Decay Curve',
  },
  {
    quote:
      'Dreaming is overnight therapy. It takes the painful sting out of difficult emotional experiences, allowing you to wake up feeling more grounded and resilient.',
    author: 'Dr. Matthew Walker',
    title: 'Author of Why We Sleep, UC Berkeley Neuroscience',
  },
];

export function PerspectivesSection() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)]">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Science & Solitude
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)]">
            The fragile dawn window.
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            Dream recall is not a test of memory; it is a race against neurochemistry. Capturing the raw emotional residue before dawn fades preserves cognitive patterns that the conscious mind ignores.
          </p>
        </div>

        {/* 3 Perspectives Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSPECTIVES.map((item, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col justify-between space-y-6 shadow-sm"
            >
              <div className="space-y-4">
                <div className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent)]">
                  <Quote size={16} />
                </div>
                <blockquote className="text-sm text-[var(--text-primary)] leading-relaxed italic font-light">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-0.5">
                <p className="text-xs font-medium text-[var(--text-primary)] font-mono">{item.author}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{item.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bedside PWA Banner */}
        <div className="p-8 md:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)] block">
              Bedside Nightstand Experience
            </span>
            <h3 className="text-2xl font-display font-medium text-[var(--text-primary)]">
              Install Subconscious Log as a Native Home Screen App
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light leading-relaxed">
              No App Store downloads needed. Open Subconscious Log in Safari or Chrome on your phone, tap <span className="font-mono text-[var(--text-primary)]">Share → Add to Home Screen</span>, and open it with one tap each morning with zero browser chrome.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center gap-3 text-xs text-[var(--text-primary)] font-mono">
              <Smartphone size={20} className="text-[var(--accent)] shrink-0" />
              <div>
                <p className="font-semibold">PWA Standalone</p>
                <p className="text-[10px] text-[var(--text-muted)]">Full Bedside Mode</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

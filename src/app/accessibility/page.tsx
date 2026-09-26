import React from 'react';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Eye, Check, Volume2, Move, Heart } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Accessibility Statement — SUBCONSCIOUS LOG Dream Journal',
  description:
    'Our commitment to digital accessibility: high-contrast typography, screen reader compatibility, voice dictation, and reduced-motion support.',
  path: '/accessibility',
  keywords: ['SUBCONSCIOUS LOG accessibility statement', 'accessible dream app', 'contrast and reduced motion'],
});

export default function AccessibilityPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Accessibility', url: '/accessibility' },
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-soft)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />

      <PublicNavbar />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6 md:px-10 w-full space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Inclusion
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            Accessibility Statement
          </h1>

          <p className="text-xs font-mono text-[var(--text-muted)]">
            Effective Date: {SITE_CONFIG.effectiveDate} · Last Updated: {SITE_CONFIG.lastUpdated}
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-8 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-light">
          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              1. Our Accessibility Principles
            </h2>
            <p>
              SUBCONSCIOUS LOG is designed with digital accessibility in mind to support an inclusive morning journaling experience. We aim to implement accessible user-interface conventions, including readable typography, high-contrast themes, keyboard navigation, and operating-system motion controls. Note that we have not conducted a formal third-party accessibility certification audit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              2. Core Accessibility Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                  <Volume2 size={14} />
                  <span>Voice Dictation</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  One-tap speech-to-text enables users with motor impairments or visual fatigue to record waking thoughts without keyboard strain.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                  <Eye size={14} />
                  <span>High Contrast Themes</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Thoughtfully calibrated warm obsidian (dark) and warm parchment (light) palettes designed to exceed standard contrast ratios.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                  <Move size={14} />
                  <span>Reduced Motion Support</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  All atmospheric background canvases and particle effects respect the operating system <code className="font-mono text-[var(--text-primary)]">prefers-reduced-motion</code> setting.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                  <Check size={14} />
                  <span>Keyboard & Screen Reader</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Semantic HTML structure, clear ARIA labeling, and logical tab navigation across forms and modals.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              3. Accessibility Feedback
            </h2>
            <p>
              We continually audit and improve our user interface. If you encounter any barrier or difficulty accessing any portion of the SUBCONSCIOUS LOG service, please reach out to our team at{' '}
              {SITE_CONFIG.supportEmail ? (
                <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-[var(--accent)] hover:underline font-mono">
                  {SITE_CONFIG.supportEmail}
                </a>
              ) : (
                <span className="font-mono text-[var(--text-muted)]">
                  [support contact pending configuration · set NEXT_PUBLIC_SUPPORT_EMAIL]
                </span>
              )}{' '}
              with &ldquo;Accessibility&rdquo; in the subject line. We welcome your feedback and will work to accommodate your needs.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

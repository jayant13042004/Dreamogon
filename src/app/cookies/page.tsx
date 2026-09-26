import React from 'react';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Cookie, ShieldCheck, Check } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Cookie Policy — SUBCONSCIOUS LOG Dream Journal',
  description:
    "SUBCONSCIOUS LOG's cookie policy: we use only strictly necessary authentication and preference cookies. Zero third-party ad tracking.",
  path: '/cookies',
  keywords: ['SUBCONSCIOUS LOG cookie policy', 'privacy first cookies', 'no ad tracking'],
});

export default function CookiePolicyPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Cookie Policy', url: '/cookies' },
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
              Transparency
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            Cookie Policy
          </h1>

          <p className="text-xs font-mono text-[var(--text-muted)]">
            Effective Date: {SITE_CONFIG.effectiveDate} · Last Updated: {SITE_CONFIG.lastUpdated}
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-8 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-light">
          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files placed on your computer or mobile device when you access web services. They help websites recognize your browser session and remember functional preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              2. Our Privacy-First Cookie Philosophy
            </h2>
            <p>
              SUBCONSCIOUS LOG operates on a minimal, privacy-first infrastructure. <strong>We do not use third-party advertising cookies, social tracking pixels, or behavioral profiling cookies.</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              3. Cookies We Use
            </h2>
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                  Strictly Necessary (Authentication)
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Session identifiers (such as <code className="font-mono text-[var(--text-primary)]">sb-access-token</code> and <code className="font-mono text-[var(--text-primary)]">sb-refresh-token</code>) provided by Supabase Auth to keep you securely signed in to your private journal across pages. These are essential for security.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                  Functional & Preferences
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Local storage values and preference flags that remember your preferred visual appearance (light mode or dark mode) and your audio input preferences.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              4. How to Manage or Disable Cookies
            </h2>
            <p>
              You can control and configure cookie handling in your browser settings (Chrome, Safari, Firefox, Edge). Note that blocking essential authentication cookies will prevent you from signing in to your SUBCONSCIOUS LOG journal account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              5. Contact Us
            </h2>
            <p>
              If you have any questions regarding our cookie practices, contact <a href={`mailto:${SITE_CONFIG.privacyEmail}`} className="text-[var(--accent)] hover:underline font-mono">{SITE_CONFIG.privacyEmail}</a>.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

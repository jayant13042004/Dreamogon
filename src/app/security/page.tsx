import React from 'react';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { ShieldCheck, Lock, KeyRound, Server, EyeOff, AlertCircle } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Security & Data Protection — Subconscious Log',
  description:
    'Overview of Subconscious Log’s technical security controls: Row Level Security (RLS), HTTPS encryption, database protection, and responsible disclosure.',
  path: '/security',
  keywords: ['dream journal security', 'Subconscious Log data encryption', 'Row Level Security dream app', 'vulnerability reporting'],
});

export default function SecurityPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Security', url: '/security' },
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
              Architecture & Protection
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            Security & Data Protection
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            Your subconscious thoughts deserve uncompromising technical defense. Learn how Subconscious Log protects your dream entries at every architectural layer.
          </p>
        </div>

        {/* Technical Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <Lock size={20} className="text-[var(--accent)]" />
            <h2 className="text-base font-display font-medium text-[var(--text-primary)]">
              Database Row Level Security (RLS)
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              We enforce multi-tenant isolation at the database engine level. Every SQL query for dreams, entities, or reflections is cryptographically bound to your authenticated Supabase user ID. Cross-account data leaks are prevented at the engine core.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <KeyRound size={20} className="text-[var(--accent)]" />
            <h2 className="text-base font-display font-medium text-[var(--text-primary)]">
              Encryption in Transit & At Rest
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              All communications between your browser and our servers use standard HTTPS/TLS encryption. Database storage and automated backups are encrypted at rest by our managed database infrastructure (Supabase).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <Server size={20} className="text-[var(--accent)]" />
            <h2 className="text-base font-display font-medium text-[var(--text-primary)]">
              Isolated Payment Infrastructure
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              Subconscious Log never handles, touches, or stores your payment card credentials. All billing is managed through Stripe, certified under PCI-DSS Level 1 (the highest standard in payment security).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <EyeOff size={20} className="text-[var(--accent)]" />
            <h2 className="text-base font-display font-medium text-[var(--text-primary)]">
              Model Training Boundaries
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              We do not train our own public foundation models on your journal entries or reflections. Data submitted for AI analysis is sent per-request to generate reflections according to the privacy and security terms of the Google Gemini API.
            </p>
          </div>
        </div>

        {/* Responsible Disclosure */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] block">
            Vulnerability Reporting
          </span>
          <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">
            Responsible Disclosure Channel
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light leading-relaxed">
            We welcome vulnerability reports from independent security researchers. If you discover a security issue or vulnerability in our application, please report it to our security desk at{' '}
            {SITE_CONFIG.securityEmail ? (
              <a href={`mailto:${SITE_CONFIG.securityEmail}`} className="text-[var(--accent)] hover:underline font-mono">
                {SITE_CONFIG.securityEmail}
              </a>
            ) : (
              <span className="font-mono text-[var(--text-muted)]">
                [security contact pending configuration &middot; set NEXT_PUBLIC_SECURITY_EMAIL]
              </span>
            )}.
          </p>
          <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
            Please include steps to reproduce and allow reasonable time for remediation before any public disclosure. We do not pursue legal action against researchers acting in good faith.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

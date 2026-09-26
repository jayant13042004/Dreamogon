import React from 'react';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { ShieldCheck, Lock, EyeOff, Server, FileText } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Privacy Policy — Subconscious Log Dream Archive',
  description:
    'Subconscious Log’s strict privacy policy: your dream journal entries are private, encrypted in transit and at rest, and never sold, publicly indexed, or shared with third-party advertisers.',
  path: '/privacy',
  keywords: ['dream journal privacy', 'is Subconscious Log private', 'data protection dream journal', 'zero data sharing policy'],
});

export default function PrivacyPolicyPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy', url: '/privacy' },
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-soft)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />

      <PublicNavbar />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6 md:px-10 w-full space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Legal & Trust
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            Privacy Policy
          </h1>

          <p className="text-xs font-mono text-[var(--text-muted)]">
            Effective Date: {SITE_CONFIG.effectiveDate} &middot; Last Updated: {SITE_CONFIG.lastUpdated}
          </p>
        </div>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2">
            <EyeOff size={18} className="text-[var(--accent)]" />
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Never Publicly Indexed</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
              Your journal entries are protected by strict authentication and explicit noindex headers. Search engines cannot crawl your entries.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2">
            <Lock size={18} className="text-[var(--accent)]" />
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Zero Data Selling</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
              We never sell, rent, or trade your journal entries, voice recordings, or behavioral profiles to advertising or data brokers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2">
            <Server size={18} className="text-[var(--accent)]" />
            <h2 className="text-sm font-medium text-[var(--text-primary)]">No Foundation Model Training</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
              Your private reflections are never used to train public language models or third-party AI systems.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-8 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-light">
          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              1. Introduction & Operator Identity
            </h2>
            <p>
              This Privacy Policy describes how {SITE_CONFIG.legalEntityName} (&ldquo;SUBCONSCIOUS LOG&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, protects, and discloses personal information when you visit our website at {SITE_CONFIG.url} or utilize the SUBCONSCIOUS LOG web application (the &ldquo;Service&rdquo;).
            </p>
            <p>
              Operating Address: {SITE_CONFIG.registeredAddress}. For any questions regarding your personal data, you may contact our Privacy Desk at{' '}
              {SITE_CONFIG.privacyEmail ? (
                <a href={`mailto:${SITE_CONFIG.privacyEmail}`} className="text-[var(--accent)] hover:underline font-mono">
                  {SITE_CONFIG.privacyEmail}
                </a>
              ) : (
                <span className="font-mono text-[var(--text-muted)]">
                  [privacy contact pending configuration &middot; set NEXT_PUBLIC_PRIVACY_EMAIL]
                </span>
              )}.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              2. Information We Collect
            </h2>
            <p>We collect information necessary to provide you with a private, functioning journal service:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-primary)]">Account Credentials:</strong> When you register, we collect your email address and authentication tokens via our identity provider (Supabase Auth). We do not store plaintext passwords.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Dream Journal Entries:</strong> Your raw text narratives, titles, wake times, mood selections, lucidity scores, and user-assigned tags.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Voice Audio:</strong> If you utilize voice dictation, audio is processed ephemerally in browser memory or via secure transcription endpoints strictly to generate your written transcript.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Billing & Subscription Details:</strong> If you upgrade to SUBCONSCIOUS LOG Pro, your payment information is collected and processed directly by our payment provider (Stripe). SUBCONSCIOUS LOG does not store or process raw credit card numbers.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              3. How We Process Artificial Intelligence Inquiries
            </h2>
            <p>
              SUBCONSCIOUS LOG provides AI-assisted reflective inquiries, theme tracking, and longitudinal pattern analysis. When you request reflection on a dream:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The text of that entry is transmitted via encrypted API connections to the configured AI inference provider (such as the Google Gemini API).</li>
              <li>SUBCONSCIOUS LOG does not train our own public foundation models on your journal entries or private dream texts.</li>
              <li>Data handling by upstream AI providers is governed by their respective API terms and customer configurations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              4. Data Storage, Security & Row Level Isolation
            </h2>
            <p>
              We implement industry-standard technical and operational safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Row Level Security (RLS):</strong> Our database enforces multi-tenant isolation at the PostgreSQL engine level. Your data can only be queried by a request bearing your authenticated user session.</li>
              <li><strong>Encryption:</strong> All data in transit is encrypted using HTTPS/TLS protocols. Managed database storage and backups are encrypted at rest by our database provider (Supabase).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              5. Your Rights: Export and Erasure
            </h2>
            <p>
              You maintain sovereign ownership of your dreams. Under applicable privacy frameworks (including GDPR and CCPA), you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Access & Export:</strong> Export your full dream history at any time in machine-readable JSON or Markdown formats directly from your Settings.</li>
              <li><strong>Permanently Delete:</strong> Delete your account and all associated entries, audio transcripts, and reflections permanently from your Settings. Deletion is instantaneous and irreversible.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              6. Contacting the Data Privacy Desk
            </h2>
            <p>
              If you have inquiries regarding this Privacy Policy or wish to exercise statutory data rights, please email:
            </p>
            <p className="font-mono text-xs text-[var(--text-primary)]">
              Privacy Officer: {SITE_CONFIG.privacyEmail || '[pending configuration &middot; set NEXT_PUBLIC_PRIVACY_EMAIL]'}<br />
              Entity: {SITE_CONFIG.legalEntityName}<br />
              Address: {SITE_CONFIG.registeredAddress}
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Refund & Cancellation Policy — Dreamogon',
  description:
    'Dreamogon’s transparent refund and cancellation policy: self-serve cancellation for subscriptions and clear terms for Lifetime purchases.',
  path: '/refunds',
  keywords: ['Dreamogon refund policy', 'cancel Dreamogon pro subscription', 'lifetime guarantee terms', 'subscription billing terms'],
});

export default function RefundPolicyPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Refund Policy', url: '/refunds' },
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
              Billing Terms
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            Refund & Cancellation Policy
          </h1>

          <p className="text-xs font-mono text-[var(--text-muted)]">
            Effective Date: {SITE_CONFIG.effectiveDate} &middot; Last Updated: {SITE_CONFIG.lastUpdated}
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-8 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-light">
          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              1. Self-Serve Subscription Cancellation
            </h2>
            <p>
              You may cancel your recurring Dreamogon Pro subscription (Monthly or Annual) at any time without contacting support or navigating retention friction.
            </p>
            <p>
              To cancel, navigate to <strong>Settings &rarr; Subscription & Plan</strong> inside your logged-in Dreamogon account and click <strong>Manage Subscription & Invoices</strong>. This opens the self-serve Stripe customer portal where you can cancel immediately.
            </p>
            <p>
              Upon cancellation, your Pro entitlement remains fully active until the end of your current paid billing period (month or year). You will not be billed again.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              2. Lifetime Access Purchases
            </h2>
            <p>
              Dreamogon Lifetime is a single, non-recurring purchase ($149 one-time). There are no recurring charges, renewals, or subscription maintenance fees.
            </p>
            <p>
              Because digital entitlements and AI quota allocations are provisioned immediately upon transaction confirmation, Lifetime purchases are intended to be final. However, if you experience insurmountable technical issues or accidental duplicate purchases, you may contact our support desk within 7 days of purchase for review.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              3. Refund Inquiries & Technical Review
            </h2>
            <p>
              If you experience technical errors or unexpected behavior during your initial upgrade, we want to make it right. Contact our support desk within 7 days of the initial transaction:
            </p>
            <p>
              To submit a billing inquiry or refund request, email{' '}
              {SITE_CONFIG.supportEmail ? (
                <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-[var(--accent)] hover:underline font-mono">
                  {SITE_CONFIG.supportEmail}
                </a>
              ) : (
                <span className="font-mono text-[var(--text-muted)]">
                  [support contact pending configuration &middot; set NEXT_PUBLIC_SUPPORT_EMAIL]
                </span>
              )}{' '}
              with your account email address and invoice details. Approved refunds are credited back to your original payment method via Stripe.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              4. Data Preservation Following Plan Changes
            </h2>
            <p>
              Canceling a subscription never deletes your recorded dreams. Your full text entries, audio transcripts, AI reflections, and visual images remain permanently preserved in your account on the Free plan, with complete export capabilities always available.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

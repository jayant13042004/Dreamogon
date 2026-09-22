import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/structuredData';
import { Check, Sparkles, ShieldCheck, ArrowRight, Infinity as InfinityIcon } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Pricing — Free, Pro & Lifetime | Dreamogon',
  description:
    'Honest, transparent pricing for Dreamogon. Unlimited dream journaling is free forever. Upgrade to Pro or Lifetime for deep archive understanding, longitudinal pattern synthesis, and expanded AI reflection.',
  path: '/pricing',
  keywords: [
    'dream journal pricing',
    'Dreamogon cost',
    'free dream journal app',
    'Dreamogon Pro subscription',
    'Dreamogon Lifetime',
    'AI dream journal plans',
  ],
});

const PRICING_FAQS = [
  {
    question: 'Is dream recording really unlimited on the Free plan?',
    answer:
      'Yes. You can record as many dreams as you wish using text or voice dictation. Your personal dream archive, search, and calendar views are free forever with zero artificial dream caps.',
  },
  {
    question: 'What is the core difference between Free and Pro?',
    answer:
      'Free allows you to record, organize, and begin reflecting on your dreams with a monthly allowance of 5 contemplative AI inquiries. Pro unlocks understanding across your dream archive over time: longitudinal pattern synthesis, recurring people/places/motifs across months and years, and conversational AI Guide exploration with full archive context.',
  },
  {
    question: 'What is the Lifetime plan?',
    answer:
      'Lifetime is a single, one-time payment of $149. It grants permanent entitlement to all Pro features with a sustainable recurring monthly fair-use AI allowance (100 operations per month) without any recurring subscription fees.',
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      'Yes, with a single click. You can manage or cancel your subscription directly from your Account Settings via our self-serve Stripe customer portal. When you cancel, you keep Pro access until the end of your current paid billing period.',
  },
  {
    question: 'What happens to my recorded dreams if I cancel Pro?',
    answer:
      'Every dream entry, voice transcript, reflection, and pattern in your archive remains permanently preserved. Your private dream archive is yours forever. You simply revert to the Free tier AI reflection allowances for future months.',
  },
  {
    question: 'What AI provider powers Dreamogon?',
    answer:
      'Dreamogon uses direct, encrypted API integration with Google Gemini. We do not use your private dream narratives to train public AI foundation models, and we never sell dream data to advertisers.',
  },
  {
    question: 'Can I export my entire journal archive?',
    answer:
      'Yes. Dreamogon provides complete data portability. You can export your full dream entries, tags, and AI reflections at any time in standardized JSON or human-readable Markdown.',
  },
  {
    question: 'How do refunds work?',
    answer:
      'If you experience technical issues or made an accidental purchase, you can contact our support desk within 7 days of purchase for a review in accordance with our Refund & Cancellation Policy.',
  },
];

export default function PricingPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Pricing', url: '/pricing' },
  ]);

  const faqSchema = generateFAQSchema(
    PRICING_FAQS.map((f) => ({ question: f.question, answer: f.answer }))
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-soft)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PublicNavbar />

      <main className="pt-32 pb-24 max-w-6xl mx-auto px-6 md:px-10 w-full space-y-24">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Honest & Defensible
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            Start free. Understand over time.
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            Record dreams freely forever. Upgrade when you want deeper cross-dream reflection, longitudinal memory, and pattern synthesis across your archive.
          </p>
        </div>

        {/* 4 Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* FREE */}
          <div className="p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col justify-between space-y-7 shadow-xs">
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-1">
                  Essential Journal
                </span>
                <h2 className="text-2xl font-display font-medium text-[var(--text-primary)]">Free</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-display font-semibold text-[var(--text-primary)]">$0</span>
                  <span className="text-xs text-[var(--text-muted)]">/ forever</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2 font-light">
                  Start your dream archive. Unlimited recording, zero paywalls on your memories.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                {[
                  'Unlimited dream recording (text & voice)',
                  'Full archive, timeline & calendar views',
                  'Instant search & mood filters',
                  '5 contemplative AI reflections / month',
                  'Basic pattern overview & emotional radar',
                  'Spatial Dream World constellation',
                  'Full JSON & Markdown export',
                  'Complete privacy & data ownership',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/signup"
              className="w-full py-3 rounded-full border border-[var(--border-default)] hover:border-[var(--text-muted)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-xs font-mono uppercase tracking-wider text-[var(--text-primary)] text-center transition-colors block"
            >
              Start Free Journal
            </Link>
          </div>

          {/* PRO MONTHLY */}
          <div className="p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col justify-between space-y-7 shadow-xs">
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] block mb-1">
                  Archive Intelligence
                </span>
                <h2 className="text-2xl font-display font-medium text-[var(--text-primary)]">Pro Monthly</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-display font-semibold text-[var(--text-primary)]">$9</span>
                  <span className="text-xs text-[var(--text-muted)]">/ month</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2 font-light">
                  Understand your dream life over time with deep cross-dream pattern synthesis.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                {[
                  'Everything included in Free',
                  '100 AI operations / month',
                  'Cross-dream longitudinal pattern synthesis',
                  'Recurring themes across months & years',
                  'Recurring people, places & emotions',
                  'Conversational AI Guide with dream context',
                  '20 secondary visual memories / month',
                  'Priority support desk access',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/signup?tier=pro_monthly"
              className="w-full py-3 rounded-full border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)] text-xs font-medium uppercase tracking-wider text-center transition-colors block"
            >
              Choose Monthly ($9/mo)
            </Link>
          </div>

          {/* PRO ANNUAL */}
          <div className="p-7 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--accent)] flex flex-col justify-between space-y-7 relative shadow-md">
            <div className="absolute -top-3 right-6">
              <span className="px-3 py-0.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-[9px] font-mono uppercase tracking-widest font-semibold">
                Best Value · Save 33%
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] block mb-1">
                  Annual Billing
                </span>
                <h2 className="text-2xl font-display font-medium text-[var(--text-primary)]">Pro Annual</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-display font-semibold text-[var(--text-primary)]">$72</span>
                  <span className="text-xs text-[var(--text-muted)]">/ year ($6/mo)</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2 font-light">
                  Save with annual billing. Full Pro access at equivalent $6/month.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                {[
                  'Everything included in Pro Monthly',
                  '$6/month equivalent (save 33%)',
                  '100 AI operations / month',
                  'Billed annually at $72/year',
                  'Full cross-dream pattern radar',
                  'AI Guide with archive memory',
                  '20 secondary visual memories / month',
                  'Priority processing queues',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/signup?tier=pro_annual"
              className="w-full py-3 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider text-center transition-colors block shadow-xs"
            >
              Choose Annual ($72/yr)
            </Link>
          </div>

          {/* LIFETIME */}
          <div className="p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col justify-between space-y-7 shadow-xs">
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-1">
                  One-Time Investment
                </span>
                <h2 className="text-2xl font-display font-medium text-[var(--text-primary)]">Lifetime</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-display font-semibold text-[var(--text-primary)]">$149</span>
                  <span className="text-xs text-[var(--text-muted)]">one-time</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2 font-light">
                  Own the full Pro experience without a recurring subscription.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                {[
                  'Full Pro product access permanently',
                  'No recurring subscription fee ever',
                  '100 AI operations / month recurring fair-use',
                  'Cross-dream pattern synthesis & memory',
                  'Recurring people, places & themes',
                  'AI Guide with full archive context',
                  '20 secondary visual memories / month',
                  'Lifetime entitlement',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/signup?tier=lifetime"
              className="w-full py-3 rounded-full border border-[var(--border-default)] hover:border-[var(--text-muted)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-xs font-mono uppercase tracking-wider text-[var(--text-primary)] text-center transition-colors block"
            >
              Get Lifetime ($149)
            </Link>
          </div>
        </div>

        {/* Meaningful Feature Comparison Table */}
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-display font-medium text-[var(--text-primary)]">
              Feature & Capability Comparison
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-light">
              Clear distinctions. The journal is unlimited for everyone; Pro monetizes deeper understanding.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-[var(--bg-elevated)] text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="p-4 sm:p-5">Capability</th>
                    <th className="p-4 sm:p-5">Free</th>
                    <th className="p-4 sm:p-5 text-[var(--accent)]">Pro (Monthly / Annual)</th>
                    <th className="p-4 sm:p-5 text-[var(--text-primary)]">Lifetime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {[
                    ['Dream Entries & Voice Capture', 'Unlimited', 'Unlimited', 'Unlimited'],
                    ['Timeline, Search & Calendar View', 'Included', 'Included', 'Included'],
                    ['Basic Pattern Radar (Local)', 'Included', 'Included', 'Included'],
                    ['Spatial Dream World Constellation', 'Included', 'Included', 'Included'],
                    ['Monthly AI Reflection Allowance', '5 / month', '100 / month', '100 / month (recurring)'],
                    ['Cross-Dream Longitudinal Synthesis', '—', 'Included', 'Included'],
                    ['Recurring People, Places & Themes', '—', 'Included', 'Included'],
                    ['Conversational AI Guide Context', 'Preview', 'Full Archive Memory', 'Full Archive Memory'],
                    ['Visual Memories (Secondary)', '2 lifetime preview', '20 / month + regeneration', '20 / month + regeneration'],
                    ['Full Data Export (JSON & Markdown)', 'Included', 'Included', 'Included'],
                    ['Row-Level Security & Privacy', 'Included', 'Included', 'Included'],
                    ['Subscription Fee', '$0', '$9/mo or $72/yr', 'None ($149 one-time)'],
                  ].map(([feature, freeVal, proVal, lifeVal], idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-[var(--text-primary)]">{feature}</td>
                      <td className="p-4 sm:p-5 text-[var(--text-secondary)] font-mono">{freeVal}</td>
                      <td className="p-4 sm:p-5 text-[var(--accent)] font-mono font-medium">{proVal}</td>
                      <td className="p-4 sm:p-5 text-[var(--text-primary)] font-mono font-medium">{lifeVal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pricing FAQs */}
        <div className="space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-display font-medium text-[var(--text-primary)]">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-light">
              Clear terms on subscriptions, renewals, allowances, and cancellations.
            </p>
          </div>

          <div className="space-y-4">
            {PRICING_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-2"
              >
                <h4 className="text-sm font-medium text-[var(--text-primary)]">{faq.question}</h4>
                <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-display font-medium text-[var(--text-primary)]">
            Begin your dream archive today.
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light max-w-md mx-auto leading-relaxed">
            Record raw memories before they fade. No credit card required to begin journaling.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all shadow-sm"
            >
              Start Free Journal
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

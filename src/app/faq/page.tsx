import React from 'react';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/structuredData';
import { HelpCircle, ChevronDown, Compass, ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Frequently Asked Questions (FAQ) — Subconscious Log',
  description:
    'Answers to frequently asked questions about Subconscious Log: morning voice capture, AI reflection ethics, privacy guarantees, Free vs Pro vs Lifetime plans, and data export.',
  path: '/faq',
  keywords: [
    'dream journal FAQ',
    'is Subconscious Log private',
    'how does AI dream reflection work',
    'dream export',
    'delete Subconscious Log account',
    'Subconscious Log Free vs Pro',
  ],
});

const FAQS = [
  {
    category: 'Product & Practice',
    question: 'What is Subconscious Log?',
    answer:
      'Subconscious Log is a private, editorial dream journal designed for the delicate moments immediately upon waking. It allows you to speak or type raw dream fragments before they fade, provides thoughtful contemplative reflection prompts, tracks recurring subconscious motifs across time, and renders an interconnected spatial Dream World.',
  },
  {
    category: 'Product & Practice',
    question: 'How does dream journaling work?',
    answer:
      'Immediately upon waking, before checking notifications or moving abruptly, open Subconscious Log. Tap the microphone to dictate what you remember or type stream-of-consciousness into the typewriter editor. Continuous background autosave ensures nothing is lost. As you log entries across weeks and months, Subconscious Log synthesizes recurring symbols, themes, and emotional patterns.',
  },
  {
    category: 'Intelligence & Ethics',
    question: 'How does AI reflection work?',
    answer:
      'Subconscious Log strictly separates your authentic unedited words from reflective inquiry. Our AI analyzes your entry asynchronously to extract themes, moods, and archetypal motifs. It then poses Socratic, contemplative questions designed to stimulate your own personal journaling (e.g., "What did standing beside the open ocean feel like?"). It never rewrites your memories or tells you what your dream "must" mean.',
  },
  {
    category: 'Intelligence & Ethics',
    question: 'Is Subconscious Log a medical or psychological service?',
    answer:
      'No. Subconscious Log is strictly a reflective personal journaling and creative contemplation tool. We do not provide clinical diagnosis, psychiatric treatment, psychological counseling, or medical advice. If you are experiencing sleep disorders, nightmares causing distress, or psychological trauma, please consult a licensed healthcare professional.',
  },
  {
    category: 'Privacy & Ownership',
    question: 'Are my dreams private?',
    answer:
      'Yes, absolutely. Your dream journal is protected by account-level Row Level Security (RLS) in an encrypted PostgreSQL database. Your entries are never indexed on public search engines, never sold to data brokers or advertisers, and never used to train public foundation AI models.',
  },
  {
    category: 'Privacy & Ownership',
    question: 'Can I export my dreams?',
    answer:
      'Yes. You maintain 100% ownership of your writing. You can export your entire dream archive at any time from your Account Settings in open, machine-readable formats (JSON and Markdown) with full timestamps, tags, and reflection notes.',
  },
  {
    category: 'Plans & Pricing',
    question: 'What is included in the Free tier?',
    answer:
      'The Free tier includes unlimited text journaling, one-tap voice capture & speech transcription, full chronological history & calendar views, 5 AI reflections per month, basic pattern overview, spatial Dream World exploration, full data export, and 2 lifetime dream preview images.',
  },
  {
    category: 'Plans & Pricing',
    question: 'What does Subconscious Log Pro include?',
    answer:
      'Subconscious Log Pro is available as Pro Monthly ($9/mo) or Pro Annual ($72/yr — saving 33%). It includes everything in Free, plus 100 AI reflections & inquiries refreshed monthly, cross-dream longitudinal pattern synthesis across your entire archive, conversational exploration with the AI Guide (with archive memory), and 20 dream images per month with style variations.',
  },
  {
    category: 'Plans & Pricing',
    question: 'What is the Lifetime tier?',
    answer:
      'Subconscious Log Lifetime is a single one-time purchase ($149). It provides permanent Pro feature entitlement with zero recurring subscriptions. Lifetime members receive a monthly recurring fair-use allowance of 100 AI operations and 20 dream images every month, forever.',
  },
  {
    category: 'Visual Memories',
    question: 'How does dream-image generation work?',
    answer:
      'When you choose to generate a visual memory, Subconscious Log creates a private, atmospheric digital canvas that distills the visual mood and key sensory elements of your dream. These images serve as artistic anchors to help you instantly recall the dream atmosphere months later. Pro and Lifetime members receive 20 image generations refreshed every month.',
  },
  {
    category: 'Privacy & Ownership',
    question: 'How can I delete my account and data?',
    answer:
      'You can permanently delete your Subconscious Log account at any time directly from the Account Settings page. When you delete your account, all personal profile records, dream entries, audio transcripts, and generated images are permanently removed from our databases.',
  },
];

export default function FAQPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ]);

  const faqSchema = generateFAQSchema(FAQS);

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

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6 md:px-10 w-full space-y-16">
        {/* Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Knowledge Base
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            Frequently Asked Questions.
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            Honest, transparent answers regarding Subconscious Log’s capabilities, privacy model, AI reflection ethics, and account ownership.
          </p>
        </div>

        {/* FAQs List */}
        <div className="space-y-6">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--border-hover)] transition-colors space-y-3"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
                <span>Question {String(idx + 1).padStart(2, '0')}</span>
                <span className="text-[var(--text-muted)]">{faq.category}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-medium text-[var(--text-primary)] leading-snug">
                {faq.question}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light leading-relaxed pt-1">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-display font-medium text-[var(--text-primary)]">
              Have a question not listed here?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              Our support desk is always happy to assist with inquiries regarding features, security, or billing.
            </p>
          </div>

          <Link
            href="/contact"
            className="px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all shrink-0"
          >
            Contact Support Desk
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

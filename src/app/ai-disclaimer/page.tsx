import React from 'react';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo/metadata';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Brain, ShieldCheck, AlertTriangle, Sparkles, Heart } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'AI & Contemplative Disclaimer — Subconscious Log',
  description:
    'Our ethical boundaries: Subconscious Log is a contemplative personal reflection and pattern archive tool, not clinical, medical, or psychiatric diagnosis.',
  path: '/ai-disclaimer',
  keywords: ['AI dream reflection disclaimer', 'ethical AI dream journal', 'not medical advice dream interpretation'],
});

export default function AIDisclaimerPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'AI Disclaimer', url: '/ai-disclaimer' },
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
              Ethical Guardrails
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            AI & Contemplative Disclaimer
          </h1>

          <p className="text-xs font-mono text-[var(--text-muted)]">
            Effective Date: {SITE_CONFIG.effectiveDate} &middot; Last Updated: {SITE_CONFIG.lastUpdated}
          </p>
        </div>

        {/* Highlight Callout */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--accent)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--accent)] font-semibold">
            <AlertTriangle size={15} />
            Important Notice
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium leading-relaxed">
            Subconscious Log is a software tool for creative journaling, self-inquiry, and long-term pattern discovery. It is NOT a medical, psychological, or psychiatric diagnostic service.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-8 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-light">
          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              1. Non-Medical & Non-Clinical Nature
            </h2>
            <p>
              The AI reflection inquiries, emotional tags, and symbolic pattern correlations explored within Subconscious Log are provided purely for personal exploration and contemplative journaling. They do not constitute:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Psychological counseling or psychotherapy</li>
              <li>Psychiatric or medical diagnosis</li>
              <li>Sleep disorder clinical evaluation</li>
              <li>Predictive or supernatural fortune-telling</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              2. How AI Reflections Are Framed
            </h2>
            <p>
              We design our prompts according to strict ethical boundaries:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Socratic Questions:</strong> The AI is instructed to ask open-ended questions that prompt your own journaling rather than imposing rigid interpretations.</li>
              <li><strong>Possibilities, Not Pronouncements:</strong> Cultural, literary, and psychological motifs are presented strictly as subjective possibilities. You are always the final authority on your dream.</li>
              <li><strong>Pristine Ground Truth:</strong> Your authentic morning words remain completely untouched.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              3. Visual Interpretations
            </h2>
            <p>
              Visual dream imagery generated within Subconscious Log represents artistic digital interpretations derived from the motifs of your dream entry. They are contemplative visual anchors designed to evoke mood, not literal recordings of neurobiological dream states.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-medium text-[var(--text-primary)]">
              4. Support Resources for Mental Health
            </h2>
            <p>
              If your dreams or sleep patterns are causing intense emotional distress, nightmare-related anxiety, trauma re-experiencing, or insomnia, please reach out to qualified healthcare providers:
            </p>
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1.5 text-xs font-mono">
              <p>&bull; United States & Canada: Call or text <strong>988</strong> (Suicide & Crisis Lifeline)</p>
              <p>&bull; United Kingdom: Call <strong>111</strong> (NHS) or <strong>116 123</strong> (Samaritans)</p>
              <p>&bull; International: Visit <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">findahelpline.com</a> for free, confidential support in your country.</p>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

import React from 'react';
import { constructMetadata } from '@/lib/seo/metadata';
import { BLOG_POSTS } from '@/lib/seo/blogPosts';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { BlogIndexClient } from './BlogIndexClient';
import { Compass, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = constructMetadata({
  title: 'Dream Journal & Sleep Psychology Blog',
  description:
    'Evidence-based articles, journaling guides, oneiric science, and philosophical reflections on dreams and subconscious patterns.',
  path: '/blog',
  keywords: [
    'dream blog',
    'dream articles',
    'dream research',
    'lucid dreaming tips',
    'sleep psychology',
    'dream journaling guide',
  ],
});

export default function BlogIndexPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-soft)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />

      <PublicNavbar />

      <main className="pt-28 md:pt-36 pb-24 max-w-6xl mx-auto px-5 sm:px-8 md:px-10 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono text-[var(--accent)] uppercase tracking-[0.24em]">
            <Compass size={13} />
            <span>The DREAMOGON Chronicle</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-[1.12]">
            Reflections on Dreams, Memory & the Subconscious
          </h1>
          <p className="text-[var(--text-secondary)] text-base md:text-xl font-light leading-relaxed">
            Evidence-based guides, REM neuroscience, and mindful journaling practices curated by the
            DREAMOGON Editorial Desk.
          </p>
        </div>

        {/* Client Interactive Filter & Grid */}
        <BlogIndexClient posts={BLOG_POSTS} />

        {/* Bottom CTA */}
        <div className="mt-24 p-8 sm:p-12 md:p-16 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] text-center space-y-6 shadow-xs relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-3 relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)] block">
              The Subconscious Archive
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-[var(--text-primary)] leading-snug">
              Begin Tracking Your Subconscious World
            </h2>
            <p className="text-[var(--text-secondary)] text-sm md:text-base font-light leading-relaxed">
              Capture fragments at 5 AM before they dissolve, with private AI reflections and
              cross-dream motif discovery.
            </p>
            <div className="pt-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] text-xs font-semibold uppercase tracking-wider transition-all shadow-md"
              >
                <span>Begin your journal</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

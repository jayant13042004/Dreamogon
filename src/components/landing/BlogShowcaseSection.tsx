'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/seo/blogPosts';

export function BlogShowcaseSection() {
  // Select 3 premier articles covering diverse topics
  const featuredPosts = BLOG_POSTS.slice(0, 3);

  return (
    <section id="blog-preview" className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
                From the Editorial Desk
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)]">
              Subconscious Inquiries & Guides.
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
              Essays, cognitive research, and mindful contemplative practices on dream recall, archetypes, and waking memory.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)] hover:underline whitespace-nowrap"
          >
            <span>Explore all articles</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* 3 Editorial Post Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPosts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-3xl p-7 bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--border-hover)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] text-[var(--accent)] border border-[var(--border-subtle)] text-[10px] uppercase tracking-wider font-medium">
                    {post.category}
                  </span>
                  <span className="text-[var(--text-muted)] text-[11px] flex items-center gap-1">
                    <Clock size={12} />
                    {post.readingTime}
                  </span>
                </div>

                <h3 className="text-xl font-display font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors"
                >
                  <span>Read</span>
                  <ChevronRight size={13} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

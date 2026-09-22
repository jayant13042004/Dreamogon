'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BlogPost, BlogCategory } from '@/lib/seo/blogPosts';
import { ArrowRight, Clock, Calendar, Compass, Search, Sparkles, BookOpen } from 'lucide-react';

interface BlogIndexClientProps {
  posts: BlogPost[];
}

const CATEGORIES: Array<'All' | BlogCategory> = [
  'All',
  'Dream Journaling',
  'Recurring Dreams',
  'Lucid Dreaming',
  'Sleep & Dreams',
  'Dream Symbols',
];

export function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | BlogCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' || post.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.keywords.some((k) => k.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = posts[0];
  const regularPosts =
    selectedCategory === 'All' && !searchQuery
      ? filteredPosts.slice(1)
      : filteredPosts;

  return (
    <div className="space-y-12">
      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-xs'
                    : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Quick Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-9 pr-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
      </div>

      {/* Featured Hero Article (Visible only when All is selected and no search) */}
      {selectedCategory === 'All' && !searchQuery && featuredPost && (
        <section aria-label="Featured article">
          <Link href={`/blog/${featuredPost.slug}`} className="group block">
            <article className="p-8 md:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] group-hover:border-[var(--accent)]/60 transition-all duration-300 shadow-sm relative overflow-hidden">
              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[10px] uppercase tracking-wider font-semibold">
                    Featured Guide
                  </span>
                  <span className="text-[var(--text-muted)] opacity-40">•</span>
                  <span className="text-[var(--text-muted)] font-mono text-[11px]">
                    {featuredPost.category}
                  </span>
                  <span className="text-[var(--text-muted)] opacity-40">•</span>
                  <span className="text-[var(--text-muted)] font-mono text-[11px] flex items-center gap-1">
                    <Clock size={12} /> {featuredPost.readingTime}
                  </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-display font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-[1.15]">
                  {featuredPost.title}
                </h2>

                <p className="text-[var(--text-secondary)] text-base md:text-lg font-light leading-relaxed">
                  {featuredPost.excerpt}
                </p>

                <div className="pt-4 flex items-center gap-2 text-xs font-mono text-[var(--accent)] uppercase tracking-wider font-medium group-hover:translate-x-1 transition-transform">
                  <span>Read complete guide</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </article>
          </Link>
        </section>
      )}

      {/* Article Grid */}
      {regularPosts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-card)] border border-dashed border-[var(--border-default)] space-y-3">
          <BookOpen size={28} className="mx-auto text-[var(--text-muted)]" />
          <h3 className="text-base font-medium text-[var(--text-primary)]">No articles found</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            No articles match your search or selected category. Try resetting the filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-xs text-[var(--accent)] hover:underline font-mono"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {regularPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article className="h-full flex flex-col justify-between p-7 md:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] group-hover:border-[var(--accent)]/50 transition-all duration-300 shadow-xs hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)] font-mono text-[10px] uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-[var(--text-muted)] font-mono text-[11px]">
                      <Clock size={12} />
                      {post.readingTime}
                    </span>
                  </div>

                  <h3 className="text-2xl font-display font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-3">
                    {post.title}
                  </h3>

                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light line-clamp-3 mb-6">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="font-mono text-[11px]">
                    {new Date(post.publishedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-[var(--accent)] font-medium font-mono text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                    Read article <ArrowRight size={13} />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

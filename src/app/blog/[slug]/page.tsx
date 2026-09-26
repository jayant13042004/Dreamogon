import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo/metadata';
import { BLOG_POSTS } from '@/lib/seo/blogPosts';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { BlogContent } from '@/components/blog/BlogContent';
import { ShareButton } from '@/components/blog/ShareButton';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Sparkles,
  List,
} from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = BLOG_POSTS.find((p) => p.slug === resolvedParams.slug);
  if (!post) return {};

  return constructMetadata({
    title: post.title,
    description: post.metaDescription,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = BLOG_POSTS.find((p) => p.slug === resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.metaDescription,
    url: postUrl,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorName: post.author.name,
  });

  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const relatedPosts = BLOG_POSTS.filter((p) => post.relatedSlugs?.includes(p.slug));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-soft)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />

      <PublicNavbar />

      <main className="pt-28 md:pt-32 pb-24 max-w-4xl mx-auto px-5 sm:px-8 w-full">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>All Articles</span>
          </Link>

          <ShareButton title={post.title} />
        </div>

        {/* Article Header */}
        <header className="space-y-5 mb-10 pb-8 border-b border-[var(--border-default)]">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)] font-mono text-[10px] uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-[var(--text-muted)] opacity-50">•</span>
            <span className="text-[var(--text-muted)] flex items-center gap-1 font-mono text-[11px]">
              <Clock size={12} />
              {post.readingTime}
            </span>
            <span className="text-[var(--text-muted)] opacity-50">•</span>
            <span className="text-[var(--text-muted)] flex items-center gap-1 font-mono text-[11px]">
              <Calendar size={12} />
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)] tracking-tight leading-[1.18]">
            {post.title}
          </h1>

          {/* Excerpt Lead */}
          <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] font-light leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author Info */}
          <div className="flex items-center gap-3 pt-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent)] font-medium font-display text-sm shrink-0 shadow-xs">
              L
            </div>
            <div>
              <span className="text-sm text-[var(--text-primary)] font-medium block">
                {post.author.name}
              </span>
              <span className="text-xs text-[var(--text-muted)]">{post.author.role}</span>
            </div>
          </div>
        </header>

        {/* Table of Contents */}
        {post.tableOfContents && post.tableOfContents.length > 0 && (
          <nav
            aria-label="Table of contents"
            className="p-6 md:p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] mb-12 shadow-xs"
          >
            <div className="flex items-center gap-2 mb-4">
              <List size={15} className="text-[var(--accent)]" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--accent)]">
                Table of Contents
              </h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
              {post.tableOfContents.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-start gap-2 py-0.5 group"
                  >
                    <span className="text-[11px] font-mono text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0 mt-0.5">
                      0{index + 1}.
                    </span>
                    <span className="leading-snug">{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Article Body */}
        <article className="max-w-none">
          <BlogContent content={post.content} />
        </article>

        {/* Mid-Article / Post-Article CTA Banner */}
        <section className="mt-16 p-8 md:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-[var(--accent)]">
            <Compass size={120} />
          </div>
          <div className="max-w-xl space-y-3 relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--accent)]">
              Begin Your Sanctuary
            </span>
            <h3 className="text-2xl md:text-3xl font-display font-medium text-[var(--text-primary)] leading-snug">
              Turn your night dreams into lifelong personal insight.
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">
              Capture fragments at 5 AM by voice in 30 seconds. Discover recurring motifs, emotional
              shifts, and subconscious patterns over time with SUBCONSCIOUS LOG.
            </p>
            <div className="pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] text-xs font-semibold tracking-wide transition-all shadow-sm"
              >
                <span>Start your dream journal</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Editorial Disclaimer */}
        <div className="mt-10 p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-start gap-3.5 text-xs text-[var(--text-muted)] leading-relaxed">
          <ShieldCheck size={18} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--text-primary)] font-medium">
              Editorial & Reflection Note:{' '}
            </strong>
            SUBCONSCIOUS LOG publishes scientific overviews, psychological literature reviews, and reflective
            journaling practices for self-awareness. Content is for contemplative and educational
            purposes and is not intended as psychiatric treatment or clinical medical advice.
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[var(--border-default)]">
            <h3 className="text-2xl font-display font-medium text-[var(--text-primary)] mb-6">
              Related Explorations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <Link key={rel.slug} href={`/blog/${rel.slug}`} className="block group">
                  <article className="h-full p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] group-hover:border-[var(--accent)]/50 transition-all duration-300 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2.5">
                        <span className="text-[10px] uppercase font-mono text-[var(--accent)] tracking-wider">
                          {rel.category}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          {rel.readingTime}
                        </span>
                      </div>
                      <h4 className="font-display text-lg font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-2">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-light">
                        {rel.excerpt}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
                      <span>Read article</span>
                      <ArrowRight
                        size={13}
                        className="group-hover:translate-x-1 transition-transform text-[var(--accent)]"
                      />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

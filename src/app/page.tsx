'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass,
  PenLine,
  Mic,
  Lock,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  Clock,
  BookOpen,
} from 'lucide-react';
import Image from 'next/image';
import { DreamJourneyWalkthrough } from '@/components/layout/DreamJourneyWalkthrough';
import { ProductDemoSection } from '@/components/landing/ProductDemoSection';
import { ProductShowcaseSection } from '@/components/landing/ProductShowcaseSection';
import { RecurringPatternsSection } from '@/components/landing/RecurringPatternsSection';
import { DreamEvolutionLandingSection } from '@/components/landing/DreamEvolutionLandingSection';
import { BlogShowcaseSection } from '@/components/landing/BlogShowcaseSection';
import { CompetitiveMatrixSection } from '@/components/landing/CompetitiveMatrixSection';
import { PerspectivesSection } from '@/components/landing/PerspectivesSection';
import { ExploreDreamModal } from '@/components/layout/ExploreDreamModal';
import { useTheme } from '@/components/layout/ThemeProvider';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { PublicFooter } from '@/components/layout/PublicNav';

export default function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreModalOpen, setExploreModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-soft)]">
      {/* ─────────────────────────────────────────────────────────────
          1. NAVIGATION
      ───────────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--bg-primary)]/95 border-b border-[var(--border-default)] py-3 shadow-sm backdrop-blur-md'
            : 'bg-[var(--bg-primary)]/85 border-b border-[var(--border-default)]/70 py-3.5 sm:py-4 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo with fixed minimum breathing room */}
          <div className="flex items-center shrink-0 pr-2 xl:pr-4">
            <BrandLogo size="md" href="/" />
          </div>

          {/* Desktop Navigation Links - Centered, properly spaced, never breaking lines */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-[11px] xl:text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            <a
              href="#demo"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-all"
            >
              Walkthrough
            </a>
            <a
              href="#patterns"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-all"
            >
              Patterns
            </a>
            <a
              href="#capture"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-all"
            >
              Capture
            </a>
            <a
              href="#journey"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-all"
            >
              The Journey
            </a>
            <a
              href="#evolution"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-all"
            >
              Evolution
            </a>
            <Link
              href="/blog"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-all"
            >
              Blog
            </Link>
            <a
              href="#pricing"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-all"
            >
              Pricing
            </a>
          </div>

          {/* Right Actions: Theme Toggle, Log In, and CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-xl border border-transparent hover:border-[var(--border-default)] transition-colors shrink-0"
              aria-label="Toggle theme"
            >
              {mounted && resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <span className="w-px h-4 bg-[var(--border-default)] shrink-0 mx-0.5" aria-hidden="true" />
            <Link
              href="/login"
              className="text-[11px] xl:text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 transition-colors whitespace-nowrap shrink-0"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-[11px] xl:text-xs font-medium uppercase tracking-wider bg-[var(--accent)] text-[var(--bg-primary)] px-4 xl:px-5 py-2.5 rounded-full hover:bg-[var(--accent-hover)] transition-all shadow-sm hover:shadow-md whitespace-nowrap shrink-0 inline-flex items-center justify-center font-sans"
            >
              Begin your journal
            </Link>
          </div>

          {/* Mobile & Tablet controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="p-2 text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--bg-primary)]/98 backdrop-blur-xl pt-24 px-6 pb-8 flex flex-col justify-between lg:hidden border-b border-[var(--border-default)] animate-in fade-in duration-200">
          <div className="flex flex-col gap-4 overflow-y-auto">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--text-muted)] mb-1">
              Navigation
            </span>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors py-1"
            >
              Walkthrough
            </a>
            <a
              href="#patterns"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors py-1"
            >
              Patterns
            </a>
            <a
              href="#capture"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors py-1"
            >
              Capture
            </a>
            <a
              href="#journey"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors py-1"
            >
              The Journey
            </a>
            <a
              href="#evolution"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors py-1"
            >
              Evolution
            </a>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors py-1"
            >
              Blog
            </Link>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors py-1"
            >
              Pricing
            </a>
          </div>
          <div className="pt-6 border-t border-[var(--border-default)] flex flex-col gap-3 shrink-0">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center text-xs font-mono uppercase tracking-wider font-medium border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-xl transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 text-center text-xs font-medium uppercase tracking-wider bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] rounded-xl transition-colors shadow-sm"
            >
              Begin your journal
            </Link>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION (Atmospheric with hero-dreamscape.png)
      ───────────────────────────────────────────────────────────── */}
      <header className="relative pt-36 md:pt-44 pb-24 md:pb-36 px-6 md:px-10 overflow-hidden border-b border-[var(--border-default)]">
        {/* Supporting Atmospheric Visual Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <Image
            src="/visuals/landing/hero-dreamscape.png"
            alt="Subconscious dreamscape atmosphere"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-[center_35%] opacity-25 dark:opacity-40 transition-opacity duration-700"
          />
          {/* Subtle multi-directional gradients ensuring 100% text readability across light and dark themes */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/85 to-[var(--bg-primary)]/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/60 via-transparent to-[var(--bg-primary)]" />
        </div>

        <div className="max-w-5xl mx-auto space-y-10 relative z-10">
          {/* Headline & Narrative Lead */}
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
                Morning Dream Journal &amp; Subconscious Archive
              </p>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-normal leading-[1.06] tracking-tight text-[var(--text-primary)]">
              Your dreams disappear.
              <br />
              <span className="italic font-light text-[var(--text-secondary)]">SUBCONSCIOUS LOG remembers.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] font-light leading-relaxed max-w-2xl">
              A private journal designed for the moments immediately upon waking. Write or speak raw fragments before they fade, reflect with quiet care, and watch patterns emerge across time.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider bg-[var(--accent)] text-[var(--bg-primary)] px-8 py-4 rounded-full hover:bg-[var(--accent-hover)] transition-all shadow-md hover:shadow-lg text-center"
              >
                <span>Begin your journal</span>
                <ChevronRight size={15} />
              </Link>

              <button
                type="button"
                onClick={() => setExploreModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider border border-[var(--border-default)] hover:border-[var(--text-muted)] bg-[var(--bg-card)]/80 backdrop-blur-sm hover:bg-[var(--bg-card)] px-7 py-4 rounded-full transition-all text-center"
              >
                <span>Explore a sample dream</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. PRODUCT DEMO SECTION ("See SUBCONSCIOUS LOG in action")
      ───────────────────────────────────────────────────────────── */}
      <ProductDemoSection videoSrc="/subconsciouslog-demo.mp4" />

      {/* ─────────────────────────────────────────────────────────────
          4. RECURRING PATTERNS & CONTINUITY (Supporting Visual 2)
      ───────────────────────────────────────────────────────────── */}
      <RecurringPatternsSection />

      {/* ─────────────────────────────────────────────────────────────
          5. MORNING CAPTURE EXPERIENCE ("What do you remember?")
      ───────────────────────────────────────────────────────────── */}
      <section id="capture" className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)]">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left explanation */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)] block">
                The Dawn Routine
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)] leading-tight">
                What do you remember?
              </h2>
              <p className="text-base text-[var(--text-secondary)] font-light leading-relaxed">
                Most dream tools demand too much cognition when you wake up. SUBCONSCIOUS LOG is built for half-closed eyes and fading thoughts.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: 'Type raw stream-of-consciousness',
                    desc: 'A pure, distraction-free text editor that autosaves continuously so nothing is lost.',
                    icon: PenLine,
                  },
                  {
                    title: 'Speak before words fade',
                    desc: 'One tap to record your voice. Whisper into your phone while lying in bed.',
                    icon: Mic,
                  },
                  {
                    title: 'Save immediately',
                    desc: 'One press secures the entry. Analysis runs asynchronously afterward and never blocks your morning.',
                    icon: Clock,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon size={16} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[var(--text-primary)]">{item.title}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Mock UI Card */}
            <div className="lg:col-span-6">
              <div className="p-6 md:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xl space-y-5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Morning Capture
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Draft Saved</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                    What stayed with you?
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed italic">
                    &ldquo;I woke up with the sound of a foghorn. We were standing in a hallway where all the doors opened directly into open water...&rdquo;
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                      <Mic size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">Voice capture active</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Listening with care...</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[var(--accent)]">00:42</span>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="w-full py-3 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider text-center block hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Save dream immediately
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. DREAM → MEMORY → PATTERN → WORLD (The 4 Stages)
      ───────────────────────────────────────────────────────────── */}
      <section id="journey" className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/50">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="max-w-4xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)] block">
              Core Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)] md:whitespace-nowrap">
              Dream → Memory → Pattern → World
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed max-w-2xl">
              Dreams are fragile at dawn. SUBCONSCIOUS LOG treats them with the respect they deserve — starting with effortless morning capture, gently revealing recurring symbols, and building a living memory map.
            </p>
          </div>

          <DreamJourneyWalkthrough />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. INSIDE SUBCONSCIOUS LOG (Interactive Product Showcase)
      ───────────────────────────────────────────────────────────── */}
      <ProductShowcaseSection />

      {/* ─────────────────────────────────────────────────────────────
          8. DREAM EVOLUTION & TEMPORAL DRIFT (Supporting Visual 3)
      ───────────────────────────────────────────────────────────── */}
      <DreamEvolutionLandingSection />

      {/* ─────────────────────────────────────────────────────────────
          6b. SCIENCE & PERSPECTIVES (The Dawn Memory Window)
      ───────────────────────────────────────────────────────────── */}
      <PerspectivesSection />

      {/* ─────────────────────────────────────────────────────────────
          7. REFLECTION & ETHICAL BOUNDARIES
      ───────────────────────────────────────────────────────────── */}
      <section id="reflection" className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/50">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)] block">
              Ethical AI & Boundaries
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)]">
              Possibilities, never diagnoses.
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
              SUBCONSCIOUS LOG makes a strict, respectful distinction between your authentic memory and reflective suggestions. We believe dream interpretation is a personal contemplative practice, not a clinical prescription.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent)]">
                <BookOpen size={18} />
              </div>
              <h3 className="font-display text-xl text-[var(--text-primary)] font-medium">
                1. Your Words
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                Your original journal entry remains pristine and unedited. No AI summary replaces your own authentic words.
              </p>
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
                Status: Authentic Ground Truth
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent)]">
                <Sparkles size={18} />
              </div>
              <h3 className="font-display text-xl text-[var(--text-primary)] font-medium">
                2. AI Reflection
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                Thoughtful inquiries that prompt personal journaling: &ldquo;What did the open water feel like when you stepped toward it?&rdquo;
              </p>
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
                Framing: Self-Inquiry Prompts
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent)]">
                <ShieldCheck size={18} />
              </div>
              <h3 className="font-display text-xl text-[var(--text-primary)] font-medium">
                3. Symbolic Patterns
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                Cultural and literary associations offered strictly as subjective possibilities. You are always the final authority on your dream.
              </p>
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
                Disclaimer: Never Medical Advice
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. EDITORIAL & GUIDES (From the SUBCONSCIOUS LOG Library)
      ───────────────────────────────────────────────────────────── */}
      <BlogShowcaseSection />

      {/* ─────────────────────────────────────────────────────────────
          9. PRIVACY BY DESIGN
      ───────────────────────────────────────────────────────────── */}
      <section id="privacy" className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/50">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)] block">
              Subconscious Privacy
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)]">
              Your dreams stay yours.
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
              Your journal holds thoughts you may never say out loud. Privacy is not a feature in SUBCONSCIOUS LOG; it is the philosophical foundation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
              <Lock size={20} className="text-[var(--accent)]" />
              <h4 className="font-display text-lg text-[var(--text-primary)] font-medium">Account-level security</h4>
              <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                Row Level Security ensures only your authenticated account can ever read or decrypt your dream entries.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
              <ShieldCheck size={20} className="text-[var(--accent)]" />
              <h4 className="font-display text-lg text-[var(--text-primary)] font-medium">Never sold or advertised</h4>
              <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                We will never sell your dream entries or behavioral profile to advertising brokers or data brokers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
              <Sparkles size={20} className="text-[var(--accent)]" />
              <h4 className="font-display text-lg text-[var(--text-primary)] font-medium">Model Privacy Boundaries</h4>
              <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                SUBCONSCIOUS LOG does not use your private journal entries or reflections to train internal public foundation models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9b. OBJECTIVE COMPETITIVE COMPARISON MATRIX
      ───────────────────────────────────────────────────────────── */}
      <CompetitiveMatrixSection />

      {/* ------------------------------------------------------------
          10. TRANSPARENT PRICING
      ------------------------------------------------------------ */}
      <section id="pricing" className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)] block">
              Honest Value &amp; Fair Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)]">
              Start free. Deepen when you are ready.
            </h2>
            <p className="text-base text-[var(--text-secondary)] font-light leading-relaxed">
              Every core journal tool is free forever without entry caps. Upgrade when you want cross-dream archive synthesis, conversational memory, and temporal pattern evolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-1">
                    Free Forever
                  </span>
                  <h3 className="text-2xl font-display font-medium text-[var(--text-primary)]">Free</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-display font-semibold text-[var(--text-primary)]">$0</span>
                    <span className="text-xs text-[var(--text-muted)]">/ forever</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 font-light">
                    Lifelong private dream journaling with basic subconscious reflection.
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                  {[
                    'Unlimited dream entries & voice capture',
                    'Full history, instant search & calendar',
                    '5 AI reflections per month',
                    'Subconscious pattern overview & trends',
                    'Dream World spatial constellation',
                    'Entity continuity & theme radar',
                    'Full export (JSON/Markdown) & zero lock-in',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/signup"
                className="w-full py-3 rounded-full border border-[var(--border-default)] hover:border-[var(--text-muted)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-xs font-mono uppercase tracking-wider text-[var(--text-primary)] text-center transition-colors block"
              >
                Start free
              </Link>
            </div>

            {/* Pro Monthly */}
            <div className="p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] block mb-1">
                    Monthly
                  </span>
                  <h3 className="text-2xl font-display font-medium text-[var(--text-primary)]">Pro Monthly</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-display font-semibold text-[var(--text-primary)]">$9</span>
                    <span className="text-xs text-[var(--text-muted)]">/ month</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 font-light">
                    Flexible month-to-month access to longitudinal synthesis &amp; temporal pattern tracking.
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                  {[
                    'Everything in Free included',
                    '100 AI reflections & inquiries / month',
                    'Cross-dream longitudinal pattern synthesis',
                    'AI Guide with archive conversation memory',
                    'Ask Your Dream History retrieval',
                    'Priority analysis queues & direct support',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/signup?tier=pro_monthly"
                className="w-full py-3 rounded-full border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] text-xs font-mono uppercase tracking-wider text-center transition-colors block"
              >
                Subscribe monthly
              </Link>
            </div>

            {/* Pro Annual */}
            <div className="p-7 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--accent)] flex flex-col justify-between space-y-6 relative shadow-xl">
              <div className="absolute -top-3 right-6">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-[9px] font-mono uppercase tracking-widest font-semibold">
                  Save 33%
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] block mb-1">
                    Most Popular
                  </span>
                  <h3 className="text-2xl font-display font-medium text-[var(--text-primary)]">Pro Annual</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-display font-semibold text-[var(--text-primary)]">$72</span>
                    <span className="text-xs text-[var(--text-muted)]">/ year</span>
                  </div>
                  <p className="text-xs text-[var(--accent)] mt-1 font-mono">
                    $6/month equivalent &bull; Billed annually
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-light">
                    For committed dreamers exploring long-term psychological and symbolic arcs.
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-primary)]">
                  {[
                    'Everything in Pro Monthly included',
                    '33% annual savings ($72 vs $108)',
                    '100 AI reflections & inquiries / month',
                    'Full subconscious archive pattern synthesis',
                    'Ask Your Dream History retrieval',
                    'Early access to new cognitive tools',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/signup?tier=pro_annual"
                className="w-full py-3 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider text-center transition-colors block shadow-md"
              >
                Start annual
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent)] hover:underline"
            >
              <span>View full feature comparison &amp; tier FAQ</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------
          11. FINAL CALL TO ACTION (Atmospheric with final-cta.png)
      ------------------------------------------------------------ */}
      <section className="relative py-32 md:py-44 px-6 md:px-10 border-t border-[var(--border-default)] overflow-hidden">
        {/* Supporting Atmospheric Visual Background */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src="/visuals/landing/final-cta.png"
            alt="The subconscious horizon at dawn"
            fill
            quality={90}
            sizes="100vw"
            className="object-cover object-center opacity-30 dark:opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-[var(--bg-primary)]/70" />
          <div className="absolute inset-0 bg-[var(--bg-primary)]/40 backdrop-blur-[2px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card)]/80 border border-[var(--border-default)] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.26em] text-[var(--accent)]">
              The Morning After
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-normal text-[var(--text-primary)] leading-tight tracking-tight">
            Keep what the night forgets.
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed max-w-xl mx-auto">
            Tomorrow morning&apos;s dream will be gone before noon unless you write it down. Start your private journal today.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider bg-[var(--accent)] text-[var(--bg-primary)] px-9 py-4 rounded-full hover:bg-[var(--accent-hover)] transition-all shadow-md hover:shadow-xl text-center"
            >
              <span>Begin your journal</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------
          12. FOOTER
      ------------------------------------------------------------ */}
      <PublicFooter />

      {/* Sample Dream Interactive Modal */}
      <ExploreDreamModal isOpen={exploreModalOpen} onClose={() => setExploreModalOpen(false)} />
    </div>
  );
}

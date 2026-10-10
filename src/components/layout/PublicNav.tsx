'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Menu, X, Sun, Moon, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';
import { SITE_CONFIG } from '@/lib/seo/metadata';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function PublicNavbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-default)] py-3.5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand */}
        <BrandLogo size="md" href="/" />

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium tracking-wide text-[var(--text-secondary)]">
          <Link href="/how-it-works" className="whitespace-nowrap hover:text-[var(--text-primary)] transition-colors py-1">
            How It Works
          </Link>
          <Link href="/pricing" className="whitespace-nowrap hover:text-[var(--text-primary)] transition-colors py-1">
            Pricing
          </Link>
          <Link href="/blog" className="whitespace-nowrap hover:text-[var(--text-primary)] transition-colors py-1">
            Blog
          </Link>
          <Link href="/about" className="whitespace-nowrap hover:text-[var(--text-primary)] transition-colors py-1">
            About
          </Link>
          <Link href="/faq" className="whitespace-nowrap hover:text-[var(--text-primary)] transition-colors py-1">
            FAQ
          </Link>
          <Link href="/contact" className="whitespace-nowrap hover:text-[var(--text-primary)] transition-colors py-1">
            Contact
          </Link>
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-xl border border-transparent hover:border-[var(--border-default)] transition-colors shrink-0"
            aria-label="Toggle theme"
          >
            {mounted && resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <span className="w-px h-4 bg-[var(--border-default)] shrink-0 mx-0.5" aria-hidden="true" />
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] px-3 py-2 transition-colors whitespace-nowrap shrink-0"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-sm hover:shadow-md whitespace-nowrap shrink-0"
          >
            Begin your journal
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-[var(--text-muted)] rounded-lg"
            aria-label="Toggle theme"
          >
            {mounted && resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="p-2 text-[var(--text-primary)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--bg-primary)] pt-20 px-6 flex flex-col gap-5 lg:hidden border-b border-[var(--border-default)] overflow-y-auto">
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)]"
          >
            How It Works
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)]"
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)]"
          >
            Blog
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)]"
          >
            About
          </Link>
          <Link
            href="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)]"
          >
            FAQ
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-display text-[var(--text-primary)] hover:text-[var(--accent)]"
          >
            Contact
          </Link>

          <div className="pt-6 border-t border-[var(--border-default)] flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center text-sm font-medium border border-[var(--border-default)] rounded-xl"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center text-sm font-semibold bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl"
            >
              Begin your journal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[var(--bg-card)]/60 border-t border-[var(--border-default)] pt-16 pb-14 text-[var(--text-secondary)] text-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" href="/" />
            <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-sm font-normal">
              An editorial, privacy-first dream journal for the moments immediately upon waking. Write or speak raw fragments before they fade, reflect with quiet care, and watch subconscious patterns emerge across time.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm font-mono text-[var(--text-secondary)] font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>Private Subconscious Journal</span>
              <span className="opacity-40">·</span>
              <span>Encrypted Storage</span>
            </div>
          </div>

          {/* Product Col */}
          <div className="space-y-4">
            <h4 className="text-[var(--text-primary)] font-semibold uppercase tracking-wider text-xs sm:text-sm font-mono">
              Product
            </h4>
            <ul className="space-y-3 text-sm sm:text-base font-normal">
              <li>
                <Link href="/how-it-works#capture" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Journal
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#capture" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Dream Capture
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#reflection" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  AI Reflection
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#patterns" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Insights & Patterns
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#world" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Dream World
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Col */}
          <div className="space-y-4">
            <h4 className="text-[var(--text-primary)] font-semibold uppercase tracking-wider text-xs sm:text-sm font-mono">
              Resources
            </h4>
            <ul className="space-y-3 text-sm sm:text-base font-normal">
              <li>
                <Link href="/blog" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Editorial Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  How Subconscious Log Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  About Subconscious Log
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/dream-symbols" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Symbol Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Col */}
          <div className="space-y-4">
            <h4 className="text-[var(--text-primary)] font-semibold uppercase tracking-wider text-xs sm:text-sm font-mono">
              Legal & Trust
            </h4>
            <ul className="space-y-3 text-sm sm:text-base font-normal">
              <li>
                <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Refunds & Cancellation
                </Link>
              </li>
              <li>
                <Link href="/ai-disclaimer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  AI & Contemplative Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Security & Data Protection
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors block py-0.5">
                  Accessibility Statement
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-mono text-[var(--text-secondary)]">
          <p className="font-normal">&copy; {new Date().getFullYear()} Subconscious Log. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors">
              Terms
            </Link>
            <Link href="/security" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors">
              Security
            </Link>
            <Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

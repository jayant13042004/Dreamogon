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
        <div className="hidden lg:flex items-center gap-7 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
          <Link href="/how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
            How It Works
          </Link>
          <Link href="/pricing" className="hover:text-[var(--text-primary)] transition-colors">
            Pricing
          </Link>
          <Link href="/blog" className="hover:text-[var(--text-primary)] transition-colors">
            Blog
          </Link>
          <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
            About
          </Link>
          <Link href="/faq" className="hover:text-[var(--text-primary)] transition-colors">
            FAQ
          </Link>
          <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">
            Contact
          </Link>
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-xl border border-transparent hover:border-[var(--border-default)] transition-colors"
            aria-label="Toggle theme"
          >
            {mounted && resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link
            href="/login"
            className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all shadow-sm"
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
    <footer className="bg-[var(--bg-card)]/40 border-t border-[var(--border-default)] pt-16 pb-12 text-[var(--text-muted)] text-xs">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" href="/" />
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed max-w-sm font-light">
              An editorial, privacy-first dream journal for the moments immediately upon waking. Write or speak raw fragments before they fade, reflect with quiet care, and watch subconscious patterns emerge across time.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>Private Subconscious Journal</span>
              <span className="opacity-40">·</span>
              <span>Encrypted Storage</span>
            </div>
          </div>

          {/* Product Col */}
          <div className="space-y-3">
            <h4 className="text-[var(--text-primary)] font-medium uppercase tracking-wider text-[11px] font-mono">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works#capture" className="hover:text-[var(--text-primary)] transition-colors">
                  Journal
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#capture" className="hover:text-[var(--text-primary)] transition-colors">
                  Dream Capture
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#reflection" className="hover:text-[var(--text-primary)] transition-colors">
                  AI Reflection
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#patterns" className="hover:text-[var(--text-primary)] transition-colors">
                  Insights & Patterns
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#world" className="hover:text-[var(--text-primary)] transition-colors">
                  Dream World
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[var(--text-primary)] transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Col */}
          <div className="space-y-3">
            <h4 className="text-[var(--text-primary)] font-medium uppercase tracking-wider text-[11px] font-mono">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="hover:text-[var(--text-primary)] transition-colors">
                  Editorial Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[var(--text-primary)] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
                  How Subconscious Log Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
                  About Subconscious Log
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/dream-symbols" className="hover:text-[var(--text-primary)] transition-colors">
                  Symbol Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Col */}
          <div className="space-y-3">
            <h4 className="text-[var(--text-primary)] font-medium uppercase tracking-wider text-[11px] font-mono">
              Legal & Trust
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-[var(--text-primary)] transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-[var(--text-primary)] transition-colors">
                  Refunds & Cancellation
                </Link>
              </li>
              <li>
                <Link href="/ai-disclaimer" className="hover:text-[var(--text-primary)] transition-colors">
                  AI & Contemplative Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-[var(--text-primary)] transition-colors">
                  Security & Data Protection
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-[var(--text-primary)] transition-colors">
                  Accessibility Statement
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <p>&copy; {new Date().getFullYear()} Subconscious Log. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
              Terms
            </Link>
            <Link href="/security" className="hover:text-[var(--text-primary)] transition-colors">
              Security
            </Link>
            <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

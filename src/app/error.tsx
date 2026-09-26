'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { SubconsciousLogSymbol } from '@/components/ui/BrandLogo';
import { RotateCcw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime error to console for diagnostic tracing
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent)]/20">
      <header className="p-6 md:px-12 flex items-center justify-between border-b border-[var(--border-default)]">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="text-[var(--accent)]">
            <SubconsciousLogSymbol size={22} />
          </div>
          <span className="font-display font-semibold text-sm tracking-[0.14em] text-[var(--text-primary)] uppercase">
            Subconscious Log
          </span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] mb-6 shadow-sm">
          <SubconsciousLogSymbol size={36} />
        </div>

        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[var(--accent)] mb-2 block">
          Error 500 · Interruption
        </span>

        <h1 className="text-3xl md:text-4xl font-display font-medium text-[var(--text-primary)] tracking-tight mb-3">
          Something shifted unexpectedly
        </h1>

        <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-light mb-8 max-w-md">
          A temporary disturbance interrupted your request. Your private entries remain safe and securely stored.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider shadow-sm hover:opacity-95 transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-medium tracking-wider uppercase transition-all"
          >
            <Home size={14} />
            Return to Sanctuary
          </Link>
        </div>

        {error?.digest && (
          <p className="mt-8 text-[11px] font-mono text-[var(--text-muted)]">
            Incident reference: {error.digest}
          </p>
        )}
      </main>

      <footer className="p-6 md:px-12 border-t border-[var(--border-subtle)] text-center text-xs font-mono text-[var(--text-muted)]">
        &copy; {new Date().getFullYear()} Subconscious Log. Encrypted & Private.
      </footer>
    </div>
  );
}

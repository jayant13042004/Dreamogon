'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Moon, Sun, Bell, Sparkles, Compass, Settings, LogOut } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error('Sign out error:', err);
      window.location.href = '/login';
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-default)]'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-display font-medium text-[var(--text-primary)] tracking-tight">
            {title || 'Journal'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick World Link */}
          <Link
            href="/world"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-medium transition-colors"
          >
            <Compass size={14} />
            <span>World</span>
          </Link>

          {/* New Dream Action */}
          <Link
            href="/dream/new"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] text-xs font-semibold tracking-wide transition-colors"
          >
            <Plus size={14} />
            <span>Record</span>
          </Link>

          {/* Settings Link */}
          <Link
            href="/settings"
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors border border-[var(--border-default)]"
            aria-label="Settings"
          >
            <Settings size={15} />
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors border border-[var(--border-default)]"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="p-2 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors border border-[var(--border-default)]"
            title="Sign out of Subconscious Log"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}

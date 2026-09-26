'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  MessageCircle,
  CalendarDays,
  Settings,
  Plus,
  Compass,
  Layers,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { BrandLogo } from '@/components/ui/BrandLogo';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Journal', href: '/dreams', icon: BookOpen },
  { name: 'Insights', href: '/insights', icon: TrendingUp },
  { name: 'Dream World', href: '/world', icon: Compass },
  { name: 'Dream History', href: '/chat', icon: MessageCircle },
];

function planLabel(planTier?: string | null) {
  if (planTier === 'lifetime') return 'Lifetime';
  if (planTier === 'pro') return 'Pro';
  return 'Free';
}


function initialsFromName(name?: string | null, email?: string | null) {
  const source = (name || email || 'U').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error('Sign out error:', err);
      window.location.href = '/login';
    }
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Account';
  const tier = profile?.plan_tier ?? 'free';

  return (
    <aside className="hidden md:flex flex-col w-[260px] fixed inset-y-0 left-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] z-30 select-none overflow-x-hidden">
      {/* Brand Header */}
      <div className="px-5 pt-6 pb-5">
        <BrandLogo size="md" href="/dashboard" />
        <span className="text-[8.5px] uppercase tracking-[0.20em] text-[var(--text-muted)] font-medium block mt-1.5 ml-[32px] whitespace-nowrap">
          Private Dream Archive
        </span>
      </div>

      {/* Primary Action Button */}
      <div className="px-5 mb-6">
        <Link
          href="/dream/new"
          className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-2xl bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-semibold tracking-wide shadow-sm hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all duration-200"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Record Dream</span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]'
                }`}
              >
                <item.icon
                  size={18}
                  className={isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors'}
                />
                <span className="text-xs">{item.name}</span>

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute left-0 w-0.5 h-5 bg-[var(--accent)] rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile, Settings & Sign Out */}
      <div className="p-5 border-t border-[var(--border-default)] space-y-2">
        <div className="flex items-center justify-between gap-1">
          <Link href="/settings" className="flex-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-xs">
              <Settings size={15} />
              <span>Settings</span>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            title="Sign out of Subconscious Log"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors text-xs"
            aria-label="Sign out"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--accent-soft)] border border-[var(--border-default)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] flex items-center justify-center font-semibold text-xs shrink-0">
            {loading ? '…' : initialsFromName(profile?.name, user?.email)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{loading ? 'Loading…' : displayName}</span>
            <span className="text-[10px] text-[var(--text-muted)] font-medium">{planLabel(tier)} plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

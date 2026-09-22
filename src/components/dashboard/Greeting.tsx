'use client';

import { motion } from 'framer-motion';
import { getGreeting } from '@/lib/utils/date';
import type { Profile } from '@/types/user';
import type { Dream } from '@/types/dream';
import { Sparkles, Moon, Sun } from 'lucide-react';

interface GreetingProps {
  profile: Profile | null;
  dreams: Dream[];
}

export function Greeting({ profile, dreams }: GreetingProps) {
  const greeting = getGreeting(profile?.name || undefined);
  
  const today = new Date().toISOString().split('T')[0];
  const hasDreamedToday = dreams.some(d => {
    if (!d.dream_date) return false;
    return d.dream_date.split('T')[0] === today;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
          Morning Journal
        </span>
        <span className="text-[var(--text-muted)] opacity-40">•</span>
        <span className="text-[11px] text-[var(--text-muted)] font-mono">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <h1 className="text-3xl md:text-5xl font-display font-medium text-[var(--text-primary)] tracking-tight">
        {greeting}
      </h1>
      
      <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-xl font-normal leading-relaxed">
        {hasDreamedToday 
          ? "You recorded a dream today. Your journal is preserved." 
          : "What stayed with you upon waking? Record the memory before it fades."}
      </p>
    </motion.div>
  );
}

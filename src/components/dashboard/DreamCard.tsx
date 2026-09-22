'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { getRelativeDate } from '@/lib/utils/date';
import { MOODS } from '@/lib/utils/constants';
import type { Dream } from '@/types/dream';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { resolveDreamImageUrl } from '@/lib/storage/dream-images';

interface DreamCardProps {
  dream: Dream;
  index: number;
}

export function DreamCard({ dream, index }: DreamCardProps) {
  const mood = MOODS.find(m => m.value === dream.mood) || MOODS.find(m => m.value === 'neutral') || { label: 'Neutral', value: 'neutral' };
  
  const contentPreview = dream.content?.length > 110 
    ? dream.content.substring(0, 110) + '...' 
    : dream.content || '';

  const themes = dream.ai_themes || [];
  const symbols = dream.ai_symbols || [];
  const visualUrl = resolveDreamImageUrl(dream);

  return (
    <Link href={`/dream/${dream.id}`} className="block h-full group">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
        className="h-full"
      >
        <div className="h-full flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-all duration-300 overflow-hidden">
          
          {visualUrl ? (
            <div className="relative w-full h-44 overflow-hidden bg-[var(--bg-secondary)] border-b border-[var(--border-default)]">
              <img
                src={visualUrl}
                alt={dream.title || 'Dream visual memory'}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-95 group-hover:opacity-100"
              />
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-[var(--bg-card)]/90 backdrop-blur-sm border border-[var(--border-default)] text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                {mood.label}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-20 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between px-5">
              <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
                <ImageIcon size={14} className="opacity-70" />
                <span className="text-[10px] uppercase font-mono tracking-wider">Dream Record</span>
              </div>
              <div className="px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-default)] text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                {mood.label}
              </div>
            </div>
          )}

          {/* Card Body */}
          <div className="p-5 sm:p-6 flex flex-col flex-grow">
            <div className="mb-2">
              <h3 className="font-display font-medium text-lg md:text-xl text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                {dream.title || 'Untitled Reflection'}
              </h3>
              
              <p className="text-[var(--text-muted)] text-xs font-mono mt-0.5">
                {getRelativeDate(dream.dream_date)}
              </p>
            </div>
            
            <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-5 flex-grow leading-relaxed font-normal">
              "{contentPreview}"
            </p>
            
            {/* Tags / Entities Footer */}
            <div className="pt-3 border-t border-[var(--border-default)] mt-auto flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5 min-w-0">
                {themes.slice(0, 2).map((theme, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-default)] truncate max-w-[120px]">
                    {theme}
                  </span>
                ))}
                {symbols.slice(0, 1).map((sym, i) => (
                  <span key={`s-${i}`} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-default)] truncate max-w-[120px]">
                    {sym}
                  </span>
                ))}
              </div>

              <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </div>

        </div>
      </motion.div>
    </Link>
  );
}

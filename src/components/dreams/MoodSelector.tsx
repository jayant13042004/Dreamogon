'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mood } from '@/types/dream';
import { MOODS } from '@/lib/utils/constants';

interface MoodSelectorProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--text-secondary)]">Mood</label>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((moodItem) => {
          const isSelected = value === moodItem.value;
          return (
            <motion.button
              key={moodItem.value}
              type="button"
              onClick={() => onChange(moodItem.value as Mood)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs transition-colors ${
                isSelected
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] border-[var(--accent)] font-medium'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[var(--accent)]'
              }`}
            >
              <span>{moodItem.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

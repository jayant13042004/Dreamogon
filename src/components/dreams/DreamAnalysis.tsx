'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { DreamAnalysis as IDreamAnalysis } from '@/types/dream';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface DreamAnalysisProps {
  analysis: IDreamAnalysis;
  dream?: unknown;
}

export function DreamAnalysis({ analysis }: DreamAnalysisProps) {
  const reduceMotion = useReducedMotion();
  if (!analysis) return null;

  const containerVariants = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06 } },
      };

  const itemVariants = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0 },
      };

  return (
    <motion.div
      variants={containerVariants}
      initial={reduceMotion ? undefined : 'hidden'}
      animate={reduceMotion ? undefined : 'show'}
      className="space-y-6"
    >
      {/* 1. Reflective summary & note */}
      <motion.div variants={itemVariants}>
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[var(--text-muted)]" />
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              Reflective summary
            </h3>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
            {analysis.summary}
          </p>
          {analysis.insight && (
            <p className="text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-subtle)] pt-3 italic">
              “{analysis.insight}”
            </p>
          )}
        </div>
      </motion.div>

      {/* 2. Emotional undertones (Qualitative tags - NO pseudo-science bars) */}
      {analysis.emotions && analysis.emotions.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Emotional undertones noticed
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.emotions.map((emotion, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)] capitalize"
                >
                  {emotion.name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Reflection questions to ponder */}
      {analysis.reflection_questions && analysis.reflection_questions.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="text-[var(--accent)] shrink-0" size={16} />
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                Questions for morning reflection
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.reflection_questions.slice(0, 2).map((question: string, index: number) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed"
                >
                  {question}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Subjective interpretations framed gently */}
      {analysis.possible_interpretations && analysis.possible_interpretations.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Possible interpretations
            </h3>
            <div className="space-y-2.5">
              {analysis.possible_interpretations.map((interpretation: string, index: number) => (
                <p key={index} className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  • {interpretation}
                </p>
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] pt-1">
              Suggestions based on metaphorical patterns — not clinical facts.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

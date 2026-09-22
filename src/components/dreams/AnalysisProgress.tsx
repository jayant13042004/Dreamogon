'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Image as ImageIcon, Sparkles, CheckCircle } from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Reading your dream memory...', icon: BookOpen },
  { id: 2, label: 'Extracting key themes & artifacts...', icon: Search },
  { id: 3, label: 'Capturing the scene & visual atmosphere...', icon: ImageIcon },
  { id: 4, label: 'Bringing your dream memory to life...', icon: Sparkles },
];

interface AnalysisProgressProps {
  isAnalyzing: boolean;
  currentStage: number;
}

export function AnalysisProgress({ isAnalyzing, currentStage }: AnalysisProgressProps) {
  if (!isAnalyzing) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          className="bg-[var(--bg-card)] p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-[var(--border-default)] text-[var(--text-primary)] relative overflow-hidden"
        >
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] block mb-1">
              Archiving Dream
            </span>
            <h2 className="text-2xl font-display font-medium text-[var(--text-primary)]">
              Reflecting & Preserving
            </h2>
            <p className="text-[var(--text-muted)] text-xs mt-1">
              Distilling narrative motifs, resonance, and quiet reflections…
            </p>
          </div>

          <div className="space-y-4">
            {STAGES.map((stage) => {
              const isActive = currentStage === stage.id;
              const isComplete = currentStage > stage.id;
              const isPending = currentStage < stage.id;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-4 transition-all duration-300 ${
                    isPending ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  <div
                    className={`relative flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isComplete
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                        : isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                    }`}
                  >
                    {isComplete ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 12 }}
                      >
                        <CheckCircle size={18} />
                      </motion.div>
                    ) : (
                      <Icon size={18} />
                    )}

                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-[var(--accent)] border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                  </div>

                  <div>
                    <h4
                      className={`text-sm font-medium ${
                        isActive
                          ? 'text-[var(--accent)]'
                          : isComplete
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {stage.label}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

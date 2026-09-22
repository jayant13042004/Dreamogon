'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronRight, Compass, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ExploreDreamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExploreDreamModal({ isOpen, onClose }: ExploreDreamModalProps) {
  const [step, setStep] = useState(0); // 0: typing, 1: mapping, 2: cards, 3: call-to-action
  const [typedText, setTypedText] = useState('');
  
  const fullText = "I was walking through a city I had never seen before. I could hear the ocean nearby, but I couldn't find it.";

  // Typewriter effect in Step 0
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setTypedText('');
      return;
    }

    if (step === 0) {
      let index = 0;
      setTypedText('');
      const interval = setInterval(() => {
        setTypedText((prev) => prev + fullText.charAt(index));
        index++;
        if (index >= fullText.length) {
          clearInterval(interval);
          // Transition to Step 1 (mapping) after 1.5s pause
          setTimeout(() => {
            setStep(1);
          }, 1500);
        }
      }, 35); // 35ms per character typing speed
      
      return () => clearInterval(interval);
    }
  }, [isOpen, step]);

  // Transition from Step 1 (mapping) to Step 2 (cards/analysis)
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        setStep(2);
      }, 4500); // give 4.5 seconds to show visual map
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#17151C]/40 dark:bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl shadow-2xl p-7 md:p-9 overflow-hidden z-10 text-[var(--text-primary)]"
          >
            {/* Header / Brand */}
            <div className="flex justify-between items-center mb-7 border-b border-[var(--border-default)] pb-4">
              <div className="flex items-center gap-2">
                <Compass className="text-[var(--accent)] w-5 h-5" />
                <span className="font-display font-medium tracking-wider text-xs uppercase text-[var(--accent)]">
                  Interactive Demonstration · Illustrative Sample Dream
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stage Contents */}
            <div className="min-h-[260px] flex flex-col justify-center">
              
              {/* Step 0: Typewriter typing of sample dream */}
              {step === 0 && (
                <div className="space-y-4">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent)] font-medium block">
                    Illustrative Sample Input
                  </span>
                  <p className="text-xl md:text-2xl font-display font-normal leading-relaxed italic border-l-2 border-[var(--accent)] pl-4 py-1 text-[var(--text-primary)]">
                    "{typedText}"
                    <span className="animate-pulse font-sans font-normal text-[var(--accent)] ml-0.5">|</span>
                  </p>
                </div>
              )}

              {/* Step 1: Mapping Dream Fragments */}
              {step === 1 && (
                <div className="flex flex-col items-center justify-center space-y-8 py-4">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent)] font-medium block self-start">
                    Extracting Core Fragments
                  </span>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full">
                    {/* Node 1: City */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="px-5 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-sm flex flex-col items-center"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Setting</span>
                      <span className="text-sm font-semibold tracking-wider text-[var(--text-primary)]">CITY</span>
                    </motion.div>

                    {/* Flow arrow 1 */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-[var(--accent)] rotate-90 md:rotate-0"
                    >
                      <ArrowRight size={18} />
                    </motion.div>

                    {/* Node 2: Searching */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.1 }}
                      className="px-5 py-3 rounded-xl bg-[var(--accent-soft)] border border-[var(--border-default)] shadow-sm flex flex-col items-center"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-[var(--accent)]">Action</span>
                      <span className="text-sm font-semibold tracking-wider text-[var(--accent)]">SEARCHING</span>
                    </motion.div>

                    {/* Flow arrow 2 */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.7 }}
                      className="text-[var(--accent)] rotate-90 md:rotate-0"
                    >
                      <ArrowRight size={18} />
                    </motion.div>

                    {/* Node 3: Ocean */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 2.0 }}
                      className="px-5 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-sm flex flex-col items-center"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Symbol</span>
                      <span className="text-sm font-semibold tracking-wider text-[var(--text-primary)]">OCEAN</span>
                    </motion.div>

                    {/* Flow arrow 3 */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.6 }}
                      className="text-[var(--accent)] rotate-90 md:rotate-0"
                    >
                      <ArrowRight size={18} />
                    </motion.div>

                    {/* Node 4: Uncertainty */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 2.9 }}
                      className="px-5 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] shadow-sm flex flex-col items-center"
                    >
                      <span className="text-[9px] uppercase tracking-wider opacity-80">Emotion</span>
                      <span className="text-sm font-semibold tracking-wider">UNCERTAINTY</span>
                    </motion.div>
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ delay: 0.5, duration: 3.5 }}
                    className="text-xs text-[var(--text-muted)] italic"
                  >
                    Identifying core motifs and themes...
                  </motion.p>
                </div>
              )}

              {/* Step 2: Insight / Meaning mapping reveal */}
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent)] font-medium block w-full mb-1">
                      Identified Motifs
                    </span>
                    <span className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md text-xs font-mono text-[var(--text-primary)]">
                      Exploration
                    </span>
                    <span className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md text-xs font-mono text-[var(--text-primary)]">
                      Uncertainty
                    </span>
                    <span className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md text-xs font-mono text-[var(--text-primary)]">
                      Longing
                    </span>
                  </div>

                  {/* AI Reflection Text Card */}
                  <motion.div 
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-2.5 z-10 relative">
                      <Sparkles size={15} className="text-[var(--accent)]" />
                      <span className="text-xs font-medium tracking-wider uppercase text-[var(--accent)]">
                        Reflective Observation
                      </span>
                    </div>

                    <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)] italic z-10 relative">
                      "One possible interpretation is that the dream combines unfamiliar surroundings (the unknown city) with a search for something familiar or meaningful (the ocean you hear but cannot find), pointing to feelings of navigation or transition in your waking life."
                    </p>
                  </motion.div>

                  {/* Call to action conversion link */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--border-default)] mt-4"
                  >
                    <span className="text-xs text-[var(--text-muted)]">
                      Understand your own subconscious maps.
                    </span>
                    <Link 
                      href="/signup" 
                      onClick={onClose}
                      className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                    >
                      Try it with your own dream <ChevronRight size={14} />
                    </Link>
                  </motion.div>
                </motion.div>
              )}

            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}

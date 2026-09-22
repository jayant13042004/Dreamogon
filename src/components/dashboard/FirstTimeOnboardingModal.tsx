'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Compass, ArrowRight, Check, X, Mic, Feather } from 'lucide-react';

const INTENTIONS = [
  { id: 'remember', label: 'Remember dreams before they fade', icon: Moon },
  { id: 'patterns', label: 'Uncover recurring themes & symbols', icon: Compass },
  { id: 'clarity', label: 'Emotional clarity & self-reflection', icon: Sparkles },
];

interface FirstTimeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FirstTimeOnboardingModal({ isOpen, onClose }: FirstTimeOnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedIntention, setSelectedIntention] = useState<string>('remember');

  const handleFinish = () => {
    localStorage.setItem('dreamogon_onboarding_dismissed', 'true');
    onClose();
  };

  const handleStartRecording = () => {
    localStorage.setItem('dreamogon_onboarding_dismissed', 'true');
    onClose();
    router.push('/dream/new');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] p-6 sm:p-8 shadow-2xl relative text-[var(--text-primary)]"
        >
          {/* Close / Skip button */}
          <button
            onClick={handleFinish}
            className="absolute top-6 right-6 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="Skip onboarding"
          >
            <X size={16} />
          </button>

          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-7 bg-[var(--accent)]'
                    : s < step
                    ? 'w-3 bg-[var(--accent)]/50'
                    : 'w-3 bg-[var(--border-default)]'
                }`}
              />
            ))}
          </div>

          {/* STEP 1: Intention */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                  Step 1 of 3
                </span>
                <h2 className="text-2xl font-display font-medium text-[var(--text-primary)] mt-1">
                  Welcome to Dreamogon
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  What is your primary intention with your dream journal?
                </p>
              </div>

              <div className="space-y-2.5">
                {INTENTIONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedIntention === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIntention(item.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-sm transition-all ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)] font-medium shadow-sm'
                          : 'border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                              : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-[var(--accent)]" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Morning Capture Tip */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                  Step 2 of 3
                </span>
                <h2 className="text-2xl font-display font-medium text-[var(--text-primary)] mt-1">
                  The morning capture ritual
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  Dream recall vanishes within minutes of waking. Here is how to keep it effortless:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Sparkles size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed">
                    <strong className="text-[var(--text-primary)] font-medium">Stay still for 30 seconds.</strong> Before opening your messages, keep your eyes softly closed and replay the last image.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Mic size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed">
                    <strong className="text-[var(--text-primary)] font-medium">Capture raw fragments.</strong> A few whispered phrases or keywords are all Dreamogon needs to reconstruct the emotional memory.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Feather size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed">
                    <strong className="text-[var(--text-primary)] font-medium">No pressure for prose.</strong> Bullet points, voice recordings, and half-remembered sensations are completely welcome.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors"
                >
                  <span>Got it</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Ready to Record */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                  Step 3 of 3
                </span>
                <h2 className="text-2xl font-display font-medium text-[var(--text-primary)] mt-1">
                  Begin your sanctuary
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  Stored securely so you can build a private personal record. AI assists with reflection only when you choose.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--accent-soft)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] leading-relaxed">
                Ready to record your first dream or what you remember from last night?
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-4 py-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] text-center order-2 sm:order-1"
                >
                  Explore dashboard first
                </button>
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-md order-1 sm:order-2"
                >
                  <span>Record my first dream</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

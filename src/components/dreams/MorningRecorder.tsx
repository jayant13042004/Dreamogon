'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Globe, AlertCircle, Square, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export interface MorningRecorderProps {
  onTranscript: (text: string) => void;
  onInterimText?: (text: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
  disabled?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English (US)', short: 'EN' },
  { code: 'en-GB', label: 'English (UK)', short: 'UK' },
  { code: 'es-ES', label: 'Español', short: 'ES' },
  { code: 'fr-FR', label: 'Français', short: 'FR' },
  { code: 'de-DE', label: 'Deutsch', short: 'DE' },
  { code: 'it-IT', label: 'Italiano', short: 'IT' },
  { code: 'pt-BR', label: 'Português', short: 'PT' },
  { code: 'ja-JP', label: '日本語', short: 'JA' },
  { code: 'hi-IN', label: 'हिन्दी', short: 'HI' },
  { code: 'nl-NL', label: 'Nederlands', short: 'NL' },
];

export function MorningRecorder({
  onTranscript,
  onInterimText,
  onRecordingChange,
  disabled = false,
}: MorningRecorderProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isExplicitlyStopped = useRef(true);
  const retryCount = useRef(0);
  const reduceMotion = useReducedMotion();

  // Detect default browser language
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.language) {
      const navLang = navigator.language;
      const match = SUPPORTED_LANGUAGES.find(
        (l) =>
          l.code.toLowerCase() === navLang.toLowerCase() ||
          l.code.split('-')[0] === navLang.split('-')[0]
      );
      if (match) setSelectedLang(match.code);
    }
  }, []);

  // Check support & initialize recognition
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLang;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript + ' ';
        } else {
          currentInterim += item[0].transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
      setInterimText(currentInterim);
      onInterimText?.(currentInterim);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition warning:', event.error);
      if (event.error === 'not-allowed') {
        setErrorHint('Microphone permission is needed. Please allow microphone access in your browser.');
        stopSession();
      } else if (event.error === 'no-speech') {
        // Normal in pause — keep session alive
      } else if (event.error !== 'aborted') {
        setErrorHint('Microphone paused. Tap to resume.');
      }
    };

    recognition.onend = () => {
      // If user did not explicitly stop and we're recording, silently auto-resume for sleepy pauses
      if (!isExplicitlyStopped.current && retryCount.current < 5) {
        retryCount.current += 1;
        try {
          recognition.start();
          return;
        } catch {
          // Fall through to stop
        }
      }
      setIsRecording(false);
      onRecordingChange?.(false);
      setInterimText('');
      onInterimText?.('');
      releaseWakeLock();
      clearTimer();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      clearTimer();
      releaseWakeLock();
    };
  }, [selectedLang, onTranscript, onInterimText, onRecordingChange]);

  const requestWakeLock = async () => {
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch {
      // wakeLock is non-critical enhancement
    }
  };

  const releaseWakeLock = () => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch {
      // ignore
    }
  };

  const startTimer = () => {
    clearTimer();
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const triggerHaptic = () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(35);
      }
    } catch {
      // non-critical
    }
  };

  const startSession = async () => {
    if (!recognitionRef.current || disabled) return;
    setErrorHint(null);
    triggerHaptic();
    isExplicitlyStopped.current = false;
    retryCount.current = 0;

    try {
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current.start();
      setIsRecording(true);
      onRecordingChange?.(true);
      startTimer();
      await requestWakeLock();
    } catch (e: any) {
      console.warn('Failed to start speech recognition directly:', e);
      // Already running or permission issue
      if (e?.name === 'InvalidStateError') {
        setIsRecording(true);
        onRecordingChange?.(true);
      } else {
        setErrorHint('Microphone could not start. You can type directly below.');
      }
    }
  };

  const stopSession = () => {
    triggerHaptic();
    isExplicitlyStopped.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
    onRecordingChange?.(false);
    setInterimText('');
    onInterimText?.('');
    clearTimer();
    releaseWakeLock();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopSession();
    } else {
      startSession();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="w-full">
      {/* Unsupported browser fallback warning */}
      {!isSupported && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3 text-xs text-[var(--text-secondary)]">
          <AlertCircle size={15} className="text-[var(--accent)] shrink-0" />
          <span>
            Instant voice capture is best in Chrome, Safari, or Edge. You can also type directly or use your keyboard microphone.
          </span>
        </div>
      )}

      {/* Main Hero Recording Capsule */}
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          isRecording
            ? 'border-[var(--accent)] bg-[var(--bg-card)] shadow-lg shadow-[var(--accent-soft)]'
            : 'border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--border-subtle)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
          {/* Left: Button & Live Status */}
          <div className="flex items-center gap-4">
            {/* Big Thumb-Friendly Tap Button */}
            <div className="relative shrink-0">
              {/* Ethereal pulse aura when recording */}
              {isRecording && !reduceMotion && (
                <motion.div
                  className="absolute -inset-2.5 rounded-full bg-[var(--accent)] opacity-20 pointer-events-none"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.08, 0.25] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                />
              )}

              <button
                type="button"
                onClick={toggleRecording}
                disabled={disabled || !isSupported}
                aria-label={isRecording ? 'Stop recording dream' : 'Start recording dream with voice'}
                className={`relative flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent-soft)] active:scale-95 ${
                  isRecording
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 ring-4 ring-rose-500/20'
                    : 'bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] shadow-md shadow-[var(--accent-soft)]'
                } ${disabled || !isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isRecording ? (
                  <Square size={22} className="fill-current" />
                ) : (
                  <Mic size={26} className="text-[var(--bg-primary)]" />
                )}
              </button>
            </div>

            {/* Status Information for Sleepy Mind */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-medium text-[var(--text-primary)]">
                  {isRecording ? 'Listening… speak freely' : 'Tap to speak your dream'}
                </span>
                {isRecording && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-rose-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {formatTimer(elapsedSeconds)}
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                {isRecording
                  ? 'Pauses are fine. Tap the red square when finished.'
                  : 'Fastest way to capture sleepy fragments before they fade.'}
              </p>
            </div>
          </div>

          {/* Right: Soundwave Visualization & Language Selector */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
            {/* Dynamic Soundwave Bars */}
            {isRecording && !reduceMotion && (
              <div className="flex items-center gap-1 h-6 px-2">
                {[0.4, 0.8, 1.0, 0.6, 0.3].map((heightRatio, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-[var(--accent)]"
                    animate={{
                      height: [`${heightRatio * 8}px`, `${heightRatio * 22}px`, `${heightRatio * 10}px`],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.7 + i * 0.15,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                disabled={isRecording}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Change recording language"
              >
                <Globe size={13} className="text-[var(--accent)]" />
                <span>{currentLangObj.short}</span>
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-full mt-2 z-40 w-44 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-1.5 shadow-xl backdrop-blur-md"
                  >
                    <p className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Language
                    </p>
                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setSelectedLang(lang.code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                            selectedLang === lang.code
                              ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-medium'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                          }`}
                        >
                          <span>{lang.label}</span>
                          <span className="font-mono text-[10px] opacity-75">{lang.short}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Live Interim Transcript Stream Strip */}
        {isRecording && (
          <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)] shrink-0">
                Live
              </span>
              <p className="italic text-[var(--text-primary)] truncate font-serif">
                {interimText ? `“${interimText}”` : 'Listening for your voice…'}
              </p>
            </div>
          </div>
        )}

        {/* Error or Warning Hint */}
        {errorHint && !isRecording && (
          <div className="border-t border-amber-400/20 bg-amber-400/5 px-4 py-2 text-xs text-amber-300">
            {errorHint}
          </div>
        )}
      </div>
    </div>
  );
}

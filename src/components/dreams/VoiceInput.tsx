'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, AlertCircle } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'lg';
  label?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Español' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'hi-IN', label: 'हिन्दी' },
];

export function VoiceInput({
  onTranscript,
  disabled,
  size = 'sm',
  label,
}: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>('en-US');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wakeLockRef = useRef<any>(null);
  const reduceMotion = useReducedMotion();

  // Detect default language
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.language) {
      const navLang = navigator.language;
      const match = SUPPORTED_LANGUAGES.find(
        (l) => l.code.toLowerCase() === navLang.toLowerCase() || l.code.split('-')[0] === navLang.split('-')[0]
      );
      if (match) setSelectedLang(match.code);
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            currentInterim += transcript;
          }
        }

        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        releaseWakeLock();
        if (event.error === 'not-allowed') {
          setErrorHint('Microphone permission needed');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setErrorHint('Voice capture paused');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText('');
        releaseWakeLock();
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript, selectedLang]);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch {
      // Non-critical if wakeLock is denied or unsupported
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

  const toggleRecording = async () => {
    if (!recognitionRef.current || disabled) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setInterimText('');
      releaseWakeLock();
    } else {
      try {
        setErrorHint(null);
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
        setIsRecording(true);
        await requestWakeLock();
      } catch (e) {
        console.error('Failed to start recording', e);
        setErrorHint('Could not start voice capture');
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <AlertCircle size={13} className="text-amber-400 shrink-0" />
        <span title="Speech Recognition requires Chrome, Edge, Safari, or mobile keyboard dictation">
          Voice: use mobile mic or Chrome
        </span>
      </div>
    );
  }

  const isLarge = size === 'lg';

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Primary Voice Trigger */}
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 ${
          isLarge
            ? 'min-h-12 rounded-2xl px-4 py-2.5 text-sm font-medium'
            : 'rounded-full p-2'
        } ${
          isRecording
            ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40 shadow-sm'
            : isLarge
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-secondary)]'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-default)]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isRecording ? 'Stop speaking' : 'Speak your dream'}
      >
        {isRecording ? (
          reduceMotion ? (
            <Mic size={isLarge ? 20 : 18} />
          ) : (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <Mic size={isLarge ? 20 : 18} />
            </motion.div>
          )
        ) : (
          <Mic size={isLarge ? 20 : 18} className={isLarge ? 'text-[var(--accent)]' : ''} />
        )}
        {label && <span className="text-xs sm:text-sm">{isRecording ? 'Listening…' : label}</span>}
      </button>

      {/* Language Selector Pill */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowLangMenu(!showLangMenu)}
          disabled={isRecording}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]/80 px-2 py-1 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title="Dictation language"
        >
          <Globe size={11} className="text-[var(--accent)]" />
          <span>{selectedLang.split('-')[0].toUpperCase()}</span>
        </button>

        {showLangMenu && (
          <div className="absolute left-0 mt-1.5 z-30 w-36 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-1 shadow-xl text-xs backdrop-blur-md">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setSelectedLang(lang.code);
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
                  selectedLang === lang.code
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live Interim Feedback */}
      {isRecording && (
        <div className="flex max-w-[14rem] items-center gap-2 text-xs text-[var(--text-muted)] sm:max-w-xs">
          {!reduceMotion && (
            <motion.div
              className="h-2 w-2 shrink-0 rounded-full bg-rose-400"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
          <span className="truncate italic text-[var(--text-secondary)]">
            {interimText ? `“${interimText}”` : 'Whisper what you remember…'}
          </span>
        </div>
      )}

      {errorHint && !isRecording && (
        <span className="text-xs text-amber-500/90 dark:text-amber-300/90 font-mono">
          {errorHint}
        </span>
      )}
    </div>
  );
}

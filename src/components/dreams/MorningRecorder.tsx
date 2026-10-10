'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, AlertCircle, Square, Sparkles, Loader2, Search, Check, X, Volume2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, VoiceLanguage } from '@/lib/constants/languages';
import { mergeTranscripts } from '@/lib/utils/voice';

export interface MorningRecorderProps {
  onTranscript: (text: string) => void;
  onRawTranscript?: (text: string) => void;
  onInterimText?: (text: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
  /** Called when audio recording finishes, with the raw Blob — for Phase 2 local persistence */
  onAudioCaptured?: (blob: Blob, mimeType: string, langCode: string) => void;
  disabled?: boolean;
  autoStart?: boolean;
}

export function MorningRecorder({
  onTranscript,
  onRawTranscript,
  onInterimText,
  onRecordingChange,
  onAudioCaptured,
  disabled = false,
  autoStart = false,
}: MorningRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [selectedLang, setSelectedLang] = useState(DEFAULT_LANGUAGE);
  const [showLangModal, setShowLangModal] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [showHelpDetails, setShowHelpDetails] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const accumulatedTranscriptRef = useRef<string>('');
  const wakeLockRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isExplicitlyStopped = useRef(true);
  const retryCount = useRef(0);
  const activeEngineRef = useRef<'speech' | 'recorder' | null>(null);
  const lastCommittedIndexRef = useRef<number>(-1);
  /** Set of normalized phrases already emitted to parent — prevents re-emission across restarts */
  const emittedPhrasesRef = useRef<Set<string>>(new Set());
  const autoStartTriggered = useRef(false);
  const reduceMotion = useReducedMotion();

  // Load saved language preference or detect browser language
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('subconscious_dictation_lang');
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      setSelectedLang(saved);
      return;
    }

    if (navigator.language) {
      const navLang = navigator.language;
      const match = SUPPORTED_LANGUAGES.find(
        (l) =>
          l.code.toLowerCase() === navLang.toLowerCase() ||
          l.code.split('-')[0].toLowerCase() === navLang.split('-')[0].toLowerCase()
      );
      if (match) setSelectedLang(match.code);
    }
  }, []);

  // Auto-start recording session if requested by caller
  useEffect(() => {
    if (autoStart && !autoStartTriggered.current && !isRecording && !disabled && !isTranscribing) {
      autoStartTriggered.current = true;
      const timer = setTimeout(() => {
        startSession();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [autoStart, disabled, isRecording, isTranscribing]);

  const handleSelectLanguage = (code: string) => {
    setSelectedLang(code);
    setShowLangModal(false);
    setLangSearch('');
    if (typeof window !== 'undefined') {
      localStorage.setItem('subconscious_dictation_lang', code);
    }
  };

  const requestWakeLock = async () => {
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch {
      // Non-critical
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
      // ignore
    }
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      mediaStreamRef.current = null;
    }
  };

  /**
   * Transcribe recorded audio chunks with Gemini AI
   */
  const transcribeAudioChunks = async (chunks: Blob[], langCode: string) => {
    if (chunks.length === 0) return;
    const audioBlob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' });
    if (audioBlob.size < 800) return;

    setIsTranscribing(true);
    setErrorHint(null);

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('language', langCode);

      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data = await res.json();
      if (data.rawTranscript && data.rawTranscript.trim()) {
        onRawTranscript?.(data.rawTranscript.trim());
      }
      if (data.transcript && data.transcript.trim()) {
        onTranscript(data.transcript.trim());
      }
    } catch (err: any) {
      console.warn('AI audio transcription error:', err);
      setErrorHint('Could not complete audio transcription. Please type your dream notes or try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  /**
   * Start recording using MediaRecorder fallback (for Firefox or when SpeechRecognition fails)
   */
  const startMediaRecorderFallback = async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('NO_MEDIA_DEVICES');
      }

      // Simple { audio: true } constraint avoids driver crashes on Windows/mobile
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }

        const recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        recorder.start(250);
        mediaRecorderRef.current = recorder;
      }

      activeEngineRef.current = 'recorder';
      setIsRecording(true);
      onRecordingChange?.(true);
      startTimer();
      await requestWakeLock();
      return true;
    } catch (err: any) {
      console.warn('MediaRecorder fallback failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorHint('Microphone access was not granted by your browser or operating system.');
        setShowHelpDetails(true);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorHint('No microphone device was detected on your computer or phone.');
      } else {
        setErrorHint('Unable to access microphone. You can type your dream directly in the text box.');
      }
      return false;
    }
  };

  /**
   * Main Start Session function
   */
  const startSession = async () => {
    if (disabled || isRecording || isTranscribing) return;
    setErrorHint(null);
    setShowHelpDetails(false);
    triggerHaptic();
    isExplicitlyStopped.current = false;
    retryCount.current = 0;
    accumulatedTranscriptRef.current = '';
    audioChunksRef.current = [];
    lastCommittedIndexRef.current = -1;
    emittedPhrasesRef.current.clear();

    const isMobile =
      typeof navigator !== 'undefined' &&
      (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (typeof window !== 'undefined' && window.innerWidth <= 768));

    // On mobile devices (Android / iOS): ALWAYS use MediaRecorder directly.
    // Reason: Mobile browsers (especially Android Chrome) have broken SpeechRecognition:
    // they play system start/stop beeps, cut off on 1s of silence, and cause repeated text.
    // MediaRecorder is completely silent, never cuts off mid-speech, and Gemini transcribes
    // accurately with zero repetition.
    if (isMobile) {
      await startMediaRecorderFallback();
      return;
    }

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : undefined;

    // 1. On desktop: Try real-time Web Speech API
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLang;

        recognition.onresult = (event: any) => {
          let newFinal = '';
          let currentInterim = '';

          const startIdx = typeof event.resultIndex === 'number' ? event.resultIndex : 0;
          for (let i = startIdx; i < event.results.length; i++) {
            const item = event.results[i];
            const text = item[0]?.transcript || '';
            if (item.isFinal) {
              if (i > lastCommittedIndexRef.current) {
                newFinal += text + ' ';
                lastCommittedIndexRef.current = i;
              }
            } else {
              currentInterim += text;
            }
          }

          const trimmed = newFinal.trim();
          if (trimmed) {
            const normalizedKey = trimmed.toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?;:]+$/, '');
            if (!emittedPhrasesRef.current.has(normalizedKey)) {
              emittedPhrasesRef.current.add(normalizedKey);
              accumulatedTranscriptRef.current = mergeTranscripts(accumulatedTranscriptRef.current, trimmed);
              onTranscript(trimmed);
            }
          }
          setInterimText(currentInterim);
          onInterimText?.(currentInterim);
        };

        recognition.onerror = async (event: any) => {
          console.warn('Speech recognition warning:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            if (!mediaRecorderRef.current) {
              const fallbackStarted = await startMediaRecorderFallback();
              if (!fallbackStarted) {
                setIsRecording(false);
                onRecordingChange?.(false);
                clearTimer();
                releaseWakeLock();
              }
            }
          } else if (event.error === 'network') {
            if (!mediaRecorderRef.current) {
              await startMediaRecorderFallback();
            }
          }
        };

        // When speech recognition ends naturally on desktop, stop cleanly (NO auto-restart loop)
        recognition.onend = () => {
          setIsRecording(false);
          onRecordingChange?.(false);
          clearTimer();
          releaseWakeLock();
        };

        recognition.start();
        recognitionRef.current = recognition;
        activeEngineRef.current = 'speech';
        setIsRecording(true);
        onRecordingChange?.(true);
        startTimer();
        await requestWakeLock();
        return;
      } catch (err: any) {
        console.warn('SpeechRecognition failed to start directly; falling back to MediaRecorder:', err);
      }
    }

    // 2. Fallback to MediaRecorder
    await startMediaRecorderFallback();
  };

  /**
   * Stop active recording session
   */
  const stopSession = async () => {
    triggerHaptic();
    isExplicitlyStopped.current = true;

    // 1. Stop SpeechRecognition if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    // 2. Stop MediaRecorder and wait for the final chunk to be flushed to audioChunksRef
    const wasRecordingWithRecorder = activeEngineRef.current === 'recorder';
    let chunksToProcess: Blob[] = [];

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        const recorder = mediaRecorderRef.current!;
        recorder.onstop = () => {
          resolve();
        };
        try {
          recorder.stop();
        } catch {
          resolve();
        }
      });
      chunksToProcess = [...audioChunksRef.current];
      mediaRecorderRef.current = null;
    } else {
      chunksToProcess = [...audioChunksRef.current];
    }

    // 3. Release media stream
    stopMediaStream();

    activeEngineRef.current = null;
    lastCommittedIndexRef.current = -1;
    emittedPhrasesRef.current.clear();
    setIsRecording(false);
    onRecordingChange?.(false);
    setInterimText('');
    onInterimText?.('');
    clearTimer();
    releaseWakeLock();

    // 4. If recorded with MediaRecorder (or didn't get speech text), transcribe with Gemini AI
    if ((wasRecordingWithRecorder || !accumulatedTranscriptRef.current.trim()) && chunksToProcess.length > 0) {
      // Phase 2: Emit audio blob to parent for IndexedDB persistence (before transcription)
      if (onAudioCaptured && chunksToProcess.length > 0) {
        const mimeType = chunksToProcess[0]?.type || 'audio/webm';
        const audioBlob = new Blob(chunksToProcess, { type: mimeType });
        if (audioBlob.size > 800) {
          onAudioCaptured(audioBlob, mimeType.split(';')[0], selectedLang);
        }
      }
      await transcribeAudioChunks(chunksToProcess, selectedLang);
    }
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

  const popularLanguages = [
    'en-US',
    'hi-IN',
    'es-ES',
    'fr-FR',
    'de-DE',
    'it-IT',
    'ja-JP',
    'pt-BR',
    'mr-IN',
  ];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeLabel.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="w-full relative">
      {/* Main Hero Recording Stage */}
      <div
        className={`relative rounded-3xl border transition-all duration-300 ${
          isRecording
            ? 'border-[var(--accent)]/40 bg-[var(--bg-card)] shadow-2xl ring-1 ring-[var(--accent)]/20'
            : isTranscribing
              ? 'border-[var(--accent)]/50 bg-[var(--bg-card)] shadow-md shadow-[var(--accent-soft)]'
              : 'border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--border-subtle)] shadow-sm'
        }`}
      >
        <div className="flex flex-col items-center justify-center p-6 sm:p-7 text-center">
          {/* Top Bar: Mode Status Badge & Language Selector */}
          <div className="w-full flex items-center justify-between gap-3 mb-5 sm:mb-6">
            {/* Mode Status Pill */}
            <div>
              {isRecording ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-3.5 py-1 font-mono text-xs font-medium text-[var(--text-primary)] border border-[var(--border-default)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
                  RECORDING · {formatTimer(elapsedSeconds)}
                </span>
              ) : isTranscribing ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono text-xs font-semibold text-[var(--accent)] border border-[var(--accent)]/30">
                  <Loader2 size={12} className="animate-spin" />
                  TRANSCRIBING
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)]/60 px-3 py-1 font-mono text-[11px] font-semibold text-[var(--accent)] uppercase tracking-wider border border-[var(--accent)]/20">
                  <Sparkles size={12} />
                  Instant Record
                </span>
              )}
            </div>

            {/* Language Selector Pill */}
            <button
              type="button"
              onClick={() => setShowLangModal(true)}
              disabled={isRecording || isTranscribing}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3.5 py-1.5 text-xs text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--bg-card)] transition-all cursor-pointer shadow-xs active:scale-95"
              title="Click to change recording language (Hindi, Spanish, French, etc.)"
            >
              <Globe size={13} className="text-[var(--accent)]" />
              <span className="font-semibold">{currentLangObj.nativeLabel}</span>
              <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                ({currentLangObj.short})
              </span>
            </button>
          </div>

          {/* Central Hero Tap Target with Ambient Waves */}
          <div className="relative my-2 sm:my-3">
            {/* Multi-layered Pulsing Sound Rings when Recording */}
            {isRecording && !reduceMotion && (
              <>
                <motion.div
                  className="absolute -inset-4 sm:-inset-5 rounded-full bg-[var(--accent)] opacity-10 pointer-events-none"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.05, 0.15] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute -inset-8 sm:-inset-10 rounded-full bg-[var(--accent)] opacity-5 pointer-events-none"
                  animate={{ scale: [1, 1.35, 1], opacity: [0.08, 0, 0.08] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 0.3 }}
                />
              </>
            )}

            <button
              type="button"
              onClick={toggleRecording}
              disabled={disabled || isTranscribing}
              aria-label={isRecording ? 'Stop recording dream' : 'Start recording dream with voice'}
              className={`relative flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent-soft)] active:scale-95 ${
                isRecording
                  ? 'bg-[var(--bg-secondary)] text-[var(--accent)] border-2 border-[var(--accent)] shadow-2xl shadow-[var(--accent-soft)] ring-4 ring-[var(--accent)]/20'
                  : isTranscribing
                    ? 'bg-[var(--bg-secondary)] text-[var(--accent)] border-2 border-[var(--border-default)]'
                    : 'bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] shadow-2xl shadow-[var(--accent-soft)] hover:scale-105 ring-4 ring-[var(--accent)]/15'
              } ${disabled || isTranscribing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isRecording ? (
                <Square size={36} className="fill-[var(--accent)] text-[var(--accent)]" />
              ) : isTranscribing ? (
                <Loader2 size={40} className="animate-spin text-[var(--accent)]" />
              ) : (
                <Mic size={46} className="text-[var(--bg-primary)]" />
              )}
            </button>
          </div>

          {/* Status Label & Guidance */}
          <div className="mt-3 space-y-1 max-w-sm">
            <h3 className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
              {isRecording
                ? 'Listening… speak freely'
                : isTranscribing
                  ? 'Transcribing your voice with AI…'
                  : 'Tap to speak your dream'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isRecording
                ? 'Take your time. Tap the square button when you are finished.'
                : isTranscribing
                  ? `Transcribing in ${currentLangObj.nativeLabel}…`
                  : `Speak in ${currentLangObj.nativeLabel}. Review and archive your dream anytime.`}
            </p>
          </div>

          {/* Soundwave Visualization when Recording */}
          {isRecording && !reduceMotion && (
            <div className="flex items-center justify-center gap-1.5 h-8 mt-3">
              {[0.4, 0.7, 1.0, 0.8, 0.5, 0.9, 0.3].map((heightRatio, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-[var(--accent)]"
                  animate={{
                    height: [`${heightRatio * 8}px`, `${heightRatio * 26}px`, `${heightRatio * 10}px`],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.65 + i * 0.12,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          )}

          {/* Live Interim Transcript Stream Strip */}
          {isRecording && (
            <div className="w-full mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/70 p-3.5 text-xs text-left">
              <div className="flex items-start gap-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                  Live
                </span>
                <p className="italic text-[var(--text-primary)] font-serif text-sm leading-relaxed line-clamp-2">
                  {interimText ? `“${interimText}”` : `Listening in ${currentLangObj.nativeLabel}…`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error or Help Guidance */}
        {errorHint && !isRecording && (
          <div className="border-t border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 rounded-b-2xl space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">{errorHint}</p>
                {showHelpDetails && (
                  <div className="text-xs text-[var(--text-secondary)] space-y-1 pt-1 bg-[var(--bg-card)]/60 p-3 rounded-xl border border-[var(--border-default)]">
                    <p className="font-semibold text-[var(--text-primary)]">Quick Checklist to Enable Microphone:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>
                        <strong>Windows / Mac Settings:</strong> Open Settings → Privacy & Security → Microphone → Ensure &quot;Allow apps/browsers to access microphone&quot; is turned ON.
                      </li>
                      <li>
                        <strong>Browser Permissions:</strong> In your browser address bar next to the URL, check site settings to ensure Microphone is set to &quot;Allow&quot;.
                      </li>
                      <li>
                        <strong>Microphone Hardware:</strong> Verify your microphone or headset is plugged in, not muted, and selected as default.
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={startSession}
                className="px-3 py-1 rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] font-medium text-xs hover:bg-[var(--accent-hover)] transition-all cursor-pointer"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => setShowHelpDetails(!showHelpDetails)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline cursor-pointer"
              >
                {showHelpDetails ? 'Hide details' : 'How to fix microphone access'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Language Selection Modal - Rendered with fixed backdrop so it is NEVER clipped */}
      <AnimatePresence>
        {showLangModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-2xl p-6 space-y-5 text-[var(--text-primary)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">
                      Voice Dictation Language
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Choose your preferred language for speaking dreams
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLangModal(false)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search language (Hindi, Spanish, French, Marathi...)"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  autoFocus
                />
              </div>

              {/* Popular Languages Quick Picks */}
              {!langSearch && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                    Popular Languages
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {popularLanguages.map((code) => {
                      const item = SUPPORTED_LANGUAGES.find((l) => l.code === code);
                      if (!item) return null;
                      const isSelected = selectedLang === item.code;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => handleSelectLanguage(item.code)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-semibold shadow-xs'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--accent)] border border-[var(--border-default)]'
                          }`}
                        >
                          {item.nativeLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Languages Scrollable Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                  All Languages ({filteredLanguages.length})
                </span>
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {filteredLanguages.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSelectLanguage(lang.code)}
                        className={`w-full text-left p-3 rounded-xl text-sm transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-semibold shadow-xs'
                            : 'hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-default)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">{lang.nativeLabel}</span>
                          <span className={`text-xs ${isSelected ? 'opacity-90' : 'text-[var(--text-secondary)]'}`}>
                            {lang.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs ${isSelected ? 'opacity-90' : 'text-[var(--text-muted)]'}`}>
                            {lang.short}
                          </span>
                          {isSelected && <Check size={16} />}
                        </div>
                      </button>
                    );
                  })}
                  {filteredLanguages.length === 0 && (
                    <p className="text-sm text-[var(--text-muted)] text-center py-6">
                      No language found matching &ldquo;{langSearch}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

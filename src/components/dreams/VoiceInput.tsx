'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, AlertCircle, Loader2, Check, X, Search } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/lib/constants/languages';
import { mergeTranscripts, getBestSupportedAudioMimeType, getAudioFileExtension } from '@/lib/utils/voice';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'lg';
  label?: string;
}

export function VoiceInput({
  onTranscript,
  disabled,
  size = 'sm',
  label,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>(DEFAULT_LANGUAGE);
  const [showLangModal, setShowLangModal] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const actualMimeTypeRef = useRef<string>('audio/webm');
  const accumulatedTranscriptRef = useRef<string>('');
  const wakeLockRef = useRef<any>(null);
  const isExplicitlyStopped = useRef(true);
  const activeEngineRef = useRef<'speech' | 'recorder' | null>(null);
  const lastCommittedIndexRef = useRef<number>(-1);
  /** Set of normalized phrases already emitted — prevents re-emission across restarts */
  const emittedPhrasesRef = useRef<Set<string>>(new Set());
  const reduceMotion = useReducedMotion();

  // Load language preference
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
      if ('wakeLock' in navigator) {
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

  const transcribeAudioChunks = async (chunks: Blob[], langCode: string) => {
    if (chunks.length === 0) return;
    const finalMime = actualMimeTypeRef.current || chunks[0]?.type || 'audio/webm';
    const audioBlob = new Blob(chunks, { type: finalMime });
    if (audioBlob.size < 50) return;

    setIsTranscribing(true);
    setErrorHint(null);

    try {
      const ext = getAudioFileExtension(finalMime);
      const formData = new FormData();
      formData.append('file', audioBlob, `recording.${ext}`);
      formData.append('language', langCode);

      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Transcription failed');
      }

      const data = await res.json();
      if (data.transcript && data.transcript.trim()) {
        onTranscript(data.transcript.trim());
      }
    } catch (err) {
      console.warn('AI transcription error in VoiceInput:', err);
      setErrorHint('Could not complete audio transcription');
    } finally {
      setIsTranscribing(false);
    }
  };

  const startMediaRecorderFallback = async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('NO_MEDIA_DEVICES');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const supportedMime = getBestSupportedAudioMimeType();
      let recorder: MediaRecorder;
      try {
        recorder = supportedMime
          ? new MediaRecorder(stream, { mimeType: supportedMime })
          : new MediaRecorder(stream);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      actualMimeTypeRef.current = recorder.mimeType || supportedMime || 'audio/webm';

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      const isMp4OrAac =
        actualMimeTypeRef.current.includes('mp4') ||
        actualMimeTypeRef.current.includes('aac') ||
        actualMimeTypeRef.current.includes('m4a');

      if (isMp4OrAac) {
        recorder.start();
      } else {
        recorder.start(1000);
      }

      mediaRecorderRef.current = recorder;
      activeEngineRef.current = 'recorder';
      setIsRecording(true);
      await requestWakeLock();
      return true;
    } catch (err: any) {
      console.warn('MediaRecorder fallback in VoiceInput failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorHint('Microphone access denied. Please allow permissions.');
      } else {
        setErrorHint('Microphone unavailable. You can type directly.');
      }
      return false;
    }
  };

  const startRecording = async () => {
    if (disabled || isRecording || isTranscribing) return;
    setErrorHint(null);
    isExplicitlyStopped.current = false;
    accumulatedTranscriptRef.current = '';
    audioChunksRef.current = [];
    lastCommittedIndexRef.current = -1;
    emittedPhrasesRef.current.clear();

    const isMobile =
      typeof navigator !== 'undefined' &&
      (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (typeof window !== 'undefined' && window.innerWidth <= 768));

    // On mobile devices (Android / iOS): MediaRecorder is preferred
    if (isMobile) {
      const ok = await startMediaRecorderFallback();
      if (ok) return;
    }

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : undefined;

    // 1. Try real-time Web Speech API
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
            const resultItem = event.results[i];
            const text = resultItem[0]?.transcript || '';
            if (resultItem.isFinal) {
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
        };

        recognition.onerror = async (event: any) => {
          if (event.error === 'not-allowed' || event.error === 'network') {
            if (!mediaRecorderRef.current) {
              await startMediaRecorderFallback();
            }
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        activeEngineRef.current = 'speech';
        setIsRecording(true);
        await requestWakeLock();
        return;
      } catch (e) {
        console.warn('SpeechRecognition failed to start directly:', e);
      }
    }

    // 2. Fallback to MediaRecorder
    await startMediaRecorderFallback();
  };

  const stopRecording = async () => {
    isExplicitlyStopped.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    const wasRecordingWithRecorder = activeEngineRef.current === 'recorder';
    let chunksToProcess: Blob[] = [];

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const recorder = mediaRecorderRef.current;
      await new Promise<void>((resolve) => {
        const handleData = (event: BlobEvent) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        recorder.addEventListener('dataavailable', handleData);
        recorder.addEventListener(
          'stop',
          () => {
            setTimeout(() => {
              try {
                recorder.removeEventListener('dataavailable', handleData);
              } catch {
                // ignore
              }
              resolve();
            }, 60);
          },
          { once: true }
        );

        try {
          if (recorder.state === 'recording') {
            try {
              recorder.requestData();
            } catch {
              // ignore
            }
            recorder.stop();
          } else {
            resolve();
          }
        } catch {
          resolve();
        }
      });
      chunksToProcess = [...audioChunksRef.current];
      mediaRecorderRef.current = null;
    } else {
      chunksToProcess = [...audioChunksRef.current];
    }

    stopMediaStream();

    activeEngineRef.current = null;
    lastCommittedIndexRef.current = -1;
    emittedPhrasesRef.current.clear();
    setIsRecording(false);
    setInterimText('');
    releaseWakeLock();

    if ((wasRecordingWithRecorder || !accumulatedTranscriptRef.current.trim()) && chunksToProcess.length > 0) {
      await transcribeAudioChunks(chunksToProcess, selectedLang);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isLarge = size === 'lg';
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeLabel.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Primary Voice Trigger */}
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled || isTranscribing}
        className={`flex items-center justify-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 cursor-pointer ${
          isLarge
            ? 'min-h-12 rounded-2xl px-4 py-2.5 text-sm font-medium'
            : 'rounded-full p-2'
        } ${
          isRecording
            ? 'bg-[var(--bg-secondary)] text-[var(--accent)] border border-[var(--accent)]/40 shadow-sm'
            : isTranscribing
              ? 'bg-[var(--bg-secondary)] text-[var(--accent)] border border-[var(--border-default)]'
              : isLarge
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-secondary)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-default)]'
        } ${disabled || isTranscribing ? 'opacity-60 cursor-not-allowed' : ''}`}
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
        ) : isTranscribing ? (
          <Loader2 size={isLarge ? 20 : 18} className="animate-spin text-[var(--accent)]" />
        ) : (
          <Mic size={isLarge ? 20 : 18} className={isLarge ? 'text-[var(--accent)]' : ''} />
        )}
        {label && (
          <span className="text-xs sm:text-sm">
            {isRecording ? 'Listening…' : isTranscribing ? 'Transcribing…' : label}
          </span>
        )}
      </button>

      {/* Language Selector Button */}
      <button
        type="button"
        onClick={() => setShowLangModal(true)}
        disabled={isRecording || isTranscribing}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-2.5 py-1 text-xs text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors cursor-pointer"
        title="Dictation language (Hindi, Spanish, French, etc.)"
      >
        <Globe size={12} className="text-[var(--accent)]" />
        <span className="font-semibold">{currentLangObj.nativeLabel}</span>
      </button>

      {/* Live Interim Feedback */}
      {isRecording && (
        <div className="flex max-w-[14rem] items-center gap-2 text-xs text-[var(--text-secondary)] sm:max-w-xs">
          {!reduceMotion && (
            <motion.div
              className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
          <span className="truncate italic text-[var(--text-primary)]">
            {interimText ? `“${interimText}”` : `Listening in ${currentLangObj.nativeLabel}…`}
          </span>
        </div>
      )}

      {errorHint && !isRecording && (
        <span className="text-xs text-amber-600 dark:text-amber-300 font-medium">
          {errorHint}
        </span>
      )}

      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLangModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-2xl p-6 space-y-4 text-[var(--text-primary)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-[var(--accent)]" />
                  <h3 className="font-semibold text-base">Select Language</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLangModal(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search language..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {filteredLanguages.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`w-full text-left p-2.5 rounded-xl text-sm transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-semibold'
                          : 'hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <div>
                        <span>{lang.nativeLabel}</span>
                        <span className={`text-xs ml-2 ${isSelected ? 'opacity-90' : 'text-[var(--text-secondary)]'}`}>
                          ({lang.label})
                        </span>
                      </div>
                      {isSelected && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

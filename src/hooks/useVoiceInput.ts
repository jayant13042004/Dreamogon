'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { DEFAULT_LANGUAGE } from '@/lib/constants/languages';
import { mergeTranscripts } from '@/lib/utils/voice';

interface UseVoiceInputOptions {
  continuous?: boolean;
  lang?: string;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => Promise<void>;
  resetTranscript: () => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { continuous = true, lang = DEFAULT_LANGUAGE } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastCommittedIndexRef = useRef<number>(-1);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : undefined;

    setIsSupported(Boolean(SpeechRecognition || navigator?.mediaDevices?.getUserMedia));

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interim = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            if (i > lastCommittedIndexRef.current) {
              finalTranscript += result[0].transcript + ' ';
              lastCommittedIndexRef.current = i;
            }
          } else {
            interim += result[0].transcript;
          }
        }

        if (finalTranscript.trim()) {
          setTranscript((prev) => mergeTranscripts(prev, finalTranscript));
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning in useVoiceInput:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        lastCommittedIndexRef.current = -1;
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [continuous, lang]);

  const startListening = useCallback(async () => {
    if (isListening) return;

    // Explicitly request microphone permission to summon native prompt if needed
    if (navigator?.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        stream.getTracks().forEach((t) => t.stop());
      } catch (err) {
        console.warn('Microphone permission request error in useVoiceInput:', err);
        return;
      }
    }

    if (recognitionRef.current) {
      setTranscript('');
      setInterimTranscript('');
      lastCommittedIndexRef.current = -1;
      try {
        recognitionRef.current.lang = lang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  }, [isListening, lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [isListening]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}

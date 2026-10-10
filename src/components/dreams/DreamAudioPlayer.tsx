'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

import type { DreamSegment } from '@/types/dream';

interface DreamAudioPlayerProps {
  dreamId: string;
  durationSeconds?: number | null;
  mimeType?: string | null;
  transcriptionStatus?: 'none' | 'transcribing' | 'completed' | 'failed' | null;
  rawTranscript?: string | null;
  onTranscriptionComplete?: () => void;
  /** Phase 7: Optional list of all dream segments for multi-segment playback */
  segments?: DreamSegment[];
}

export function DreamAudioPlayer({
  dreamId,
  durationSeconds,
  mimeType = 'audio/webm',
  transcriptionStatus = 'none',
  rawTranscript,
  onTranscriptionComplete,
  segments = [],
}: DreamAudioPlayerProps) {
  // Filter voice segments with audio
  const voiceSegments = segments.filter((s) => s.audio_path || s.segment_type === 'voice');
  const hasMultipleSegments = voiceSegments.length > 1;

  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const activeSegment = voiceSegments[activeSegmentIndex] || null;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const effectiveDuration = activeSegment?.audio_duration_seconds || durationSeconds || 0;
  const [duration, setDuration] = useState<number>(effectiveDuration);
  const [isMuted, setIsMuted] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isRetryingTranscription, setIsRetryingTranscription] = useState(false);
  const [showRawTranscript, setShowRawTranscript] = useState(false);

  const effectiveTranscript = activeSegment ? activeSegment.raw_transcript : rawTranscript;
  const effectiveStatus = activeSegment ? activeSegment.transcription_status : transcriptionStatus;

  const audioSrc = activeSegment?.id
    ? `/api/dreams/${dreamId}/audio?segmentId=${activeSegment.id}`
    : `/api/dreams/${dreamId}/audio`;

  // Reset audio state when switching segments
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setLoadError(false);
    setDuration(activeSegment?.audio_duration_seconds || durationSeconds || 0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [activeSegmentIndex, activeSegment?.id, activeSegment?.audio_duration_seconds, durationSeconds]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setLoadError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setLoadError(false);
      }).catch((err) => {
        console.warn('[AudioPlayer] Playback error:', err);
        setLoadError(true);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleRetryTranscription = async () => {
    if (isRetryingTranscription) return;
    setIsRetryingTranscription(true);
    try {
      const res = await fetch(`/api/dreams/${dreamId}/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force: true,
          segmentId: activeSegment?.id || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to re-transcribe');
      }

      toast.success('Audio transcribed successfully.');
      onTranscriptionComplete?.();
    } catch (err: any) {
      toast.error(err?.message || 'Could not complete transcription.');
    } finally {
      setIsRetryingTranscription(false);
    }
  };

  if (loadError) {
    return (
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)]/50 p-4 text-xs text-[var(--text-muted)] flex items-center justify-between">
        <span>Audio recording unavailable or access expired.</span>
        <button
          type="button"
          onClick={() => {
            setLoadError(false);
            if (audioRef.current) {
              audioRef.current.load();
            }
          }}
          className="text-[var(--accent)] hover:underline cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const isTranscribing = effectiveStatus === 'transcribing' || isRetryingTranscription;
  const isFailed = effectiveStatus === 'failed';
  const isNone = effectiveStatus === 'none';

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-xs space-y-4">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            {hasMultipleSegments ? `Voice Recording · Part ${activeSegmentIndex + 1} of ${voiceSegments.length}` : 'Original Voice Recording'}
          </span>
        </div>
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Multi-Segment Switcher Pills */}
      {hasMultipleSegments && (
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          <span className="text-[11px] font-mono text-[var(--text-muted)] mr-1">Voice segments:</span>
          {voiceSegments.map((seg, idx) => (
            <button
              key={seg.id || idx}
              type="button"
              onClick={() => setActiveSegmentIndex(idx)}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-all cursor-pointer ${
                activeSegmentIndex === idx
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-semibold shadow-xs'
                  : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Part {idx + 1}
              {seg.audio_duration_seconds ? ` (${formatTime(seg.audio_duration_seconds)})` : ''}
            </button>
          ))}
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="h-10 w-10 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] flex items-center justify-center hover:bg-[var(--accent-hover)] transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
          aria-label={isPlaying ? 'Pause voice recording' : 'Play voice recording'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        {/* Restart Button */}
        <button
          type="button"
          onClick={restartAudio}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer shrink-0"
          title="Restart from beginning"
          aria-label="Restart audio"
        >
          <RotateCcw size={15} />
        </button>

        {/* Scrub Bar */}
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
            aria-label="Audio progress slider"
          />
        </div>

        {/* Mute Toggle */}
        <button
          type="button"
          onClick={toggleMute}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer shrink-0"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Transcription Status & Action Bar */}
      {(isTranscribing || isFailed || isNone) && (
        <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          {isTranscribing ? (
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <Loader2 size={13} className="animate-spin shrink-0" />
              <span>Transcribing audio in background…</span>
            </div>
          ) : isFailed ? (
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle size={13} className="shrink-0" />
              <span>Transcription paused. Your voice recording is safely preserved.</span>
            </div>
          ) : (
            <div className="text-[var(--text-muted)]">
              Voice recording preserved safely in your private archive.
            </div>
          )}

          {!isTranscribing && (
            <button
              type="button"
              onClick={handleRetryTranscription}
              disabled={isRetryingTranscription}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] text-[var(--text-primary)] font-medium text-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Sparkles size={12} className="text-[var(--accent)]" />
              <span>{isFailed ? 'Retry transcription' : 'Transcribe with AI'}</span>
            </button>
          )}
        </div>
      )}

      {/* Verbatim Raw Transcript Accordion */}
      {effectiveTranscript && effectiveTranscript.trim().length > 0 && (
        <div className="pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setShowRawTranscript((prev) => !prev)}
            className="flex items-center justify-between w-full text-left text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <FileText size={12} />
              <span>
                {hasMultipleSegments ? `View Part ${activeSegmentIndex + 1} speech transcript` : 'View verbatim speech transcript'}
              </span>
            </div>
            {showRawTranscript ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showRawTranscript && (
            <div className="mt-2.5 p-3 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-mono leading-relaxed whitespace-pre-wrap">
              {effectiveTranscript}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

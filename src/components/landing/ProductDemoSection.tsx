'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, Compass, Volume2, VolumeX, Maximize2, Sparkles, Mic, Brain, Globe } from 'lucide-react';
import { ExploreDreamModal } from '@/components/layout/ExploreDreamModal';

interface ProductDemoSectionProps {
  /**
   * Optional custom video URL. If null or file not found, the graceful poster & interactive preview are displayed.
   * Drop a 30-60s video into /public/subconsciouslog-demo.mp4 to immediately activate live playback.
   */
  videoSrc?: string;
}

const DEMO_CHAPTERS = [
  { time: '0:00', label: 'Dawn Capture', icon: Mic, desc: 'Speaking fragments while lying in bed' },
  { time: '0:15', label: 'Quiet Reflection', icon: Brain, desc: 'Socratic prompts, never clinical labels' },
  { time: '0:32', label: 'Pattern Detection', icon: Sparkles, desc: 'Recurring motifs across seasons' },
  { time: '0:48', label: 'Dream World', icon: Globe, desc: 'Spatial constellation of memories' },
];

export function ProductDemoSection({ videoSrc = '/subconsciouslog-demo.mp4' }: ProductDemoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayToggle = () => {
    if (hasVideoError || !videoRef.current) {
      setShowSampleModal(true);
      return;
    }

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setHasVideoError(true);
          setShowSampleModal(true);
        });
    }
  };

  return (
    <section id="demo" className="py-24 md:py-32 px-6 md:px-10 border-t border-[var(--border-default)] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[var(--accent)]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Product Walkthrough
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            See Subconscious Log in action.
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            From the first raw murmur at 6:00 AM to a living constellation of subconscious motifs. Watch how Subconscious Log preserves what waking life erases.
          </p>
        </div>

        {/* Video Player Container */}
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden border border-[var(--border-default)] bg-[#0A0908] shadow-2xl group">
            {/* Browser / Frame Top Bar */}
            <div className="px-5 py-3.5 bg-[var(--bg-card)]/80 border-b border-[var(--border-default)] flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-default)] opacity-60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-default)] opacity-60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-default)] opacity-60" />
                <span className="ml-3 text-[11px] font-mono text-[var(--text-muted)] tracking-wider">
                  subconsciouslog.com · product demonstration
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)]">
                  45s Walkthrough
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            {/* Video or Poster Area */}
            <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden bg-[#0C0B0A]">
              {/* Optional HTML5 video element */}
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                muted={isMuted}
                onError={() => setHasVideoError(true)}
                onEnded={() => setIsPlaying(false)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  isPlaying && !hasVideoError ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              />

              {/* Poster Art & Atmosphere (active when paused or video not yet placed) */}
              {(!isPlaying || hasVideoError) && (
                <div className="absolute inset-0 select-none">
                  {/* Atmospheric Deep Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#080706] via-[#141210] to-[#1C1A17]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(200,184,158,0.12),transparent_70%)]" />

                  {/* High-fidelity Mockup Preview in Poster */}
                  <div className="absolute inset-6 sm:inset-10 md:inset-14 rounded-2xl border border-[#C8B89E]/15 bg-[#12110F]/85 p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-md">
                    <div className="flex items-center justify-between border-b border-[#C8B89E]/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
                          <Compass size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent)]">Morning Archive</p>
                          <p className="text-sm font-display font-medium text-[#E8DFD3]">The House by the Frozen Sea</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#A89F91] border border-[#C8B89E]/20 px-2.5 py-1 rounded-full">
                        Voice Memo · 06:14 AM
                      </span>
                    </div>

                    <div className="space-y-3 py-4 max-w-xl">
                      <p className="text-xs sm:text-sm text-[#DDD4C7] font-light leading-relaxed italic">
                        &ldquo;I woke up with the smell of cedar wood. The house had no western wall—just wooden pilings looking straight onto black water that didn&rsquo;t freeze, even though snow was falling on the floorboards...&rdquo;
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#C8B89E]/10 text-[#C8B89E] border border-[#C8B89E]/20">
                          Lucidity: 70%
                        </span>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#C8B89E]/10 text-[#C8B89E] border border-[#C8B89E]/20">
                          Tone: Serene Melancholy
                        </span>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#C8B89E]/10 text-[#C8B89E] border border-[#C8B89E]/20">
                          Motif: Threshold & Sea
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#C8B89E]/10 pt-3 text-[11px] font-mono text-[#8C8377]">
                      <span>AI Reflection: &ldquo;What kept the water from freezing?&rdquo;</span>
                      <span className="text-[var(--accent)]">Illustrative Scenario</span>
                    </div>
                  </div>

                  {/* Dark vignette overlay */}
                  <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                </div>
              )}

              {/* Play Button Trigger */}
              <div className="relative z-30 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  aria-label={isPlaying ? 'Pause product demo' : 'Launch interactive walkthrough'}
                  className="group/play flex items-center justify-center relative"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover/play:scale-110 group-hover/play:bg-[var(--accent-hover)]">
                    {isPlaying && !hasVideoError ? (
                      <Pause size={24} className="fill-current" />
                    ) : (
                      <Play size={24} className="fill-current ml-1" />
                    )}
                  </div>
                  {/* Ripple ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/40 animate-ping pointer-events-none" />
                </button>
                <span className="text-[11px] font-mono text-white/80 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider select-none pointer-events-none">
                  Launch Interactive Walkthrough
                </span>
              </div>

              {/* In-Video Controls Bar (when playing) */}
              {isPlaying && !hasVideoError && (
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between z-30">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 text-white/80 hover:text-white rounded-lg transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <span className="text-xs font-mono text-white/70">Subconscious Log Product Walkthrough</span>
                  <button
                    onClick={() => videoRef.current?.requestFullscreen()}
                    className="p-2 text-white/80 hover:text-white rounded-lg transition-colors"
                    aria-label="Fullscreen"
                  >
                    <Maximize2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chapters & Timestamp Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {DEMO_CHAPTERS.map((ch, idx) => {
              const Icon = ch.icon;
              const isCurrent = activeChapter === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveChapter(idx);
                    if (videoRef.current && !hasVideoError) {
                      const times = [0, 15, 32, 48];
                      videoRef.current.currentTime = times[idx] || 0;
                      if (!isPlaying) {
                        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                      }
                    } else {
                      setShowSampleModal(true);
                    }
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                    isCurrent
                      ? 'bg-[var(--bg-card)] border-[var(--accent)] shadow-md'
                      : 'bg-[var(--bg-card)]/50 border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={isCurrent ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
                      <span className="text-xs font-medium text-[var(--text-primary)]">{ch.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--accent)]">{ch.time}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] font-light leading-relaxed line-clamp-2">
                    {ch.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Sample Dream Modal (Fallback & Interactive Experience) */}
      <ExploreDreamModal isOpen={showSampleModal} onClose={() => setShowSampleModal(false)} />
    </section>
  );
}

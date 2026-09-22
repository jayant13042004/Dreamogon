'use client';

import React, { useEffect, useRef, useState } from 'react';

export function CinematicDreamHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle system for mist and subtle rain
    const drops: { x: number; y: number; length: number; speed: number; opacity: number }[] = [];
    const dropCount = 45;

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 600),
        length: Math.random() * 16 + 8,
        speed: Math.random() * 3 + 2,
        opacity: Math.random() * 0.15 + 0.05,
      });
    }

    // Floating subtle particles (luminescent dust)
    const motes: { x: number; y: number; r: number; dx: number; dy: number; alpha: number }[] = [];
    const moteCount = 20;

    for (let i = 0; i < moteCount; i++) {
      motes.push({
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 600),
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.25,
        dy: -Math.random() * 0.3 - 0.1,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw rain streaks
      ctx.lineWidth = 1;
      for (let i = 0; i < dropCount; i++) {
        const d = drops[i];
        d.y += d.speed;
        d.x += 0.4; // slight slant

        if (d.y > height) {
          d.y = -20;
          d.x = Math.random() * width;
        }

        ctx.strokeStyle = `rgba(225, 218, 205, ${d.opacity})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + 1.5, d.y + d.length);
        ctx.stroke();
      }

      // 2. Draw drifting motes (subconscious light)
      for (let i = 0; i < moteCount; i++) {
        const m = motes[i];
        m.x += m.dx;
        m.y += m.dy;

        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        const pulse = 0.5 + 0.5 * Math.sin(time * 2 + i);
        ctx.fillStyle = `rgba(200, 184, 158, ${m.alpha * pulse})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[460px] md:h-[540px] rounded-3xl overflow-hidden border border-[var(--border-default)] bg-[#0C0B0A] shadow-2xl select-none"
    >
      {/* 1. Deep atmospheric sky & horizon gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090807] via-[#141210] to-[#1C1916]" />

      {/* 2. Surreal Horizon Glow / Mist */}
      <div className="absolute top-[48%] inset-x-0 h-40 bg-gradient-to-t from-[#C8B89E]/10 via-[#8A7968]/5 to-transparent blur-2xl pointer-events-none" />

      {/* 3. Distant Monolithic Architecture Silhouette (Subtle Surrealism) */}
      <svg
        className="absolute bottom-[28%] inset-x-0 w-full h-44 text-[#161412] pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1000 200"
        fill="currentColor"
      >
        {/* Distant landscape/structures */}
        <path d="M0,180 L80,140 L160,165 L250,110 L340,150 L420,130 L520,170 L600,105 L680,145 L760,120 L860,160 L940,135 L1000,175 L1000,200 L0,200 Z" opacity="0.4" fill="#1C1A17" />
        {/* Midground minimalist monuments */}
        <rect x="220" y="80" width="18" height="120" opacity="0.5" fill="#191714" rx="2" />
        <rect x="242" y="100" width="12" height="100" opacity="0.4" fill="#171512" rx="1" />
        <rect x="740" y="70" width="22" height="130" opacity="0.5" fill="#191714" rx="2" />
        <rect x="766" y="95" width="14" height="105" opacity="0.4" fill="#171512" rx="1" />
        {/* Subtle horizon line */}
        <line x1="0" y1="180" x2="1000" y2="180" stroke="#C8B89E" strokeOpacity="0.15" strokeWidth="0.8" />
      </svg>

      {/* 4. Wet Asphalt Road Stretching to Horizon (Perspective) */}
      <div className="absolute bottom-0 inset-x-0 h-[42%] overflow-hidden">
        {/* Road surface */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B] via-[#12110F] to-[#181613]" />

        {/* Perspective Road Trapeze */}
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 800 300"
        >
          <defs>
            <linearGradient id="roadShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C8B89E" stopOpacity="0.25" />
              <stop offset="35%" stopColor="#8A7968" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#25221D" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="centerLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C8B89E" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#C8B89E" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Road body */}
          <polygon points="360,0 440,0 680,300 120,300" fill="#0C0B0A" />

          {/* Wet asphalt reflection sheen */}
          <polygon points="380,0 420,0 520,300 280,300" fill="url(#roadShine)" />

          {/* Dashed Road Centerline (receding perspective) */}
          <line x1="400" y1="10" x2="400" y2="28" stroke="url(#centerLineGrad)" strokeWidth="1.2" />
          <line x1="400" y1="42" x2="400" y2="70" stroke="url(#centerLineGrad)" strokeWidth="1.8" />
          <line x1="400" y1="92" x2="400" y2="135" stroke="url(#centerLineGrad)" strokeWidth="2.4" />
          <line x1="400" y1="165" x2="400" y2="230" stroke="url(#centerLineGrad)" strokeWidth="3.2" />
          <line x1="400" y1="265" x2="400" y2="300" stroke="url(#centerLineGrad)" strokeWidth="4.0" />

          {/* Soft puddle reflection ripples */}
          <ellipse cx="365" cy="180" rx="35" ry="4" fill="#C8B89E" fillOpacity="0.12" />
          <ellipse cx="430" cy="220" rx="48" ry="6" fill="#C8B89E" fillOpacity="0.1" />
        </svg>

        {/* Ground fog across bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 5. Rain and Motes Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* 6. Cinematic Vignette & Ambient Framing */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A]/90 via-transparent to-[#0C0B0A]/40 pointer-events-none z-20" />
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] pointer-events-none z-20" />

      {/* 7. Quiet Editorial Caption in corner */}
      <div className="absolute bottom-6 left-6 md:left-8 z-30 max-w-xs pointer-events-none">
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)] mb-1">
          Illustrative Memory Scene · 04:18 AM
        </p>
        <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
          &ldquo;I was driving alone on a wet road at dusk. The water reflected the horizon before the road ended.&rdquo;
        </p>
      </div>

      {/* 8. Memory Coordinate / Status Indicator */}
      <div className="absolute top-6 right-6 md:right-8 z-30 pointer-events-none flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        <span className="text-[10px] font-mono tracking-[0.2em] text-[var(--text-muted)] uppercase">
          Illustrative Canvas
        </span>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DreamArtifact, EntityType } from '@/types/dream';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface DreamWorldCanvasProps {
  artifacts: DreamArtifact[];
  onSelectArtifact?: (artifact: DreamArtifact | null) => void;
  highlightedArtifactId?: string | null;
}

export function DreamWorldCanvas({
  artifacts,
  onSelectArtifact,
  highlightedArtifactId
}: DreamWorldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<DreamArtifact | null>(null);

  // Camera State
  const cameraRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    zoom: 1,
    targetZoom: 1,
    isDragging: false,
    startX: 0,
    startY: 0
  });

  const mousePosRef = useRef({ x: 0, y: 0, active: false });

  // Focus on selected artifact
  const focusOnNode = useCallback((node: DreamArtifact) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const targetX = -(node.position_x * rect.width / 100);
    const targetY = -(node.position_y * rect.height / 100);
    cameraRef.current.targetX = targetX;
    cameraRef.current.targetY = targetY;
    cameraRef.current.targetZoom = 1.35;
  }, []);

  const resetCamera = useCallback(() => {
    cameraRef.current.targetX = 0;
    cameraRef.current.targetY = 0;
    cameraRef.current.targetZoom = 1;
  }, []);

  const adjustZoom = useCallback((delta: number) => {
    cameraRef.current.targetZoom = Math.max(0.65, Math.min(2.2, cameraRef.current.targetZoom + delta));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animId: number;
    let time = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    // Map artifacts into rich spatial visual nodes
    const getNodes = () => {
      return artifacts.map(a => {
        // Evolution sizing based on appearance count
        const count = a.appearance_count || 1;
        const baseSize = count === 1 ? 16 : count === 2 ? 24 : Math.min(42, 28 + count * 3);
        
        return {
          ...a,
          worldX: a.position_x * width / 100,
          worldY: a.position_y * height / 100,
          z: a.position_z || 0,
          size: baseSize,
          baseSize,
          pulseSpeed: 0.02 + Math.random() * 0.015,
          phase: Math.random() * Math.PI * 2,
          colorHue: a.artifact_type === 'emotion' ? '185, 165, 140' :
                    a.artifact_type === 'place' ? '120, 150, 165' :
                    a.artifact_type === 'person' ? '170, 160, 150' :
                    a.artifact_type === 'animal' ? '190, 165, 130' :
                    a.artifact_type === 'theme' ? '160, 155, 145' :
                    a.artifact_type === 'activity' ? '175, 170, 155' : '180, 170, 155'
        };
      });
    };

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Soft floating motes — fewer, warmer (not starfield)
    const ambientDust = Array.from({ length: prefersReducedMotion ? 12 : 28 }, () => ({
      x: (Math.random() - 0.5) * width * 1.8,
      y: (Math.random() - 0.5) * height * 1.8,
      z: (Math.random() - 0.5) * 20,
      size: Math.random() * 1.6 + 0.5,
      speed: Math.random() * 0.004 + 0.002,
      phase: Math.random() * Math.PI * 2
    }));

    /** Subtle silhouette by entity meaning — not RPG characters */
    const drawEntitySilhouette = (
      type: EntityType | string,
      name: string,
      size: number,
      hue: string,
      hovered: boolean
    ) => {
      const fill = `rgba(${hue}, ${hovered ? 0.88 : 0.68})`;
      const stroke = 'rgba(242, 237, 230, 0.55)';
      const n = name.toLowerCase();
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(0.8, size * 0.06);

      const isWater =
        type === 'place' &&
        /ocean|sea|lake|river|water|rain|beach|pool/.test(n);
      const isHouse =
        type === 'place' &&
        /house|home|room|apartment|building|door|childhood/.test(n);
      const isCar =
        type === 'object' && /car|vehicle|truck|bus|taxi|drive/.test(n);
      const isRoad =
        type === 'place' || type === 'activity'
          ? /road|path|street|highway|travel|journey/.test(n)
          : false;
      const isFlying =
        type === 'activity' || type === 'theme'
          ? /fly|flying|float|sky|air/.test(n)
          : /fly|flying/.test(n);

      if (isWater) {
        ctx.beginPath();
        ctx.moveTo(-size, size * 0.2);
        ctx.quadraticCurveTo(-size * 0.4, -size * 0.35, 0, size * 0.1);
        ctx.quadraticCurveTo(size * 0.4, size * 0.55, size, size * 0.15);
        ctx.lineTo(size, size * 0.55);
        ctx.quadraticCurveTo(0, size * 0.85, -size, size * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        return;
      }

      if (isHouse) {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.9, -size * 0.25);
        ctx.lineTo(size * 0.9, size * 0.85);
        ctx.lineTo(-size * 0.9, size * 0.85);
        ctx.lineTo(-size * 0.9, -size * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(-size * 0.18, size * 0.25, size * 0.36, size * 0.6);
        ctx.stroke();
        return;
      }

      if (isCar) {
        ctx.beginPath();
        ctx.roundRect(-size, -size * 0.25, size * 2, size * 0.7, size * 0.15);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-size * 0.55, -size * 0.25);
        ctx.lineTo(-size * 0.2, -size * 0.7);
        ctx.lineTo(size * 0.45, -size * 0.7);
        ctx.lineTo(size * 0.75, -size * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-size * 0.55, size * 0.45, size * 0.22, 0, Math.PI * 2);
        ctx.arc(size * 0.55, size * 0.45, size * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      if (isRoad) {
        ctx.beginPath();
        ctx.moveTo(-size * 0.35, size);
        ctx.lineTo(-size * 0.1, -size);
        ctx.lineTo(size * 0.1, -size);
        ctx.lineTo(size * 0.55, size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([size * 0.2, size * 0.15]);
        ctx.beginPath();
        ctx.moveTo(0, size * 0.85);
        ctx.lineTo(0, -size * 0.85);
        ctx.strokeStyle = 'rgba(242, 237, 230, 0.35)';
        ctx.stroke();
        ctx.setLineDash([]);
        return;
      }

      if (isFlying) {
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.1, size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -size * 0.55, size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hue}, 0.35)`;
        ctx.fill();
        return;
      }

      if (type === 'person') {
        // Distant silhouette — not a character avatar
        ctx.beginPath();
        ctx.arc(0, -size * 0.45, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-size * 0.55, size * 0.85);
        ctx.quadraticCurveTo(0, size * 0.1, size * 0.55, size * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        return;
      }

      if (type === 'place') {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-size * 0.7, size * 0.15);
        ctx.quadraticCurveTo(0, -size * 0.4, size * 0.7, size * 0.15);
        ctx.stroke();
        return;
      }

      if (type === 'object') {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.75, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.75, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        return;
      }

      if (type === 'emotion') {
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        return;
      }

      // Default soft orb
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };

    // Mouse & Touch events
    const onMouseDown = (e: MouseEvent) => {
      cameraRef.current.isDragging = true;
      cameraRef.current.startX = e.clientX - cameraRef.current.x;
      cameraRef.current.startY = e.clientY - cameraRef.current.y;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      mousePosRef.current = { x: mouseX, y: mouseY, active: true };

      if (cameraRef.current.isDragging) {
        cameraRef.current.targetX = e.clientX - cameraRef.current.startX;
        cameraRef.current.targetY = e.clientY - cameraRef.current.startY;
      }

      // Hit detection in transformed space
      const cx = width / 2 + cameraRef.current.x;
      const cy = height / 2 + cameraRef.current.y;
      const currentZoom = cameraRef.current.zoom;

      const nodes = getNodes();
      let hovered: DreamArtifact | null = null;

      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const screenX = cx + n.worldX * currentZoom;
        const screenY = cy + n.worldY * currentZoom;
        const hitRadius = (n.size + 10) * currentZoom;

        if (Math.hypot(mouseX - screenX, mouseY - screenY) < hitRadius) {
          hovered = n;
          break;
        }
      }

      setHoveredNode(hovered);
    };

    const onMouseUp = () => {
      cameraRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.12 : -0.12;
      cameraRef.current.targetZoom = Math.max(0.65, Math.min(2.2, cameraRef.current.targetZoom + delta));
    };

    const onClick = () => {
      if (hoveredNode) {
        focusOnNode(hoveredNode);
        if (onSelectArtifact) onSelectArtifact(hoveredNode);
      } else {
        if (onSelectArtifact) onSelectArtifact(null);
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);

    // Render loop
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth camera interpolation
      cameraRef.current.x += (cameraRef.current.targetX - cameraRef.current.x) * 0.08;
      cameraRef.current.y += (cameraRef.current.targetY - cameraRef.current.y) * 0.08;
      cameraRef.current.zoom += (cameraRef.current.targetZoom - cameraRef.current.zoom) * 0.08;

      const camX = cameraRef.current.x;
      const camY = cameraRef.current.y;
      const zoom = cameraRef.current.zoom;
      const cx = width / 2 + camX;
      const cy = height / 2 + camY;

      // 1. Soft regional atmosphere (memory landscape — not game zones)
      const regions = [
        { name: 'Memory', x: -22, y: -12, color: 'rgba(120, 150, 165, 0.06)' },
        { name: 'Horizon', x: 22, y: -12, color: 'rgba(190, 165, 130, 0.05)' },
        { name: 'Quiet', x: -18, y: 18, color: 'rgba(170, 160, 150, 0.05)' },
        { name: 'Depth', x: 22, y: 18, color: 'rgba(100, 120, 130, 0.06)' }
      ];

      regions.forEach(r => {
        const regX = cx + (r.x * width / 100) * zoom;
        const regY = cy + (r.y * height / 100) * zoom;
        const regRadius = 200 * zoom;

        const grad = ctx.createRadialGradient(regX, regY, 0, regX, regY, regRadius);
        grad.addColorStop(0, r.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(regX, regY, regRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.font = `${Math.round(11 * zoom)}px 'Cormorant Garamond', Georgia, serif`;
        ctx.fillStyle = 'rgba(242, 237, 230, 0.18)';
        ctx.textAlign = 'center';
        ctx.fillText(r.name, regX, regY - regRadius * 0.55);
        ctx.restore();
      });

      // 2. Soft motes
      ambientDust.forEach(d => {
        if (!prefersReducedMotion) d.phase += d.speed;
        const dustX = cx + (d.x + Math.sin(d.phase) * 10) * zoom;
        const dustY = cy + (d.y + Math.cos(d.phase) * 10) * zoom;
        const alpha = (Math.sin(d.phase) * 0.5 + 0.5) * 0.28;

        ctx.fillStyle = `rgba(201, 184, 160, ${alpha})`;
        ctx.beginPath();
        ctx.arc(dustX, dustY, d.size * zoom, 0, Math.PI * 2);
        ctx.fill();
      });

      const nodes = getNodes();

      // 3. Quiet connecting paths (no energy photons)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const p1X = cx + n1.worldX * zoom;
          const p1Y = cy + n1.worldY * zoom;
          const p2X = cx + n2.worldX * zoom;
          const p2Y = cy + n2.worldY * zoom;

          const dist = Math.hypot(p1X - p2X, p1Y - p2Y);

          if (dist < 260 * zoom) {
            const alpha = Math.max(0.03, (260 * zoom - dist) / (260 * zoom) * 0.16);
            ctx.beginPath();
            ctx.moveTo(p1X, p1Y);
            ctx.lineTo(p2X, p2Y);
            ctx.strokeStyle = `rgba(201, 184, 160, ${alpha})`;
            ctx.lineWidth = 1 * zoom;
            ctx.stroke();
          }
        }
      }

      // 4. Entity silhouettes from dream meaning
      nodes.sort((a, b) => b.z - a.z);

      nodes.forEach(n => {
        const posX = cx + n.worldX * zoom;
        const posY = cy + n.worldY * zoom;
        const isHovered = hoveredNode?.id === n.id;
        const isHighlighted = highlightedArtifactId === n.id;

        const pulse = prefersReducedMotion
          ? 1
          : 1 + Math.sin(time * n.pulseSpeed * 60 + n.phase) * 0.05;
        const curSize = (isHovered || isHighlighted ? n.size * 1.2 : n.size) * pulse * zoom;

        ctx.save();
        ctx.translate(posX, posY);

        const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, curSize * 2);
        auraGrad.addColorStop(0, `rgba(${n.colorHue}, ${isHovered ? 0.35 : 0.14})`);
        auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, curSize * 2, 0, Math.PI * 2);
        ctx.fill();

        drawEntitySilhouette(n.artifact_type, n.name, curSize, n.colorHue, isHovered || isHighlighted);

        if (n.appearance_count > 1) {
          ctx.beginPath();
          ctx.arc(0, 0, curSize * 1.45, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(242, 237, 230, 0.28)';
          ctx.setLineDash([3 * zoom, 4 * zoom]);
          ctx.lineWidth = 1 * zoom;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();
        ctx.save();
        ctx.font = `${Math.round((isHovered ? 13 : 11) * zoom)}px 'Source Sans 3', system-ui, sans-serif`;
        ctx.fillStyle = isHovered ? '#F2EDE6' : 'rgba(242, 237, 230, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(n.name, posX, posY + curSize + 14 * zoom);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
    };
  }, [artifacts, hoveredNode, focusOnNode, onSelectArtifact, highlightedArtifactId]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-140px)] min-h-[580px] bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--border-default)] select-none cursor-grab active:cursor-grabbing"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* World HUD Controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 z-30 pointer-events-auto">
        <button
          onClick={() => adjustZoom(0.2)}
          className="p-2.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--accent-soft)] text-[var(--text-primary)] border border-[var(--border-default)] transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => adjustZoom(-0.2)}
          className="p-2.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--accent-soft)] text-[var(--text-primary)] border border-[var(--border-default)] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={resetCamera}
          className="p-2.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--accent-soft)] text-[var(--text-primary)] border border-[var(--border-default)] transition-colors"
          title="Return to Center"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Navigation Hint */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)]/90 border border-[var(--border-default)] text-[var(--text-secondary)] text-xs font-medium flex items-center gap-2">
          <Compass size={12} className="text-[var(--accent)]" />
          <span>Drag to explore · Scroll to zoom · Click to inspect</span>
        </div>
      </div>

      {/* Hover Tooltip Overlay */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            key={`tooltip-artifact-${hoveredNode.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border border-[var(--border-default)] px-5 py-3 rounded-xl shadow-lg pointer-events-none flex flex-col items-center z-40"
          >
            <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] mb-1">
              {hoveredNode.artifact_type}
            </span>
            <span className="text-base font-display font-semibold text-[var(--text-primary)]">
              {hoveredNode.name}
            </span>
            <span className="text-xs text-[var(--text-muted)] mt-0.5">
              In {hoveredNode.appearance_count} dream{hoveredNode.appearance_count > 1 ? 's' : ''} · Click to explore
            </span>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

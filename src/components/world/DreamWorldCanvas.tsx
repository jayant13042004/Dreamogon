'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DreamArtifact, EntityType, TemporalStatus } from '@/types/dream';
import { DreamArtifactConnection } from '@/lib/dreamWorld';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ZoomIn, ZoomOut, Maximize2, Sparkles } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';

interface DreamWorldCanvasProps {
  artifacts: DreamArtifact[];
  connections?: DreamArtifactConnection[];
  onSelectArtifact?: (artifact: DreamArtifact | null) => void;
  highlightedArtifactId?: string | null;
  temporalFilter?: string;
  onBackToOverview?: () => void;
}

export function DreamWorldCanvas({
  artifacts,
  connections = [],
  onSelectArtifact,
  highlightedArtifactId,
  temporalFilter = 'all',
  onBackToOverview
}: DreamWorldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<DreamArtifact | null>(null);
  const [densityMode, setDensityMode] = useState<'recurring' | 'all'>('recurring');
  const { resolvedTheme } = useTheme();
  const isDarkRef = useRef(resolvedTheme === 'dark');

  useEffect(() => {
    isDarkRef.current = resolvedTheme === 'dark';
  }, [resolvedTheme]);

  const recurringCount = artifacts.filter(
    (a) => a.appearance_count > 1 || a.temporal_status === 'anchor'
  ).length;

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

    // Map artifacts into rich spatial visual nodes with refined palettes and temporal states
    const getNodes = () => {
      const isDark = isDarkRef.current;

      return artifacts.map((a) => {
        const count = a.appearance_count || 1;
        const isSingleton = count === 1 && a.temporal_status !== 'anchor';
        const isHighlighted = a.id === highlightedArtifactId;

        // Scalability: in recurring mode, singletons are quiet points of light; recurring are full landmarks
        const baseSize =
          densityMode === 'recurring' && isSingleton && !isHighlighted
            ? 7
            : count === 1
              ? 14
              : count === 2
                ? 22
                : count < 5
                  ? 30
                  : Math.min(44, 32 + count * 2);

        const temporal = a.temporal_status || 'recurring';

        const colorHue = isDark
          ? (a.artifact_type === 'emotion'
              ? '210, 130, 125'
              : a.artifact_type === 'place'
                ? '120, 165, 185'
                : a.artifact_type === 'person'
                  ? '195, 155, 130'
                  : a.artifact_type === 'animal'
                    ? '200, 165, 115'
                    : a.artifact_type === 'theme'
                      ? '170, 140, 195'
                      : a.artifact_type === 'activity'
                        ? '175, 175, 170'
                        : '205, 175, 125')
          : (a.artifact_type === 'emotion'
              ? '185, 80, 75'
              : a.artifact_type === 'place'
                ? '55, 115, 140'
                : a.artifact_type === 'person'
                  ? '150, 100, 65'
                  : a.artifact_type === 'animal'
                    ? '155, 115, 45'
                    : a.artifact_type === 'theme'
                      ? '115, 80, 150'
                      : a.artifact_type === 'activity'
                        ? '90, 95, 100'
                        : '145, 110, 50');

        return {
          ...a,
          isSingleton,
          worldX: (a.position_x * width) / 100,
          worldY: (a.position_y * height) / 100,
          z: a.position_z || 0,
          size: baseSize,
          baseSize,
          temporalStatus: temporal,
          connectedCount: (a.connected_artifact_ids || []).length,
          pulseSpeed: temporal === 'emerging' ? 0.035 : 0.02 + Math.random() * 0.012,
          phase: Math.random() * Math.PI * 2,
          colorHue,
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
      hovered: boolean,
      isDark: boolean
    ) => {
      const fillAlpha = isDark ? (hovered ? 0.90 : 0.72) : (hovered ? 0.95 : 0.82);
      const stroke = isDark ? 'rgba(242, 237, 230, 0.60)' : 'rgba(26, 24, 20, 0.65)';
      const fill = `rgba(${hue}, ${fillAlpha})`;
      const n = name.toLowerCase();
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(0.9, size * (isDark ? 0.06 : 0.08));

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
        ctx.strokeStyle = isDark ? 'rgba(242, 237, 230, 0.35)' : 'rgba(26, 24, 20, 0.50)';
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
        ctx.fillStyle = isDark ? `rgba(${hue}, 0.35)` : `rgba(${hue}, 0.50)`;
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
      const isDark = isDarkRef.current;

      // Smooth camera interpolation
      cameraRef.current.x += (cameraRef.current.targetX - cameraRef.current.x) * 0.08;
      cameraRef.current.y += (cameraRef.current.targetY - cameraRef.current.y) * 0.08;
      cameraRef.current.zoom += (cameraRef.current.targetZoom - cameraRef.current.zoom) * 0.08;

      const camX = cameraRef.current.x;
      const camY = cameraRef.current.y;
      const zoom = cameraRef.current.zoom;
      const cx = width / 2 + camX;
      const cy = height / 2 + camY;

      if (!isDark) {
        // High quality warm parchment paper backdrop with subtle vignette in light mode
        const bgGrad = ctx.createRadialGradient(cx, cy, 40 * zoom, cx, cy, Math.max(width, height) * 0.85);
        bgGrad.addColorStop(0, '#FAF7F2');
        bgGrad.addColorStop(1, '#ECE6DC');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // 1. Soft regional atmosphere (memory landscape — not game zones)
      const regions = isDark
        ? [
            { name: 'Memory', x: -22, y: -12, color: 'rgba(120, 150, 165, 0.06)' },
            { name: 'Horizon', x: 22, y: -12, color: 'rgba(190, 165, 130, 0.05)' },
            { name: 'Quiet', x: -18, y: 18, color: 'rgba(170, 160, 150, 0.05)' },
            { name: 'Depth', x: 22, y: 18, color: 'rgba(100, 120, 130, 0.06)' }
          ]
        : [
            { name: 'Memory', x: -22, y: -12, color: 'rgba(70, 110, 130, 0.07)' },
            { name: 'Horizon', x: 22, y: -12, color: 'rgba(160, 120, 60, 0.07)' },
            { name: 'Quiet', x: -18, y: 18, color: 'rgba(120, 110, 95, 0.07)' },
            { name: 'Depth', x: 22, y: 18, color: 'rgba(60, 85, 100, 0.07)' }
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
        ctx.fillStyle = isDark ? 'rgba(242, 237, 230, 0.25)' : 'rgba(45, 40, 32, 0.42)';
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

        ctx.fillStyle = isDark ? `rgba(201, 184, 160, ${alpha})` : `rgba(80, 70, 55, ${alpha * 0.75})`;
        ctx.beginPath();
        ctx.arc(dustX, dustY, d.size * zoom, 0, Math.PI * 2);
        ctx.fill();
      });

      const nodes = getNodes();
      const nodeById = new Map<string, typeof nodes[0]>();
      nodes.forEach((n) => nodeById.set(n.id, n));

      // 3. Meaningful Subconscious Filaments (Co-occurrence in Dreams)
      if (connections && connections.length > 0) {
        for (const c of connections) {
          const n1 = nodeById.get(c.sourceId);
          const n2 = nodeById.get(c.targetId);
          if (!n1 || !n2) continue;

          const p1X = cx + n1.worldX * zoom;
          const p1Y = cy + n1.worldY * zoom;
          const p2X = cx + n2.worldX * zoom;
          const p2Y = cy + n2.worldY * zoom;

          const isConnectedToHover = hoveredNode && (hoveredNode.id === n1.id || hoveredNode.id === n2.id);
          const isConnectedToHighlight = highlightedArtifactId && (highlightedArtifactId === n1.id || highlightedArtifactId === n2.id);
          const isActiveLink = isConnectedToHover || isConnectedToHighlight;

          let baseAlpha = isDark ? (0.08 + c.strength * 0.14) : (0.22 + c.strength * 0.32);
          if (hoveredNode || highlightedArtifactId) {
            baseAlpha = isActiveLink
              ? (isDark ? Math.min(0.85, 0.45 + c.strength * 0.35) : Math.min(0.95, 0.65 + c.strength * 0.35))
              : baseAlpha * 0.2;
          }

          // Gentle breathing curvature
          const midX = (p1X + p2X) / 2 + Math.sin(time * 0.35 + c.strength * 4) * 8 * zoom;
          const midY = (p1Y + p2Y) / 2 + Math.cos(time * 0.35 + c.strength * 4) * 8 * zoom;

          ctx.beginPath();
          ctx.moveTo(p1X, p1Y);
          ctx.quadraticCurveTo(midX, midY, p2X, p2Y);
          if (isDark) {
            ctx.strokeStyle = isActiveLink ? `rgba(224, 195, 155, ${baseAlpha})` : `rgba(201, 184, 160, ${baseAlpha})`;
          } else {
            ctx.strokeStyle = isActiveLink ? `rgba(165, 110, 35, ${baseAlpha})` : `rgba(65, 55, 45, ${baseAlpha})`;
          }
          ctx.lineWidth = (isActiveLink ? (isDark ? 1.75 : 2.2) : (isDark ? 0.9 : 1.25)) * zoom;
          ctx.stroke();
        }
      } else {
        // Fallback quiet geometric paths
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
              const alpha = isDark
                ? Math.max(0.03, ((260 * zoom - dist) / (260 * zoom)) * 0.16)
                : Math.max(0.08, ((260 * zoom - dist) / (260 * zoom)) * 0.30);
              ctx.beginPath();
              ctx.moveTo(p1X, p1Y);
              ctx.lineTo(p2X, p2Y);
              ctx.strokeStyle = isDark ? `rgba(201, 184, 160, ${alpha})` : `rgba(75, 65, 55, ${alpha})`;
              ctx.lineWidth = (isDark ? 1 : 1.2) * zoom;
              ctx.stroke();
            }
          }
        }
      }

      // 4. Entity silhouettes & temporal atmospheres
      nodes.sort((a, b) => b.z - a.z);

      nodes.forEach((n) => {
        const posX = cx + n.worldX * zoom;
        const posY = cy + n.worldY * zoom;
        const isHovered = hoveredNode?.id === n.id;
        const isHighlighted = highlightedArtifactId === n.id;

        const matchesFilter = temporalFilter === 'all' || n.temporalStatus === temporalFilter;
        const globalDim = matchesFilter ? 1 : 0.22;

        const pulse = prefersReducedMotion ? 1 : 1 + Math.sin(time * n.pulseSpeed * 60 + n.phase) * 0.05;
        const curSize = (isHovered || isHighlighted ? n.size * 1.2 : n.size) * pulse * zoom;

        ctx.save();
        ctx.globalAlpha = globalDim;
        ctx.translate(posX, posY);

        // Radial aura
        const isSingletonQuiet = densityMode === 'recurring' && n.isSingleton && !isHovered && !isHighlighted;

        if (isSingletonQuiet) {
          // Draw quiet celestial point of light
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(3, curSize * 0.7), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${n.colorHue}, ${0.35 * globalDim})`;
          ctx.fill();
        } else {
          // Full silhouette & aura for recurring landmarks or active nodes
          const auraMultiplier = n.temporalStatus === 'anchor' ? 2.5 : n.temporalStatus === 'emerging' ? 2.2 : 2.0;
          const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, curSize * auraMultiplier);
          const auraAlpha = isHovered ? (isDark ? 0.38 : 0.32) : n.temporalStatus === 'dormant' ? 0.05 : (isDark ? 0.14 : 0.20);
          auraGrad.addColorStop(0, `rgba(${n.colorHue}, ${auraAlpha})`);
          auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(0, 0, curSize * auraMultiplier, 0, Math.PI * 2);
          ctx.fill();

          // Emerging motif ripple effect
          if (n.temporalStatus === 'emerging' && !prefersReducedMotion) {
            const ripple = ((time * 0.6 + n.phase) % 1);
            ctx.beginPath();
            ctx.arc(0, 0, curSize * (1.1 + ripple * 0.6), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(52, 211, 153, ${(1 - ripple) * 0.35})`;
            ctx.lineWidth = 1 * zoom;
            ctx.stroke();
          }

          // Draw silhouette
          drawEntitySilhouette(n.artifact_type, n.name, curSize, n.colorHue, isHovered || isHighlighted, isDark);

          // Anchor status: double concentric ring
          if (n.temporalStatus === 'anchor') {
            ctx.beginPath();
            ctx.arc(0, 0, curSize * 1.45, 0, Math.PI * 2);
            ctx.strokeStyle = isDark ? 'rgba(242, 237, 230, 0.38)' : 'rgba(35, 30, 24, 0.50)';
            ctx.lineWidth = (isDark ? 1.2 : 1.4) * zoom;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, curSize * 1.65, 0, Math.PI * 2);
            ctx.strokeStyle = isDark ? 'rgba(242, 237, 230, 0.22)' : 'rgba(35, 30, 24, 0.30)';
            ctx.lineWidth = 0.9 * zoom;
            ctx.stroke();
          } else if (n.appearance_count > 1) {
            ctx.beginPath();
            ctx.arc(0, 0, curSize * 1.45, 0, Math.PI * 2);
            ctx.strokeStyle = isDark
              ? (n.temporalStatus === 'dormant' ? 'rgba(242, 237, 230, 0.18)' : 'rgba(242, 237, 230, 0.32)')
              : (n.temporalStatus === 'dormant' ? 'rgba(35, 30, 24, 0.25)' : 'rgba(35, 30, 24, 0.45)');
            ctx.setLineDash([3 * zoom, 4 * zoom]);
            ctx.lineWidth = 1 * zoom;
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        ctx.restore();

        // Progressive label disclosure: only show text on prominent or focused nodes
        const isNeighborOfHover = hoveredNode && (hoveredNode.connected_artifact_ids || []).includes(n.id);
        const shouldShowLabel =
          isHovered ||
          isHighlighted ||
          isNeighborOfHover ||
          (n.temporalStatus === 'anchor') ||
          (n.appearance_count >= 3) ||
          (zoom >= 1.25 && n.appearance_count >= 2) ||
          (zoom >= 1.6);

        if (shouldShowLabel && !isSingletonQuiet) {
          ctx.save();
          ctx.globalAlpha = isHovered || isHighlighted ? 1 : globalDim * (n.appearance_count > 1 ? 0.95 : 0.70);
          ctx.font = `${isHovered ? '600' : '500'} ${Math.round((isHovered ? 13 : 11.5) * zoom)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

          if (isDark) {
            ctx.fillStyle = isHovered || isHighlighted ? '#FFFFFF' : 'rgba(242, 237, 230, 0.90)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
            ctx.shadowBlur = 4;
          } else {
            ctx.fillStyle = isHovered || isHighlighted ? '#0E0D0B' : '#2A2620';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
            ctx.shadowBlur = 4;
          }

          ctx.textAlign = 'center';
          ctx.fillText(n.name, posX, posY + curSize + 15 * zoom);
          ctx.restore();
        }
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
  }, [artifacts, connections, hoveredNode, focusOnNode, onSelectArtifact, highlightedArtifactId, temporalFilter, densityMode, resolvedTheme]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-140px)] min-h-[580px] bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--border-default)] select-none cursor-grab active:cursor-grabbing"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* World HUD Controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 z-30 pointer-events-auto">
        {/* Scalability Focus Toggle */}
        <button
          onClick={() => setDensityMode((prev) => (prev === 'recurring' ? 'all' : 'recurring'))}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
            densityMode === 'recurring'
              ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/40 shadow-xs'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-secondary)]'
          }`}
          title="Toggle density between recurring landmarks and full archive"
        >
          <Sparkles size={13} className={densityMode === 'recurring' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
          <span>{densityMode === 'recurring' ? `Recurring (${recurringCount})` : `All (${artifacts.length})`}</span>
        </button>

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

        {onBackToOverview && (
          <button
            onClick={onBackToOverview}
            className="px-3.5 py-2 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-default)] transition-colors text-xs font-medium ml-1"
          >
            Back to Overview
          </button>
        )}
      </div>

      {/* Navigation Hint */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)]/90 border border-[var(--border-default)] text-[var(--text-secondary)] text-xs font-medium flex items-center gap-2">
          <Compass size={12} className="text-[var(--accent)]" />
          <span>Drag to pan · Scroll to zoom · Click node to inspect connections</span>
        </div>
      </div>

      {/* Hover Tooltip Overlay with Temporal Badge */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            key={`tooltip-artifact-${hoveredNode.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border border-[var(--border-default)] px-5 py-3 rounded-2xl shadow-xl pointer-events-none flex flex-col items-center z-40 max-w-sm text-center"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
                {hoveredNode.artifact_type}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">•</span>
              <span
                className={`text-[10px] px-2 py-0.2 rounded-full font-medium ${
                  hoveredNode.temporal_status === 'emerging'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : hoveredNode.temporal_status === 'anchor'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : hoveredNode.temporal_status === 'dormant'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                }`}
              >
                {hoveredNode.temporal_status === 'emerging'
                  ? 'Emerging Motif'
                  : hoveredNode.temporal_status === 'anchor'
                    ? 'Archive Anchor'
                    : hoveredNode.temporal_status === 'dormant'
                      ? 'Dormant Memory'
                      : 'Recurring'}
              </span>
            </div>

            <span className="text-base font-display font-semibold text-[var(--text-primary)]">
              {hoveredNode.name}
            </span>

            <span className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
              <span>Seen in {hoveredNode.appearance_count} dream{hoveredNode.appearance_count > 1 ? 's' : ''}</span>
              {(hoveredNode.connected_artifact_ids || []).length > 0 && (
                <>
                  <span>·</span>
                  <span>Links with {hoveredNode.connected_artifact_ids!.length} motifs</span>
                </>
              )}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

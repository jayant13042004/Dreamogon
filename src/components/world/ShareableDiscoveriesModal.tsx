'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Shield,
  Compass,
  TrendingUp,
  Layers,
  Calendar,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { DreamWorldData } from '@/lib/dreamWorld';
import { toast } from '@/components/ui/Toast';

interface ShareableDiscoveriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldData: DreamWorldData;
}

type DiscoveryTab = 'milestone' | 'themes' | 'world' | 'evolution';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function ShareableDiscoveriesModal({
  isOpen,
  onClose,
  worldData,
}: ShareableDiscoveriesModalProps) {
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('milestone');
  const [copiedText, setCopiedText] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    artifacts,
    dreamCount,
    topThemes,
    mostRecurringElement,
    topEmotion,
    earliestDreamDate,
    latestDreamDate,
  } = worldData;

  const milestoneTitle =
    dreamCount >= 100
      ? '100 Dreams Later'
      : dreamCount >= 50
        ? '50 Dreams Later'
        : dreamCount >= 25
          ? '25 Dreams Later'
          : dreamCount >= 10
            ? '10 Dreams Later'
            : `${dreamCount} Dreams Recorded`;

  const dateSpan =
    earliestDreamDate && latestDreamDate
      ? `${formatDate(earliestDreamDate)} – ${formatDate(latestDreamDate)}`
      : 'Active Archive';

  // Counts by temporal status
  const emergingCount = artifacts.filter((a) => a.temporal_status === 'emerging').length;
  const anchorCount = artifacts.filter((a) => a.temporal_status === 'anchor').length;
  const dormantCount = artifacts.filter((a) => a.temporal_status === 'dormant').length;

  const handleCopyText = async () => {
    let summary = '';
    if (activeTab === 'milestone') {
      summary = `✦ Subconscious Log · ${milestoneTitle}\nArchive Span: ${dateSpan}\nRecorded Dreams: ${dreamCount}\nUncovered Artifacts: ${artifacts.length}\nRecurring Anchor: ${mostRecurringElement || 'Forming'}\nhttps://subconsciouslog.com`;
    } else if (activeTab === 'themes') {
      summary = `✦ Subconscious Log · My Recurring Themes\nArchive Span: ${dateSpan}\nTop Themes: ${topThemes.join(', ')}\nFrequent Anchor: ${mostRecurringElement || 'Forming'}\nhttps://subconsciouslog.com`;
    } else if (activeTab === 'world') {
      summary = `✦ Subconscious Log · My Dream World\nSubconscious Universe: ${artifacts.length} elements across ${dreamCount} dreams\nActive Anchors: ${anchorCount} · Emerging Motifs: ${emergingCount}\nhttps://subconsciouslog.com`;
    } else {
      summary = `✦ Subconscious Log · How My Dreams Changed\nArchive Span: ${dateSpan}\nFrom earlier entries to recent nights: ${emergingCount} motifs emerged, while ${dormantCount} faded into memory.\nhttps://subconsciouslog.com`;
    }

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedText(true);
      toast.success('Discovery summary copied to clipboard');
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleNativeShare = async () => {
    if (typeof window === 'undefined') return;
    const shareData = {
      title: `Subconscious Log · ${milestoneTitle}`,
      text: `Across ${dreamCount} dreams recorded in my private dream archive (${dateSpan}), recurring motifs and subtle evolutions have surfaced.`,
      url: 'https://subconsciouslog.com',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or fallback
      }
    } else {
      handleCopyText();
    }
  };

  const handleExportPNG = async () => {
    setDownloadingImage(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
      bgGrad.addColorStop(0, '#10141A');
      bgGrad.addColorStop(1, '#080A0D');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 630);

      // Subtle atmospheric glow
      const radialAura = ctx.createRadialGradient(600, 315, 50, 600, 315, 550);
      radialAura.addColorStop(0, 'rgba(180, 150, 120, 0.12)');
      radialAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialAura;
      ctx.fillRect(0, 0, 1200, 630);

      // Border outline
      ctx.strokeStyle = 'rgba(242, 237, 230, 0.12)';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, 1120, 550);

      // Brand tag
      ctx.font = "600 15px 'Source Sans 3', system-ui, sans-serif";
      ctx.fillStyle = '#C9B8A0';
      ctx.letterSpacing = '3px';
      ctx.fillText('SUBCONSCIOUS LOG  ·  PRIVATE DREAM ARCHIVE', 80, 100);

      // Date span
      ctx.font = "400 16px 'Source Sans 3', system-ui, sans-serif";
      ctx.fillStyle = 'rgba(242, 237, 230, 0.5)';
      ctx.fillText(dateSpan, 80, 130);

      // Main Milestone Heading
      ctx.font = "600 48px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = '#F2EDE6';
      const heading =
        activeTab === 'milestone'
          ? milestoneTitle
          : activeTab === 'themes'
            ? 'My Recurring Themes'
            : activeTab === 'world'
              ? 'My Dream World'
              : 'How My Dreams Changed';
      ctx.fillText(heading, 80, 205);

      // Subtitle
      ctx.font = "italic 400 20px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = 'rgba(242, 237, 230, 0.7)';
      ctx.fillText(
        '"Your dreams become more meaningful when you can see them as a whole, not one at a time."',
        80,
        245
      );

      // Horizontal separator
      ctx.strokeStyle = 'rgba(242, 237, 230, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, 280);
      ctx.lineTo(1120, 280);
      ctx.stroke();

      // Stats Columns
      const colY = 360;
      // Col 1
      ctx.font = "600 52px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = '#C9B8A0';
      ctx.fillText(String(dreamCount), 80, colY);
      ctx.font = "500 13px 'Source Sans 3', system-ui, sans-serif";
      ctx.fillStyle = 'rgba(242, 237, 230, 0.5)';
      ctx.fillText('DREAMS RECORDED', 80, colY + 30);

      // Col 2
      ctx.font = "600 52px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = '#C9B8A0';
      ctx.fillText(String(artifacts.length), 340, colY);
      ctx.font = "500 13px 'Source Sans 3', system-ui, sans-serif";
      ctx.fillStyle = 'rgba(242, 237, 230, 0.5)';
      ctx.fillText('SUBCONSCIOUS ARTIFACTS', 340, colY + 30);

      // Col 3
      ctx.font = "600 36px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = '#F2EDE6';
      ctx.fillText(mostRecurringElement || 'Varied', 640, colY - 5);
      ctx.font = "500 13px 'Source Sans 3', system-ui, sans-serif";
      ctx.fillStyle = 'rgba(242, 237, 230, 0.5)';
      ctx.fillText('CENTRAL ARCHIVE ANCHOR', 640, colY + 30);

      // Col 4
      ctx.font = "600 36px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = '#F2EDE6';
      ctx.fillText(topEmotion || 'Reflective', 920, colY - 5);
      ctx.font = "500 13px 'Source Sans 3', system-ui, sans-serif";
      ctx.fillStyle = 'rgba(242, 237, 230, 0.5)';
      ctx.fillText('DOMINANT EMOTION', 920, colY + 30);

      // Key Themes Pill Box
      if (topThemes.length > 0) {
        ctx.font = "500 15px 'Source Sans 3', system-ui, sans-serif";
        ctx.fillStyle = '#F2EDE6';
        ctx.fillText(`Recurring Motifs:  ${topThemes.slice(0, 4).join('  ·  ')}`, 80, 480);
      }

      // Footer
      ctx.font = "400 14px 'Source Sans 3', system-ui, sans-serif";
      ctx.fillStyle = 'rgba(242, 237, 230, 0.4)';
      ctx.fillText('Private Dream Archive  ·  No raw dream text or sensitive notes are ever made public.', 80, 545);
      ctx.fillStyle = '#C9B8A0';
      ctx.fillText('SubconsciousLog.com', 960, 545);

      // Export
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `subconscious-log-${activeTab}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Discovery card exported as PNG');
      }
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export card image');
    } finally {
      setDownloadingImage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Sparkles size={14} className="text-[var(--accent)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                  Shareable Discoveries
                </span>
              </div>
              <h2 className="text-xl font-display font-semibold text-[var(--text-primary)]">
                Your Dream Archive Milestone
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Privacy Notice Banner */}
          <div className="px-5 py-2.5 bg-emerald-500/5 border-b border-emerald-500/15 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <Shield size={14} className="shrink-0" />
            <span>
              <strong>Privacy by design:</strong> Sharing is always optional. Only high-level motifs and milestones are included—never your raw dream texts.
            </span>
          </div>

          {/* Discovery Card Tabs */}
          <div className="px-5 pt-4 flex items-center gap-1.5 overflow-x-auto border-b border-[var(--border-subtle)] pb-3">
            {[
              { id: 'milestone', label: milestoneTitle, icon: Calendar },
              { id: 'themes', label: 'Recurring Themes', icon: Sparkles },
              { id: 'world', label: 'My Dream World', icon: Compass },
              { id: 'evolution', label: 'How Dreams Changed', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DiscoveryTab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)]'
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Card Preview Body */}
          <div className="p-6 overflow-y-auto flex-1">
            <div
              ref={cardRef}
              className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-card)] border border-[var(--border-default)] shadow-inner space-y-6 relative overflow-hidden"
            >
              {/* Subtle watermarked logo / tagline */}
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono pb-4 border-b border-[var(--border-subtle)]">
                <span className="uppercase tracking-widest text-[var(--accent)] font-semibold">
                  Subconscious Log
                </span>
                <span>{dateSpan}</span>
              </div>

              {/* Tab: Milestone */}
              {activeTab === 'milestone' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-display font-semibold text-[var(--text-primary)]">
                      {milestoneTitle}
                    </h3>
                    <p className="text-xs md:text-sm text-[var(--text-secondary)] italic mt-1 leading-relaxed">
                      "Your dreams become more meaningful when you can see them as a whole, not one at a time."
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                      <div className="text-2xl font-bold font-display text-[var(--accent)]">{dreamCount}</div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Dreams Logged</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                      <div className="text-2xl font-bold font-display text-[var(--text-primary)]">{artifacts.length}</div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Motifs Uncovered</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                      <div className="text-base font-semibold text-[var(--text-primary)] truncate">{mostRecurringElement || 'Varied'}</div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Archive Anchor</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                      <div className="text-base font-semibold text-[var(--text-primary)] capitalize truncate">{topEmotion || 'Reflective'}</div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Dominant Tone</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Themes */}
              {activeTab === 'themes' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-display font-semibold text-[var(--text-primary)]">
                      My Recurring Themes
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      The core threads that continually surface across my subconscious journal.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {topThemes.map((theme, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] font-medium text-xs border border-[var(--accent)]/20"
                      >
                        ✦ {theme}
                      </span>
                    ))}
                    {topThemes.length === 0 && (
                      <span className="text-xs text-[var(--text-muted)] italic">
                        Themes emerge as you record dreams across multiple mornings.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Dream World */}
              {activeTab === 'world' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-display font-semibold text-[var(--text-primary)]">
                      My Dream World
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      A personal universe of {artifacts.length} subconscious landmarks mapped across {dreamCount} dreams.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                      <span className="text-xs font-semibold text-emerald-500 block">{emergingCount}</span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase">Emerging</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                      <span className="text-xs font-semibold text-blue-500 block">{anchorCount}</span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase">Anchors</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                      <span className="text-xs font-semibold text-amber-500 block">{dormantCount}</span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase">Dormant</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Evolution */}
              {activeTab === 'evolution' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-display font-semibold text-[var(--text-primary)]">
                      How My Dreams Changed
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Longitudinal movement: earlier memories receding as new symbols take form.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <p>
                      Across {dreamCount} recorded dreams, the archive shows {emergingCount} newly emerging motifs, while earlier symbols have settled into memory.
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] font-mono">
                      Dominant atmosphere: {topEmotion || 'Reflective'} · Core anchor: {mostRecurringElement || 'Forming'}
                    </p>
                  </div>
                </div>
              )}

              {/* Footer Note */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                <span>SubconsciousLog.com</span>
                <span className="flex items-center gap-1">
                  <Lock size={10} />
                  Private Archive Snapshot
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-5 border-t border-[var(--border-default)] bg-[var(--bg-secondary)] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[var(--text-muted)]">
              Export high-res card or copy text summary
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyText}
                className="text-xs font-medium"
              >
                {copiedText ? (
                  <>
                    <Check size={13} className="mr-1 text-[var(--accent)]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="mr-1" />
                    <span>Copy Text</span>
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPNG}
                disabled={downloadingImage}
                className="text-xs font-medium"
              >
                <Download size={13} className="mr-1" />
                <span>{downloadingImage ? 'Generating...' : 'Export PNG'}</span>
              </Button>

              <Button
                size="sm"
                onClick={handleNativeShare}
                className="text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)]"
              >
                <Share2 size={13} className="mr-1" />
                <span>Share Discovery</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  MapPin,
  Users,
  Compass,
  Layers,
  Sparkle,
} from 'lucide-react';
import { DreamAnalysis as IDreamAnalysis, DreamSymbol } from '@/types/dream';

interface DreamAnalysisProps {
  analysis: IDreamAnalysis;
  dream?: unknown;
}

function parsePatternString(pattern: string): { label?: string; observation: string } {
  const match =
    pattern.match(/^(Connected to [^:—–]+[—–-][^:]+):\s*(.*)$/i) ||
    pattern.match(/^(Connected to [^:]+):\s*(.*)$/i);
  if (match) {
    return {
      label: match[1].trim(),
      observation: match[2].trim(),
    };
  }
  return {
    observation: pattern,
  };
}

export function DreamAnalysis({ analysis }: DreamAnalysisProps) {
  const reduceMotion = useReducedMotion();
  if (!analysis) return null;

  const containerVariants = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06 } },
      };

  const itemVariants = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0 },
      };

  // Safe element resolution with fallbacks for legacy records
  const resolvedSymbols: DreamSymbol[] = (
    Array.isArray(analysis.symbols) && analysis.symbols.length > 0
      ? analysis.symbols.map((s) => (typeof s === 'string' ? { name: s } : s))
      : (analysis.key_elements || []).map((k) => ({ name: k }))
  ).filter((s) => Boolean(s.name));

  const resolvedPeople: string[] =
    Array.isArray(analysis.people) && analysis.people.length > 0
      ? analysis.people
      : (analysis.entities || [])
          .filter((e) => e.entity_type === 'person')
          .map((e) => e.entity_name);

  const resolvedLocations: string[] =
    Array.isArray(analysis.locations) && analysis.locations.length > 0
      ? analysis.locations
      : (analysis.entities || [])
          .filter((e) => e.entity_type === 'place')
          .map((e) => e.entity_name);

  const resolvedDetails: string[] = Array.isArray(analysis.notable_details)
    ? analysis.notable_details
    : [];

  const hasElements =
    resolvedSymbols.length > 0 ||
    resolvedPeople.length > 0 ||
    resolvedLocations.length > 0 ||
    resolvedDetails.length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial={reduceMotion ? undefined : 'hidden'}
      animate={reduceMotion ? undefined : 'show'}
      className="space-y-6"
    >
      {/* A. Reflective summary & Morning insight */}
      <motion.div variants={itemVariants}>
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[var(--text-muted)]" />
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              Reflective summary
            </h3>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
            {analysis.summary}
          </p>
          {analysis.insight && (
            <div className="border-t border-[var(--border-subtle)] pt-3 mt-3">
              <p className="text-xs text-[var(--text-muted)] leading-relaxed italic font-serif">
                “{analysis.insight}”
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* B. Themes + Emotional undertones */}
      {((analysis.themes && analysis.themes.length > 0) ||
        (analysis.emotions && analysis.emotions.length > 0)) && (
        <motion.div variants={itemVariants}>
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-4">
            {analysis.themes && analysis.themes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Underlying themes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.themes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)]"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.emotions && analysis.emotions.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Emotional undertones
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.emotions.map((emotion, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] capitalize"
                    >
                      {emotion.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* C. Dream Elements (Symbols, People, Locations, Notable Details) */}
      {hasElements && (
        <motion.div variants={itemVariants}>
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-5">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[var(--text-muted)]" />
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                Dream elements & motifs
              </h3>
            </div>

            {/* Symbols & Motifs */}
            {resolvedSymbols.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkle size={12} className="text-[var(--accent)]" />
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    Symbols & motifs
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {resolvedSymbols.map((symbol, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] space-y-1"
                    >
                      <span className="font-medium text-xs text-[var(--text-primary)] block">
                        {symbol.name}
                      </span>
                      {symbol.reflection && (
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                          {symbol.reflection}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* People & Figures */}
            {resolvedPeople.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-[var(--accent)]" />
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    People & figures
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resolvedPeople.map((person, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)]"
                    >
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Locations & Settings */}
            {resolvedLocations.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-[var(--accent)]" />
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    Locations & settings
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resolvedLocations.map((location, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)]"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notable Sensory & Surreal Details */}
            {resolvedDetails.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Notable details noticed
                </h4>
                <ul className="space-y-1.5">
                  {resolvedDetails.map((detail, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-[var(--text-secondary)] leading-relaxed flex items-start gap-2"
                    >
                      <span className="text-[var(--accent)] shrink-0 mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* D. Possible interpretations */}
      {analysis.possible_interpretations &&
        analysis.possible_interpretations.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-[var(--text-muted)]" />
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  Possible interpretations
                </h3>
              </div>
              <div className="space-y-2.5">
                {analysis.possible_interpretations.map(
                  (interpretation: string, index: number) => (
                    <p
                      key={index}
                      className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed"
                    >
                      • {interpretation}
                    </p>
                  )
                )}
              </div>
              <p className="text-[11px] text-[var(--text-muted)] pt-1 italic">
                Metaphorical possibilities to ponder — never clinical facts or diagnoses.
              </p>
            </div>
          </motion.div>
        )}

      {/* E. Cross-Dream patterns & connections */}
      {analysis.recurring_patterns && analysis.recurring_patterns.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="text-[var(--accent)] shrink-0" size={15} />
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Cross-dream patterns & connections
              </h3>
            </div>
            <div className="space-y-3">
              {analysis.recurring_patterns.map((pattern: string, index: number) => {
                const parsed = parsePatternString(pattern);
                return (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] space-y-1.5"
                  >
                    {parsed.label && (
                      <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--accent)] font-medium">
                        {parsed.label}
                      </span>
                    )}
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {parsed.observation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* F. Questions for morning reflection */}
      {analysis.reflection_questions && analysis.reflection_questions.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="text-[var(--accent)] shrink-0" size={16} />
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                Questions for morning reflection
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.reflection_questions.slice(0, 3).map((question: string, index: number) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed"
                >
                  {question}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

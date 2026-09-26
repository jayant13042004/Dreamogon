import {
  getAIClient,
  GENERATION_MODELS,
  shouldFallbackToNextModel,
} from '@/lib/ai/client';
import { DREAM_EVOLUTION_PROMPT } from '@/lib/ai/prompts';
import type { DreamEvolutionAnalysis, MotifShift, TemporalPeriodSummary } from '@/types/ai';

interface EvolutionInputDream {
  id: string;
  title: string;
  content: string;
  dream_date: string;
  mood: string | null;
  lucidity: string | null;
  ai_themes?: string[] | null;
  ai_symbols?: string[] | null;
  ai_summary?: string | null;
}

function formatDateRange(startDateStr?: string, endDateStr?: string): string {
  if (!startDateStr || !endDateStr) return 'Active archive';
  try {
    const s = new Date(startDateStr);
    const e = new Date(endDateStr);
    const sStr = s.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const eStr = e.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (sStr === eStr) return sStr;
    return `${sStr} – ${eStr}`;
  } catch {
    return `${startDateStr} – ${endDateStr}`;
  }
}

export async function analyzeDreamEvolution(
  dreams: EvolutionInputDream[],
  artifacts: Array<{ name: string; artifact_type: string; appearance_count: number; first_seen_at: string; last_seen_at: string }> = []
): Promise<DreamEvolutionAnalysis> {
  if (dreams.length < 3) {
    throw new Error('At least 3 dreams are required to observe temporal evolution.');
  }

  // Sort strictly ascending chronologically
  const sorted = [...dreams].sort(
    (a, b) => new Date(a.dream_date).getTime() - new Date(b.dream_date).getTime()
  );

  const midpoint = Math.floor(sorted.length / 2);
  const earlierSlice = sorted.slice(0, midpoint);
  const recentSlice = sorted.slice(midpoint);

  // Compute moods frequency for both periods
  const getTopMoods = (slice: EvolutionInputDream[]): string[] => {
    const counts: Record<string, number> = {};
    slice.forEach((d) => {
      const m = d.mood || 'neutral';
      counts[m] = (counts[m] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([m]) => m)
      .slice(0, 3);
  };

  // Compute motifs frequency for both periods
  const getTopMotifs = (slice: EvolutionInputDream[]): string[] => {
    const counts: Record<string, number> = {};
    slice.forEach((d) => {
      (d.ai_themes || []).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
      (d.ai_symbols || []).forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([m]) => m)
      .slice(0, 5);
  };

  const earlierRange = formatDateRange(earlierSlice[0]?.dream_date, earlierSlice[earlierSlice.length - 1]?.dream_date);
  const recentRange = formatDateRange(recentSlice[0]?.dream_date, recentSlice[recentSlice.length - 1]?.dream_date);

  const payload = {
    earlierPeriod: {
      dateRange: earlierRange,
      dreamCount: earlierSlice.length,
      dominantMoods: getTopMoods(earlierSlice),
      topMotifs: getTopMotifs(earlierSlice),
      sampleDreams: earlierSlice.map((d) => ({
        id: d.id,
        date: d.dream_date,
        title: d.title,
        mood: d.mood,
        themes: d.ai_themes,
        summary: d.ai_summary || d.content.slice(0, 140),
      })),
    },
    recentPeriod: {
      dateRange: recentRange,
      dreamCount: recentSlice.length,
      dominantMoods: getTopMoods(recentSlice),
      topMotifs: getTopMotifs(recentSlice),
      sampleDreams: recentSlice.map((d) => ({
        id: d.id,
        date: d.dream_date,
        title: d.title,
        mood: d.mood,
        themes: d.ai_themes,
        summary: d.ai_summary || d.content.slice(0, 140),
      })),
    },
    knownArtifacts: artifacts.slice(0, 12).map((a) => ({
      name: a.name,
      type: a.artifact_type,
      appearances: a.appearance_count,
      firstSeen: a.first_seen_at,
      lastSeen: a.last_seen_at,
    })),
  };

  const ai = getAIClient();
  const userContent = JSON.stringify(payload, null, 2);

  let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;

  for (const model of GENERATION_MODELS) {
    try {
      response = await ai.models.generateContent({
        model,
        contents: userContent,
        config: {
          systemInstruction: DREAM_EVOLUTION_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });
      break;
    } catch (error) {
      console.error(`Gemini model ${model} failed for evolution analysis:`, error);
      if (!shouldFallbackToNextModel(error)) {
        throw error;
      }
    }
  }

  if (!response || !response.text) {
    throw new Error('All AI models failed to produce evolution analysis.');
  }

  let cleaned = response.text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '');
    cleaned = cleaned.replace(/\n?```$/i, '');
  }
  cleaned = cleaned.trim();

  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  const rawParsed = JSON.parse(cleaned);

  // Validate and normalize structure
  const result: DreamEvolutionAnalysis = {
    temporalComparison: {
      earlierPeriod: {
        dateRange: rawParsed.temporalComparison?.earlierPeriod?.dateRange || earlierRange,
        dreamCount: earlierSlice.length,
        dominantMoods: rawParsed.temporalComparison?.earlierPeriod?.dominantMoods || getTopMoods(earlierSlice),
        keyMotifs: rawParsed.temporalComparison?.earlierPeriod?.keyMotifs || getTopMotifs(earlierSlice),
        characteristicAtmosphere: rawParsed.temporalComparison?.earlierPeriod?.characteristicAtmosphere || 'Earlier archive memories.',
      },
      recentPeriod: {
        dateRange: rawParsed.temporalComparison?.recentPeriod?.dateRange || recentRange,
        dreamCount: recentSlice.length,
        dominantMoods: rawParsed.temporalComparison?.recentPeriod?.dominantMoods || getTopMoods(recentSlice),
        keyMotifs: rawParsed.temporalComparison?.recentPeriod?.keyMotifs || getTopMotifs(recentSlice),
        characteristicAtmosphere: rawParsed.temporalComparison?.recentPeriod?.characteristicAtmosphere || 'Recent archive memories.',
      },
      summary: rawParsed.temporalComparison?.summary || 'Your dream motifs reflect an evolving emotional and narrative journey over time.',
    },
    shifts: Array.isArray(rawParsed.shifts)
      ? rawParsed.shifts.map((s: any): MotifShift => ({
          motif: s.motif || 'Recurring motif',
          type: ['emerging', 'fading', 'transforming', 'stabilizing'].includes(s.type) ? s.type : 'transforming',
          category: ['theme', 'person', 'place', 'symbol', 'emotion', 'narrative'].includes(s.category) ? s.category : 'theme',
          observation: s.observation || '',
          earlierContext: s.earlierContext || undefined,
          recentContext: s.recentContext || undefined,
        }))
      : [],
    emotionalTrajectory: {
      direction: rawParsed.emotionalTrajectory?.direction || 'Evolving emotional landscape',
      observation: rawParsed.emotionalTrajectory?.observation || 'Subtle shifts in emotional expression across your dream log.',
    },
    narrativeAgency: {
      observation: rawParsed.narrativeAgency?.observation || 'Your agency and perspective within dreams have developed across entries.',
    },
    reflectionPrompt: rawParsed.reflectionPrompt || 'What feelings or real-life transitions do these dream shifts evoke for you?',
    analyzedAt: new Date().toISOString(),
    totalDreamsAnalyzed: sorted.length,
  };

  return result;
}

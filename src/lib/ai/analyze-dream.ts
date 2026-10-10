import {
  getAIClient,
  GENERATION_MODELS,
  shouldFallbackToNextModel,
} from '@/lib/ai/client';
import { DREAM_ANALYSIS_PROMPT } from '@/lib/ai/prompts';
import type { DreamAnalysis, DreamSymbol, EntityType } from '@/types/dream';

export interface PreviousDreamContext {
  title: string;
  summary: string;
  date: string;
  themes: string[];
  people?: string[];
  locations?: string[];
  symbols?: string[];
}

const VALID_ENTITY_TYPES: Set<string> = new Set([
  'person',
  'place',
  'object',
  'emotion',
  'animal',
  'activity',
  'symbol',
  'theme',
]);

export function sanitizeAnalysis(raw: any): DreamAnalysis {
  const summary = typeof raw?.summary === 'string' ? raw.summary : '';
  const emotions = Array.isArray(raw?.emotions)
    ? raw.emotions
        .filter((e: any) => e && typeof e.name === 'string')
        .map((e: any) => ({
          name: String(e.name),
          percentage: typeof e.percentage === 'number' ? e.percentage : 20,
        }))
    : [];

  const rawEntities = Array.isArray(raw?.entities)
    ? raw.entities
        .filter(
          (ent: any) =>
            ent &&
            typeof ent.entity_name === 'string' &&
            ent.entity_name.trim().length > 0
        )
        .map((ent: any) => ({
          entity_type: (VALID_ENTITY_TYPES.has(ent.entity_type)
            ? ent.entity_type
            : 'symbol') as EntityType,
          entity_name: String(ent.entity_name).trim(),
          confidence:
            typeof ent.confidence === 'number'
              ? Math.max(0.1, Math.min(1.0, ent.confidence))
              : 0.8,
        }))
    : undefined;

  // 1. Themes (with fallback from entities if missing)
  let themes = Array.isArray(raw?.themes)
    ? raw.themes.filter((t: any) => typeof t === 'string' && t.trim().length > 0)
    : [];
  if (themes.length === 0 && rawEntities) {
    themes = rawEntities
      .filter((e: any) => e.entity_type === 'theme')
      .map((e: any) => e.entity_name);
  }

  // 2. Symbols (with fallback from key_elements or entities)
  let symbols: DreamSymbol[] = [];
  if (Array.isArray(raw?.symbols)) {
    symbols = raw.symbols
      .filter((s: any) => s && (typeof s === 'string' || typeof s?.name === 'string'))
      .map((s: any) => {
        if (typeof s === 'string') {
          return { name: s.trim() };
        }
        return {
          name: String(s.name || '').trim(),
          ...(typeof s.reflection === 'string' && s.reflection.trim().length > 0
            ? { reflection: s.reflection.trim() }
            : {}),
        };
      })
      .filter((s: DreamSymbol) => s.name.length > 0);
  }
  if (symbols.length === 0 && Array.isArray(raw?.key_elements) && raw.key_elements.length > 0) {
    symbols = raw.key_elements
      .filter((k: any) => typeof k === 'string' && k.trim().length > 0)
      .map((k: string) => ({ name: k.trim() }));
  }
  if (symbols.length === 0 && rawEntities) {
    symbols = rawEntities
      .filter((e: any) => e.entity_type === 'symbol' || e.entity_type === 'object')
      .map((e: any) => ({ name: e.entity_name }));
  }

  // 3. People (with fallback from entities)
  let people: string[] = [];
  if (Array.isArray(raw?.people)) {
    people = raw.people
      .filter((p: any) => typeof p === 'string' && p.trim().length > 0)
      .map((p: string) => p.trim());
  } else if (rawEntities) {
    people = rawEntities
      .filter((e: any) => e.entity_type === 'person')
      .map((e: any) => e.entity_name);
  }

  // 4. Locations (with fallback from entities)
  let locations: string[] = [];
  if (Array.isArray(raw?.locations)) {
    locations = raw.locations
      .filter((l: any) => typeof l === 'string' && l.trim().length > 0)
      .map((l: string) => l.trim());
  } else if (rawEntities) {
    locations = rawEntities
      .filter((e: any) => e.entity_type === 'place')
      .map((e: any) => e.entity_name);
  }

  // 5. Notable details
  const notable_details = Array.isArray(raw?.notable_details)
    ? raw.notable_details
        .filter((d: any) => typeof d === 'string' && d.trim().length > 0)
        .map((d: string) => d.trim())
    : [];

  // 6. Key elements (backward compatibility: symbols + prominent elements)
  let key_elements = Array.isArray(raw?.key_elements)
    ? raw.key_elements.filter((k: any) => typeof k === 'string' && k.trim().length > 0)
    : [];
  if (key_elements.length === 0) {
    key_elements = symbols.map((s) => s.name);
  }

  const possible_interpretations = Array.isArray(raw?.possible_interpretations)
    ? raw.possible_interpretations.filter((p: any) => typeof p === 'string' && p.trim().length > 0)
    : [];
  const recurring_patterns = Array.isArray(raw?.recurring_patterns)
    ? raw.recurring_patterns.filter((r: any) => typeof r === 'string' && r.trim().length > 0)
    : [];
  const reflection_questions = Array.isArray(raw?.reflection_questions)
    ? raw.reflection_questions.filter((q: any) => typeof q === 'string' && q.trim().length > 0)
    : [];
  const insight = typeof raw?.insight === 'string' ? raw.insight : '';

  return {
    summary,
    emotions,
    themes,
    symbols,
    people,
    locations,
    notable_details,
    possible_interpretations,
    recurring_patterns,
    reflection_questions,
    insight,
    key_elements,
    ...(rawEntities ? { entities: rawEntities } : {}),
  };
}

export async function analyzeDream(
  dreamContent: string,
  dreamDate: string,
  mood: string,
  lucidity: string,
  previousDreams?: PreviousDreamContext[],
  rawTranscript?: string
): Promise<DreamAnalysis> {
  try {
    const ai = getAIClient();

    let userMessage = `Dream Date: ${dreamDate}\nMood: ${mood}\nLucidity: ${lucidity}\n\nDream Content:\n${dreamContent}`;

    if (
      rawTranscript &&
      rawTranscript.trim().length > 0 &&
      rawTranscript.trim() !== dreamContent.trim()
    ) {
      userMessage += `\n\nOriginal Spoken Transcript (Raw audio capture context for emotional nuance):\n${rawTranscript.trim()}`;
    }

    if (previousDreams && previousDreams.length > 0) {
      userMessage +=
        '\n\nPrevious Dreams Context:\n' +
        JSON.stringify(previousDreams, null, 2);
    }

    let response: Awaited<
      ReturnType<typeof ai.models.generateContent>
    > | null = null;

    for (const model of GENERATION_MODELS) {
      try {
        console.log(`Trying Gemini model for dream analysis: ${model}`);

        response = await ai.models.generateContent({
          model,
          contents: userMessage,
          config: {
            systemInstruction: DREAM_ANALYSIS_PROMPT,
            responseMimeType: 'application/json',
          },
        });

        console.log(`Dream analysis succeeded with: ${model}`);
        break;
      } catch (error) {
        console.error(`Gemini model ${model} failed:`, error);

        if (!shouldFallbackToNextModel(error)) {
          throw error;
        }

        console.log(`Falling back from ${model} to the next model...`);
      }
    }

    if (!response) {
      throw new Error('All Gemini generation models failed.');
    }

    const responseText = response.text;

    if (!responseText) {
      throw new Error('AI returned an empty response.');
    }

    // Clean up response text to isolate JSON
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, '');
      cleanedText = cleanedText.replace(/\n?```$/i, '');
    }
    cleanedText = cleanedText.trim();

    // Isolate actual JSON object starting from first '{' and ending at last '}'
    const startIdx = cleanedText.indexOf('{');
    const endIdx = cleanedText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleanedText = cleanedText.substring(startIdx, endIdx + 1);
    }

    const parsedRaw = JSON.parse(cleanedText);
    const analysis = sanitizeAnalysis(parsedRaw);

    return analysis;
  } catch (error) {
    console.error('Error in analyzeDream:', error);
    throw new Error('Failed to analyze dream. Please try again.');
  }
}
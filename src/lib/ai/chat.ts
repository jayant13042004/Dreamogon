import {
  getAIClient,
  GENERATION_MODELS,
  shouldFallbackToNextModel,
} from '@/lib/ai/client';
import { CHAT_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import type { DreamReferenceItem } from '@/types/ai';

export interface DreamContext {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: string;
  themes: string[];
  summary: string;
}

export interface ArchiveContextMeta {
  totalCount: number;
  earliestDate?: string;
  latestDate?: string;
  searchedTopic?: string;
  zeroMatchesFound?: boolean;
  topRecurringArtifacts?: Array<{ name: string; type: string; count: number }>;
}

// Optimized fast model priority for real-time conversational latency
const FAST_CHAT_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
] as const;

export async function chatWithDreamHistory(
  userMessage: string,
  dreamContext: DreamContext[],
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>,
  archiveMeta?: ArchiveContextMeta
): Promise<{
  response: string;
  dreamReferences: DreamReferenceItem[];
}> {
  try {
    const ai = getAIClient();

    // 1. Build Provenance & Archive Header
    let archiveHeader = '';
    if (archiveMeta) {
      archiveHeader += `ARCHIVE STATUS & PROVENANCE:\n`;
      archiveHeader += `• Total recorded dreams in archive: ${archiveMeta.totalCount}\n`;
      if (archiveMeta.earliestDate && archiveMeta.latestDate) {
        archiveHeader += `• Archive date range: ${archiveMeta.earliestDate} to ${archiveMeta.latestDate}\n`;
      }
      if (archiveMeta.topRecurringArtifacts && archiveMeta.topRecurringArtifacts.length > 0) {
        const topList = archiveMeta.topRecurringArtifacts
          .map((a) => `${a.name} (${a.type}, ${a.count}×)`)
          .join(', ');
        archiveHeader += `• Key recurring archive motifs: ${topList}\n`;
      }
      if (archiveMeta.zeroMatchesFound && archiveMeta.searchedTopic) {
        archiveHeader += `• VERIFIED SEARCH: A comprehensive search across all ${archiveMeta.totalCount} dreams for "${archiveMeta.searchedTopic}" yielded ZERO matches. Inform the user accurately that this is absent from their archive.\n`;
      }
      archiveHeader += '\n';
    }

    // 2. Format Retrieved Dreams Context
    const formattedDreams = dreamContext.slice(0, 18).map((d) => {
      const themesStr = d.themes && d.themes.length > 0 ? ` [Themes: ${d.themes.join(', ')}]` : '';
      const summaryOrSnippet = d.summary ? d.summary : d.content.slice(0, 180);
      return `• [ID: ${d.id}] "${d.title}" (${d.date}, mood: ${d.mood})${themesStr} - ${summaryOrSnippet}`;
    }).join('\n');

    const contextString = formattedDreams.length > 0
      ? `${archiveHeader}RETRIEVED DREAMS FROM ARCHIVE:\n${formattedDreams}`
      : `${archiveHeader}No matching dreams retrieved from archive.`;

    const systemMessage = `${CHAT_SYSTEM_PROMPT}

${contextString}

Instructions:
Respond in 2-3 thoughtful paragraphs with grounded, observational language.
Always cite the title and date of any dream you discuss.
At the very end of your response, output:
<references>[{"id": "...", "title": "...", "date": "..."}]</references>`;

    // Take last 6 turns of conversation history
    const recentHistory = conversationHistory.slice(-6);

    const contents = recentHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;

    for (const model of FAST_CHAT_MODELS) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: systemMessage,
            temperature: 0.6,
            maxOutputTokens: 750,
          },
        });
        break;
      } catch (error) {
        console.error(`Model ${model} failed, attempting fallback:`, error);
        if (!shouldFallbackToNextModel(error)) {
          throw error;
        }
      }
    }

    if (!response) {
      throw new Error('All generation models failed.');
    }

    const responseText = response.text || '';
    let cleanResponse = responseText;
    let parsedRefs: any[] = [];

    const refMatch = responseText.match(/<references>([\s\S]*?)<\/references>/);
    if (refMatch) {
      cleanResponse = responseText.replace(/<references>[\s\S]*?<\/references>/, '').trim();
      try {
        parsedRefs = JSON.parse(refMatch[1].trim());
      } catch (e) {
        console.warn('Could not parse dream references JSON:', e);
      }
    }

    // Normalize dream references into DreamReferenceItem[]
    const dreamReferences: DreamReferenceItem[] = [];
    const seenIds = new Set<string>();

    for (const ref of parsedRefs) {
      let refId = '';
      let refTitle = '';
      let refDate = '';

      if (typeof ref === 'string') {
        refId = ref;
      } else if (ref && typeof ref === 'object') {
        refId = ref.id || '';
        refTitle = ref.title || '';
        refDate = ref.date || '';
      }

      if (!refId || seenIds.has(refId)) continue;
      seenIds.add(refId);

      const matchedContext = dreamContext.find((d) => d.id === refId);
      dreamReferences.push({
        id: refId,
        title: refTitle || matchedContext?.title || 'Recorded Dream',
        date: refDate || matchedContext?.date || '',
      });
    }

    return {
      response: cleanResponse,
      dreamReferences,
    };
  } catch (error) {
    console.error('Error in chatWithDreamHistory:', error);
    throw new Error('Failed to respond to chat.');
  }
}
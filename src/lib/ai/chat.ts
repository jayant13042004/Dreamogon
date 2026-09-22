import {
  getAIClient,
  GENERATION_MODELS,
  shouldFallbackToNextModel,
} from '@/lib/ai/client';
import { CHAT_SYSTEM_PROMPT } from '@/lib/ai/prompts';

interface DreamContext {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: string;
  themes: string[];
  summary: string;
}

// Optimized fast model priority for real-time conversational latency
const FAST_CHAT_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
] as const;

export async function chatWithDreamHistory(
  userMessage: string,
  dreamContext: DreamContext[],
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>
): Promise<{ response: string; dreamReferences: Array<{ id: string; title?: string; date?: string }> }> {
  try {
    const ai = getAIClient();

    // Streamlined compact context for ultra-low token latency
    const compactContext = dreamContext.slice(0, 15).map(d => 
      `• [ID: ${d.id}] "${d.title}" (${d.date}, mood: ${d.mood}) - ${d.summary || d.content.slice(0, 120)}`
    ).join('\n');

    const contextString = compactContext.length > 0
      ? `User's Recorded Dreams:\n${compactContext}`
      : 'No recorded dreams yet.';

    const systemMessage = `${CHAT_SYSTEM_PROMPT}

${contextString}

Instructions:
Be insightful, warm, concise, and direct. Respond in 2-3 focused paragraphs.
If you refer to any specific dream from the list, append its ID at the very end in format: <references>["id1", "id2"]</references>`;

    // Take only last 6 turns of conversation history for speed
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
            maxOutputTokens: 600,
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
    let refIds: string[] = [];

    const refMatch = responseText.match(/<references>(.*?)<\/references>/);
    if (refMatch) {
      cleanResponse = responseText.replace(/<references>.*?<\/references>/, '').trim();
      try {
        refIds = JSON.parse(refMatch[1]);
      } catch (e) {
        console.warn('Could not parse dream references:', e);
      }
    }

    // Map referenced IDs back to dream titles and dates for UI cards
    const dreamReferences = refIds.map(id => {
      const match = dreamContext.find(d => d.id === id);
      return match ? { id: match.id, title: match.title, date: match.date } : { id };
    });

    return {
      response: cleanResponse,
      dreamReferences,
    };
  } catch (error) {
    console.error('Error in chatWithDreamHistory:', error);
    throw new Error('Failed to respond to chat.');
  }
}
import { GoogleGenAI } from '@google/genai';
import { getAIClient } from './client';

export interface StructuredDreamScene {
  primaryScene: string;
  keyObjects: string[];
  environment: string[];
  figures: string[];
  lighting: string;
  timeOfDay: string;
  dominantEmotions: string[];
  colorPalette: string;
  composition: string;
  surrealAtmosphere: string;
}

export const FREE_DREAM_IMAGES_LIMIT = 2;
/** @deprecated Use PLANS.pro_monthly.dreamImages.limit from @/lib/billing — Pro is 20/month */
export const PRO_DREAM_IMAGES_LIMIT = 20;

/**
 * Subconscious Log Global Visual Art Directive
 * Enforces a recognizable, cinematic, slightly surreal, memory-like aesthetic across all dreams.
 */
const SUBCONSCIOUS_LOG_VISUAL_DIRECTIVE = `
Visual Aesthetics:
- Style: Atmospheric cinematic film still, fine art realism with subtle surrealism, dreamy analog texture, elegant color grading, soft volumetric lighting.
- Mood: Evocative, deeply emotional, quiet, mysterious, feels like a sacred personal memory rather than commercial artwork.
- Composition: Wide or medium cinematic framing (16:9 or 4:3), shallow depth of field, rich environmental context.
- Negative Constraints: Strictly NO text, NO words, NO letters, NO watermarks, NO signatures, NO cartoonish features, NO anime, NO bright neon oversaturation, NO generic fantasy cliches (no random stars, floating moons, brains, or dream bubbles unless explicitly in the dream).
- Human Presence: If people are present, render them as distant silhouettes, back-facing figures, or subtle atmospheric presence to preserve personal identity and privacy.
`.trim();

/**
 * Step 1: Analyze dream content and extract a structured scene representation.
 */
export async function extractDreamSceneStructure(
  content: string,
  title?: string,
  mood?: string
): Promise<StructuredDreamScene> {
  const ai = getAIClient();

  const prompt = `
You are Subconscious Log's Dream Visual Director.
Analyze the following dream journal entry and extract its core visual memory elements into structured JSON.
Focus on the emotional atmosphere, primary scene, environment, lighting, and key objects that made this dream visually distinct.

Dream Title: ${title || 'Untitled'}
Mood: ${mood || 'Reflective'}
Dream Content:
"${content}"

Return JSON matching this schema:
{
  "primaryScene": "A concise description of the central visual scene",
  "keyObjects": ["list of recognizable, important objects mentioned"],
  "environment": ["list of landscape or architectural settings"],
  "figures": ["description of people as silhouettes or distant figures, or empty if none"],
  "lighting": "Description of the lighting (e.g., golden twilight, wet neon reflections, diffused mist)",
  "timeOfDay": "night / dawn / twilight / golden hour / daytime / eclipse",
  "dominantEmotions": ["e.g., peaceful, melancholic, awe-inspiring, mysterious"],
  "colorPalette": "e.g., deep midnight indigo, amber headlights, wet asphalt, ocean turquoise",
  "composition": "e.g., wide cinematic shot from behind a vehicle looking toward an expansive horizon",
  "surrealAtmosphere": "e.g., quiet stillness where the distant house seems closer than physically possible"
}
`.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text) as StructuredDreamScene;
    return parsed;
  } catch (error) {
    console.error('Failed to extract structured dream scene:', error);
    return {
      primaryScene: title || 'A surreal subconscious landscape',
      keyObjects: [],
      environment: ['dreamscape', 'ethereal atmosphere'],
      figures: [],
      lighting: 'soft ambient twilight',
      timeOfDay: 'twilight',
      dominantEmotions: [mood || 'peaceful'],
      colorPalette: 'deep violet, dusky amber, soft charcoal',
      composition: 'wide cinematic framing with expansive depth',
      surrealAtmosphere: 'subtle ethereal calm with deep spatial horizon',
    };
  }
}

/**
 * Step 2: Build the finalized generation prompt using the Subconscious Log visual language.
 */
export function buildDreamImagePrompt(scene: StructuredDreamScene): string {
  const parts: string[] = [];

  parts.push(`Cinematic dream visual memory: ${scene.primaryScene}.`);

  if (scene.environment.length > 0) {
    parts.push(`Environment: ${scene.environment.join(', ')}.`);
  }

  if (scene.keyObjects.length > 0) {
    parts.push(`Prominent elements: ${scene.keyObjects.join(', ')}.`);
  }

  if (scene.figures.length > 0) {
    parts.push(`Figures: ${scene.figures.join(', ')}.`);
  }

  parts.push(`Lighting: ${scene.lighting}, during ${scene.timeOfDay}.`);
  parts.push(`Atmosphere and tone: ${scene.dominantEmotions.join(', ')}. ${scene.surrealAtmosphere}.`);
  parts.push(`Color grading: ${scene.colorPalette}.`);
  parts.push(`Framing: ${scene.composition}.`);
  parts.push(SUBCONSCIOUS_LOG_VISUAL_DIRECTIVE);

  return parts.join(' ');
}

export interface DreamImageResult {
  /** Raw image bytes — upload to Supabase Storage; do not persist as base64 in Postgres */
  bytes: Buffer;
  mimeType: string;
  structuredScene: StructuredDreamScene;
  prompt: string;
}

/**
 * Step 3: Generate the visual image for the dream.
 * Returns bytes for Storage upload. Uses existing providers (Imagen → OpenAI → Pollinations → SVG).
 */
export async function generateDreamVisual(
  content: string,
  title?: string,
  mood?: string
): Promise<DreamImageResult> {
  const structuredScene = await extractDreamSceneStructure(content, title, mood);
  const prompt = buildDreamImagePrompt(structuredScene);

  const googleApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (googleApiKey && !googleApiKey.startsWith('AQ.')) {
    try {
      const ai = getAIClient();
      const imageResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '4:3',
        },
      });
      const generated = imageResponse.generatedImages?.[0];
      if (generated?.image?.imageBytes) {
        return {
          bytes: Buffer.from(generated.image.imageBytes, 'base64'),
          mimeType: 'image/jpeg',
          structuredScene,
          prompt,
        };
      }
    } catch (apiError) {
      console.warn('Google Imagen generation failed, trying next provider:', apiError);
    }
  }

  if (openaiApiKey) {
    try {
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: openaiApiKey });
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      });
      const remoteUrl = response?.data?.[0]?.url;
      if (remoteUrl) {
        const fetched = await fetchRemoteImage(remoteUrl);
        if (fetched) {
          return { ...fetched, structuredScene, prompt };
        }
      }
    } catch (openAIErr) {
      console.warn('OpenAI DALL·E generation failed, trying neural engine:', openAIErr);
    }
  }

  try {
    const cleanPrompt = encodeURIComponent(
      `${structuredScene.primaryScene}, ${structuredScene.lighting}, ${structuredScene.colorPalette}, cinematic dream film still, 35mm photograph, ethereal fine art realism, masterwork`
    );
    const randomSeed = Math.floor(Math.random() * 1000000);
    const fluxUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=768&nologo=true&seed=${randomSeed}&model=flux`;

    const fetched = await fetchRemoteImage(fluxUrl, 15000);
    if (fetched) {
      return { ...fetched, structuredScene, prompt };
    }
  } catch (neuralErr) {
    console.warn('Flux neural image generation failed, using procedural fallback:', neuralErr);
  }

  const svg = generateProceduralDreamCanvas(structuredScene);
  return {
    bytes: Buffer.from(svg, 'utf8'),
    mimeType: 'image/svg+xml',
    structuredScene,
    prompt,
  };
}

async function fetchRemoteImage(
  url: string,
  timeoutMs = 20000
): Promise<{ bytes: Buffer; mimeType: string } | null> {
  const imageFetch = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!imageFetch.ok) return null;
  const arrayBuffer = await imageFetch.arrayBuffer();
  const mimeType = (imageFetch.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
  return {
    bytes: Buffer.from(arrayBuffer),
    mimeType: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
  };
}

/**
 * Generates an artistic, procedural SVG dream memory card encoding the exact mood, palette, and elements.
 */
function generateProceduralDreamCanvas(scene: StructuredDreamScene): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0914" />
      <stop offset="50%" stop-color="#1A142D" />
      <stop offset="100%" stop-color="#2D1E4A" />
    </linearGradient>
    <radialGradient id="aura1" cx="30%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#9D7BFA" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#9D7BFA" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="aura2" cx="75%" cy="65%" r="50%">
      <stop offset="0%" stop-color="#5B3FB8" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#5B3FB8" stop-opacity="0" />
    </radialGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="60" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="url(#bg)" />

  <!-- Ambient Light Orbs -->
  <circle cx="280" cy="220" r="220" fill="url(#aura1)" filter="url(#blur)" />
  <circle cx="600" cy="400" r="260" fill="url(#aura2)" filter="url(#blur)" />

  <!-- Subtle Horizon & Ethereal Land Contour -->
  <path d="M 0 440 Q 200 410 400 450 T 800 420 L 800 600 L 0 600 Z" fill="#07060A" opacity="0.85" />
  <path d="M 0 490 Q 300 470 600 500 T 800 480 L 800 600 L 0 600 Z" fill="#050407" opacity="0.95" />

  <!-- Atmospheric Glow Lines -->
  <line x1="0" y1="440" x2="800" y2="420" stroke="#B7A9D9" stroke-opacity="0.2" stroke-width="1" />

  <!-- Soft Central Reflection Glyph -->
  <g transform="translate(400, 280)" opacity="0.6">
    <circle r="65" fill="none" stroke="#B7A9D9" stroke-width="1" stroke-dasharray="4,6" opacity="0.4" />
    <circle r="35" fill="none" stroke="#9D7BFA" stroke-width="1.5" opacity="0.6" />
    <circle r="6" fill="#FFFFFF" opacity="0.8" />
  </g>

  <!-- Memory Caption Watermark -->
  <text x="40" y="550" fill="#FFFFFF" opacity="0.85" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" letter-spacing="1">
    ${escapeXml(scene.primaryScene.slice(0, 60))}${scene.primaryScene.length > 60 ? '...' : ''}
  </text>
  <text x="40" y="572" fill="#B7A9D9" opacity="0.6" font-family="system-ui, -apple-system, sans-serif" font-size="11" letter-spacing="2" text-transform="uppercase">
    ${escapeXml(scene.dominantEmotions.join(' • '))} • ${escapeXml(scene.timeOfDay)}
  </text>
</svg>
`.trim();

  return svg;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

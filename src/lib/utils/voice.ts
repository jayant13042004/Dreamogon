/**
 * Voice Transcription Deduplication & Merging Utility
 *
 * Solves the Web Speech API repetition bug on mobile browsers (particularly
 * Android Chrome and iOS WebKit) where `onresult` re-emits historical transcripts,
 * repeats the entire phrase 4-5 times, or creates partial phrase overlaps.
 */

/**
 * Normalizes a word string for comparison by removing punctuation and lowercasing.
 */
function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, '')
    .trim();
}

/**
 * Detects and collapses consecutive repeated phrases or sentences within a single transcript string.
 * Solves the mobile Android Chrome / WebKit bug where a single result delivers repeated words
 * like "I saw water I saw water I saw water" or "flying flying".
 */
export function removeConsecutiveDuplicatePhrases(text: string): string {
  if (!text || !text.trim()) return '';
  let result = text.trim();

  // 1. Sentence-level deduplication
  const sentences = result.split(/(?<=[.?!;])\s+/);
  if (sentences.length >= 2) {
    const dedupedSentences: string[] = [];
    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i].trim();
      const normS = normalizeForComparison(s);
      const prevNorm =
        dedupedSentences.length > 0
          ? normalizeForComparison(dedupedSentences[dedupedSentences.length - 1])
          : '';
      if (!normS) continue;
      if (normS !== prevNorm) {
        dedupedSentences.push(s);
      }
    }
    result = dedupedSentences.join(' ');
  }

  // 2. Word-sequence deduplication (collapses repeated sequences of 1 to 12 words)
  const words = result.split(/\s+/);
  if (words.length >= 2) {
    let changed = true;
    let currentWords = [...words];

    while (changed) {
      changed = false;
      const maxPatternLen = Math.floor(currentWords.length / 2);
      for (let patternLen = 1; patternLen <= Math.min(maxPatternLen, 12); patternLen++) {
        for (let i = 0; i <= currentWords.length - 2 * patternLen; i++) {
          const sliceA = currentWords
            .slice(i, i + patternLen)
            .map(normalizeForComparison)
            .join(' ');
          const sliceB = currentWords
            .slice(i + patternLen, i + 2 * patternLen)
            .map(normalizeForComparison)
            .join(' ');

          if (sliceA && sliceA === sliceB) {
            currentWords.splice(i + patternLen, patternLen);
            changed = true;
            break;
          }
        }
        if (changed) break;
      }
    }
    result = currentWords.join(' ');
  }

  return result;
}

/**
 * Merges an incoming speech transcript chunk into the existing accumulated text.
 * Prevents duplicates, handles overlapping word sequences, and normalizes spacing.
 */
export function mergeTranscripts(existingText: string, incomingChunk: string): string {
  const existing = (existingText || '').trim();
  const cleanedIncoming = removeConsecutiveDuplicatePhrases(incomingChunk || '');
  const incoming = cleanedIncoming.trim();

  if (!incoming) return existingText;
  if (!existing) return incoming;

  const normExisting = normalizeForComparison(existing);
  const normIncoming = normalizeForComparison(incoming);

  // 1. Exact match or existing already ends with incoming
  if (normExisting === normIncoming || normExisting.endsWith(normIncoming)) {
    return existingText;
  }

  // 2. Incoming is fully contained within existing (common mobile re-emission)
  if (normExisting.includes(normIncoming)) {
    return existingText;
  }

  // 3. Incoming already starts with the existing text (full replacement with continuation)
  if (normIncoming.startsWith(normExisting)) {
    return incoming;
  }

  // 4. Word-level sliding overlap detection
  //    Use up to 30 words to handle mobile Chrome which can re-emit long phrases
  const existingWords = existing.split(/\s+/);
  const incomingWords = incoming.split(/\s+/);

  const maxOverlap = Math.min(existingWords.length, incomingWords.length, 30);
  let overlapCount = 0;

  for (let len = maxOverlap; len >= 1; len--) {
    const existingSlice = existingWords
      .slice(-len)
      .map(normalizeForComparison)
      .join(' ');
    const incomingSlice = incomingWords
      .slice(0, len)
      .map(normalizeForComparison)
      .join(' ');

    if (existingSlice === incomingSlice) {
      overlapCount = len;
      break;
    }
  }

  if (overlapCount > 0) {
    const newWords = incomingWords.slice(overlapCount);
    if (newWords.length === 0) {
      return existingText;
    }
    const needsSpace = !existingText.endsWith(' ') && !existingText.endsWith('\n');
    return existingText + (needsSpace ? ' ' : '') + newWords.join(' ');
  }

  // 5. No overlap detected: append with space
  const needsSpace = !existingText.endsWith(' ') && !existingText.endsWith('\n');
  return existingText + (needsSpace ? ' ' : '') + incoming;
}

/**
 * Detects the best supported recording MIME type in the current browser.
 * Returns undefined if no specific MIME type can be guaranteed, signaling
 * MediaRecorder to use browser default rather than throwing a NotSupportedError.
 */
export function getBestSupportedAudioMimeType(): string | undefined {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return undefined;
  }
  if (typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }

  // Candidate types in priority order
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/wav',
    'audio/x-m4a',
  ];

  for (const candidate of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    } catch {
      // Continue searching
    }
  }

  return undefined;
}

/**
 * Sniffs the magic byte headers of an audio buffer to return the true MIME type.
 * Prevents Gemini decode failures when mobile browsers (e.g. iOS Safari) produce MP4/AAC
 * but client-side code labeled it as audio/webm.
 */
export function detectAudioFormatFromBytes(
  buffer: Uint8Array | Buffer | ArrayBuffer | null | undefined,
  fallback = 'audio/webm'
): { mimeType: string; extension: string } {
  if (!buffer) return { mimeType: fallback, extension: 'webm' };

  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (bytes.length < 4) return { mimeType: fallback, extension: 'webm' };

  // 1. WebM / Matroska: 0x1A 0x45 0xDF 0xA3
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return { mimeType: 'audio/webm', extension: 'webm' };
  }

  // 2. Ogg: 'OggS' (0x4F 0x67 0x67 0x53)
  if (bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
    return { mimeType: 'audio/ogg', extension: 'ogg' };
  }

  // 3. WAV: 'RIFF' (0x52 0x49 0x46 0x46)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return { mimeType: 'audio/wav', extension: 'wav' };
  }

  // 4. MP3 ID3 (0x49 0x44 0x33) or sync word 0xFF 0xFB / 0xFF 0xF3 / 0xFF 0xF2
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return { mimeType: 'audio/mp3', extension: 'mp3' };
  }
  if (bytes[0] === 0xff && (bytes[1] === 0xfb || bytes[1] === 0xf3 || bytes[1] === 0xf2)) {
    return { mimeType: 'audio/mp3', extension: 'mp3' };
  }

  // 5. AAC ADTS: 0xFF 0xF1 or 0xFF 0xF9
  if (bytes[0] === 0xff && (bytes[1] === 0xf1 || bytes[1] === 0xf9)) {
    return { mimeType: 'audio/aac', extension: 'aac' };
  }

  // 6. MP4 / M4A:
  // Typically has 4-byte length followed by 'ftyp' or 'moov' at offset 4
  if (bytes.length >= 8) {
    const box = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
    if (box === 'ftyp' || box === 'moov') {
      return { mimeType: 'audio/mp4', extension: 'mp4' };
    }
  }

  const cleanFallback = fallback.split(';')[0].trim().toLowerCase() || 'audio/webm';
  const ext =
    cleanFallback.includes('mp4') || cleanFallback.includes('m4a')
      ? 'mp4'
      : cleanFallback.includes('aac')
      ? 'aac'
      : cleanFallback.includes('ogg')
      ? 'ogg'
      : cleanFallback.includes('wav')
      ? 'wav'
      : cleanFallback.includes('mp3') || cleanFallback.includes('mpeg')
      ? 'mp3'
      : 'webm';

  return { mimeType: cleanFallback, extension: ext };
}

export function getAudioFileExtension(mimeType: string): string {
  const clean = (mimeType || '').split(';')[0].trim().toLowerCase();
  if (clean.includes('mp4') || clean.includes('m4a')) return 'mp4';
  if (clean.includes('aac')) return 'aac';
  if (clean.includes('ogg')) return 'ogg';
  if (clean.includes('wav')) return 'wav';
  if (clean.includes('mp3') || clean.includes('mpeg')) return 'mp3';
  return 'webm';
}


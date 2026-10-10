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

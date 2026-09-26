const DRAFT_PREFIX = 'subconscious_log_dream_draft';
const LEGACY_DRAFT_PREFIX = 'dreamogon_dream_draft';
const OLD_LEGACY_DRAFT_PREFIX = 'lucida_dream_draft';

export type MemoryType = 'full' | 'fragment' | 'feeling' | 'scene';

export type DreamDraft = {
  title?: string;
  date?: string;
  content?: string;
  mood?: string | null;
  lucidity?: string | null;
  tags?: string[];
  memoryType?: MemoryType;
  updatedAt?: string;
};

export function draftStorageKey(userId: string | null | undefined): string {
  if (!userId) return `${DRAFT_PREFIX}_anonymous`;
  return `${DRAFT_PREFIX}_${userId}`;
}

function legacyDraftStorageKey(userId: string | null | undefined): string {
  if (!userId) return `${LEGACY_DRAFT_PREFIX}_anonymous`;
  return `${LEGACY_DRAFT_PREFIX}_${userId}`;
}

function oldLegacyDraftStorageKey(userId: string | null | undefined): string {
  if (!userId) return `${OLD_LEGACY_DRAFT_PREFIX}_anonymous`;
  return `${OLD_LEGACY_DRAFT_PREFIX}_${userId}`;
}

export function readDreamDraft(userId: string | null | undefined): DreamDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      localStorage.getItem(draftStorageKey(userId)) ||
      localStorage.getItem(legacyDraftStorageKey(userId)) ||
      localStorage.getItem(oldLegacyDraftStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DreamDraft;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDreamDraft(userId: string | null | undefined, draft: DreamDraft): void {
  if (typeof window === 'undefined') return;
  const hasContent =
    Boolean(draft.content?.trim()) ||
    Boolean(draft.title?.trim()) ||
    Boolean(draft.tags?.length) ||
    Boolean(draft.mood) ||
    Boolean(draft.lucidity);

  if (!hasContent) {
    clearDreamDraft(userId);
    return;
  }

  localStorage.setItem(
    draftStorageKey(userId),
    JSON.stringify({ ...draft, updatedAt: new Date().toISOString() })
  );
}

export function clearDreamDraft(userId: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(draftStorageKey(userId));
  // Clear legacy unscoped key from earlier versions
  localStorage.removeItem('dream_journal_draft');
}

export function draftHasSubstance(draft: DreamDraft | null): boolean {
  if (!draft) return false;
  return Boolean((draft.content && draft.content.trim().length > 10) || draft.title?.trim());
}

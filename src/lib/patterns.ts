import type { Dream, DreamEntity, EntityType } from '@/types/dream';
import { toDateKey } from '@/lib/utils/date';

export type CountedItem = {
  name: string;
  count: number;
  type?: EntityType | 'theme' | 'mood';
};

export { toDateKey };

function bump(map: Map<string, CountedItem>, name: string, type?: CountedItem['type']) {
  const key = name.trim().toLowerCase();
  if (!key) return;
  const existing = map.get(key);
  if (existing) {
    existing.count += 1;
  } else {
    map.set(key, { name: name.trim(), count: 1, type });
  }
}

export function aggregateThemes(dreams: Dream[]): CountedItem[] {
  const map = new Map<string, CountedItem>();
  for (const d of dreams) {
    for (const theme of d.ai_themes || []) bump(map, theme, 'theme');
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function aggregateMoods(dreams: Dream[]): CountedItem[] {
  const map = new Map<string, CountedItem>();
  for (const d of dreams) {
    if (d.mood) bump(map, d.mood, 'mood');
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function aggregateEntitiesByType(
  entities: DreamEntity[],
  type: EntityType
): CountedItem[] {
  const map = new Map<string, CountedItem>();
  for (const e of entities) {
    if (e.entity_type === type) bump(map, e.entity_name, type);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function recurringOnly(items: CountedItem[], minCount = 2): CountedItem[] {
  return items.filter((i) => i.count >= minCount);
}

export function buildQuietPatternNotes(args: {
  dreamCount: number;
  themes: CountedItem[];
  people: CountedItem[];
  places: CountedItem[];
  moods: CountedItem[];
}): string[] {
  const notes: string[] = [];
  const { dreamCount, themes, people, places, moods } = args;

  if (dreamCount < 2) return notes;

  const topTheme = themes.find((t) => t.count >= 2);
  if (topTheme) {
    notes.push(
      `"${topTheme.name}" appears in ${topTheme.count} dreams — a possible recurring thread worth noticing.`
    );
  }

  const topPerson = people.find((p) => p.count >= 2);
  if (topPerson) {
    notes.push(
      `${topPerson.name} shows up across ${topPerson.count} entries. That may reflect waking life — or simply memory.`
    );
  }

  const topPlace = places.find((p) => p.count >= 2);
  if (topPlace) {
    notes.push(
      `The place "${topPlace.name}" returns in ${topPlace.count} dreams. Familiar settings often carry emotional weight.`
    );
  }

  const topMood = moods.find((m) => m.count >= 2);
  if (topMood) {
    notes.push(
      `You marked "${topMood.name}" most often (${topMood.count} times). Mood tags are your labels, not diagnoses.`
    );
  }

  if (notes.length === 0 && dreamCount >= 3) {
    notes.push(
      'Your journal is growing. As more dreams share themes or people, clearer patterns will surface here.'
    );
  }

  return notes;
}

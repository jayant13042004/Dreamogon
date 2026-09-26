import { SupabaseClient } from '@supabase/supabase-js';
import { DreamArtifact, EntityType, DreamInsight } from '@/types/dream';
import { resolveDreamImageUrl } from '@/lib/storage/dream-images';

/**
 * Deterministic pseudo-random number generator based on string seed
 */
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

export interface DreamArtifactConnection {
  sourceId: string;
  targetId: string;
  strength: number;
  sharedDreamCount: number;
  sampleDreamTitle?: string;
}

export interface DreamWorldData {
  artifacts: DreamArtifact[];
  connections: DreamArtifactConnection[];
  insights: DreamInsight[];
  dreamCount: number;
  topThemes: string[];
  mostRecurringElement: string | null;
  topEmotion: string | null;
  hasUnfamiliarConnection: boolean;
  earliestDreamDate?: string;
  latestDreamDate?: string;
  totalMilestone: number;
}

/**
 * Dream World source of truth:
 * - dream_entities + dreams.ai_themes / mood (canonical)
 * - dream_artifacts / dream_connections (derived cache for stable positions and co-occurrence)
 */
export async function fetchCompleteDreamWorldData(
  supabase: SupabaseClient,
  userId: string
): Promise<DreamWorldData> {
  try {
    const [dreamsRes, entitiesRes, artifactsRes, insightsRes, connectionsRes] = await Promise.all([
      supabase
        .from('dreams')
        .select('id, title, dream_date, ai_symbols, ai_themes, ai_emotions, mood, image_url, image_path, ai_analysis')
        .eq('user_id', userId)
        .order('dream_date', { ascending: false }),
      supabase.from('dream_entities').select('*').eq('user_id', userId),
      supabase.from('dream_artifacts').select('*').eq('user_id', userId),
      supabase.from('dream_insights').select('*').eq('user_id', userId),
      supabase.from('dream_connections').select('*').eq('user_id', userId),
    ]);

    const dreams = dreamsRes.data || [];
    const dreamCount = dreams.length;
    const cachedArtifacts = (artifactsRes.data || []) as DreamArtifact[];
    const dbConnections = connectionsRes.data || [];

    // Chronological boundaries
    const sortedDreamsAsc = [...dreams].sort(
      (a, b) => new Date(a.dream_date).getTime() - new Date(b.dream_date).getTime()
    );
    const earliestDreamDate = sortedDreamsAsc[0]?.dream_date;
    const latestDreamDate = sortedDreamsAsc[sortedDreamsAsc.length - 1]?.dream_date;

    // Temporal threshold: last 40% of dreams or recent cutoff
    let recentThresholdDate = earliestDreamDate || new Date().toISOString();
    if (sortedDreamsAsc.length >= 3) {
      const cutoffIdx = Math.floor(sortedDreamsAsc.length * 0.6);
      recentThresholdDate = sortedDreamsAsc[cutoffIdx]?.dream_date || recentThresholdDate;
    }

    // Index cached artifact positions by type:name
    const cachedByKey = new Map<string, DreamArtifact>();
    for (const a of cachedArtifacts) {
      cachedByKey.set(`${a.artifact_type}:${a.name.toLowerCase().trim()}`, a);
    }

    type EntityAgg = {
      name: string;
      type: EntityType;
      count: number;
      firstSeen: string;
      lastSeen: string;
      relatedDreamIds: string[];
      relatedDreams: Array<{ id: string; title: string; date: string; imageUrl?: string | null }>;
    };

    const entityMap = new Map<string, EntityAgg>();
    // Track which entity keys appeared in each dream ID for co-occurrence connections
    const dreamToEntityKeys = new Map<string, Set<string>>();

    const upsertEntity = (
      type: EntityType,
      name: string,
      dreamId: string,
      date: string,
      title: string,
      imageUrl?: string | null
    ) => {
      if (!name?.trim()) return;
      const key = `${type}:${name.toLowerCase().trim()}`;
      const dreamInfo = {
        id: dreamId,
        title: title || 'Untitled Dream',
        date,
        imageUrl: imageUrl ?? null,
      };

      // Record co-occurrence mapping
      if (!dreamToEntityKeys.has(dreamId)) {
        dreamToEntityKeys.set(dreamId, new Set<string>());
      }
      dreamToEntityKeys.get(dreamId)!.add(key);

      const existing = entityMap.get(key);
      if (existing) {
        existing.count += 1;
        if (!existing.relatedDreamIds.includes(dreamId)) {
          existing.relatedDreamIds.push(dreamId);
          existing.relatedDreams.push(dreamInfo);
        }
        if (new Date(date) > new Date(existing.lastSeen)) {
          existing.lastSeen = date;
        }
        if (new Date(date) < new Date(existing.firstSeen)) {
          existing.firstSeen = date;
        }
      } else {
        entityMap.set(key, {
          name,
          type,
          count: 1,
          firstSeen: date,
          lastSeen: date,
          relatedDreamIds: [dreamId],
          relatedDreams: [dreamInfo],
        });
      }
    };

    // Canonical: dream_entities
    for (const e of entitiesRes.data || []) {
      const parentDream = dreams.find((d: { id: string }) => d.id === e.dream_id);
      const parentImageUrl = parentDream ? resolveDreamImageUrl(parentDream as Parameters<typeof resolveDreamImageUrl>[0]) : null;

      upsertEntity(
        (e.entity_type || 'symbol') as EntityType,
        e.entity_name,
        e.dream_id,
        e.created_at || parentDream?.dream_date || new Date().toISOString(),
        parentDream?.title || 'Dream Entry',
        parentImageUrl
      );
    }

    // Supplement from dream-level themes / symbols / mood
    for (const d of dreams) {
      const imageUrl = resolveDreamImageUrl(d as Parameters<typeof resolveDreamImageUrl>[0]);

      if (Array.isArray(d.ai_themes)) {
        for (const th of d.ai_themes) {
          if (th) upsertEntity('theme', th, d.id, d.dream_date, d.title || 'Untitled Dream', imageUrl);
        }
      }
      if (Array.isArray(d.ai_symbols)) {
        for (const sym of d.ai_symbols) {
          if (sym) upsertEntity('symbol', sym, d.id, d.dream_date, d.title || 'Untitled Dream', imageUrl);
        }
      }
      if (d.mood) {
        upsertEntity('emotion', d.mood, d.id, d.dream_date, d.title || 'Untitled Dream', imageUrl);
      }
    }

    // Calculate Co-Occurrence Connections between pairs of entities
    const pairCoOccurrenceMap = new Map<string, { count: number; sampleTitle: string }>();

    dreamToEntityKeys.forEach((keysSet, dreamId) => {
      const dreamObj = dreams.find((d: { id: string }) => d.id === dreamId);
      const sampleTitle = dreamObj?.title || 'Shared Dream';
      const keys = Array.from(keysSet);

      for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
          const k1 = keys[i];
          const k2 = keys[j];
          const pairKey = k1 < k2 ? `${k1}|||${k2}` : `${k2}|||${k1}`;
          const current = pairCoOccurrenceMap.get(pairKey) || { count: 0, sampleTitle };
          current.count += 1;
          pairCoOccurrenceMap.set(pairKey, current);
        }
      }
    });

    // Build key-to-ID lookup for artifacts
    const keyToArtifactId = new Map<string, string>();
    const entityEntries = Array.from(entityMap.entries());

    entityEntries.forEach(([key, item], index) => {
      const cached = cachedByKey.get(key);
      const artId = cached?.id || `entity_${index}_${encodeURIComponent(item.name)}`;
      keyToArtifactId.set(key, artId);
    });

    // Compute connected artifact IDs for each artifact
    const connectedIdsByArtifactKey = new Map<string, Set<string>>();

    pairCoOccurrenceMap.forEach((meta, pairKey) => {
      const [k1, k2] = pairKey.split('|||');
      const id1 = keyToArtifactId.get(k1);
      const id2 = keyToArtifactId.get(k2);
      if (id1 && id2) {
        if (!connectedIdsByArtifactKey.has(k1)) connectedIdsByArtifactKey.set(k1, new Set());
        if (!connectedIdsByArtifactKey.has(k2)) connectedIdsByArtifactKey.set(k2, new Set());
        connectedIdsByArtifactKey.get(k1)!.add(id2);
        connectedIdsByArtifactKey.get(k2)!.add(id1);
      }
    });

    // Build display artifacts from entities with temporal context
    const artifacts: DreamArtifact[] = entityEntries.map(([key, item], index) => {
      const cached = cachedByKey.get(key);
      const artId = keyToArtifactId.get(key)!;

      // Determine temporal status
      let temporalStatus: 'emerging' | 'recurring' | 'dormant' | 'anchor' | 'fading' = 'recurring';

      if (dreamCount < 3) {
        temporalStatus = 'emerging';
      } else {
        const firstSeenTime = new Date(item.firstSeen).getTime();
        const lastSeenTime = new Date(item.lastSeen).getTime();
        const thresholdTime = new Date(recentThresholdDate).getTime();

        if (item.count >= 3 && firstSeenTime < thresholdTime && lastSeenTime >= thresholdTime) {
          temporalStatus = 'anchor'; // Enduring constant
        } else if (firstSeenTime >= thresholdTime) {
          temporalStatus = 'emerging'; // Newly appeared in recent archive
        } else if (lastSeenTime < thresholdTime) {
          temporalStatus = item.count >= 2 ? 'fading' : 'dormant'; // Earlier memory sleeping in distance
        } else {
          temporalStatus = 'recurring';
        }
      }

      let zoneX = 0;
      let zoneY = 0;
      let zBase = 5;

      if (
        item.type === 'place' ||
        item.name.toLowerCase().includes('home') ||
        item.name.toLowerCase().includes('school')
      ) {
        zoneX = -25;
        zoneY = -15;
        zBase = 15;
      } else if (item.type === 'emotion' || item.type === 'theme') {
        zoneX = 25;
        zoneY = 20;
        zBase = -10;
      } else if (
        item.name.toLowerCase().includes('flight') ||
        item.name.toLowerCase().includes('travel') ||
        item.name.toLowerCase().includes('road')
      ) {
        zoneX = 25;
        zoneY = -15;
        zBase = 8;
      } else {
        zoneX = -20;
        zoneY = 20;
        zBase = 10;
      }

      const posX = cached?.position_x ?? zoneX + (seededRandom(`${key}_x_${index}`) - 0.5) * 35;
      const posY = cached?.position_y ?? zoneY + (seededRandom(`${key}_y_${index}`) - 0.5) * 30;
      const posZ = cached?.position_z ?? zBase + (seededRandom(`${key}_z_${index}`) - 0.5) * 12;

      const connectedIds = Array.from(connectedIdsByArtifactKey.get(key) || []);

      return {
        id: artId,
        user_id: userId,
        artifact_type: item.type,
        name: item.name,
        description: cached?.description ?? null,
        metadata: {
          relatedDreams: item.relatedDreams,
          source: 'dream_entities',
          temporalStatus,
        },
        appearance_count: item.count,
        first_seen_at: item.firstSeen,
        last_seen_at: item.lastSeen,
        position_x: posX,
        position_y: posY,
        position_z: posZ,
        temporal_status: temporalStatus,
        connected_artifact_ids: connectedIds,
        created_at: item.firstSeen,
        updated_at: item.lastSeen,
      };
    });

    // Build connections list
    const connections: DreamArtifactConnection[] = [];
    pairCoOccurrenceMap.forEach((meta, pairKey) => {
      const [k1, k2] = pairKey.split('|||');
      const sourceId = keyToArtifactId.get(k1);
      const targetId = keyToArtifactId.get(k2);

      if (sourceId && targetId) {
        const strength = Math.min(1.0, 0.35 + meta.count * 0.2);
        connections.push({
          sourceId,
          targetId,
          strength,
          sharedDreamCount: meta.count,
          sampleDreamTitle: meta.sampleTitle,
        });
      }
    });

    // Also include any custom DB connections
    for (const dbc of dbConnections) {
      if (!connections.some((c) => (c.sourceId === dbc.artifact_id_1 && c.targetId === dbc.artifact_id_2) || (c.sourceId === dbc.artifact_id_2 && c.targetId === dbc.artifact_id_1))) {
        connections.push({
          sourceId: dbc.artifact_id_1,
          targetId: dbc.artifact_id_2,
          strength: dbc.connection_strength || 0.5,
          sharedDreamCount: 1,
        });
      }
    }

    const themeCounts = new Map<string, number>();
    const emotionCounts = new Map<string, number>();
    const elementCounts = new Map<string, number>();

    dreams.forEach((d) => {
      if (Array.isArray(d.ai_themes)) {
        d.ai_themes.forEach((t: string) => themeCounts.set(t, (themeCounts.get(t) || 0) + 1));
      }
      if (d.mood) {
        emotionCounts.set(d.mood, (emotionCounts.get(d.mood) || 0) + 1);
      }
    });

    artifacts.forEach((a) => {
      if (a.artifact_type !== 'theme' && a.artifact_type !== 'emotion') {
        elementCounts.set(a.name, a.appearance_count);
      }
    });

    const topThemes = Array.from(themeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((t) => t[0]);
    const mostRecurringElement =
      Array.from(elementCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const topEmotion =
      Array.from(emotionCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const insights: DreamInsight[] = ((insightsRes.data || []) as DreamInsight[]).filter(
      (i) => !i.is_pro_locked
    );

    if (dreamCount >= 3 && insights.length === 0 && topThemes.length > 0) {
      insights.push({
        id: 'insight_theme_recurring',
        user_id: userId,
        title: `Recurring motif: ${topThemes[0]}`,
        description: `Themes of ${topThemes[0]} have appeared across your recent dreams — a possible pattern worth noticing, not a diagnosis.`,
        is_pro_locked: false,
        related_dream_ids: dreams.map((d) => d.id),
        related_artifact_ids: [],
        created_at: new Date().toISOString(),
      });
    }

    return {
      artifacts,
      connections,
      insights,
      dreamCount,
      topThemes,
      mostRecurringElement,
      topEmotion,
      hasUnfamiliarConnection: dreamCount >= 2,
      earliestDreamDate,
      latestDreamDate,
      totalMilestone: dreamCount,
    };
  } catch (error) {
    console.error('Error fetching complete dream world data:', error);
    return {
      artifacts: [],
      connections: [],
      insights: [],
      dreamCount: 0,
      topThemes: [],
      mostRecurringElement: null,
      topEmotion: null,
      hasUnfamiliarConnection: false,
      totalMilestone: 0,
    };
  }
}

import type { SupabaseClient } from '@supabase/supabase-js';
import { analyzeDream, type PreviousDreamContext } from '@/lib/ai/analyze-dream';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { getAiQuota, recordAiOperation } from '@/lib/billing';
import type { DreamAnalysis, DreamEntity, EntityType } from '@/types/dream';

const VALID_ENTITY_TYPES: Set<EntityType> = new Set([
  'person',
  'place',
  'object',
  'emotion',
  'animal',
  'activity',
  'symbol',
  'theme',
]);

function formatPreviousDreamContext(d: any): PreviousDreamContext | null {
  const title = d.title || 'Untitled Dream';
  const date = d.dream_date;
  const rawSummary =
    d.ai_summary && d.ai_summary !== '__analyzing__'
      ? d.ai_summary
      : d.content
        ? d.content.slice(0, 160).replace(/\s+/g, ' ') + '...'
        : '';

  const summary = rawSummary.slice(0, 200).trim();
  if (!summary || summary === '__analyzing__') return null;

  const analysis = d.ai_analysis as DreamAnalysis | null;
  const themes = (d.ai_themes || analysis?.themes || []).slice(0, 4);

  // Extract symbols
  let symbols: string[] = [];
  if (Array.isArray(analysis?.symbols)) {
    symbols = analysis.symbols.map((s: any) => (typeof s === 'string' ? s : s.name));
  } else if (Array.isArray(d.ai_symbols)) {
    symbols = d.ai_symbols;
  }
  symbols = symbols.filter((s) => typeof s === 'string' && s.trim().length > 0).slice(0, 4);

  // Extract people
  let people: string[] = [];
  if (Array.isArray(analysis?.people)) {
    people = analysis.people;
  } else if (Array.isArray(analysis?.entities)) {
    people = analysis.entities.filter((e: any) => e.entity_type === 'person').map((e: any) => e.entity_name);
  }
  people = people.filter((p) => typeof p === 'string' && p.trim().length > 0).slice(0, 4);

  // Extract locations
  let locations: string[] = [];
  if (Array.isArray(analysis?.locations)) {
    locations = analysis.locations;
  } else if (Array.isArray(analysis?.entities)) {
    locations = analysis.entities.filter((e: any) => e.entity_type === 'place').map((e: any) => e.entity_name);
  }
  locations = locations.filter((l) => typeof l === 'string' && l.trim().length > 0).slice(0, 4);

  return {
    title,
    date,
    summary,
    themes,
    ...(people.length > 0 ? { people } : {}),
    ...(locations.length > 0 ? { locations } : {}),
    ...(symbols.length > 0 ? { symbols } : {}),
  };
}

export interface ProcessAnalysisOptions {
  dreamDate?: string | null;
  mood?: string | null;
  lucidity?: string | null;
  rawTranscript?: string | null;
  force?: boolean;
}

export interface ProcessAnalysisResult {
  success: boolean;
  analysis?: DreamAnalysis;
  entities?: DreamEntity[];
  embeddingGenerated?: boolean;
  alreadyAnalyzed?: boolean;
  inProgress?: boolean;
  error?: string;
  code?: string;
  isQuotaExceeded?: boolean;
  quota?: {
    used: number;
    limit: number;
    remaining: number;
    planTier: string;
  };
}

/**
 * Core server-side function to run AI reflection, extract entities,
 * update 3D world artifacts, and compute vector embeddings for a dream.
 *
 * Shared between POST /api/ai/analyze and the asynchronous background pipeline
 * in POST /api/dreams/[id]/transcribe.
 */
export async function processDreamAnalysis(
  supabase: SupabaseClient,
  userId: string,
  dreamId: string,
  content: string,
  options?: ProcessAnalysisOptions
): Promise<ProcessAnalysisResult> {
  const cleanContent = (content || '').trim();
  if (!cleanContent || cleanContent === 'Audio dream recording' || cleanContent.startsWith('Voice recording captured')) {
    return {
      success: false,
      error: 'Meaningful dream content is required for AI reflection.',
    };
  }

  // 1. Idempotency & Concurrency: Return existing analysis if already performed,
  // or return inProgress if another worker is actively analyzing it.
  const { data: existingDream } = await supabase
    .from('dreams')
    .select('id, ai_analysis, ai_summary, dream_date, mood, lucidity, raw_transcript, content, updated_at, embedding')
    .eq('id', dreamId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingDream?.ai_analysis && !options?.force) {
    const currentQuota = await getAiQuota(supabase, userId);
    return {
      success: true,
      analysis: existingDream.ai_analysis as DreamAnalysis,
      alreadyAnalyzed: true,
      quota: {
        used: currentQuota.used,
        limit: currentQuota.limit,
        remaining: currentQuota.remaining,
        planTier: currentQuota.planTier,
      },
    };
  }

  // If another process is actively analyzing this dream right now (< 60s), avoid duplicate Gemini call & quota deduction
  if (existingDream?.ai_summary === '__analyzing__' && !options?.force) {
    const updatedAt = existingDream.updated_at ? new Date(existingDream.updated_at).getTime() : 0;
    if (Date.now() - updatedAt < 60_000) {
      const currentQuota = await getAiQuota(supabase, userId);
      return {
        success: true,
        inProgress: true,
        quota: {
          used: currentQuota.used,
          limit: currentQuota.limit,
          remaining: currentQuota.remaining,
          planTier: currentQuota.planTier,
        },
      };
    }
  }

  // 2. Check user's monthly AI quota
  const quota = await getAiQuota(supabase, userId);
  if (!quota.allowed) {
    return {
      success: false,
      error:
        'Monthly AI reflection allowance reached. Upgrade to Pro for 100 reflections/month and deep pattern analysis.',
      code: 'quota_exceeded',
      isQuotaExceeded: true,
      quota: {
        used: quota.used,
        limit: quota.limit,
        remaining: quota.remaining,
        planTier: quota.planTier,
      },
    };
  }

  // 3. Gather controlled previous dreams context for cross-dream pattern detection
  // Controlled Budget: 5-8 recent dreams + 3-5 relevant older dreams (entity/semantic similarity)
  const { data: recentDreamRows } = await supabase
    .from('dreams')
    .select('id, title, ai_summary, content, dream_date, ai_themes, ai_symbols, ai_analysis')
    .eq('user_id', userId)
    .neq('id', dreamId)
    .order('dream_date', { ascending: false })
    .limit(7);

  const recentIds = new Set((recentDreamRows || []).map((d) => d.id));
  const candidateOlderIds = new Set<string>();

  // A. Semantic similarity if current dream has embedding (e.g. re-analysis)
  if (existingDream?.embedding) {
    try {
      const { data: semanticRows } = await supabase.rpc('match_dreams', {
        query_embedding: existingDream.embedding,
        match_threshold: 0.45,
        match_count: 5,
        p_user_id: userId,
      });
      for (const row of semanticRows || []) {
        if (row.id !== dreamId && !recentIds.has(row.id)) {
          candidateOlderIds.add(row.id);
        }
      }
    } catch (semErr) {
      console.warn('[processDreamAnalysis] Semantic match rpc skipped:', semErr);
    }
  }

  // B. Entity keyword matching: check user's existing artifacts mentioned in cleanContent
  try {
    const { data: userArtifacts } = await supabase
      .from('dream_artifacts')
      .select('name')
      .eq('user_id', userId)
      .limit(60);

    const contentLower = cleanContent.toLowerCase();
    const matchedArtifactNames = (userArtifacts || [])
      .map((a) => a.name)
      .filter((name) => name.length >= 3 && contentLower.includes(name.toLowerCase()))
      .slice(0, 5);

    if (matchedArtifactNames.length > 0) {
      const { data: entityMatches } = await supabase
        .from('dream_entities')
        .select('dream_id')
        .eq('user_id', userId)
        .neq('dream_id', dreamId)
        .in('entity_name', matchedArtifactNames)
        .limit(10);

      for (const ent of entityMatches || []) {
        if (!recentIds.has(ent.dream_id)) {
          candidateOlderIds.add(ent.dream_id);
        }
      }
    }
  } catch (artErr) {
    console.warn('[processDreamAnalysis] Artifact matching skipped:', artErr);
  }

  // Fetch candidate older dreams (capped to 4 to strictly respect context budget)
  const olderIdsToFetch = Array.from(candidateOlderIds).slice(0, 4);
  let olderDreamRows: any[] = [];
  if (olderIdsToFetch.length > 0) {
    const { data: fetchedOlder } = await supabase
      .from('dreams')
      .select('id, title, ai_summary, content, dream_date, ai_themes, ai_symbols, ai_analysis')
      .in('id', olderIdsToFetch);
    olderDreamRows = fetchedOlder || [];
  }

  // Combine and format previous dreams into compact context
  const allPreviousRows = [...(recentDreamRows || []), ...olderDreamRows];
  const seenDreamIds = new Set<string>();

  const previousDreams: PreviousDreamContext[] = [];
  for (const d of allPreviousRows) {
    if (seenDreamIds.has(d.id)) continue;
    seenDreamIds.add(d.id);

    const formatted = formatPreviousDreamContext(d);
    if (formatted) {
      previousDreams.push(formatted);
    }
  }

  const effectiveDate =
    options?.dreamDate ||
    existingDream?.dream_date ||
    new Date().toISOString().split('T')[0];
  const effectiveMood = options?.mood || existingDream?.mood || 'neutral';
  const effectiveLucidity =
    options?.lucidity || existingDream?.lucidity || 'not_sure';
  const effectiveRawTranscript =
    options?.rawTranscript || existingDream?.raw_transcript || undefined;

  // 4. Acquire atomic analysis lock
  await supabase
    .from('dreams')
    .update({
      ai_summary: '__analyzing__',
      updated_at: new Date().toISOString(),
    })
    .eq('id', dreamId)
    .eq('user_id', userId);

  // 5. Run single consolidated AI analysis (includes summary, emotions, themes, patterns, and entities)
  let analysis: DreamAnalysis;
  try {
    analysis = await analyzeDream(
      cleanContent,
      effectiveDate,
      effectiveMood,
      effectiveLucidity,
      previousDreams,
      effectiveRawTranscript
    );
  } catch (aiError) {
    // Release atomic lock on failure so it can be retried cleanly
    await supabase
      .from('dreams')
      .update({
        ai_summary:
          existingDream?.ai_summary && existingDream.ai_summary !== '__analyzing__'
            ? existingDream.ai_summary
            : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dreamId)
      .eq('user_id', userId);
    throw aiError;
  }

  // 6. Deduct 1 AI quota operation (strictly only on successful analysis)
  await recordAiOperation(supabase, userId);

  // 6. Map extracted entities from consolidated response
  const timestamp = new Date().toISOString();
  const rawEntities = Array.isArray(analysis.entities) ? analysis.entities : [];

  const entities: DreamEntity[] = rawEntities
    .filter(
      (e) =>
        e &&
        typeof e.entity_name === 'string' &&
        e.entity_name.trim().length > 0
    )
    .map((e) => ({
      id: crypto.randomUUID(),
      dream_id: dreamId,
      user_id: userId,
      entity_type: VALID_ENTITY_TYPES.has(e.entity_type)
        ? e.entity_type
        : 'symbol',
      entity_name: e.entity_name.trim(),
      confidence:
        typeof e.confidence === 'number'
          ? Math.max(0.1, Math.min(1.0, e.confidence))
          : 0.8,
      created_at: timestamp,
    }));

  // 7. Generate vector embedding for semantic search (gemini-embedding-001, 768 dimensions)
  let embedding: number[] | null = null;
  try {
    embedding = await generateEmbedding(
      `${cleanContent}\n\nThemes: ${analysis.themes.join(', ')}\nEmotions: ${analysis.emotions.map((e) => e.name).join(', ')}`
    );
  } catch (embeddingError) {
    console.error('Embedding generation failed (non-critical):', embeddingError);
  }

  // 8. Update dream record in Postgres
  const updatePayload: Record<string, unknown> = {
    ai_summary: analysis.summary,
    ai_analysis: analysis,
    ai_emotions: analysis.emotions,
    ai_symbols:
      analysis.symbols && analysis.symbols.length > 0
        ? analysis.symbols.map((s) => (typeof s === 'string' ? s : s.name))
        : analysis.key_elements,
    ai_themes: analysis.themes,
    updated_at: new Date().toISOString(),
  };

  if (embedding) {
    updatePayload.embedding = embedding;
  }

  await supabase
    .from('dreams')
    .update(updatePayload)
    .eq('id', dreamId)
    .eq('user_id', userId);

  // 9. Persist entities and World Artifacts if present
  if (entities.length > 0) {
    try {
      // Check prior entities for THIS dream to prevent duplicate appearance_count on retries
      const { data: priorEntities } = await supabase
        .from('dream_entities')
        .select('entity_name, entity_type')
        .eq('dream_id', dreamId)
        .eq('user_id', userId);

      const priorEntitySet = new Set(
        (priorEntities || []).map(
          (p) => `${p.entity_type}:::${p.entity_name.trim().toLowerCase()}`
        )
      );
      const isReanalysis =
        Boolean(existingDream?.ai_analysis) ||
        (priorEntities && priorEntities.length > 0);

      await supabase
        .from('dream_entities')
        .delete()
        .eq('dream_id', dreamId)
        .eq('user_id', userId);

      await supabase.from('dream_entities').insert(entities);

      // Ensure user has a world state
      const { data: worldState } = await supabase
        .from('dream_world_state')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!worldState) {
        await supabase.from('dream_world_state').insert({ user_id: userId });
      }

      // Fetch existing artifacts matching the names to increment count
      const { data: existingArtifacts } = await supabase
        .from('dream_artifacts')
        .select('id, artifact_type, name, appearance_count')
        .eq('user_id', userId)
        .in(
          'name',
          entities.map((e) => e.entity_name)
        );

      const artifactsToUpsert = entities.map((entity) => {
        const existing = existingArtifacts?.find(
          (a) =>
            a.name.toLowerCase() === entity.entity_name.toLowerCase() &&
            a.artifact_type === entity.entity_type
        );

        const entityKey = `${entity.entity_type}:::${entity.entity_name.trim().toLowerCase()}`;
        const alreadyCountedForThisDream = priorEntitySet.has(entityKey);

        if (existing) {
          return {
            id: existing.id,
            user_id: userId,
            artifact_type: existing.artifact_type,
            name: existing.name,
            // Only increment count if this dream hasn't already counted this entity
            appearance_count: alreadyCountedForThisDream
              ? existing.appearance_count
              : existing.appearance_count + 1,
            last_seen_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        } else {
          let zBase = 5;
          if (entity.entity_type === 'place') zBase = 20;
          else if (
            entity.entity_type === 'emotion' ||
            entity.entity_type === 'theme'
          )
            zBase = -10;

          return {
            user_id: userId,
            artifact_type: entity.entity_type,
            name: entity.entity_name,
            appearance_count: 1,
            position_x: (Math.random() - 0.5) * 50,
            position_y: (Math.random() - 0.5) * 40,
            position_z: zBase + (Math.random() - 0.5) * 15,
            first_seen_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
          };
        }
      });

      const uniqueArtifactsMap = new Map();
      artifactsToUpsert.forEach((a) => {
        const key = `${a.artifact_type}-${a.name}`;
        if (!uniqueArtifactsMap.has(key)) {
          uniqueArtifactsMap.set(key, a);
        }
      });
      const dedupedArtifacts = Array.from(uniqueArtifactsMap.values());

      if (dedupedArtifacts.length > 0) {
        await supabase
          .from('dream_artifacts')
          .upsert(dedupedArtifacts, {
            onConflict: 'user_id, artifact_type, name',
          });

        const { data: refreshedArtifacts } = await supabase
          .from('dream_artifacts')
          .select('id, artifact_type, name')
          .eq('user_id', userId)
          .in(
            'name',
            entities.map((e) => e.entity_name)
          );

        if (refreshedArtifacts && refreshedArtifacts.length >= 2) {
          const ids = refreshedArtifacts.map((a) => a.id);
          const connectionRows: Array<{
            user_id: string;
            artifact_id_1: string;
            artifact_id_2: string;
            connection_strength: number;
          }> = [];

          for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
              const [a, b] =
                ids[i] < ids[j] ? [ids[i], ids[j]] : [ids[j], ids[i]];
              connectionRows.push({
                user_id: userId,
                artifact_id_1: a,
                artifact_id_2: b,
                connection_strength: 1,
              });
            }
          }

          for (const row of connectionRows) {
            const { data: existingConn } = await supabase
              .from('dream_connections')
              .select('id, connection_strength')
              .eq('artifact_id_1', row.artifact_id_1)
              .eq('artifact_id_2', row.artifact_id_2)
              .maybeSingle();

            if (existingConn) {
              if (!isReanalysis) {
                await supabase
                  .from('dream_connections')
                  .update({
                    connection_strength:
                      (existingConn.connection_strength || 1) + 1,
                  })
                  .eq('id', existingConn.id);
              }
            } else {
              await supabase.from('dream_connections').insert(row);
            }
          }
        }
      }
    } catch (artifactErr) {
      console.warn('Artifact updating warning (non-critical):', artifactErr);
    }
  }

  return {
    success: true,
    analysis,
    entities,
    embeddingGenerated: Boolean(embedding),
    quota: {
      used: quota.used + 1,
      limit: quota.limit,
      remaining: Math.max(0, quota.remaining - 1),
      planTier: quota.planTier,
    },
  };
}

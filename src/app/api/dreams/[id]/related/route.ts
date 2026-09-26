import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { EntityContinuity, RelatedDreamConnection, EntityType } from '@/types/dream';

function formatMonthYear(dateStr: string | null | undefined): string {
  if (!dateStr) return 'earlier';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return 'earlier';
  }
}

// GET /api/dreams/[id]/related - Get related dreams and entity continuity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch current target dream
    const { data: targetDream, error: dreamError } = await supabase
      .from('dreams')
      .select('id, title, content, dream_date, ai_themes, ai_symbols, mood, embedding')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (dreamError || !targetDream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    // 2. Fetch extracted entities for this dream
    const { data: entitiesData } = await supabase
      .from('dream_entities')
      .select('id, entity_type, entity_name')
      .eq('dream_id', id)
      .eq('user_id', user.id);

    const entities = entitiesData || [];
    const entityNames = Array.from(new Set(entities.map((e) => e.entity_name)));

    // 3. Fetch artifact continuity from dream_artifacts for this dream's entities
    let artifactsMap = new Map<string, any>();
    if (entityNames.length > 0) {
      const { data: artifactsData } = await supabase
        .from('dream_artifacts')
        .select('id, artifact_type, name, appearance_count, first_seen_at, last_seen_at')
        .eq('user_id', user.id)
        .in('name', entityNames);

      (artifactsData || []).forEach((art) => {
        artifactsMap.set(`${art.artifact_type}:${art.name.toLowerCase()}`, art);
        artifactsMap.set(art.name.toLowerCase(), art);
      });
    }

    // Build Entity Continuity Cards
    const continuityCards: EntityContinuity[] = entities.map((ent) => {
      const art =
        artifactsMap.get(`${ent.entity_type}:${ent.entity_name.toLowerCase()}`) ||
        artifactsMap.get(ent.entity_name.toLowerCase());

      const count = art?.appearance_count ?? 1;
      const firstSeen = art?.first_seen_at || targetDream.dream_date;
      const isFirst = count <= 1;

      let badge = 'First appearance in your archive';
      if (count > 1) {
        badge = `Seen in ${count} dreams · First appeared ${formatMonthYear(firstSeen)}`;
      }

      return {
        id: art?.id,
        name: ent.entity_name,
        type: ent.entity_type as EntityType,
        appearanceCount: count,
        firstSeenAt: firstSeen,
        lastSeenAt: art?.last_seen_at,
        isFirstAppearance: isFirst,
        continuityBadge: badge,
      };
    });

    // Deduplicate continuity cards by name + type
    const uniqueContinuityMap = new Map<string, EntityContinuity>();
    continuityCards.forEach((c) => {
      const key = `${c.type}:${c.name.toLowerCase()}`;
      if (!uniqueContinuityMap.has(key)) {
        uniqueContinuityMap.set(key, c);
      }
    });
    const uniqueContinuityCards = Array.from(uniqueContinuityMap.values()).sort(
      (a, b) => b.appearanceCount - a.appearanceCount
    );

    // 4. Find Connected Dreams
    interface CandidateDream {
      id: string;
      title: string;
      dream_date: string;
      ai_summary: string | null;
      content: string;
      sharedEntities: string[];
      sharedThemes: string[];
      semanticScore: number;
      reasons: string[];
    }

    const candidates = new Map<string, CandidateDream>();

    // A. Shared Entities: query dream_entities for other dreams matching these names
    if (entityNames.length > 0) {
      const { data: sharedEntityRows } = await supabase
        .from('dream_entities')
        .select('dream_id, entity_type, entity_name, dreams!inner(id, title, dream_date, ai_summary, content)')
        .eq('user_id', user.id)
        .neq('dream_id', id)
        .in('entity_name', entityNames)
        .limit(120);

      for (const row of sharedEntityRows || []) {
        const other = (row as any).dreams;
        if (!other) continue;

        const existing: CandidateDream = candidates.get(other.id) || {
          id: other.id,
          title: other.title || 'Untitled Dream',
          dream_date: other.dream_date,
          ai_summary: other.ai_summary,
          content: other.content,
          sharedEntities: [] as string[],
          sharedThemes: [] as string[],
          semanticScore: 0,
          reasons: [] as string[],
        };

        if (!existing.sharedEntities.includes(row.entity_name)) {
          existing.sharedEntities.push(row.entity_name);
          const typeLabel =
            row.entity_type === 'person'
              ? 'person'
              : row.entity_type === 'place'
                ? 'place'
                : row.entity_type === 'theme'
                  ? 'theme'
                  : 'symbol';
          existing.reasons.push(`Shared ${typeLabel}: ${row.entity_name}`);
        }

        candidates.set(other.id, existing);
      }
    }

    // B. Shared Themes: query dreams that overlap on ai_themes
    const targetThemes = targetDream.ai_themes || [];
    if (targetThemes.length > 0) {
      const { data: themeDreams } = await supabase
        .from('dreams')
        .select('id, title, dream_date, ai_summary, content, ai_themes')
        .eq('user_id', user.id)
        .neq('id', id)
        .overlaps('ai_themes', targetThemes)
        .limit(30);

      for (const td of themeDreams || []) {
        const overlapping = (td.ai_themes || []).filter((t: string) => targetThemes.includes(t));
        if (overlapping.length === 0) continue;

        const existing: CandidateDream = candidates.get(td.id) || {
          id: td.id,
          title: td.title || 'Untitled Dream',
          dream_date: td.dream_date,
          ai_summary: td.ai_summary,
          content: td.content,
          sharedEntities: [] as string[],
          sharedThemes: [] as string[],
          semanticScore: 0,
          reasons: [] as string[],
        };

        for (const t of overlapping) {
          if (!existing.sharedThemes.includes(t)) {
            existing.sharedThemes.push(t);
            existing.reasons.push(`Shared theme: ${t}`);
          }
        }

        candidates.set(td.id, existing);
      }
    }

    // C. Semantic Vector Matches (Subconscious resonance)
    if (targetDream.embedding) {
      try {
        const { data: semanticRows } = await supabase.rpc('match_dreams', {
          query_embedding: targetDream.embedding,
          match_threshold: 0.44,
          match_count: 8,
          p_user_id: user.id,
        });

        for (const sm of semanticRows || []) {
          if (sm.id === id) continue;

          const existing: CandidateDream = candidates.get(sm.id) || {
            id: sm.id,
            title: sm.title || 'Untitled Dream',
            dream_date: sm.dream_date,
            ai_summary: sm.ai_summary,
            content: sm.content,
            sharedEntities: [] as string[],
            sharedThemes: [] as string[],
            semanticScore: 0,
            reasons: [] as string[],
          };

          const sim = sm.similarity || 0;
          existing.semanticScore = Math.max(existing.semanticScore, sim);
          if (sim >= 0.58) {
            const matchPct = Math.round(sim * 100);
            const resonanceReason = `Subconscious narrative resonance (${matchPct}%)`;
            if (!existing.reasons.some((r) => r.startsWith('Subconscious narrative resonance'))) {
              existing.reasons.push(resonanceReason);
            }
          }

          candidates.set(sm.id, existing);
        }
      } catch (embErr) {
        console.warn('Semantic match rpc failed non-critically:', embErr);
      }
    }

    // 5. Rank and structure connected dreams
    const relatedDreams: RelatedDreamConnection[] = Array.from(candidates.values())
      .map((c) => {
        // Compute connection weight: entities (especially people & places) carry high weight
        const entityWeight = c.sharedEntities.length * 3.5;
        const themeWeight = c.sharedThemes.length * 1.5;
        const semanticWeight = c.semanticScore * 3.0;
        const compositeScore = entityWeight + themeWeight + semanticWeight;

        // Primary reason priority: entity > theme > semantic
        let primaryReason = 'Connected through recurring motifs';
        if (c.sharedEntities.length > 0) {
          primaryReason = `Shared ${c.sharedEntities.slice(0, 2).join(' & ')}`;
        } else if (c.sharedThemes.length > 0) {
          primaryReason = `Shared theme: ${c.sharedThemes[0]}`;
        } else if (c.semanticScore > 0) {
          primaryReason = `Subconscious resonance (${Math.round(c.semanticScore * 100)}% match)`;
        }

        return {
          id: c.id,
          title: c.title,
          dream_date: c.dream_date,
          ai_summary: c.ai_summary,
          content: c.content,
          sharedEntities: c.sharedEntities,
          sharedThemes: c.sharedThemes,
          semanticScore: c.semanticScore,
          reasons: c.reasons,
          primaryReason,
          _score: compositeScore,
        };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, 6)
      .map(({ _score, ...rest }) => rest);

    return NextResponse.json({
      continuityCards: uniqueContinuityCards,
      relatedDreams,
      totalConnected: relatedDreams.length,
    });
  } catch (error) {
    console.error('Error fetching related dreams:', error);
    return NextResponse.json({ error: 'Failed to fetch related dreams' }, { status: 500 });
  }
}

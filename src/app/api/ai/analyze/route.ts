import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeDream } from '@/lib/ai/analyze-dream';
import { extractDreamEntities } from '@/lib/ai/extract-entities';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { rateLimit } from '@/lib/rate-limit';
import { getAiQuota, recordAiOperation } from '@/lib/billing';

// POST /api/ai/analyze - Analyze a dream with AI
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limited = rateLimit(`ai:analyze:${user.id}`, { limit: 20, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many analysis requests. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }

    const body = await request.json();
    const { dreamId, content, dream_date, mood, lucidity } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Dream content is required' }, { status: 400 });
    }

    // Fetch recent dreams for context (exclude current dream)
    const { data: recentDreams } = await supabase
      .from('dreams')
      .select('title, ai_summary, dream_date, ai_themes')
      .eq('user_id', user.id)
      .neq('id', dreamId || '')
      .order('dream_date', { ascending: false })
      .limit(10);

    const previousDreams = recentDreams
      ?.filter(d => d.ai_summary)
      .map(d => ({
        title: d.title,
        summary: d.ai_summary!,
        date: d.dream_date,
        themes: d.ai_themes || [],
      }));

    const quota = await getAiQuota(supabase, user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: 'Monthly AI reflection allowance reached. Upgrade to Pro for 100 reflections/month and deep pattern analysis.',
          code: 'quota_exceeded',
          isQuotaExceeded: true,
          limit: quota.limit,
          used: quota.used,
          remaining: quota.remaining,
          planTier: quota.planTier,
        },
        { status: 403 }
      );
    }

    // Run AI analysis
    const analysis = await analyzeDream(
      content,
      dream_date || new Date().toISOString().split('T')[0],
      mood || 'neutral',
      lucidity || 'not_sure',
      previousDreams
    );

    await recordAiOperation(supabase, user.id);

    // Extract entities
    let entities: Awaited<ReturnType<typeof extractDreamEntities>> = [];
    try {
      if (dreamId) {
        entities = await extractDreamEntities(content, dreamId, user.id);
      }
    } catch (entityError) {
      console.error('Entity extraction failed (non-critical):', entityError);
    }

    // Generate embedding for semantic search
    let embedding: number[] | null = null;
    try {
      embedding = await generateEmbedding(
        `${content}\n\nThemes: ${analysis.themes.join(', ')}\nEmotions: ${analysis.emotions.map(e => e.name).join(', ')}`
      );
    } catch (embeddingError) {
      console.error('Embedding generation failed (non-critical):', embeddingError);
    }

    // Update the dream with AI analysis
    if (dreamId) {
      const updatePayload: Record<string, unknown> = {
        ai_summary: analysis.summary,
        ai_analysis: analysis,
        ai_emotions: analysis.emotions,
        ai_symbols: analysis.key_elements,
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
        .eq('user_id', user.id);

      // Save entities
      if (entities.length > 0) {
        // Clear old entities first
        await supabase
          .from('dream_entities')
          .delete()
          .eq('dream_id', dreamId)
          .eq('user_id', user.id);

        await supabase
          .from('dream_entities')
          .insert(entities);

        // --- WORLD ARTIFACTS SYSTEM ---
        
        // Ensure user has a world state (for users who existed before migration)
        const { data: worldState } = await supabase
          .from('dream_world_state')
          .select('user_id')
          .eq('user_id', user.id)
          .single();
        
        if (!worldState) {
          await supabase.from('dream_world_state').insert({ user_id: user.id });
        }

        // Fetch existing artifacts matching the names to increment count
        const { data: existingArtifacts } = await supabase
          .from('dream_artifacts')
          .select('id, artifact_type, name, appearance_count')
          .eq('user_id', user.id)
          .in('name', entities.map(e => e.entity_name));

        const artifactsToUpsert = entities.map(entity => {
          const existing = existingArtifacts?.find(a => a.name === entity.entity_name && a.artifact_type === entity.entity_type);
          
          if (existing) {
            return {
              id: existing.id,
              user_id: user.id,
              artifact_type: existing.artifact_type,
              name: existing.name,
              appearance_count: existing.appearance_count + 1,
              last_seen_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          } else {
            // New Artifact: Generate 3D spatial coordinates
            let zBase = 5;
            if (entity.entity_type === 'place') zBase = 20;
            else if (entity.entity_type === 'emotion' || entity.entity_type === 'theme') zBase = -10; // Background elements
            
            return {
              user_id: user.id,
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

        // Deduplicate in case the AI extracted the same entity twice in one dream
        const uniqueArtifactsMap = new Map();
        artifactsToUpsert.forEach(a => {
           const key = `${a.artifact_type}-${a.name}`;
           if (!uniqueArtifactsMap.has(key)) {
             uniqueArtifactsMap.set(key, a);
           }
        });
        const dedupedArtifacts = Array.from(uniqueArtifactsMap.values());

        if (dedupedArtifacts.length > 0) {
          await supabase
            .from('dream_artifacts')
            .upsert(dedupedArtifacts, { onConflict: 'user_id, artifact_type, name' });

          // Refresh artifacts for connection cache (derived from co-occurring entities)
          const { data: refreshedArtifacts } = await supabase
            .from('dream_artifacts')
            .select('id, artifact_type, name')
            .eq('user_id', user.id)
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
                const [a, b] = ids[i] < ids[j] ? [ids[i], ids[j]] : [ids[j], ids[i]];
                connectionRows.push({
                  user_id: user.id,
                  artifact_id_1: a,
                  artifact_id_2: b,
                  connection_strength: 1,
                });
              }
            }

            // Upsert co-occurrence edges; strengthen existing links when present
            for (const row of connectionRows) {
              const { data: existing } = await supabase
                .from('dream_connections')
                .select('id, connection_strength')
                .eq('artifact_id_1', row.artifact_id_1)
                .eq('artifact_id_2', row.artifact_id_2)
                .maybeSingle();

              if (existing) {
                await supabase
                  .from('dream_connections')
                  .update({
                    connection_strength: (existing.connection_strength || 1) + 1,
                  })
                  .eq('id', existing.id);
              } else {
                await supabase.from('dream_connections').insert(row);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      analysis,
      entities,
      embeddingGenerated: !!embedding,
      quota: {
        used: quota.used + 1,
        limit: quota.limit,
        remaining: Math.max(0, quota.remaining - 1),
        planTier: quota.planTier,
      },
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    const message = error instanceof Error ? error.message : 'AI analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

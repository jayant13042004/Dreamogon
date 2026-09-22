import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveDreamImageUrl } from '@/lib/storage/dream-images';

// GET /api/dreams/[id] - Get a single dream
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: dream, error } = await supabase
      .from('dreams')
      .select('*, dream_tags(tag), dream_entities(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    const resolvedDream = {
      ...dream,
      image_url: resolveDreamImageUrl(dream),
    };

    return NextResponse.json({ dream: resolvedDream });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/dreams/[id] - Update a dream
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, dream_date, mood, lucidity, tags } = body;

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (dream_date !== undefined) updateData.dream_date = dream_date;
    if (mood !== undefined) updateData.mood = mood;
    if (lucidity !== undefined) updateData.lucidity = lucidity;

    const { data: dream, error } = await supabase
      .from('dreams')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !dream) {
      return NextResponse.json({ error: 'Dream not found or update failed' }, { status: 404 });
    }

    // Update tags if provided
    if (tags !== undefined && Array.isArray(tags)) {
      // Delete existing tags
      await supabase
        .from('dream_tags')
        .delete()
        .eq('dream_id', id)
        .eq('user_id', user.id);

      // Insert new tags
      if (tags.length > 0) {
        const tagRecords = tags.map((tag: string) => ({
          dream_id: id,
          user_id: user.id,
          tag: tag.trim(),
        }));
        await supabase.from('dream_tags').insert(tagRecords);
      }
    }

    return NextResponse.json({ dream });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/dreams/[id] - Delete a dream
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: dream } = await supabase
      .from('dreams')
      .select('image_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (dream?.image_path) {
      const { DREAM_IMAGES_BUCKET } = await import('@/lib/storage/dream-images');
      await supabase.storage.from(DREAM_IMAGES_BUCKET).remove([dream.image_path]).catch(() => {});
    }

    const { error } = await supabase
      .from('dreams')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting dream:', error);
      return NextResponse.json({ error: 'Failed to delete dream' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

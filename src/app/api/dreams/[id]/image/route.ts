import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { downloadDreamImage, parseDataUrl } from '@/lib/storage/dream-images';

/**
 * Authenticated image delivery for Storage-backed dream visuals.
 * Legacy data-URL rows are still readable directly from image_url by the client.
 */
export async function GET(
  _request: NextRequest,
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

    let dream: {
      id: string;
      image_path?: string | null;
      image_url?: string | null;
      ai_analysis?: Record<string, unknown> | null;
    } | null = null;

    const { data: dreamCols, error: colError } = await supabase
      .from('dreams')
      .select('id, image_path, image_url, ai_analysis')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!colError && dreamCols) {
      dream = dreamCols;
    } else {
      const { data: baseDream, error: baseError } = await supabase
        .from('dreams')
        .select('id, ai_analysis')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (baseError || !baseDream) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const analysisObj = (baseDream.ai_analysis as Record<string, unknown>) || {};
      dream = {
        id: baseDream.id,
        image_path: (analysisObj.image_path as string) || null,
        image_url: (analysisObj.image_url as string) || null,
        ai_analysis: analysisObj,
      };
    }

    if (dream.image_path) {
      const file = await downloadDreamImage(supabase, dream.image_path);
      if (!file) {
        return NextResponse.json({ error: 'Image missing' }, { status: 404 });
      }

      return new NextResponse(file.bytes, {
        status: 200,
        headers: {
          'Content-Type': file.contentType,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    // Legacy: data URL still in Postgres — stream once so <img src="/api/..."> works after migration of URL shape
    const legacy =
      dream.image_url ||
      (dream.ai_analysis as { image_url?: string } | null)?.image_url ||
      null;

    if (legacy?.startsWith('data:')) {
      const parsed = parseDataUrl(legacy);
      if (!parsed) {
        return NextResponse.json({ error: 'Invalid legacy image' }, { status: 404 });
      }
      return new NextResponse(new Uint8Array(parsed.bytes), {
        status: 200,
        headers: {
          'Content-Type': parsed.mimeType,
          'Cache-Control': 'private, max-age=300',
        },
      });
    }

    if (legacy?.startsWith('http://') || legacy?.startsWith('https://')) {
      return NextResponse.redirect(legacy, 302);
    }

    return NextResponse.json({ error: 'No image' }, { status: 404 });
  } catch (err) {
    console.error('Dream image proxy error:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
}

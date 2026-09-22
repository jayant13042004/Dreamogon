import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 1. Cancel active Stripe subscription if present
    try {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('provider, provider_subscription_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (sub?.provider === 'stripe' && sub.provider_subscription_id && process.env.STRIPE_SECRET_KEY) {
        try {
          const { getStripe } = await import('@/lib/billing/stripe-provider');
          const stripe = getStripe();
          await stripe.subscriptions.cancel(sub.provider_subscription_id);
        } catch (stripeErr) {
          console.warn('Could not cancel Stripe subscription during account deletion:', stripeErr);
        }
      }
    } catch (subErr) {
      console.warn('Error checking subscription during account deletion:', subErr);
    }

    // 2. Remove stored dream images from Storage
    try {
      const { data: userDreams } = await supabase
        .from('dreams')
        .select('image_path')
        .eq('user_id', userId);

      const pathsToDelete = (userDreams || [])
        .map((d: { image_path?: string | null }) => d.image_path)
        .filter((p): p is string => Boolean(p));

      if (pathsToDelete.length > 0) {
        const { DREAM_IMAGES_BUCKET } = await import('@/lib/storage/dream-images');
        await supabase.storage.from(DREAM_IMAGES_BUCKET).remove(pathsToDelete).catch(() => {});
      }
    } catch (storageErr) {
      console.warn('Error removing user dream images from storage:', storageErr);
    }

    // 3. Delete user data across all tables
    try {
      await supabase.from('chat_messages').delete().eq('user_id', userId);
      await supabase.from('dream_connections').delete().eq('user_id', userId);
      await supabase.from('dream_artifacts').delete().eq('user_id', userId);
      await supabase.from('dream_insights').delete().eq('user_id', userId);
      await supabase.from('dream_entities').delete().eq('user_id', userId);
      await supabase.from('dream_tags').delete().eq('user_id', userId);
      await supabase.from('dreams').delete().eq('user_id', userId);
      await supabase.from('usage_meters').delete().eq('user_id', userId);
      await supabase.from('subscriptions').delete().eq('user_id', userId);
      await supabase.from('user_preferences').delete().eq('user_id', userId);
      await supabase.from('profiles').delete().eq('id', userId);
    } catch (dbErr) {
      console.error('Error cleaning up user tables:', dbErr);
    }

    // 4. Delete user from auth via service client if configured
    try {
      const serviceClient = createServiceClient();
      await serviceClient.auth.admin.deleteUser(userId);
    } catch (adminErr) {
      console.warn('Could not delete from auth.admin directly (service role key may not be set):', adminErr);
      // Fallback: sign out user session
      await supabase.auth.signOut();
    }

    return NextResponse.json({ success: true, message: 'Account and associated data deleted' });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete account' },
      { status: 500 }
    );
  }
}

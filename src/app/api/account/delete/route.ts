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

    // 3. Delete user data across all tables explicitly
    const deleteResults = await Promise.allSettled([
      supabase.from('chat_messages').delete().eq('user_id', userId),
      supabase.from('dream_connections').delete().eq('user_id', userId),
      supabase.from('dream_artifacts').delete().eq('user_id', userId),
      supabase.from('dream_insights').delete().eq('user_id', userId),
      supabase.from('dream_entities').delete().eq('user_id', userId),
      supabase.from('dream_tags').delete().eq('user_id', userId),
      supabase.from('dreams').delete().eq('user_id', userId),
      supabase.from('dream_world_state').delete().eq('user_id', userId),
      supabase.from('usage_meters').delete().eq('user_id', userId),
      supabase.from('subscriptions').delete().eq('user_id', userId),
      supabase.from('user_preferences').delete().eq('user_id', userId),
      supabase.from('profiles').delete().eq('id', userId),
    ]);

    for (const res of deleteResults) {
      if (res.status === 'rejected') {
        console.error('Error during user tables cleanup:', res.reason);
      }
    }

    // 4. Delete user from auth.users via service client
    let authDeleted = false;
    try {
      const serviceClient = createServiceClient();
      const { error: adminDeleteError } = await serviceClient.auth.admin.deleteUser(userId);
      if (adminDeleteError) {
        console.error('auth.admin.deleteUser error:', adminDeleteError);
        throw adminDeleteError;
      }
      authDeleted = true;
    } catch (adminErr) {
      console.error('Could not delete user from auth.admin:', adminErr);
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          {
            error:
              'Account data cleared, but authentication identity removal failed. Please contact support to complete account removal.',
          },
          { status: 500 }
        );
      }
    }

    // Sign out user session
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      authDeleted,
      message: 'Account and associated data deleted completely',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete account' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBillingProvider, getPlanTier, getSubscription } from '@/lib/billing';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const planTier = await getPlanTier(supabase, user.id);
    if (planTier === 'lifetime') {
      return NextResponse.json(
        {
          error: 'Lifetime members do not have a recurring subscription to manage.',
          isLifetime: true,
        },
        { status: 400 }
      );
    }

    const provider = getBillingProvider();
    if (!provider.isConfigured()) {
      return NextResponse.json(
        { error: 'Billing is not configured yet', code: 'billing_not_configured' },
        { status: 503 }
      );
    }

    const sub = await getSubscription(supabase, user.id);
    if (!sub?.provider_customer_id) {
      return NextResponse.json(
        { error: 'No active billing subscription found.' },
        { status: 400 }
      );
    }

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    const portal = await provider.createCustomerPortalSession({
      customerId: sub.provider_customer_id,
      returnUrl: `${origin}/settings`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error('Portal error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Could not open billing portal' }, { status: 500 });
  }
}

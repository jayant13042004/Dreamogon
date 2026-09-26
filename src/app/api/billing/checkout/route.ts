import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBillingProvider, getSubscription } from '@/lib/billing';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let planId: 'pro_monthly' | 'pro_annual' = 'pro_monthly';
    try {
      const body = await request.json();
      if (body?.planId && ['pro_monthly', 'pro_annual'].includes(body.planId)) {
        planId = body.planId;
      }
    } catch {
      // Empty body defaults to pro_monthly
    }

    const provider = getBillingProvider();
    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          error: 'Billing is not configured yet',
          code: 'billing_not_configured',
        },
        { status: 503 }
      );
    }

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    const existing = await getSubscription(supabase, user.id);

    const session = await provider.createCheckoutSession({
      userId: user.id,
      email: user.email,
      customerId: existing?.provider_customer_id,
      planId,
      successUrl: `${origin}/settings?billing=success&plan=${planId}`,
      cancelUrl: `${origin}/settings?billing=canceled`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.sessionId });
  } catch (error) {
    console.error('Checkout error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }
}

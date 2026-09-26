import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';
import { syncSubscriptionAccess } from '@/lib/billing/access';
import { getStripe, mapStripeSubscriptionStatus } from '@/lib/billing/stripe-provider';
import type { PlanInterval } from '@/lib/billing/types';

export const runtime = 'nodejs';

async function resolveUserId(
  supabase: ReturnType<typeof createServiceClient>,
  args: {
    clientReferenceId?: string | null;
    metadataUserId?: string | null;
    customerId?: string | null;
  }
): Promise<string | null> {
  if (args.clientReferenceId) return args.clientReferenceId;
  if (args.metadataUserId) return args.metadataUserId;

  if (args.customerId) {
    const { data } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('provider', 'stripe')
      .eq('provider_customer_id', args.customerId)
      .maybeSingle();
    if (data?.user_id) return data.user_id;
  }

  return null;
}

async function applyStripeSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null
) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  const userId =
    (await resolveUserId(supabase, {
      metadataUserId: subscription.metadata?.user_id,
      customerId,
    })) || fallbackUserId;

  if (!userId) {
    console.error('Webhook: could not resolve user for subscription', subscription.id);
    return;
  }

  const status = mapStripeSubscriptionStatus(subscription.status);
  // Stripe API 2025+: billing period lives on subscription items
  const primaryItem = subscription.items?.data?.[0];
  const itemPeriodEnd = primaryItem?.current_period_end;
  const periodEnd = itemPeriodEnd
    ? new Date(itemPeriodEnd * 1000).toISOString()
    : null;

  const recurringInterval = primaryItem?.price?.recurring?.interval;
  const interval: PlanInterval = recurringInterval === 'year' ? 'year' : 'month';

  await syncSubscriptionAccess(supabase, {
    userId,
    provider: 'stripe',
    providerCustomerId: customerId,
    providerSubscriptionId: subscription.id,
    status,
    currency: subscription.currency || 'usd',
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    priceId: primaryItem?.price?.id || null,
    interval,
    rawMeta: {
      stripe_status: subscription.status,
      plan_metadata: subscription.metadata?.plan,
    },
  });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature failed:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();

    const { data: seen } = await supabase
      .from('billing_webhook_events')
      .select('id')
      .eq('id', event.id)
      .maybeSingle();

    if (seen) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription?.id;

          if (!subscriptionId) break;

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await applyStripeSubscription(
            supabase,
            subscription,
            session.client_reference_id || session.metadata?.user_id
          );
          break;
        }

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await applyStripeSubscription(supabase, subscription);
        break;
      }

      default:
        break;
    }

    await supabase.from('billing_webhook_events').upsert(
      {
        id: event.id,
        provider: 'stripe',
        event_type: event.type,
        processed_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

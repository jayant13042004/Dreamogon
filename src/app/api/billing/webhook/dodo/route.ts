import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { syncSubscriptionAccess } from '@/lib/billing/access';
import { getDodoClient, mapDodoSubscriptionStatus, mapDodoInterval } from '@/lib/billing/dodo-provider';
import type { Subscriptions } from 'dodopayments/resources/subscriptions';

export const runtime = 'nodejs';

async function resolveUserId(
  supabase: ReturnType<typeof createServiceClient>,
  args: {
    metadataUserId?: string | null;
    customerId?: string | null;
    subscriptionId?: string | null;
    email?: string | null;
  }
): Promise<string | null> {
  if (args.metadataUserId) return args.metadataUserId;

  if (args.subscriptionId) {
    const { data } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('provider', 'dodo')
      .eq('provider_subscription_id', args.subscriptionId)
      .maybeSingle();
    if (data?.user_id) return data.user_id;
  }

  if (args.customerId) {
    const { data } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('provider', 'dodo')
      .eq('provider_customer_id', args.customerId)
      .maybeSingle();
    if (data?.user_id) return data.user_id;
  }

  if (args.email) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', args.email)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!webhookKey) {
    return NextResponse.json({ error: 'Dodo webhook key not configured' }, { status: 503 });
  }

  const webhookId = request.headers.get('webhook-id');
  const webhookSignature = request.headers.get('webhook-signature');
  const webhookTimestamp = request.headers.get('webhook-timestamp');

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    return NextResponse.json({ error: 'Missing required webhook headers' }, { status: 400 });
  }

  const rawBody = await request.text();
  const dodo = getDodoClient();

  let event: any;
  try {
    event = dodo.webhooks.unwrap(rawBody, {
      headers: {
        'webhook-id': webhookId,
        'webhook-signature': webhookSignature,
        'webhook-timestamp': webhookTimestamp,
      },
      key: webhookKey,
    });
  } catch (err) {
    console.error('Dodo webhook signature verification failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();

    // Idempotency check
    const { data: seen } = await supabase
      .from('billing_webhook_events')
      .select('id')
      .eq('id', webhookId)
      .maybeSingle();

    if (seen) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const eventType: string = event.type;
    const subData = event.data as Subscriptions.Subscription | undefined;

    if (eventType.startsWith('subscription.') && subData?.subscription_id) {
      const metadataUserId = typeof subData.metadata?.user_id === 'string' ? subData.metadata.user_id : null;
      const customerId = subData.customer?.customer_id || null;
      const customerEmail = subData.customer?.email || null;

      const userId = await resolveUserId(supabase, {
        metadataUserId,
        customerId,
        subscriptionId: subData.subscription_id,
        email: customerEmail,
      });

      if (!userId) {
        console.warn(`[Dodo Webhook] Could not resolve user for subscription: ${subData.subscription_id}`);
      } else {
        await syncSubscriptionAccess(supabase, {
          userId,
          provider: 'dodo',
          providerCustomerId: customerId,
          providerSubscriptionId: subData.subscription_id,
          status: mapDodoSubscriptionStatus(subData.status),
          currency: subData.currency || 'usd',
          currentPeriodEnd: subData.next_billing_date || null,
          cancelAtPeriodEnd: Boolean(subData.cancel_at_next_billing_date),
          priceId: subData.product_id || null,
          interval: mapDodoInterval(subData.payment_frequency_interval),
          rawMeta: {
            dodo_event_type: eventType,
            dodo_status: subData.status,
            metadata: subData.metadata,
          },
        });
      }
    }

    await supabase.from('billing_webhook_events').upsert(
      {
        id: webhookId,
        provider: 'dodo',
        event_type: eventType,
        processed_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Dodo webhook processing error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

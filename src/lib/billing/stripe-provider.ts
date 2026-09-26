import Stripe from 'stripe';
import type { BillingProvider, CreateCheckoutInput, CreatePortalInput } from './provider';
import { BILLING_CURRENCY } from './config';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      (process.env.STRIPE_PRICE_ID_PRO_MONTHLY ||
        process.env.STRIPE_PRICE_ID_PRO_ANNUAL) &&
      process.env.STRIPE_WEBHOOK_SECRET
  );
}

export const stripeBillingProvider: BillingProvider = {
  id: 'stripe',
  isConfigured: isStripeConfigured,

  async createCheckoutSession(input: CreateCheckoutInput) {
    const stripe = getStripe();
    const requestedPlan = input.planId === 'pro_annual' ? 'pro_annual' : 'pro_monthly';

    let priceId: string | undefined;

    if (requestedPlan === 'pro_annual') {
      priceId = process.env.STRIPE_PRICE_ID_PRO_ANNUAL;
      if (!priceId) throw new Error('STRIPE_PRICE_ID_PRO_ANNUAL is not configured');
    } else {
      priceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
      if (!priceId) throw new Error('STRIPE_PRICE_ID_PRO_MONTHLY is not configured');
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer: input.customerId || undefined,
      customer_email: input.customerId ? undefined : input.email,
      client_reference_id: input.userId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        user_id: input.userId,
        plan: requestedPlan,
      },
      subscription_data: {
        metadata: {
          user_id: input.userId,
          plan: requestedPlan,
        },
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    return { url: session.url, sessionId: session.id };
  },

  async createCustomerPortalSession(input: CreatePortalInput) {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: input.customerId,
      return_url: input.returnUrl,
    });
    return { url: session.url };
  },
};

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status | string
): import('./types').SubscriptionStatus {
  const known: import('./types').SubscriptionStatus[] = [
    'active',
    'trialing',
    'past_due',
    'canceled',
    'unpaid',
    'incomplete',
    'incomplete_expired',
    'paused',
  ];
  if (known.includes(status as import('./types').SubscriptionStatus)) {
    return status as import('./types').SubscriptionStatus;
  }
  return 'inactive';
}

export { BILLING_CURRENCY };

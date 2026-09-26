import DodoPayments from 'dodopayments';
import type { BillingProvider, CreateCheckoutInput, CreatePortalInput } from './provider';
import type { CheckoutSessionResult, PortalSessionResult, SubscriptionStatus, PlanInterval } from './types';

export function getDodoClient(): DodoPayments {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) {
    throw new Error('DODO_PAYMENTS_API_KEY is not set');
  }
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode';
  return new DodoPayments({
    bearerToken,
    environment,
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || undefined,
  });
}

export function isDodoConfigured(): boolean {
  return Boolean(
    process.env.DODO_PAYMENTS_API_KEY &&
    (process.env.DODO_PRODUCT_ID_PRO_MONTHLY || process.env.DODO_PRODUCT_ID_PRO_ANNUAL)
  );
}

export function getDodoProductId(planId?: 'pro_monthly' | 'pro_annual'): string {
  if (planId === 'pro_annual') {
    const annualId = process.env.DODO_PRODUCT_ID_PRO_ANNUAL;
    if (annualId) return annualId;
  }
  const monthlyId = process.env.DODO_PRODUCT_ID_PRO_MONTHLY;
  if (monthlyId) return monthlyId;
  throw new Error('Dodo Payments product ID is not configured (check DODO_PRODUCT_ID_PRO_MONTHLY / DODO_PRODUCT_ID_PRO_ANNUAL)');
}

export function mapDodoSubscriptionStatus(status: string): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active';
    case 'pending':
      return 'incomplete';
    case 'on_hold':
    case 'past_due':
      return 'past_due';
    case 'paused':
      return 'paused';
    case 'cancelled':
      return 'canceled';
    case 'failed':
      return 'unpaid';
    case 'expired':
      return 'incomplete_expired';
    default:
      return 'inactive';
  }
}

export function mapDodoInterval(interval?: string | null): PlanInterval {
  if (!interval) return 'month';
  const lower = interval.toLowerCase();
  if (lower.includes('year')) return 'year';
  return 'month';
}

export const dodoBillingProvider: BillingProvider = {
  id: 'dodo',
  isConfigured: isDodoConfigured,

  async createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSessionResult> {
    const client = getDodoClient();
    const productId = getDodoProductId(input.planId);

    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: input.email,
      },
      return_url: input.successUrl,
      metadata: {
        user_id: input.userId,
        plan_id: input.planId || 'pro_monthly',
      },
    });

    if (!session.checkout_url) {
      throw new Error('Dodo Payments did not return a checkout_url');
    }

    return {
      url: session.checkout_url,
      sessionId: session.session_id,
    };
  },

  async createCustomerPortalSession(input: CreatePortalInput): Promise<PortalSessionResult> {
    const client = getDodoClient();
    try {
      const portal = await client.customers.customerPortal.create(input.customerId, {
        return_url: input.returnUrl,
      });

      if (portal?.link) {
        return { url: portal.link };
      }
    } catch (err) {
      console.warn('Dodo customer portal session creation failed, using fallback:', err);
    }

    return {
      url: 'https://customer.dodopayments.com',
    };
  },
};

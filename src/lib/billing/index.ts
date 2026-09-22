import { BILLING_PROVIDER } from './config';
import type { BillingProvider } from './provider';
import { stripeBillingProvider } from './stripe-provider';

/**
 * Provider-agnostic entrypoint.
 * Stripe is the first concrete adapter (global SaaS checkout).
 * Razorpay (or others) can implement the same BillingProvider interface later.
 */
export function getBillingProvider(): BillingProvider {
  switch (BILLING_PROVIDER) {
    case 'razorpay':
      throw new Error(
        'Razorpay adapter is not enabled. Set BILLING_PROVIDER=stripe or implement lib/billing/razorpay-provider.ts.'
      );
    case 'stripe':
    default:
      return stripeBillingProvider;
  }
}

export * from './config';
export * from './types';
export * from './access';
export * from './provider';

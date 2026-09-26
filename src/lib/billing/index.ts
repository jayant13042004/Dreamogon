import { BILLING_PROVIDER } from './config';
import type { BillingProvider } from './provider';
import { stripeBillingProvider } from './stripe-provider';

import { dodoBillingProvider } from './dodo-provider';

/**
 * Provider-agnostic entrypoint.
 * Stripe and Dodo Payments are supported.
 */
export function getBillingProvider(): BillingProvider {
  switch (BILLING_PROVIDER) {
    case 'dodo':
      return dodoBillingProvider;
    case 'razorpay':
      throw new Error(
        'Razorpay adapter is not enabled. Set BILLING_PROVIDER=dodo or BILLING_PROVIDER=stripe.'
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

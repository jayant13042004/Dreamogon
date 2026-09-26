import type { CheckoutSessionResult, PortalSessionResult } from './types';
import type { BillingProviderId } from './config';

export type CreateCheckoutInput = {
  userId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
  /** Existing provider customer id if known */
  customerId?: string | null;
  /** The requested plan to checkout */
  planId?: 'pro_monthly' | 'pro_annual';
};

export type CreatePortalInput = {
  customerId: string;
  returnUrl: string;
};

export type BillingProvider = {
  id: BillingProviderId;
  isConfigured: () => boolean;
  createCheckoutSession: (input: CreateCheckoutInput) => Promise<CheckoutSessionResult>;
  createCustomerPortalSession: (input: CreatePortalInput) => Promise<PortalSessionResult>;
};

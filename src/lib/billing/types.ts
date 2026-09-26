import type { PlanTier } from '@/types/user';
import type { BillingProviderId } from './config';

export type SubscriptionStatus =
  | 'inactive'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

export type PlanInterval = 'month' | 'year' | 'one_time' | null;

export type SubscriptionRecord = {
  id: string;
  user_id: string;
  provider: BillingProviderId;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  status: SubscriptionStatus;
  plan_tier: PlanTier;
  currency: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  price_id?: string | null;
  interval?: PlanInterval;
};

export type CheckoutSessionResult = {
  url: string;
  sessionId: string;
};

export type PortalSessionResult = {
  url: string;
};

export type AiQuotaDecision = {
  allowed: boolean;
  planTier: PlanTier;
  limit: number;
  used: number;
  remaining: number;
  periodKey: string;
  reason?: 'quota_exceeded' | 'ok';
};

export type AiUsageSummary = {
  planTier: PlanTier;
  limit: number;
  used: number;
  remaining: number;
  periodKey: string;
};

/** Map provider subscription status → application plan_tier */
export function planTierFromSubscriptionStatus(
  status: SubscriptionStatus,
  intendedTier: PlanTier = 'pro'
): PlanTier {
  if (status === 'active' || status === 'trialing') return intendedTier;
  return 'free';
}


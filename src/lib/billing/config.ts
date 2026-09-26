import type { PlanTier } from '@/types/user';
import type { PlanInterval } from './types';

/** Global default presentment currency — configurable, not hardcoded */
export const BILLING_CURRENCY = (process.env.BILLING_CURRENCY || 'usd').toLowerCase();

export type BillingProviderId = 'stripe' | 'razorpay';

export const BILLING_PROVIDER = (process.env.BILLING_PROVIDER || 'stripe') as BillingProviderId;

export const PLAN_IDS = {
  free: 'free',
  pro_monthly: 'pro_monthly',
  pro_annual: 'pro_annual',
  lifetime: 'lifetime',
} as const;

export type PlanDefinition = {
  id: string;
  tier: PlanTier;
  name: string;
  headline: string;
  description: string;
  /** Amount in major currency units (e.g. 9 = $9.00) for display */
  priceDisplay: number;
  currency: string;
  interval: PlanInterval;
  intervalLabel: string;
  aiAllowance: {
    monthlyLimit: number;
  };
  /** Lifetime image slots for free; monthly generations for pro / lifetime */
  dreamImages: {
    kind: 'lifetime' | 'monthly';
    limit: number;
  };
  allowImageRegeneration: boolean;
  features: string[];
};

export const PLANS: Record<keyof typeof PLAN_IDS, PlanDefinition> = {
  free: {
    id: PLAN_IDS.free,
    tier: 'free',
    name: 'Free',
    headline: 'Start your dream archive',
    description: 'Everything you need to record and begin understanding your dreams.',
    priceDisplay: 0,
    currency: BILLING_CURRENCY,
    interval: null,
    intervalLabel: '/ forever',
    aiAllowance: { monthlyLimit: 5 },
    dreamImages: { kind: 'lifetime', limit: 2 },
    allowImageRegeneration: false,
    features: [
      'Unlimited dream recording (text & voice)',
      'Full archive, instant search & calendar views',
      '5 quiet AI reflections / month',
      'Basic subconscious pattern overview & themes',
      'Spatial Dream World constellation',
      '2 lifetime preview visual memories',
      'Full data export (JSON & Markdown) & privacy baseline',
    ],
  },
  pro_monthly: {
    id: PLAN_IDS.pro_monthly,
    tier: 'pro',
    name: 'Pro Monthly',
    headline: 'Understand your dream life over time',
    description: 'Deeper cross-dream analysis, recurring motifs, and longitudinal synthesis.',
    priceDisplay: Number(process.env.NEXT_PUBLIC_PRO_PRICE_DISPLAY || '9'),
    currency: BILLING_CURRENCY,
    interval: 'month',
    intervalLabel: '/ month',
    aiAllowance: { monthlyLimit: 100 },
    dreamImages: { kind: 'monthly', limit: 20 },
    allowImageRegeneration: true,
    features: [
      'Everything included in Free',
      '100 AI operations / month',
      'Deep cross-dream pattern synthesis across your archive',
      'Longitudinal dream-memory & pattern evolution',
      'Recurring people, places & emotional patterns over time',
      'Conversational AI Guide with full dream-history context',
      '20 experimental visual memories / month + regeneration',
      'Direct support desk access',
    ],
  },
  pro_annual: {
    id: PLAN_IDS.pro_annual,
    tier: 'pro',
    name: 'Pro Annual',
    headline: 'Save with annual billing ($6/mo equivalent)',
    description: 'The full Pro experience at $72/year ($6/month equivalent).',
    priceDisplay: 72,
    currency: BILLING_CURRENCY,
    interval: 'year',
    intervalLabel: '/ year',
    aiAllowance: { monthlyLimit: 100 },
    dreamImages: { kind: 'monthly', limit: 20 },
    allowImageRegeneration: true,
    features: [
      'Everything included in Pro Monthly',
      '$6/month equivalent (save 33% compared to monthly)',
      '100 AI operations / month',
      'Billed annually at $72/year',
      'Cross-dream archive understanding & recurring pattern radar',
      'Conversational AI Guide with full context',
      '20 experimental visual memories / month + regeneration',
    ],
  },
  lifetime: {
    id: PLAN_IDS.lifetime,
    tier: 'lifetime',
    name: 'Lifetime',
    headline: 'Own the full Pro experience without a recurring subscription',
    description: 'One-time payment for permanent Pro entitlement and sustainable recurring fair-use AI.',
    priceDisplay: 149,
    currency: BILLING_CURRENCY,
    interval: 'one_time',
    intervalLabel: 'one-time payment',
    aiAllowance: { monthlyLimit: 100 },
    dreamImages: { kind: 'monthly', limit: 20 },
    allowImageRegeneration: true,
    features: [
      'Full Pro product access permanently',
      'No recurring Subconscious Log subscription fee',
      '100 AI operations / month recurring fair-use allowance',
      'Deep cross-dream pattern synthesis & archive queries',
      'Longitudinal theme tracking across months & years',
      'Conversational AI Guide with full dream-history context',
      '20 experimental visual memories / month + regeneration',
    ],
  },
};

export function getPlanDefinition(tier: PlanTier): PlanDefinition {
  if (tier === 'lifetime') return PLANS.lifetime;
  if (tier === 'pro') return PLANS.pro_monthly;
  return PLANS.free;
}

export function getPlanById(id: string): PlanDefinition {
  if (id === PLAN_IDS.pro_annual) return PLANS.pro_annual;
  if (id === PLAN_IDS.lifetime) return PLANS.lifetime;
  if (id === PLAN_IDS.pro_monthly || id === 'pro') return PLANS.pro_monthly;
  return PLANS.free;
}

export function formatPlanPrice(plan: PlanDefinition): string {
  if (plan.priceDisplay <= 0) return 'Free';
  const currency = plan.currency.toUpperCase();
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(plan.priceDisplay);
  } catch {
    return `${currency} ${plan.priceDisplay}`;
  }
}

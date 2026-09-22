import type { SupabaseClient } from '@supabase/supabase-js';
import type { PlanTier } from '@/types/user';
import { getPlanDefinition } from './config';
import type {
  AiQuotaDecision,
  AiUsageSummary,
  ImageQuotaDecision,
  PlanInterval,
  SubscriptionRecord,
  SubscriptionStatus,
} from './types';
import { planTierFromSubscriptionStatus } from './types';

const IMAGE_METRIC = 'dream_images';
const AI_METRIC = 'ai_operations';

export function currentUtcMonthKey(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getPrivilegedClient(fallbackClient: SupabaseClient): SupabaseClient {
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createServiceClient } = require('@/lib/supabase/service');
      return createServiceClient();
    }
  } catch {
    // Fallback to the authenticated client in dev environments
  }
  return fallbackClient;
}

export async function getPlanTier(
  supabase: SupabaseClient,
  userId: string
): Promise<PlanTier> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('plan_tier')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data?.plan_tier === 'lifetime') return 'lifetime';
    if (!error && data?.plan_tier === 'pro') return 'pro';
  } catch {
    // Fall back to free
  }
  return 'free';
}

export async function getSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionRecord | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return null;
    return (data as SubscriptionRecord) || null;
  } catch {
    return null;
  }
}

/* ==========================================================================
   AI Allowance & Usage System
   ========================================================================== */

export async function getAiQuota(
  supabase: SupabaseClient,
  userId: string
): Promise<AiQuotaDecision> {
  const planTier = await getPlanTier(supabase, userId);
  const plan = getPlanDefinition(planTier);
  const limit = plan.aiAllowance.monthlyLimit;
  const periodKey = currentUtcMonthKey();

  let used = 0;
  try {
    const { data: meter, error } = await supabase
      .from('usage_meters')
      .select('quantity')
      .eq('user_id', userId)
      .eq('metric', AI_METRIC)
      .eq('period_key', periodKey)
      .maybeSingle();

    if (!error && meter) {
      used = meter.quantity ?? 0;
    }
  } catch {
    used = 0;
  }

  const allowed = used < limit;

  return {
    allowed,
    planTier,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    periodKey,
    reason: allowed ? 'ok' : 'quota_exceeded',
  };
}

export async function getAiUsageSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<AiUsageSummary> {
  const quota = await getAiQuota(supabase, userId);
  return {
    planTier: quota.planTier,
    limit: quota.limit,
    used: quota.used,
    remaining: quota.remaining,
    periodKey: quota.periodKey,
  };
}

export async function recordAiOperation(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  try {
    const db = getPrivilegedClient(supabase);
    const periodKey = currentUtcMonthKey();

    const { data: existing, error } = await db
      .from('usage_meters')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('metric', AI_METRIC)
      .eq('period_key', periodKey)
      .maybeSingle();

    if (error) return;

    if (existing) {
      await db
        .from('usage_meters')
        .update({ quantity: (existing.quantity || 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await db.from('usage_meters').insert({
        user_id: userId,
        metric: AI_METRIC,
        period_key: periodKey,
        quantity: 1,
      });
    }
  } catch {
    // non-fatal
  }
}

/* ==========================================================================
   Dream Image Quota System (Secondary / Experimental Feature)
   ========================================================================== */

function dreamHasImage(d: {
  image_path?: string | null;
  image_url?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai_analysis?: any;
}): boolean {
  return !!(
    d.image_path ||
    d.image_url ||
    d.ai_analysis?.image_url ||
    d.ai_analysis?.image_path
  );
}

export async function getImageQuota(
  supabase: SupabaseClient,
  userId: string,
  opts: { isRegenerate: boolean; dreamAlreadyHasImage: boolean }
): Promise<ImageQuotaDecision> {
  const planTier = await getPlanTier(supabase, userId);
  const plan = getPlanDefinition(planTier);

  if (opts.isRegenerate && !plan.allowImageRegeneration) {
    return {
      allowed: false,
      planTier,
      limit: plan.dreamImages.limit,
      used: 0,
      remaining: 0,
      kind: plan.dreamImages.kind,
      reason: 'regeneration_not_allowed',
    };
  }

  if (plan.dreamImages.kind === 'lifetime') {
    let dreams: Array<{
      id: string;
      image_url?: string | null;
      image_path?: string | null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ai_analysis?: any;
    }> | null = null;

    const { data: dreamCols, error: colErr } = await supabase
      .from('dreams')
      .select('id, image_url, image_path, ai_analysis')
      .eq('user_id', userId);

    if (!colErr && dreamCols) {
      dreams = dreamCols;
    } else {
      const { data: baseDreams } = await supabase
        .from('dreams')
        .select('id, ai_analysis')
        .eq('user_id', userId);
      dreams = baseDreams;
    }

    const used = (dreams || []).filter(dreamHasImage).length;
    const wouldConsumeSlot = !opts.dreamAlreadyHasImage;
    const allowed = wouldConsumeSlot ? used < plan.dreamImages.limit : false;

    return {
      allowed,
      planTier,
      limit: plan.dreamImages.limit,
      used,
      remaining: Math.max(0, plan.dreamImages.limit - used),
      kind: 'lifetime',
      reason: allowed ? 'ok' : 'quota_exceeded',
    };
  }

  // Monthly meter for Pro & Lifetime
  const periodKey = currentUtcMonthKey();
  let used = 0;
  try {
    const { data: meter, error } = await supabase
      .from('usage_meters')
      .select('quantity')
      .eq('user_id', userId)
      .eq('metric', IMAGE_METRIC)
      .eq('period_key', periodKey)
      .maybeSingle();

    if (!error && meter) {
      used = meter.quantity ?? 0;
    }
  } catch {
    used = 0;
  }
  const allowed = used < plan.dreamImages.limit;

  return {
    allowed,
    planTier,
    limit: plan.dreamImages.limit,
    used,
    remaining: Math.max(0, plan.dreamImages.limit - used),
    kind: 'monthly',
    reason: allowed ? 'ok' : 'quota_exceeded',
  };
}

export async function recordImageGeneration(
  supabase: SupabaseClient,
  userId: string,
  planTier: PlanTier
): Promise<void> {
  const plan = getPlanDefinition(planTier);
  if (plan.dreamImages.kind !== 'monthly') return;

  const db = getPrivilegedClient(supabase);
  const periodKey = currentUtcMonthKey();
  const { data: existing } = await db
    .from('usage_meters')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('metric', IMAGE_METRIC)
    .eq('period_key', periodKey)
    .maybeSingle();

  if (existing) {
    await db
      .from('usage_meters')
      .update({ quantity: (existing.quantity || 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await db.from('usage_meters').insert({
      user_id: userId,
      metric: IMAGE_METRIC,
      period_key: periodKey,
      quantity: 1,
    });
  }
}

/* ==========================================================================
   Subscription & Entitlement Synchronization
   ========================================================================== */

/**
 * Upsert subscription + sync profiles.plan_tier (application access state).
 * Intended for webhook / service-role clients.
 */
export async function syncSubscriptionAccess(
  supabase: SupabaseClient,
  args: {
    userId: string;
    provider: SubscriptionRecord['provider'];
    providerCustomerId?: string | null;
    providerSubscriptionId?: string | null;
    status: SubscriptionStatus;
    currency?: string;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
    priceId?: string | null;
    interval?: PlanInterval;
    rawMeta?: Record<string, unknown>;
  }
): Promise<void> {
  // CRITICAL: Lifetime users must NEVER be downgraded by a subscription event
  const currentTier = await getPlanTier(supabase, args.userId);
  if (currentTier === 'lifetime') {
    console.log('syncSubscriptionAccess: user already has lifetime tier; preserving lifetime status for', args.userId);
    return;
  }

  const planTier = planTierFromSubscriptionStatus(args.status, 'pro');

  await supabase.from('subscriptions').upsert(
    {
      user_id: args.userId,
      provider: args.provider,
      provider_customer_id: args.providerCustomerId ?? null,
      provider_subscription_id: args.providerSubscriptionId ?? null,
      status: args.status,
      plan_tier: planTier,
      currency: (args.currency || 'usd').toLowerCase(),
      current_period_end: args.currentPeriodEnd ?? null,
      cancel_at_period_end: args.cancelAtPeriodEnd ?? false,
      price_id: args.priceId ?? null,
      interval: args.interval ?? 'month',
      raw_meta: args.rawMeta ?? {},
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  await supabase
    .from('profiles')
    .update({ plan_tier: planTier, updated_at: new Date().toISOString() })
    .eq('id', args.userId);
}

/**
 * Grant permanent Lifetime entitlement without subscription expiration.
 * Intended for one-time payment webhooks.
 */
export async function grantLifetimeAccess(
  supabase: SupabaseClient,
  args: {
    userId: string;
    provider: SubscriptionRecord['provider'];
    providerCustomerId?: string | null;
    currency?: string;
    priceId?: string | null;
    rawMeta?: Record<string, unknown>;
  }
): Promise<void> {
  await supabase.from('subscriptions').upsert(
    {
      user_id: args.userId,
      provider: args.provider,
      provider_customer_id: args.providerCustomerId ?? null,
      provider_subscription_id: null,
      status: 'active',
      plan_tier: 'lifetime',
      currency: (args.currency || 'usd').toLowerCase(),
      current_period_end: null, // Lifetime never expires
      cancel_at_period_end: false,
      price_id: args.priceId ?? null,
      interval: 'one_time',
      raw_meta: args.rawMeta ?? {},
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  await supabase
    .from('profiles')
    .update({ plan_tier: 'lifetime', updated_at: new Date().toISOString() })
    .eq('id', args.userId);
}

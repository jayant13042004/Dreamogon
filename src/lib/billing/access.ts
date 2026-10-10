import type { SupabaseClient } from '@supabase/supabase-js';
import type { PlanTier } from '@/types/user';
import { getPlanDefinition } from './config';
import type {
  AiQuotaDecision,
  AiUsageSummary,
  PlanInterval,
  SubscriptionRecord,
  SubscriptionStatus,
} from './types';
import { planTierFromSubscriptionStatus } from './types';

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

/**
 * Server-only helper: check if an email belongs to the configured owner allowlist.
 * Never exposed to the client.
 */
export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  const raw = process.env.OWNER_EMAILS || '';
  if (!raw.trim()) return false;
  const list = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

export async function getPlanTier(
  supabase: SupabaseClient,
  userId: string,
  userEmail?: string | null
): Promise<PlanTier> {
  try {
    if (userEmail && isOwnerEmail(userEmail)) {
      return 'pro';
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('plan_tier, email')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      if (isOwnerEmail(data.email)) {
        return 'pro';
      }
      if (data.plan_tier === 'pro' || data.plan_tier === 'lifetime') {
        return 'pro';
      }
    }
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
  userId: string,
  userEmail?: string | null
): Promise<AiQuotaDecision> {
  const planTier = await getPlanTier(supabase, userId, userEmail);
  const plan = getPlanDefinition(planTier);
  const limit = plan.aiAllowance.monthlyLimit;
  const periodKey = currentUtcMonthKey();

  let effectiveEmail = userEmail;
  if (!effectiveEmail) {
    const { data: p } = await supabase.from('profiles').select('email').eq('id', userId).maybeSingle();
    effectiveEmail = p?.email;
  }

  if (effectiveEmail && isOwnerEmail(effectiveEmail)) {
    return {
      allowed: true,
      planTier: 'pro',
      limit,
      used: 0,
      remaining: limit,
      periodKey,
      reason: 'ok',
    };
  }

  let used = 0;
  try {
    const db = getPrivilegedClient(supabase);
    const { data: meter, error } = await db
      .from('usage_meters')
      .select('quantity')
      .eq('user_id', userId)
      .eq('metric', AI_METRIC)
      .eq('period_key', periodKey)
      .maybeSingle();

    if (error) {
      console.warn('Could not read usage_meters, falling back to authenticated client:', error);
      // Fallback to client provided
      const { data: clientMeter } = await supabase
        .from('usage_meters')
        .select('quantity')
        .eq('user_id', userId)
        .eq('metric', AI_METRIC)
        .eq('period_key', periodKey)
        .maybeSingle();
      if (clientMeter) used = clientMeter.quantity ?? 0;
    } else if (meter) {
      used = meter.quantity ?? 0;
    }
  } catch (err) {
    console.error('Error in getAiQuota:', err);
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
  userId: string,
  userEmail?: string | null
): Promise<AiUsageSummary> {
  const quota = await getAiQuota(supabase, userId, userEmail);
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
  if (process.env.NODE_ENV === 'production' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in production. Quota metering cannot proceed securely.');
    throw new Error('Service configuration error: Quota metering is temporarily unavailable.');
  }

  const db = getPrivilegedClient(supabase);
  const periodKey = currentUtcMonthKey();

  const { data: existing, error: selectError } = await db
    .from('usage_meters')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('metric', AI_METRIC)
    .eq('period_key', periodKey)
    .maybeSingle();

  if (selectError) {
    console.error('Error querying usage_meters in recordAiOperation:', selectError);
    throw new Error('Failed to verify usage quota.');
  }

  if (existing) {
    const { error: updateError } = await db
      .from('usage_meters')
      .update({ quantity: (existing.quantity || 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Error updating usage_meters:', updateError);
      throw new Error('Failed to record AI usage.');
    }
  } else {
    const { error: insertError } = await db.from('usage_meters').insert({
      user_id: userId,
      metric: AI_METRIC,
      period_key: periodKey,
      quantity: 1,
    });

    if (insertError) {
      console.error('Error inserting usage_meters:', insertError);
      throw new Error('Failed to record AI usage.');
    }
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
  let planTier = planTierFromSubscriptionStatus(args.status, 'pro');

  // Verify if user is an owner, never downgrade owner access
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', args.userId)
    .maybeSingle();

  if (profile?.email && isOwnerEmail(profile.email)) {
    planTier = 'pro';
  }

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


import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  formatPlanPrice,
  getAiUsageSummary,
  getPlanDefinition,
  getPlanTier,
  getSubscription,
  PLANS,
} from '@/lib/billing';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const planTier = await getPlanTier(supabase, user.id);
    const plan = getPlanDefinition(planTier);
    const subscription = await getSubscription(supabase, user.id);
    const aiUsage = await getAiUsageSummary(supabase, user.id);

    return NextResponse.json({
      planTier,
      plan: {
        id: plan.id,
        name: plan.name,
        headline: plan.headline,
        description: plan.description,
        priceLabel: formatPlanPrice(plan),
        currency: plan.currency,
        interval: plan.interval,
        intervalLabel: plan.intervalLabel,
        features: plan.features,
      },
      catalog: {
        free: {
          id: PLANS.free.id,
          name: PLANS.free.name,
          headline: PLANS.free.headline,
          priceLabel: formatPlanPrice(PLANS.free),
          intervalLabel: PLANS.free.intervalLabel,
          features: PLANS.free.features,
          aiLimit: PLANS.free.aiAllowance.monthlyLimit,
        },
        pro_monthly: {
          id: PLANS.pro_monthly.id,
          name: PLANS.pro_monthly.name,
          headline: PLANS.pro_monthly.headline,
          priceLabel: formatPlanPrice(PLANS.pro_monthly),
          intervalLabel: PLANS.pro_monthly.intervalLabel,
          features: PLANS.pro_monthly.features,
          aiLimit: PLANS.pro_monthly.aiAllowance.monthlyLimit,
        },
        pro_annual: {
          id: PLANS.pro_annual.id,
          name: PLANS.pro_annual.name,
          headline: PLANS.pro_annual.headline,
          priceLabel: formatPlanPrice(PLANS.pro_annual),
          intervalLabel: PLANS.pro_annual.intervalLabel,
          features: PLANS.pro_annual.features,
          aiLimit: PLANS.pro_annual.aiAllowance.monthlyLimit,
        },
        lifetime: {
          id: PLANS.lifetime.id,
          name: PLANS.lifetime.name,
          headline: PLANS.lifetime.headline,
          priceLabel: formatPlanPrice(PLANS.lifetime),
          intervalLabel: PLANS.lifetime.intervalLabel,
          features: PLANS.lifetime.features,
          aiLimit: PLANS.lifetime.aiAllowance.monthlyLimit,
        },
      },
      subscription: subscription
        ? {
            status: subscription.status,
            provider: subscription.provider,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            interval: subscription.interval || (planTier === 'lifetime' ? 'one_time' : 'month'),
          }
        : null,
      aiUsage: {
        planTier: aiUsage.planTier,
        limit: aiUsage.limit,
        used: aiUsage.used,
        remaining: aiUsage.remaining,
        periodKey: aiUsage.periodKey,
      },
    });
  } catch (error) {
    console.error('Billing status error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Could not load billing status' }, { status: 500 });
  }
}

/**
 * Subconscious Log Analytics & GA4 Funnel Tracking Utility
 * 
 * Complies with strict privacy standards:
 * NEVER transmits dream text, private journal notes, or PII.
 * Only transmits anonymous behavioral signals, funnel conversions, and engagement telemetry.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Log pageviews with clean path canonicalization
 */
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag || !GA_TRACKING_ID) return;
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
    anonymize_ip: true,
  });
};

/**
 * Generic event tracker with type safety
 */
export const trackEvent = (
  eventName: string,
  params: Record<string, string | number | boolean | undefined> = {}
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  // Filter out any undefined or accidental sensitive fields
  const blocked = new Set([
    'content',
    'text',
    'dream_text',
    'dream',
    'title',
    'body',
    'prompt',
    'message',
    'email',
    'name',
  ]);
  const safeParams: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (blocked.has(key.toLowerCase())) continue;
    if (typeof value === 'string' && value.length > 120) continue;
    safeParams[key] = value;
  }

  window.gtag('event', eventName, safeParams);
};

// ─── Core Conversion Funnel Events ───────────────────────────

export const Analytics = {
  // 1. Landing & Marketing Intent
  landingInteraction: (featureName: string) =>
    trackEvent('dream_world_interaction', { feature: featureName }),

  exploreDreamClicked: (symbol?: string) =>
    trackEvent('explore_dream_clicked', { symbol: symbol || 'general' }),

  dreamDecoderStarted: () =>
    trackEvent('dream_decoder_started'),

  dreamDecoderCompleted: (symbolCount: number) =>
    trackEvent('dream_decoder_completed', { symbol_count: symbolCount }),

  // 2. Authentication & Acquisition
  signUp: (method: string = 'email') =>
    trackEvent('sign_up', { method }),

  login: (method: string = 'email') =>
    trackEvent('login', { method }),

  // 3. Product Activation & Core Loop
  dreamCreateStarted: () =>
    trackEvent('dream_create_started'),

  dreamCreated: (dreamCount: number, hasVoice: boolean = false) =>
    trackEvent('dream_created', { dream_count: dreamCount, has_voice: hasVoice }),

  dreamAnalysisCompleted: (dreamCount: number, entityCount: number) =>
    trackEvent('dream_analysis_completed', { dream_count: dreamCount, entity_count: entityCount }),

  dreamWorldOpened: (artifactCount: number, dreamCount: number) =>
    trackEvent('dream_world_opened', { artifact_count: artifactCount, dream_count: dreamCount }),

  // 4. Engagement & Retention
  artifactViewed: (artifactType: string, appearanceCount: number) =>
    trackEvent('artifact_viewed', { artifact_type: artifactType, appearance_count: appearanceCount }),

  insightViewed: (insightType: string, isProLocked: boolean) =>
    trackEvent('insight_viewed', { insight_type: insightType, is_locked: isProLocked }),

  dreamProfileViewed: (dreamCount: number) =>
    trackEvent('dream_profile_viewed', { dream_count: dreamCount }),

  // 5. Monetization & Checkout Funnel
  upgradeViewed: (trigger: string, dreamCount: number) =>
    trackEvent('upgrade_viewed', { trigger, dream_count: dreamCount }),

  beginCheckout: (plan: string, value: number, currency: string = 'USD') =>
    trackEvent('begin_checkout', { plan, value, currency }),

  purchase: (transactionId: string, value: number, plan: string, currency: string = 'USD') =>
    trackEvent('purchase', { transaction_id: transactionId, value, plan, currency }),
};

-- Slice 1A: Foundation consistency
-- Align profiles with plan scaffolding. No billing provider yet.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_tier text NOT NULL DEFAULT 'free'
    CHECK (plan_tier IN ('free', 'pro'));

COMMENT ON COLUMN public.profiles.plan_tier IS
  'Subscription plan. Foundation only — billing enforcement comes later. Defaults to free.';

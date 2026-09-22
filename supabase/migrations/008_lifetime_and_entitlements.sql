-- Migration 008: Lifetime tier support, billing intervals, price tracking, and secure usage meters

-- 1. Extend profiles.plan_tier check constraint to include 'lifetime'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_tier_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_tier_check
  CHECK (plan_tier IN ('free', 'pro', 'lifetime'));

-- 2. Extend subscriptions.plan_tier check constraint to include 'lifetime'
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_tier_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_tier_check
  CHECK (plan_tier IN ('free', 'pro', 'lifetime'));

-- 3. Add price_id and interval to subscriptions if not present
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS price_id text,
  ADD COLUMN IF NOT EXISTS interval text CHECK (interval IN ('month', 'year', 'one_time') OR interval IS NULL);

-- 4. Tighten usage_meters RLS policies:
-- Users should be able to VIEW their own usage meters, but NEVER insert or update them directly from the client.
-- Meter mutation must only happen via server-side service-role client.
DROP POLICY IF EXISTS "Users can insert own usage meters" ON public.usage_meters;
DROP POLICY IF EXISTS "Users can update own usage meters" ON public.usage_meters;

-- Re-confirm select policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'usage_meters'
    AND policyname = 'Users can view own usage meters'
  ) THEN
    CREATE POLICY "Users can view own usage meters"
      ON public.usage_meters FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

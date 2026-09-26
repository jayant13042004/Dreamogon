-- ==========================================================================
-- SUBCONSCIOUS LOG - Consolidated Database Migrations (002 through 008)
-- Paste and run this script in your Supabase project SQL Editor to enable:
-- 1. Dream World state & artifacts
-- 2. Visual memory columns & Storage bucket
-- 3. Billing, Subscriptions, and Usage Meters
-- 4. Stripe Webhook Idempotency & Lifetime Entitlements
-- ==========================================================================


-- --------------------------------------------------------------------------
-- Migration: 002_dream_world.sql
-- --------------------------------------------------------------------------
-- Dream Artifacts Table
create table public.dream_artifacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  artifact_type text not null check (artifact_type in ('person','place','object','emotion','animal','activity','symbol','theme')),
  name text not null,
  description text,
  metadata jsonb default '{}'::jsonb,
  appearance_count int default 1 not null,
  first_seen_at timestamptz default now() not null,
  last_seen_at timestamptz default now() not null,
  position_x float not null default 0,
  position_y float not null default 0,
  position_z float not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, artifact_type, name)
);

-- Dream Connections Table
create table public.dream_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  artifact_id_1 uuid references public.dream_artifacts(id) on delete cascade not null,
  artifact_id_2 uuid references public.dream_artifacts(id) on delete cascade not null,
  connection_strength float default 1.0 not null,
  first_connected_at timestamptz default now() not null,
  unique(artifact_id_1, artifact_id_2)
);

-- Dream Insights Table (For higher level observations & pro teasers)
create table public.dream_insights (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  is_pro_locked boolean default false not null,
  related_dream_ids uuid[] default '{}',
  related_artifact_ids uuid[] default '{}',
  created_at timestamptz default now() not null
);

-- Dream World State Table
create table public.dream_world_state (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  world_theme text default 'ethereal' check (world_theme in ('ethereal', 'deep_ocean', 'twilight', 'lucid')),
  maturity_level int default 1 not null,
  camera_position_x float default 0,
  camera_position_y float default 0,
  camera_position_z float default 5,
  unlocked_features jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index idx_dream_artifacts_user_id on public.dream_artifacts(user_id);
create index idx_dream_artifacts_type on public.dream_artifacts(artifact_type);
create index idx_dream_connections_user_id on public.dream_connections(user_id);
create index idx_dream_insights_user_id on public.dream_insights(user_id);

-- RLS
alter table public.dream_artifacts enable row level security;
alter table public.dream_connections enable row level security;
alter table public.dream_insights enable row level security;
alter table public.dream_world_state enable row level security;

-- RLS Policies
create policy "Users can manage own artifacts" on public.dream_artifacts
  for all using (auth.uid() = user_id);

create policy "Users can manage own connections" on public.dream_connections
  for all using (auth.uid() = user_id);

create policy "Users can manage own insights" on public.dream_insights
  for all using (auth.uid() = user_id);

create policy "Users can manage own world state" on public.dream_world_state
  for all using (auth.uid() = user_id);

-- Trigger to create default world state for new users
create or replace function public.handle_new_user_world_state()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.dream_world_state (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created_world
  after insert on auth.users
  for each row execute function public.handle_new_user_world_state();


-- --------------------------------------------------------------------------
-- Migration: 003_dream_visuals.sql
-- --------------------------------------------------------------------------
-- Add Visual Memory Image columns to Dreams table
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS image_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS image_prompt text,
ADD COLUMN IF NOT EXISTS image_generated_at timestamptz,
ADD COLUMN IF NOT EXISTS image_generation_count int DEFAULT 0;

-- Index for quickly finding dreams with generated visuals
CREATE INDEX IF NOT EXISTS idx_dreams_image_url ON public.dreams(image_url) WHERE image_url IS NOT NULL;


-- --------------------------------------------------------------------------
-- Migration: 004_foundation_consistency.sql
-- --------------------------------------------------------------------------
-- Slice 1A: Foundation consistency
-- Align profiles with plan scaffolding. No billing provider yet.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_tier text NOT NULL DEFAULT 'free'
    CHECK (plan_tier IN ('free', 'pro'));

COMMENT ON COLUMN public.profiles.plan_tier IS
  'Subscription plan. Foundation only — billing enforcement comes later. Defaults to free.';


-- --------------------------------------------------------------------------
-- Migration: 005_subscriptions_billing.sql
-- --------------------------------------------------------------------------
-- Phase 4: Provider-agnostic subscriptions + usage meters
-- Application access: profiles.plan_tier
-- Billing source of truth: provider webhooks → subscriptions row → plan_tier

create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  provider text not null check (provider in ('stripe', 'razorpay')),
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'inactive'
    check (status in (
      'inactive',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'incomplete',
      'incomplete_expired',
      'paused'
    )),
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro')),
  currency text not null default 'usd',
  current_period_end timestamptz,
  cancel_at_period_end boolean default false not null,
  raw_meta jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_subscriptions_provider_customer
  on public.subscriptions(provider, provider_customer_id);

create index if not exists idx_subscriptions_provider_sub
  on public.subscriptions(provider, provider_subscription_id);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Writes only via service role / webhooks (no insert/update policies for authenticated users)

-- Usage meters for plan-limited features (e.g. dream images)
create table if not exists public.usage_meters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  metric text not null,
  period_key text not null,
  quantity int not null default 0,
  updated_at timestamptz default now() not null,
  unique (user_id, metric, period_key)
);

create index if not exists idx_usage_meters_user_metric
  on public.usage_meters(user_id, metric, period_key);

alter table public.usage_meters enable row level security;

create policy "Users can view own usage meters"
  on public.usage_meters for select
  using (auth.uid() = user_id);

create policy "Users can insert own usage meters"
  on public.usage_meters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own usage meters"
  on public.usage_meters for update
  using (auth.uid() = user_id);



-- --------------------------------------------------------------------------
-- Migration: 006_dream_image_storage.sql
-- --------------------------------------------------------------------------
-- Stage A: Dream image storage — path/metadata in Postgres, bytes in Storage
-- Keeps existing image_url for display (proxy path or legacy data URLs)

ALTER TABLE public.dreams
ADD COLUMN IF NOT EXISTS image_path text;

CREATE INDEX IF NOT EXISTS idx_dreams_image_path
  ON public.dreams(image_path)
  WHERE image_path IS NOT NULL;

-- Private bucket: objects served via authenticated app proxy / signed URLs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dream-images',
  'dream-images',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Path convention: {user_id}/{dream_id}/{filename}
DROP POLICY IF EXISTS "Users can upload own dream images" ON storage.objects;
CREATE POLICY "Users can upload own dream images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'dream-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own dream images" ON storage.objects;
CREATE POLICY "Users can update own dream images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'dream-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read own dream images" ON storage.objects;
CREATE POLICY "Users can read own dream images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'dream-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own dream images" ON storage.objects;
CREATE POLICY "Users can delete own dream images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'dream-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- --------------------------------------------------------------------------
-- Migration: 007_webhook_idempotency.sql
-- --------------------------------------------------------------------------
-- Webhook idempotency for billing providers (Stripe event ids, etc.)
create table if not exists public.billing_webhook_events (
  id text primary key,
  provider text not null check (provider in ('stripe', 'razorpay')),
  event_type text,
  processed_at timestamptz default now() not null
);

create index if not exists idx_billing_webhook_events_processed
  on public.billing_webhook_events(processed_at desc);

alter table public.billing_webhook_events enable row level security;
-- Service role only (no policies for authenticated users)


-- --------------------------------------------------------------------------
-- Migration: 008_lifetime_and_entitlements.sql
-- --------------------------------------------------------------------------
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


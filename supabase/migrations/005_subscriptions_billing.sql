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


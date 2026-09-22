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

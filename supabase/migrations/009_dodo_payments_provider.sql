-- Migration 009: Add 'dodo' provider support to subscriptions and billing_webhook_events

ALTER TABLE public.subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_provider_check;

ALTER TABLE public.subscriptions 
  ADD CONSTRAINT subscriptions_provider_check 
  CHECK (provider IN ('stripe', 'razorpay', 'dodo'));

ALTER TABLE public.billing_webhook_events 
  DROP CONSTRAINT IF EXISTS billing_webhook_events_provider_check;

ALTER TABLE public.billing_webhook_events 
  ADD CONSTRAINT billing_webhook_events_provider_check 
  CHECK (provider IN ('stripe', 'razorpay', 'dodo'));

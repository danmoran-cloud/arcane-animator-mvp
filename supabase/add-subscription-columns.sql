-- ============================================================================
-- Arcane Animator — Unlimited-exports access columns
-- Run in Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Adds unlimited-exports state to `profiles`. A user has unlimited exports when
-- EITHER (see lib/subscription.ts):
--   • lifetime_unlimited = true — a one-time Founders/Noble lifetime purchase, or
--   • subscription_status is 'active' / 'trialing' — the monthly subscription.
--
-- The Stripe webhook keeps these in sync (app/api/webhooks/stripe/route.ts):
--   • customer.subscription.created/updated/deleted → subscription_* columns
--   • checkout.session.completed for an unlimited pack → lifetime_unlimited
--   • checkout.session.completed for the Founders tier → is_founder (badge)
--
-- All columns are nullable/defaulted and idempotent, so this is safe to re-run.
-- ============================================================================

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists subscription_current_period_end timestamptz,
  add column if not exists lifetime_unlimited boolean not null default false,
  add column if not exists is_founder boolean not null default false;

-- Fast lookup by Stripe customer id (used as a fallback path from webhooks).
create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id);

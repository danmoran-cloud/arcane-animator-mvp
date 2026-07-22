-- ============================================================================
-- Arcane Animator — Referral reward on signup (no purchase required)
-- Run in Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Grants the referral bonus the moment a referral is recorded — i.e. as soon as
-- the referred person creates their account — instead of waiting for their first
-- purchase. Both parties receive REFERRAL_REWARD_TOKENS (5) exports.
--
-- Why a trigger on `referrals` (not app code):
--   Referral rows are inserted from two different places — the email/password
--   signup path (a SECURITY DEFINER trigger that reads signup metadata) and the
--   OAuth path (applyReferral() in app/auth/callback/route.ts). A single
--   BEFORE INSERT trigger on `referrals` covers BOTH uniformly, so there is no
--   per-path grant logic to keep in sync.
--
-- Idempotency:
--   The `reward_granted` guard means a row that is somehow re-inserted or
--   back-filled as already-granted is never double-paid. One referral row per
--   referred user is already enforced upstream.
--
-- This REPLACES the old purchase-gated grant that used mark_referral_purchased /
-- award_referral_reward from the Stripe webhook. Those functions are now unused
-- (left in place, harmless) and the webhook no longer calls them.
--
-- Keep the reward amount below in sync with REFERRAL_REWARD_TOKENS in
-- lib/tokens.ts. Idempotent and safe to re-run. Does NOT retroactively reward
-- referrals recorded before this trigger existed.
-- ============================================================================

create or replace function public.grant_referral_reward_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reward_amount integer := 5;  -- REFERRAL_REWARD_TOKENS
begin
  -- Never pay a referral twice, and never self-reward.
  if coalesce(new.reward_granted, false) then
    return new;
  end if;
  if new.referrer_user_id = new.referred_user_id then
    return new;
  end if;

  -- Award exports to both parties using the canonical balance RPC.
  perform public.increment_token_balance(new.referred_user_id, reward_amount);
  perform public.increment_token_balance(new.referrer_user_id, reward_amount);

  -- Track lifetime referral exports the referrer has earned (drives the
  -- "Exports earned" stat on the account referral dashboard).
  update public.profiles
     set referral_tokens_earned = coalesce(referral_tokens_earned, 0) + reward_amount
   where id = new.referrer_user_id;

  -- Mark the row rewarded up front so it lands in its final state.
  new.reward_granted := true;
  new.status := 'rewarded';
  return new;
end;
$$;

drop trigger if exists grant_referral_reward_on_signup on public.referrals;
create trigger grant_referral_reward_on_signup
  before insert on public.referrals
  for each row
  execute function public.grant_referral_reward_on_signup();

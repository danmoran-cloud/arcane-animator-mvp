-- ============================================================================
-- Arcane Animator — Signup bonus exports
-- Run in Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Grants every NEW account a starter balance of free exports (currently 3), so
-- a signup can render real videos immediately without paying. This keeps the
-- marketing promise on the sign-up page ("get 3 free exports") true.
--
-- Implementation notes:
--   • The profile row for a new user is created by the existing
--     `handle_new_user` trigger on auth.users. We do NOT edit that function —
--     instead we hook a BEFORE INSERT trigger on `profiles` that sets the
--     starter balance whenever the row is being inserted with an empty balance
--     (0 or null). This is additive and independent of how the profile row is
--     built, so it survives future changes to `handle_new_user`.
--   • The `= 0` guard means we only ever top up brand-new / empty profiles —
--     a row inserted with a deliberate non-zero balance is left untouched.
--   • The column default is also set to 3 to cover any direct inserts.
--
-- Keep the value below in sync with SIGNUP_BONUS_TOKENS in lib/tokens.ts.
-- Idempotent and safe to re-run. It does NOT retroactively grant existing users.
-- ============================================================================

-- Direct inserts (and any path that omits token_balance) start at the bonus.
alter table public.profiles
  alter column token_balance set default 3;

create or replace function public.grant_signup_bonus_exports()
returns trigger
language plpgsql
as $$
begin
  -- Only top up empty balances so we never overwrite an intentional grant.
  if coalesce(new.token_balance, 0) = 0 then
    new.token_balance := 3;  -- SIGNUP_BONUS_TOKENS
  end if;
  return new;
end;
$$;

drop trigger if exists grant_signup_bonus_exports on public.profiles;
create trigger grant_signup_bonus_exports
  before insert on public.profiles
  for each row
  execute function public.grant_signup_bonus_exports();

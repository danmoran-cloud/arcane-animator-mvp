-- ============================================================================
-- Arcane Animator — Admin role tiers
-- Run in Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Introduces a tiered `profiles.role` column: 'user' | 'admin' | 'superadmin'.
-- `is_admin` is kept in sync automatically (true whenever role <> 'user') so
-- all existing Row Level Security policies and app checks keep working unchanged.
--
--   user        → normal app use only
--   admin       → full /admin dashboard: manage tokens & coupons
--   superadmin  → everything admin can do, PLUS grant/revoke roles for others
-- ============================================================================

-- 1) Add the column (idempotent) ---------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'user';

-- 2) Constrain to the known tiers --------------------------------------------
alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin', 'superadmin'));

-- 3) Backfill from the existing is_admin flag --------------------------------
--    Any current admin becomes a regular 'admin'; we promote the owner below.
update public.profiles
  set role = 'admin'
  where is_admin = true and role = 'user';

-- 4) Promote the owner account to superadmin ---------------------------------
--    ⚠️  Change the email if this ever runs for a different owner.
update public.profiles
  set role = 'superadmin'
  where lower(email) = 'danmoran@gvtc.com';

-- 5) Keep is_admin derived from role -----------------------------------------
--    A trigger guarantees is_admin can never drift from role, no matter how
--    the row is written (app, SQL, backfill).
create or replace function public.sync_is_admin_from_role()
returns trigger
language plpgsql
as $$
begin
  new.is_admin := (new.role is distinct from 'user');
  return new;
end;
$$;

drop trigger if exists trg_sync_is_admin_from_role on public.profiles;
create trigger trg_sync_is_admin_from_role
  before insert or update of role on public.profiles
  for each row execute function public.sync_is_admin_from_role();

-- 6) Re-sync every existing row so is_admin matches role now ------------------
update public.profiles
  set is_admin = (role is distinct from 'user');

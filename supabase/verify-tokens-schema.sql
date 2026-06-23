-- ============================================================================
-- Arcane Animator — Token / Payment schema verification
-- Run in Supabase dashboard: SQL Editor → New query → paste → Run.
-- Read-only. Reports which objects the app code requires and whether each
-- one currently exists in this database. Anything marked MISSING must be
-- created before Stripe token purchases (and the account/export flows) work.
-- ============================================================================

-- 1) REQUIRED TABLES ---------------------------------------------------------
with required_tables(name) as (
  values
    ('profiles'),
    ('token_purchases'),
    ('exports'),
    ('coupons'),
    ('coupon_redemptions'),
    ('referrals')
)
select
  rt.name as table_name,
  case when t.tablename is null then 'MISSING' else 'ok' end as status
from required_tables rt
left join pg_tables t
  on t.schemaname = 'public' and t.tablename = rt.name
order by status desc, rt.name;

-- 2) REQUIRED COLUMNS --------------------------------------------------------
with required_columns(table_name, column_name) as (
  values
    -- profiles
    ('profiles','id'),
    ('profiles','token_balance'),
    ('profiles','free_export_date'),
    ('profiles','referral_code'),
    ('profiles','referral_tokens_earned'),
    ('profiles','is_admin'),
    -- token_purchases
    ('token_purchases','user_id'),
    ('token_purchases','stripe_checkout_session_id'),
    ('token_purchases','stripe_payment_intent_id'),
    ('token_purchases','pack_name'),
    ('token_purchases','tokens_added'),
    ('token_purchases','purchase_amount'),
    ('token_purchases','currency'),
    ('token_purchases','status'),
    ('token_purchases','created_at'),
    -- exports
    ('exports','user_id'),
    ('exports','export_type'),
    ('exports','resolution'),
    ('exports','duration_seconds'),
    ('exports','base_token_cost'),
    ('exports','duration_token_cost'),
    ('exports','total_tokens_used'),
    ('exports','status'),
    ('exports','created_at'),
    -- coupons
    ('coupons','code'),
    ('coupons','is_active'),
    ('coupons','expires_at'),
    ('coupons','max_uses'),
    ('coupons','uses_count'),
    ('coupons','one_use_per_user'),
    ('coupons','token_amount'),
    -- coupon_redemptions
    ('coupon_redemptions','coupon_id'),
    ('coupon_redemptions','user_id'),
    ('coupon_redemptions','tokens_added'),
    -- referrals
    ('referrals','referrer_user_id'),
    ('referrals','referred_user_id'),
    ('referrals','status'),
    ('referrals','reward_granted'),
    ('referrals','created_at')
)
select
  rc.table_name,
  rc.column_name,
  case when c.column_name is null then 'MISSING' else 'ok' end as status
from required_columns rc
left join information_schema.columns c
  on c.table_schema = 'public'
 and c.table_name = rc.table_name
 and c.column_name = rc.column_name
order by status desc, rc.table_name, rc.column_name;

-- 3) REQUIRED FUNCTIONS (RPCs) ----------------------------------------------
with required_functions(name) as (
  values
    ('increment_token_balance'),     -- used by webhook, coupons, admin grant
    ('deduct_tokens_for_export'),    -- used by export flow
    ('mark_referral_purchased'),     -- used by webhook on first purchase
    ('award_referral_reward')        -- used by webhook on first purchase
)
select
  rf.name as function_name,
  case when p.proname is null then 'MISSING' else 'ok' end as status,
  p.proargnames as arg_names
from required_functions rf
left join pg_proc p
  on p.proname = rf.name
 and p.pronamespace = 'public'::regnamespace
order by status desc, rf.name;

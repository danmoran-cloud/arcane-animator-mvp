// Subscription (unlimited-exports membership) helpers.
//
// Unlimited exports are granted by an ACTIVE Stripe subscription, not by a token
// balance. The subscription state lives on `profiles` (stripe_customer_id,
// stripe_subscription_id, subscription_status, subscription_current_period_end)
// and is kept in sync by the Stripe webhook. See app/api/webhooks/stripe/route.ts.

// Stripe subscription statuses that grant unlimited exports. `trialing` is
// included so a free-trial period (if ever enabled) also unlocks exports.
// `past_due` is intentionally excluded: once a renewal payment fails, access is
// revoked until the customer is back in good standing (`active`).
const UNLIMITED_STATUSES = ['active', 'trialing'] as const

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'
  | null
  | undefined

// Whether a subscription status currently grants unlimited exports.
export function hasUnlimitedExports(status: SubscriptionStatus): boolean {
  return !!status && (UNLIMITED_STATUSES as readonly string[]).includes(status)
}

// The two ways a profile can hold unlimited exports:
//   - lifetime_unlimited: a one-time Founders/Noble purchase (permanent), or
//   - an active/trialing subscription.
export interface UnlimitedAccess {
  lifetimeUnlimited?: boolean | null
  subscriptionStatus?: SubscriptionStatus
}

// Whether a profile currently has unlimited exports from EITHER source.
export function hasUnlimitedAccess(access: UnlimitedAccess): boolean {
  return !!access.lifetimeUnlimited || hasUnlimitedExports(access.subscriptionStatus)
}

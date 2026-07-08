'use server'

import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { TOKEN_PACKS, isPackAvailable } from '@/lib/tokens'
import { hasUnlimitedExports, hasUnlimitedAccess, type SubscriptionStatus } from '@/lib/subscription'
import { createClient } from '@/lib/supabase/server'

// Resolve the site's origin for building Stripe redirect URLs.
// Prefer an explicit override, otherwise derive it from the incoming request
// so it always matches the serving domain (production, preview, or local)
// without depending on a build-time-inlined NEXT_PUBLIC_ value.
async function getAppUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL
  if (configured) return configured.replace(/\/$/, '')

  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (host) {
    const proto = h.get('x-forwarded-proto') ?? 'https'
    return `${proto}://${host}`
  }

  return 'http://localhost:3000'
}

export async function createTokenPurchaseCheckout(packId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Please sign in to purchase exports.', requiresAuth: true }
  }

  let pack = TOKEN_PACKS.find(p => p.id === packId)
  if (!pack) {
    return { error: 'Invalid export pack' }
  }

  // While the Founders offer is live, route any OTHER lifetime purchase (e.g.
  // Noble) to the Founders tier — the access is identical, so nobody should
  // overpay while the founding-member price is available. They become a Founder.
  if (pack.unlimited && !pack.founder) {
    const founders = TOKEN_PACKS.find(p => p.founder && isPackAvailable(p))
    if (founders) pack = founders
  }

  // Limited-time offers (e.g. the Founders tier) can't be bought past their date.
  if (!isPackAvailable(pack)) {
    return { error: 'This offer has ended.' }
  }

  // Unlimited (lifetime) packs are a one-time grant — block a second purchase if
  // the user is already unlimited from any source.
  if (pack.unlimited) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('lifetime_unlimited, subscription_status')
      .eq('id', user.id)
      .single()

    if (
      hasUnlimitedAccess({
        lifetimeUnlimited: profile?.lifetime_unlimited,
        subscriptionStatus: profile?.subscription_status as SubscriptionStatus,
      })
    ) {
      return { error: 'You already have unlimited exports on your account.' }
    }
  }

  try {
    const appUrl = await getAppUrl()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pack.unlimited
                ? `${pack.name} - Lifetime Unlimited Exports`
                : `${pack.name} - ${pack.tokens} Exports`,
              description: pack.unlimited
                ? 'Lifetime unlimited exports for Arcane Animator'
                : `${pack.tokens} export credits for Arcane Animator`,
            },
            unit_amount: pack.priceInCents,
          },
          quantity: 1,
        },
      ],
      // Fulfillment happens in the Stripe webhook (single source of truth).
      // These keys MUST match what app/api/webhooks/stripe/route.ts reads.
      metadata: {
        user_id: user.id,
        pack_id: pack.id,
        pack_name: pack.name,
        tokens: pack.tokens.toString(),
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
    })

    if (!session.url) {
      return { error: 'Failed to create checkout session' }
    }

    return { url: session.url }
  } catch (error) {
    console.error('[v0] Stripe checkout error:', error)
    return { error: 'Failed to create checkout session' }
  }
}

// Find the user's existing Stripe customer id, creating (and persisting) one if
// needed. Storing it on the profile lets renewals and the billing portal map
// back to the account, and prevents creating duplicate Stripe customers.
async function getOrCreateStripeCustomer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | undefined,
): Promise<string> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_customer_id) return profile.stripe_customer_id

  const customer = await stripe.customers.create({
    email,
    metadata: { user_id: userId },
  })

  // Persist to the profile. The webhook also backfills this from subscription
  // events, so a failure here (e.g. RLS) is non-fatal — but the common path
  // stores it immediately to avoid duplicate customers on the next checkout.
  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)

  return customer.id
}

export async function createSubscriptionCheckout() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Please sign in to subscribe.', requiresAuth: true }
  }

  const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID
  if (!priceId) {
    console.error('[v0] STRIPE_SUBSCRIPTION_PRICE_ID is not set')
    return { error: 'Subscriptions are not available right now' }
  }

  // Block subscribing when the user is already unlimited (active subscription or
  // a lifetime purchase) so they can't double-pay.
  const { data: profile } = await supabase
    .from('profiles')
    .select('lifetime_unlimited, subscription_status')
    .eq('id', user.id)
    .single()

  if (profile?.lifetime_unlimited) {
    return { error: 'You already have lifetime unlimited exports — no subscription needed.' }
  }
  if (hasUnlimitedExports(profile?.subscription_status as SubscriptionStatus)) {
    return { error: 'You already have an active unlimited subscription.' }
  }

  try {
    const appUrl = await getAppUrl()
    const customerId = await getOrCreateStripeCustomer(supabase, user.id, user.email)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      // Carry the user id on BOTH the checkout session and the subscription so
      // recurring subscription.* webhook events (which don't see the session
      // metadata) can still resolve the account.
      metadata: { user_id: user.id },
      subscription_data: {
        metadata: { user_id: user.id },
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
    })

    if (!session.url) {
      return { error: 'Failed to create checkout session' }
    }

    return { url: session.url }
  } catch (error) {
    console.error('[v0] Stripe subscription checkout error:', error)
    return { error: 'Failed to create checkout session' }
  }
}

// Open the Stripe-hosted billing portal so the customer can manage or cancel
// their subscription and update payment methods.
export async function createBillingPortalSession() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Please sign in to manage billing.', requiresAuth: true }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return { error: 'No billing account found for this user.' }
  }

  try {
    const appUrl = await getAppUrl()
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/account`,
    })
    return { url: session.url }
  } catch (error) {
    console.error('[v0] Stripe billing portal error:', error)
    return { error: 'Failed to open billing portal' }
  }
}

export interface SubscriptionInfo {
  // Whether an active/trialing SUBSCRIPTION is present (drives Manage/billing UI).
  active: boolean
  status: SubscriptionStatus
  // ISO timestamp of the current period end (renewal or expiry), if any.
  currentPeriodEnd: string | null
  // Whether a one-time lifetime (Founders/Noble) purchase is present.
  lifetimeUnlimited: boolean
  // Unlimited exports from EITHER source — the flag most UI should gate on.
  unlimited: boolean
}

// Read the signed-in user's unlimited-access state for rendering account/pricing UI.
export async function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  const supabase = await createClient()

  const empty: SubscriptionInfo = {
    active: false, status: null, currentPeriodEnd: null, lifetimeUnlimited: false, unlimited: false,
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return empty

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_current_period_end, lifetime_unlimited')
    .eq('id', user.id)
    .single()

  const status = profile?.subscription_status as SubscriptionStatus
  const lifetimeUnlimited = !!profile?.lifetime_unlimited
  return {
    active: hasUnlimitedExports(status),
    status: status ?? null,
    currentPeriodEnd: profile?.subscription_current_period_end ?? null,
    lifetimeUnlimited,
    unlimited: hasUnlimitedAccess({ lifetimeUnlimited, subscriptionStatus: status }),
  }
}

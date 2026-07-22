'use server'

import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { TOKEN_PACKS } from '@/lib/tokens'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// The current period end moved from the Subscription object onto its items in
// Stripe's Basil API (v2025-*). Read it from whichever place the account's API
// version exposes so renewal dates are captured regardless.
function getPeriodEndIso(sub: Stripe.Subscription): string | null {
  const anySub = sub as unknown as {
    current_period_end?: number
    items?: { data?: Array<{ current_period_end?: number }> }
  }
  const unix = anySub.current_period_end ?? anySub.items?.data?.[0]?.current_period_end
  return typeof unix === 'number' ? new Date(unix * 1000).toISOString() : null
}

// Upsert a user's subscription state from a Stripe Subscription object. The user
// is resolved from subscription metadata (set at checkout) so recurring events
// that lack session context still map to the right account.
async function syncSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription,
) {
  const userId = sub.metadata?.user_id
  if (!userId) {
    console.error('[v0] Subscription', sub.id, 'has no user_id metadata; cannot sync')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
      subscription_current_period_end: getPeriodEndIso(sub),
    })
    .eq('id', userId)

  if (error) {
    console.error('[v0] Error syncing subscription for user', userId, error)
  } else {
    console.log(`[v0] Synced subscription ${sub.id} (${sub.status}) for user ${userId}`)
  }
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[v0] Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Subscription lifecycle: created/updated/deleted keep the profile's unlimited
  // access in sync (activation, renewal, plan change, cancellation, lapse).
  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const sub = event.data.object as Stripe.Subscription
    const supabase = createAdminClient()
    await syncSubscription(supabase, sub)
    return NextResponse.json({ received: true })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Subscription checkouts are fulfilled by the customer.subscription.* events
    // above (which carry status + period end). Nothing to do here.
    if (session.mode === 'subscription') {
      return NextResponse.json({ received: true })
    }

    // Get the pack info from metadata. These keys MUST match what
    // app/actions/stripe.ts writes when creating the checkout session.
    const packId = session.metadata?.pack_id
    const userId = session.metadata?.user_id

    if (!packId || !userId) {
      console.error('[v0] Missing pack_id or user_id in session metadata')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const pack = TOKEN_PACKS.find(p => p.id === packId)
    if (!pack) {
      console.error('[v0] Invalid pack ID:', packId)
      return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })
    }

    // Service-role client: the webhook has no user session, and RLS would
    // otherwise reject these writes. Authenticity is guaranteed by the
    // signature check above.
    const supabase = createAdminClient()

    // Idempotency: Stripe may deliver the same event more than once. If we've
    // already recorded this checkout session, acknowledge and stop so tokens
    // are never credited twice.
    const { data: existingPurchase } = await supabase
      .from('token_purchases')
      .select('id')
      .eq('stripe_checkout_session_id', session.id)
      .maybeSingle()

    if (existingPurchase) {
      console.log(`[v0] Checkout session ${session.id} already processed; skipping`)
      return NextResponse.json({ received: true, alreadyProcessed: true })
    }

    // Record the purchase
    const { error: purchaseError } = await supabase
      .from('token_purchases')
      .insert({
        user_id: userId,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        pack_name: pack.name,
        tokens_added: pack.tokens,
        purchase_amount: pack.priceInCents,
        currency: 'usd',
        status: 'completed',
      })

    if (purchaseError) {
      console.error('[v0] Error recording purchase:', purchaseError)
      // Abort before fulfilling: without the purchase row the idempotency guard
      // can't protect against a retry double-credit.
      return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 })
    }

    if (pack.unlimited) {
      // Lifetime unlimited pack (Founders/Noble): grant permanent access via a
      // flag rather than crediting a token balance. The Founders tier also grants
      // the cosmetic founding-member badge.
      const grant: { lifetime_unlimited: true; is_founder?: true } = { lifetime_unlimited: true }
      if (pack.founder) grant.is_founder = true

      const { error: grantError } = await supabase
        .from('profiles')
        .update(grant)
        .eq('id', userId)

      if (grantError) {
        console.error('[v0] Error granting lifetime unlimited:', grantError)
        return NextResponse.json({ error: 'Failed to grant unlimited' }, { status: 500 })
      }

      console.log(`[v0] Granted lifetime unlimited (${pack.name}) to user ${userId}`)
    } else {
      // Increment the user's token balance using the database function
      const { error: balanceError } = await supabase.rpc('increment_token_balance', {
        user_id: userId,
        amount: pack.tokens,
      })

      if (balanceError) {
        console.error('[v0] Error incrementing token balance:', balanceError)
        return NextResponse.json({ error: 'Failed to add tokens' }, { status: 500 })
      }

      console.log(`[v0] Successfully added ${pack.tokens} tokens for user ${userId}`)
    }

    // Referral rewards are no longer purchase-gated: they are granted at signup
    // by the `grant_referral_reward_on_signup` DB trigger (see
    // supabase/referral-reward-on-signup.sql), so nothing to do here.
  }

  return NextResponse.json({ received: true })
}

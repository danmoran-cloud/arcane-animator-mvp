'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { TOKEN_PACKS } from '@/lib/tokens'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    
    // Get the pack info from metadata
    const packId = session.metadata?.packId
    const userId = session.metadata?.userId
    
    if (!packId || !userId) {
      console.error('[v0] Missing packId or userId in session metadata')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const pack = TOKEN_PACKS.find(p => p.id === packId)
    if (!pack) {
      console.error('[v0] Invalid pack ID:', packId)
      return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })
    }

    const supabase = await createClient()

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
    }

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

    // Referral reward: only granted on the user's FIRST completed purchase.
    // Check whether this is the first paid purchase for the user.
    const { count: paidCount } = await supabase
      .from('token_purchases')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gt('purchase_amount', 0)

    if ((paidCount ?? 0) <= 1) {
      // Mark referral as purchased, then award reward to both parties (idempotent in SQL).
      const { error: markError } = await supabase.rpc('mark_referral_purchased', {
        p_referred_user_id: userId,
      })
      if (markError) {
        console.error('[v0] Error marking referral purchased:', markError)
      }

      const { error: rewardError } = await supabase.rpc('award_referral_reward', {
        p_referred_user_id: userId,
      })
      if (rewardError) {
        console.error('[v0] Error awarding referral reward:', rewardError)
      } else {
        console.log(`[v0] Referral reward processed for referred user ${userId}`)
      }
    }
  }

  return NextResponse.json({ received: true })
}

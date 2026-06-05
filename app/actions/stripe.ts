'use server'

import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { TOKEN_PACKS } from '@/lib/tokens'
import { createClient } from '@/lib/supabase/server'

export async function createTokenPurchaseCheckout(packId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to purchase tokens' }
  }

  const pack = TOKEN_PACKS.find(p => p.id === packId)
  if (!pack) {
    return { error: 'Invalid token pack' }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pack.name} - ${pack.tokens} Tokens`,
              description: `${pack.tokens} export tokens for Arcane Animator`,
            },
            unit_amount: pack.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        pack_id: pack.id,
        pack_name: pack.name,
        tokens: pack.tokens.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/tokens?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
    })

    return { clientSecret: session.client_secret, sessionId: session.id }
  } catch (error) {
    console.error('[v0] Stripe checkout error:', error)
    return { error: 'Failed to create checkout session' }
  }
}

export async function verifyTokenPurchase(sessionId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in' }
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== 'paid') {
      return { error: 'Payment not completed' }
    }

    if (session.metadata?.user_id !== user.id) {
      return { error: 'Session does not belong to this user' }
    }

    const tokens = parseInt(session.metadata?.tokens || '0', 10)
    const packName = session.metadata?.pack_name || 'Unknown'

    // Check if this session has already been processed
    const { data: existingPurchase } = await supabase
      .from('token_purchases')
      .select('id')
      .eq('stripe_checkout_session_id', sessionId)
      .single()

    if (existingPurchase) {
      return { success: true, tokens, alreadyProcessed: true }
    }

    // Record the purchase and update token balance
    const { error: purchaseError } = await supabase
      .from('token_purchases')
      .insert({
        user_id: user.id,
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id: session.payment_intent as string,
        pack_name: packName,
        tokens_added: tokens,
        purchase_amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        status: 'completed',
      })

    if (purchaseError) {
      console.error('[v0] Purchase record error:', purchaseError)
      return { error: 'Failed to record purchase' }
    }

    // Update user's token balance
    const { error: updateError } = await supabase.rpc('increment_token_balance', {
      user_id: user.id,
      amount: tokens,
    })

    if (updateError) {
      // Fallback: direct update
      const { data: profile } = await supabase
        .from('profiles')
        .select('token_balance')
        .eq('id', user.id)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({ token_balance: profile.token_balance + tokens })
          .eq('id', user.id)
      }
    }

    return { success: true, tokens }
  } catch (error) {
    console.error('[v0] Verify purchase error:', error)
    return { error: 'Failed to verify purchase' }
  }
}

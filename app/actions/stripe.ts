'use server'

import { stripe } from '@/lib/stripe'
import { TOKEN_PACKS } from '@/lib/tokens'
import { createClient } from '@/lib/supabase/server'

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

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
      // Fulfillment happens in the Stripe webhook (single source of truth).
      // These keys MUST match what app/api/webhooks/stripe/route.ts reads.
      metadata: {
        user_id: user.id,
        pack_id: pack.id,
        pack_name: pack.name,
        tokens: pack.tokens.toString(),
      },
      success_url: `${getAppUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppUrl()}/checkout/cancel`,
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

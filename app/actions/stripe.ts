'use server'

import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { TOKEN_PACKS, UNLIMITED_PACK_NAMES } from '@/lib/tokens'
import { createClient } from '@/lib/supabase/server'

// Whether the user has already bought an unlimited pack. Unlimited is a
// one-time purchase, so this gates both the checkout action and the pricing UI.
async function userOwnsUnlimited(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<boolean> {
  if (UNLIMITED_PACK_NAMES.length === 0) return false
  const { data } = await supabase
    .from('token_purchases')
    .select('id')
    .eq('user_id', userId)
    .in('pack_name', UNLIMITED_PACK_NAMES)
    .limit(1)
  return !!(data && data.length > 0)
}

// Read-only ownership check for the pricing page so it can show a "You own this"
// indicator and disable the buy button before the user reaches checkout.
export async function hasUnlimitedPack(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  return userOwnsUnlimited(supabase, user.id)
}

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
    return { error: 'You must be logged in to purchase tokens' }
  }

  const pack = TOKEN_PACKS.find(p => p.id === packId)
  if (!pack) {
    return { error: 'Invalid token pack' }
  }

  // Unlimited is a one-time purchase — block a second buy server-side so the
  // guard holds even if the client UI is stale or bypassed.
  if (pack.unlimited && (await userOwnsUnlimited(supabase, user.id))) {
    return { error: "You already own the Noble's Pack — unlimited exports are already active on your account." }
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

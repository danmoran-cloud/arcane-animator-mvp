import 'server-only'

import Stripe from 'stripe'

// Lazily instantiate the Stripe client on first use rather than at module load.
// This prevents builds/deploys from crashing when STRIPE_SECRET_KEY is not yet
// available during static page-data collection.
let stripeClient: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeClient = new Stripe(apiKey)
  }
  return stripeClient
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripe()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

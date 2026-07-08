// Export pricing model.
//
// Pricing is FLAT: every export costs exactly one token, regardless of
// resolution, duration, or frame rate. One token therefore equals one export —
// packs are sold as export bundles. The `tokens` field (and the underlying DB
// column) is retained as the internal unit; the UI presents it as "exports".
//
// Unlimited exports are sold separately as a monthly subscription, not a pack —
// see SUBSCRIPTION below and lib/subscription.ts.

export interface TokenPack {
  id: string
  name: string
  // Export credits granted. 0 for unlimited (lifetime) packs, which grant access
  // via a flag rather than a balance.
  tokens: number
  priceInCents: number
  popular?: boolean
  savings?: string
  // One-time packs that grant permanent ("lifetime") unlimited exports.
  unlimited?: boolean
  // Grants "founding member" status (a cosmetic Founder badge) on purchase.
  founder?: boolean
  tagline?: string
  // ISO date (inclusive) after which this pack can no longer be purchased — used
  // for limited-time offers. Enforced server-side and hidden in the UI once past.
  availableUntil?: string
  // Small marketing badge shown on the card (e.g. the Founders deadline).
  badge?: string
}

export const TOKEN_PACKS: TokenPack[] = [
  {
    id: 'adventurer',
    name: "Adventurer's Pack",
    tokens: 10,
    priceInCents: 299, // $2.99
  },
  {
    id: 'hero',
    name: "Hero's Pack",
    tokens: 20,
    priceInCents: 499, // $4.99
    popular: true,
    savings: 'Best Value',
  },
  {
    id: 'founders',
    name: "Founder's Tier",
    tokens: 0,
    priceInCents: 6900, // $69 one-time
    unlimited: true,
    founder: true,
    tagline: 'Lifetime unlimited exports — founding member price.',
    availableUntil: '2026-09-30',
    badge: 'Founders — ends Sep 30, 2026',
  },
  {
    id: 'noble',
    name: "Noble's Pack",
    tokens: 0,
    priceInCents: 9900, // $99 one-time
    unlimited: true,
    tagline: 'Lifetime unlimited exports, yours forever.',
  },
]

// Whether a limited-time pack is still purchasable right now.
export function isPackAvailable(pack: TokenPack, now: Date = new Date()): boolean {
  if (!pack.availableUntil) return true
  // Available through the end of the availableUntil day (UTC).
  const deadline = new Date(`${pack.availableUntil}T23:59:59.999Z`)
  return now <= deadline
}

// The unlimited-exports subscription. Recurring monthly; the actual Stripe Price
// is created in the dashboard and referenced by STRIPE_SUBSCRIPTION_PRICE_ID.
export const SUBSCRIPTION = {
  id: 'archmage',
  name: "Archmage's Pact",
  priceInCents: 999, // $9.99 / month
  interval: 'month' as const,
  tagline: 'Unlimited exports, every month — create without limits.',
}

export type ExportResolution = 'sd' | 'hd'

// Retained for the free-daily-export eligibility rule (basic exports only).
export const HIGH_FRAME_RATE = 60

// Flat pricing: every export costs one token. Parameters are accepted (and
// ignored) so existing call sites keep working while the cost model is uniform.
export function calculateExportCost(
  _resolution?: ExportResolution,
  _durationSeconds?: number,
  _frameRate?: number,
): number {
  return 1
}

// One free export per day: SD only, 5 or 10 seconds, standard frame rate.
// HD, longer durations, and 60fps always cost tokens.
export function isFreeExportEligible(
  resolution: ExportResolution,
  durationSeconds: number,
  frameRate: number,
): boolean {
  return (
    resolution === 'sd' &&
    (durationSeconds === 5 || durationSeconds === 10) &&
    frameRate < HIGH_FRAME_RATE
  )
}

export function canAffordExport(
  tokenBalance: number,
  resolution: ExportResolution,
  durationSeconds: number,
  frameRate: number,
  hasFreeExportToday: boolean
): { canAfford: boolean; cost: number; reason?: string } {
  const cost = calculateExportCost(resolution, durationSeconds, frameRate)

  if (hasFreeExportToday && isFreeExportEligible(resolution, durationSeconds, frameRate)) {
    return { canAfford: true, cost: 0, reason: 'Using daily free export' }
  }

  if (tokenBalance >= cost) {
    return { canAfford: true, cost }
  }

  return {
    canAfford: false,
    cost,
    reason: `Need ${cost} tokens, you have ${tokenBalance}`,
  }
}

// Referral reward amount
export const REFERRAL_REWARD_TOKENS = 5

// Format price from cents to display string
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// Check if user can use daily free export
export function canUseFreeExport(lastFreeExportDate: Date | null): boolean {
  if (!lastFreeExportDate) return true
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const lastDate = new Date(lastFreeExportDate)
  lastDate.setHours(0, 0, 0, 0)
  
  return today > lastDate
}

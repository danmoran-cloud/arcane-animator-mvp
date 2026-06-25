// Token pricing and export cost system

export interface TokenPack {
  id: string
  name: string
  tokens: number
  priceInCents: number
  popular?: boolean
  savings?: string
  unlimited?: boolean
  tagline?: string
}

export const TOKEN_PACKS: TokenPack[] = [
  {
    id: 'adventurer',
    name: "Adventurer's Pack",
    tokens: 15,
    priceInCents: 299, // $2.99
  },
  {
    id: 'hero',
    name: "Hero's Pack",
    tokens: 60,
    priceInCents: 999, // $9.99
    popular: true,
    savings: 'Best Value',
  },
  {
    id: 'noble',
    name: "Noble's Pack",
    tokens: 9999999, // sentinel "unlimited" balance for fulfillment; UI shows "Unlimited"
    priceInCents: 1999, // $19.99
    unlimited: true,
    tagline: 'Boundless creation, forevermore — never purchase tokens again.',
  },
]

export type ExportResolution = 'sd' | 'hd'

// Token cost at the baseline of 5 seconds / 30fps. Every step up in duration
// adds a token, and 60fps adds one more (see calculateExportCost).
export const BASE_TOKEN_COST: Record<ExportResolution, number> = {
  sd: 1,
  hd: 2,
}

// Duration options in order. Each step up the ladder costs one extra token.
export const EXPORT_DURATIONS = [5, 10, 15, 30] as const

// Frame rate at or above which an extra token applies.
export const HIGH_FRAME_RATE = 60

export function calculateExportCost(
  resolution: ExportResolution,
  durationSeconds: number,
  frameRate: number,
): number {
  const base = BASE_TOKEN_COST[resolution] ?? BASE_TOKEN_COST.sd
  const stepIndex = EXPORT_DURATIONS.indexOf(durationSeconds as (typeof EXPORT_DURATIONS)[number])
  const durationCost = stepIndex > 0 ? stepIndex : 0
  const frameRateCost = frameRate >= HIGH_FRAME_RATE ? 1 : 0
  return base + durationCost + frameRateCost
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

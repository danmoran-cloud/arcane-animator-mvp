// Token pricing and export cost system

export interface TokenPack {
  id: string
  name: string
  tokens: number
  priceInCents: number
  popular?: boolean
  savings?: string
}

export const TOKEN_PACKS: TokenPack[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    tokens: 10,
    priceInCents: 499, // $4.99
  },
  {
    id: 'standard',
    name: 'Standard Pack',
    tokens: 25,
    priceInCents: 999, // $9.99
    popular: true,
    savings: 'Save 20%',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    tokens: 60,
    priceInCents: 1999, // $19.99
    savings: 'Save 33%',
  },
  {
    id: 'studio',
    name: 'Studio Pack',
    tokens: 150,
    priceInCents: 3999, // $39.99
    savings: 'Save 46%',
  },
]

export type ExportResolution = 'sd' | 'hd' | '4k'

export interface ExportCost {
  resolution: ExportResolution
  label: string
  baseTokenCost: number
  perSecondCost: number
  description: string
}

export const EXPORT_COSTS: Record<ExportResolution, ExportCost> = {
  sd: {
    resolution: 'sd',
    label: 'SD (720p)',
    baseTokenCost: 0,
    perSecondCost: 0,
    description: 'Free export at standard definition',
  },
  hd: {
    resolution: 'hd',
    label: 'HD (1080p)',
    baseTokenCost: 1,
    perSecondCost: 0.1, // 0.1 tokens per second
    description: '1 token base + 0.1 per second',
  },
  '4k': {
    resolution: '4k',
    label: '4K (2160p)',
    baseTokenCost: 3,
    perSecondCost: 0.25, // 0.25 tokens per second
    description: '3 tokens base + 0.25 per second',
  },
}

export function calculateExportCost(resolution: ExportResolution, durationSeconds: number): number {
  const cost = EXPORT_COSTS[resolution]
  if (!cost) return 0
  
  const baseCost = cost.baseTokenCost
  const durationCost = Math.ceil(cost.perSecondCost * durationSeconds)
  
  return baseCost + durationCost
}

export function canAffordExport(
  tokenBalance: number,
  resolution: ExportResolution,
  durationSeconds: number,
  hasFreeExportToday: boolean
): { canAfford: boolean; cost: number; reason?: string } {
  // SD is always free
  if (resolution === 'sd') {
    return { canAfford: true, cost: 0 }
  }
  
  const cost = calculateExportCost(resolution, durationSeconds)
  
  // Check if user has daily free export available
  if (hasFreeExportToday && cost <= 5) {
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

// Check if user can use daily free export
export function canUseFreeExport(lastFreeExportDate: Date | null): boolean {
  if (!lastFreeExportDate) return true
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const lastDate = new Date(lastFreeExportDate)
  lastDate.setHours(0, 0, 0, 0)
  
  return today > lastDate
}

export const SITE_CONFIG = {
  name: 'Arcane Animator',
  // Hashtags used in social share messages
  hashtags: ['DnD', 'TTRPG', 'VTT', 'DungeonMaster'],
}

// Resolve the public site URL for building referral/share links.
// Falls back to the current origin in the browser.
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'https://arcane-animator.app'
}

// Build a signup referral link from a referral code.
export function buildReferralLink(referralCode: string | null): string {
  const base = getSiteUrl()
  if (!referralCode) return `${base}/auth/sign-up`
  return `${base}/auth/sign-up?ref=${encodeURIComponent(referralCode)}`
}

// The default share message body (referral link is appended separately by share targets).
export function buildShareMessage(): string {
  return `I just animated a battle map using ${SITE_CONFIG.name}.\n\nCreate animated VTT maps for your next campaign.\n\n${SITE_CONFIG.hashtags.map((h) => `#${h}`).join(' ')}`
}

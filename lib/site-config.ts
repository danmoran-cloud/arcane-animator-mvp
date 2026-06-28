export const SITE_CONFIG = {
  name: 'Arcane Animator',
  // Hashtags used in social share messages
  hashtags: ['DnD', 'TTRPG', 'VTT', 'DungeonMaster'],
  // Community Discord server invite.
  discordUrl: 'https://discord.gg/B5srNHhPk',
}

// Legal entity details surfaced across the legal pages, footer, and copyright
// notices. Centralized so the company name / contact only ever live in one place.
export const LEGAL = {
  /** Registered legal entity that owns and operates the service. */
  company: 'Arcane Animator LLC',
  /** Short trading name used in body copy. */
  serviceName: 'Arcane Animator',
  /** Single contact mailbox for legal, privacy, and DMCA correspondence. */
  contactEmail: 'support@arcaneanimator.com',
  /** US state whose law governs the agreements (and venue for disputes). */
  governingLawState: 'Louisiana',
  /** Date the current versions of the legal documents take effect. */
  effectiveDate: 'June 27, 2026',
  /** Year used in the © copyright line. */
  copyrightYear: 2026,
} as const

/** Convenience: the "© 2026 Arcane Animator LLC" style line. */
export function copyrightLine(): string {
  return `© ${LEGAL.copyrightYear} ${LEGAL.company}. All rights reserved.`
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

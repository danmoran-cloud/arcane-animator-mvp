// Cookie consent storage + types.
//
// We distinguish two categories of cookies/storage:
//   - "essential": strictly necessary for the service to work (e.g. Supabase
//     auth session, this consent record itself). Always on, cannot be rejected.
//   - "analytics": optional product analytics (Vercel Web Analytics). Off until
//     the visitor opts in.
//
// The visitor's choice is persisted in localStorage AND mirrored to a cookie so
// it survives across sessions and could be read server-side if ever needed.

export const CONSENT_STORAGE_KEY = 'aa-cookie-consent'
export const CONSENT_COOKIE_NAME = 'aa_cookie_consent'
/** Bump when the cookie categories change so visitors are re-prompted. */
export const CONSENT_VERSION = 1
/** Event used to (re)open the banner from a "Cookie settings" link. */
export const OPEN_CONSENT_EVENT = 'aa:open-cookie-settings'

export interface ConsentState {
  /** Always true; included for clarity and forward-compatibility. */
  essential: true
  /** Optional product analytics. */
  analytics: boolean
}

export interface StoredConsent extends ConsentState {
  version: number
  /** ISO timestamp of when the choice was recorded. */
  updatedAt: string
}

export const ACCEPT_ALL: ConsentState = { essential: true, analytics: true }
export const ESSENTIAL_ONLY: ConsentState = { essential: true, analytics: false }

/** Read the stored consent, or null if the visitor has not chosen yet. */
export function readConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredConsent
    // Treat an outdated record as "not chosen" so we re-prompt.
    if (parsed.version !== CONSENT_VERSION) return null
    return { ...parsed, essential: true }
  } catch {
    return null
  }
}

/** Persist the visitor's choice to localStorage and a year-long cookie. */
export function writeConsent(state: ConsentState): StoredConsent {
  const record: StoredConsent = {
    ...state,
    essential: true,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record))
    } catch {
      // Storage may be unavailable (private mode); cookie still applies.
    }
    const value = encodeURIComponent(JSON.stringify({ v: record.version, a: record.analytics }))
    const maxAge = 60 * 60 * 24 * 365 // 1 year
    document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
  }
  return record
}

'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'
import { Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ACCEPT_ALL,
  ESSENTIAL_ONLY,
  OPEN_CONSENT_EVENT,
  type ConsentState,
  readConsent,
  writeConsent,
} from '@/lib/cookie-consent'

interface ConsentContextValue {
  /** Current consent, or null until the visitor has chosen / hydration done. */
  consent: ConsentState | null
  acceptAll: () => void
  rejectNonEssential: () => void
  /** Reopen the banner (e.g. from a "Cookie settings" footer link). */
  openSettings: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

/** Read the current consent anywhere in the tree. */
export function useCookieConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) {
    throw new Error('useCookieConsent must be used within <CookieConsentProvider>')
  }
  return ctx
}

/** Imperatively reopen the consent banner from anywhere (no context needed). */
export function openCookieSettings() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))
  }
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // On mount, load any stored choice. Show the banner only if none exists.
  useEffect(() => {
    const stored = readConsent()
    if (stored) {
      setConsent({ essential: true, analytics: stored.analytics })
    } else {
      setBannerOpen(true)
    }
    setHydrated(true)

    const reopen = () => setBannerOpen(true)
    window.addEventListener(OPEN_CONSENT_EVENT, reopen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen)
  }, [])

  const choose = useCallback((state: ConsentState) => {
    writeConsent(state)
    setConsent(state)
    setBannerOpen(false)
  }, [])

  const acceptAll = useCallback(() => choose(ACCEPT_ALL), [choose])
  const rejectNonEssential = useCallback(() => choose(ESSENTIAL_ONLY), [choose])
  const openSettings = useCallback(() => setBannerOpen(true), [])

  const analyticsEnabled =
    hydrated && consent?.analytics === true && process.env.NODE_ENV === 'production'

  return (
    <ConsentContext.Provider value={{ consent, acceptAll, rejectNonEssential, openSettings }}>
      {children}
      {analyticsEnabled && <Analytics />}
      {hydrated && bannerOpen && (
        <ConsentBanner onAcceptAll={acceptAll} onReject={rejectNonEssential} />
      )}
    </ConsentContext.Provider>
  )
}

function ConsentBanner({
  onAcceptAll,
  onReject,
}: {
  onAcceptAll: () => void
  onReject: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6"
    >
      <div className="mx-auto max-w-3xl rounded-xl border-2 border-border bg-card/95 p-4 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 hidden shrink-0 rounded-full bg-primary/10 p-2 text-primary sm:block">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            <p className="mb-1 font-serif text-base font-semibold text-foreground">
              We value your privacy
            </p>
            <p>
              We use cookies that are strictly necessary to run Arcane Animator
              (such as keeping you signed in). With your consent, we also use
              optional analytics cookies to understand how the app is used and
              improve it. You can change your choice anytime via{' '}
              <span className="text-foreground">Cookie settings</span> in the
              footer. Read our{' '}
              <Link href="/legal/cookies" className="text-primary underline underline-offset-2">
                Cookie Policy
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-primary underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            className="sm:min-w-40"
          >
            Reject non-essential
          </Button>
          <Button
            size="sm"
            onClick={onAcceptAll}
            className="bg-primary text-primary-foreground sm:min-w-40"
          >
            Accept all cookies
          </Button>
        </div>
      </div>
    </div>
  )
}

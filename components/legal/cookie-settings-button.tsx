'use client'

import { openCookieSettings } from '@/components/cookie-consent'

// Inline button that reopens the cookie consent banner. Lets server-rendered
// legal pages offer a "change your choice" control.
export function CookieSettingsButton({ label = 'Open cookie settings' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="inline-flex items-center rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
    >
      {label}
    </button>
  )
}

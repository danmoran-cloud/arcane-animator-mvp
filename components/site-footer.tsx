'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LEGAL, copyrightLine } from '@/lib/site-config'
import { openCookieSettings } from '@/components/cookie-consent'
import { DiscordLink } from '@/components/discord-link'

const LEGAL_LINKS: { href: string; label: string }[] = [
  { href: '/legal/terms', label: 'Terms of Service' },
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/cookies', label: 'Cookie Policy' },
  { href: '/legal/copyright', label: 'Copyright' },
  { href: '/legal/dmca', label: 'DMCA Policy' },
  { href: '/legal/commercial-license', label: 'Commercial License' },
]

// Site-wide footer with copyright line and legal navigation. Used on the
// content pages (pricing, account, legal, auth). The full-screen editor links
// to legal pages from the user menu instead.
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        'border-t border-border bg-card/30 text-sm text-muted-foreground',
        className,
      )}
    >
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={openCookieSettings}
            className="transition-colors hover:text-foreground"
          >
            Cookie settings
          </button>
        </nav>
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-center text-xs">
            {copyrightLine()}{' '}
            <span className="text-muted-foreground/70">
              {LEGAL.serviceName} is a product of {LEGAL.company}.
            </span>
          </p>
          <DiscordLink variant="text" label="Join our Discord" />
        </div>
      </div>
    </footer>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LEGAL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Legal Center — Arcane Animator',
  description: 'Terms, privacy, copyright, and licensing documents for Arcane Animator.',
}

const DOCS: { href: string; title: string; description: string; badge?: string }[] = [
  {
    href: '/legal/terms',
    title: 'Terms of Service',
    description: 'The agreement that governs your use of Arcane Animator.',
  },
  {
    href: '/legal/privacy',
    title: 'Privacy Policy',
    description: 'What personal data we collect, how we use it, and your rights.',
  },
  {
    href: '/legal/cookies',
    title: 'Cookie Policy',
    description: 'The cookies and similar technologies we use, and your choices.',
  },
  {
    href: '/legal/copyright',
    title: 'Copyright Information',
    description: 'Ownership of the platform, your content, and our marks.',
  },
  {
    href: '/legal/dmca',
    title: 'DMCA & Copyright Policy',
    description: 'How to report infringement and our takedown process.',
  },
  {
    href: '/legal/commercial-license',
    title: 'Commercial License Agreement',
    description: 'How exported maps and videos may be used commercially.',
  },
  {
    href: '/legal/creator-marketplace',
    title: 'Creator Asset License & Marketplace Agreement',
    description: 'Terms for a future creator marketplace.',
    badge: 'Not yet in effect',
  },
]

export default function LegalIndexPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-wide text-foreground">
        Legal Center
      </h1>
      <p className="mt-2 text-muted-foreground text-pretty">
        The agreements and policies that govern {LEGAL.serviceName}, operated by{' '}
        {LEGAL.company}. Current versions are effective {LEGAL.effectiveDate}.
      </p>

      <div className="mt-8 grid gap-3">
        {DOCS.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:border-primary/50 hover:bg-card/70"
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-medium text-foreground">{doc.title}</h2>
                {doc.badge && (
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
                    {doc.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  )
}

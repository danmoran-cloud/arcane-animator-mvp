import Link from 'next/link'
import { LEGAL } from '@/lib/site-config'

interface LegalPageProps {
  title: string
  /** Optional short subtitle / standfirst shown under the title. */
  subtitle?: string
  /** Effective date string; defaults to the configured effective date. */
  effectiveDate?: string
  /** Optional callout banner (e.g. "not yet in effect"). */
  notice?: React.ReactNode
  children: React.ReactNode
}

// Consistent header + prose wrapper for every legal document.
export function LegalPage({
  title,
  subtitle,
  effectiveDate = LEGAL.effectiveDate,
  notice,
  children,
}: LegalPageProps) {
  return (
    <article>
      <Link
        href="/legal"
        className="text-xs uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
      >
        Legal Center
      </Link>
      <h1 className="mt-3 font-serif text-3xl font-bold tracking-wide text-foreground text-balance">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-base text-muted-foreground text-pretty">{subtitle}</p>
      )}
      <p className="mt-3 text-sm text-muted-foreground">
        Effective date: <span className="text-foreground">{effectiveDate}</span>
      </p>

      {notice && (
        <div className="mt-6 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm text-foreground">
          {notice}
        </div>
      )}

      <hr className="my-8 border-border" />

      <div className="legal-prose">{children}</div>

      <hr className="my-10 border-border" />
      <p className="text-sm text-muted-foreground">
        Questions about this document? Contact us at{' '}
        <a href={`mailto:${LEGAL.contactEmail}`} className="text-primary underline underline-offset-2">
          {LEGAL.contactEmail}
        </a>
        .
      </p>
    </article>
  )
}

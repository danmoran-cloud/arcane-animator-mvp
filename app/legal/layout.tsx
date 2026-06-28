import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/logo'
import { SiteFooter } from '@/components/site-footer'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <Logo size={32} href="/" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </Link>
        </div>
      </header>

      <main className="container mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        {children}
      </main>

      <SiteFooter />
    </div>
  )
}

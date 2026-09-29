'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SUBSCRIPTION, TOKEN_PACKS, formatPrice } from '@/lib/tokens'
import {
  createSubscriptionCheckout,
  createTokenPurchaseCheckout,
  getSubscriptionStatus,
} from '@/app/actions/stripe'
import { Sparkles, Crown, Check } from 'lucide-react'

// sessionStorage flag so the splash shows at most ONCE per login session. It is
// cleared on sign-out (see components/editor/user-menu.tsx) so a fresh login shows
// it again. sessionStorage also clears when the tab/session ends. Paying users
// (Hero subscription or Noble lifetime) never see it regardless of this flag.
export const SPLASH_SEEN_KEY = 'aa-splash-seen'

const NOBLE = TOKEN_PACKS.find((p) => p.unlimited)

// A welcome + upgrade splash shown once per login session to signed-in free users.
// Rendered on the editor page (where every login lands); it self-gates and renders
// nothing until it decides to open.
export function LoginSplash() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      // Already shown this session — don't reopen on navigation/refresh.
      try {
        if (sessionStorage.getItem(SPLASH_SEEN_KEY)) return
      } catch {
        // sessionStorage unavailable (private mode) — fall through and show once.
      }

      // Paying users never see the upgrade splash.
      const info = await getSubscriptionStatus().catch(() => null)
      if (cancelled || info?.unlimited) return

      setOpen(true)
      try {
        sessionStorage.setItem(SPLASH_SEEN_KEY, '1')
      } catch {
        // Non-fatal: worst case it may reappear on a later navigation this session.
      }
    })()

    return () => { cancelled = true }
  }, [])

  const runCheckout = async (key: string, action: () => Promise<{ url?: string; error?: string }>) => {
    setLoading(key)
    try {
      const result = await action()
      if (result.url) {
        router.push(result.url)
      } else if (result.error) {
        toast.error(result.error)
        setLoading(null)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Welcome to Arcane Animator
          </DialogTitle>
          <DialogDescription className="text-pretty">
            Bring your battle maps to life. Go unlimited and export as many animated maps as you
            want — subscribe monthly, or pay once and own it forever.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Hero — monthly */}
          <div className="rounded-lg border border-border p-4 flex flex-col">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">{SUBSCRIPTION.name}</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{formatPrice(SUBSCRIPTION.priceInCents)}</span>
              <span className="text-muted-foreground text-sm">/mo</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" /> Unlimited exports · cancel anytime
            </p>
            <Button
              className="mt-3 w-full"
              size="sm"
              onClick={() => runCheckout(SUBSCRIPTION.id, createSubscriptionCheckout)}
              disabled={loading !== null}
            >
              {loading === SUBSCRIPTION.id ? 'Loading...' : `Subscribe · ${formatPrice(SUBSCRIPTION.priceInCents)}/mo`}
            </Button>
          </div>

          {/* Noble — lifetime */}
          {NOBLE && (
            <div className="rounded-lg border border-primary shadow-sm p-4 flex flex-col">
              <div className="flex items-center gap-2 text-primary">
                <Crown className="w-4 h-4" />
                <span className="font-semibold">{NOBLE.name}</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{formatPrice(NOBLE.priceInCents)}</span>
                <span className="text-muted-foreground text-sm"> once</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" /> Unlimited exports · yours forever
              </p>
              <Button
                className="mt-3 w-full"
                size="sm"
                onClick={() => runCheckout(NOBLE.id, () => createTokenPurchaseCheckout(NOBLE.id))}
                disabled={loading !== null}
              >
                {loading === NOBLE.id ? 'Loading...' : `Buy · ${formatPrice(NOBLE.priceInCents)}`}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={loading !== null}>
            Maybe later — continue to the editor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

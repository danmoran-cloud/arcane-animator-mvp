'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TOKEN_PACKS, SUBSCRIPTION, SIGNUP_BONUS_TOKENS, formatPrice } from '@/lib/tokens'
import {
  createTokenPurchaseCheckout,
  createSubscriptionCheckout,
  createBillingPortalSession,
  getSubscriptionStatus,
  type SubscriptionInfo,
} from '@/app/actions/stripe'
import { Sparkles, Crown, ArrowLeft, Check, Gift, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { DiscordLink } from '@/components/discord-link'
import { SiteFooter } from '@/components/site-footer'

// Result shape shared by the checkout server actions.
type ActionResult = { url?: string; error?: string; requiresAuth?: boolean }

// The single lifetime pass (Noble). Defined in TOKEN_PACKS so the webhook and
// checkout action can resolve it by id.
const NOBLE = TOKEN_PACKS.find((p) => p.unlimited)

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  // The signed-in user's unlimited-access state. Undefined until resolved.
  const [status, setStatus] = useState<SubscriptionInfo | undefined>(undefined)

  useEffect(() => {
    let active = true
    getSubscriptionStatus()
      .then((info) => { if (active) setStatus(info) })
      .catch(() => { if (active) setStatus(undefined) })
    return () => { active = false }
  }, [])

  const unlimited = status?.unlimited === true
  const subscriptionActive = status?.active === true
  const lifetimeOwned = status?.lifetimeUnlimited === true
  const resolving = status === undefined

  // Branded error surfacing: a sign-in prompt gets an inline "Sign In" action;
  // everything else is a plain error toast.
  const reportError = (result: ActionResult) => {
    if (!result.error) return
    if (result.requiresAuth) {
      toast.error(result.error, {
        action: { label: 'Sign In', onClick: () => router.push('/auth/login') },
      })
    } else {
      toast.error(result.error)
    }
  }

  const runCheckout = async (key: string, action: () => Promise<ActionResult>) => {
    setLoading(key)
    try {
      const result = await action()
      if (result.url) {
        router.push(result.url)
      } else {
        reportError(result)
      }
    } catch (error) {
      console.error('[v0] Checkout error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleSubscribe = () =>
    runCheckout(SUBSCRIPTION.id, () =>
      subscriptionActive ? createBillingPortalSession() : createSubscriptionCheckout(),
    )
  const handleBuyNoble = () =>
    NOBLE && runCheckout(NOBLE.id, () => createTokenPurchaseCheckout(NOBLE.id))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container max-w-5xl mx-auto flex-1 px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size={44} withTagline href="/" />
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-wide mb-4 text-balance">Go Unlimited</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Export as many animated maps as you want — subscribe monthly, or pay once and own it
            forever. Both tiers unlock unlimited high-quality WebM exports.
          </p>
        </div>

        {/* New-user offer: prominent free-exports CTA. Hidden once a user already
            has unlimited access (they don't need the pitch). */}
        {!unlimited && (
          <div className="mb-12 max-w-3xl mx-auto rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-primary/5 p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Gift className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">New here?</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-balance">
              Get {SIGNUP_BONUS_TOKENS} free exports when you sign up
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              No credit card required. Create an account and start rendering your animated maps to
              video in seconds — plus a free export every day.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/auth/sign-up">
                  <Gift className="w-4 h-4 mr-2" />
                  Claim {SIGNUP_BONUS_TOKENS} free exports
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Try the editor
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Two tiers: Hero (monthly) and Noble (lifetime) */}
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto items-stretch">
          {/* Hero — monthly subscription */}
          <Card className={`relative flex flex-col ${subscriptionActive ? 'border-green-600' : ''}`}>
            {subscriptionActive && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 hover:bg-green-600">
                <Check className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 p-3 rounded-full bg-muted text-primary">
                <Sparkles className="w-8 h-8" />
              </div>
              <CardTitle className="text-xl">{SUBSCRIPTION.name}</CardTitle>
              <CardDescription>Monthly subscription</CardDescription>
            </CardHeader>
            <CardContent className="text-center flex-1">
              <div className="mb-4">
                <span className="text-4xl font-bold">{formatPrice(SUBSCRIPTION.priceInCents)}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-semibold text-primary">Unlimited</span>
                <span className="text-muted-foreground ml-1">exports</span>
              </div>
              <div className="space-y-2 text-sm text-left">
                {['Unlimited SD & HD exports', 'Unlimited saved projects', 'Cancel anytime'].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                variant={subscriptionActive ? 'outline' : 'default'}
                onClick={handleSubscribe}
                disabled={loading !== null || resolving || (unlimited && !subscriptionActive)}
              >
                {loading === SUBSCRIPTION.id
                  ? 'Loading...'
                  : subscriptionActive
                    ? 'Manage Subscription'
                    : lifetimeOwned
                      ? 'Already Unlimited'
                      : `Subscribe · ${formatPrice(SUBSCRIPTION.priceInCents)}/mo`}
              </Button>
            </CardFooter>
          </Card>

          {/* Noble — one-time lifetime */}
          {NOBLE && (
            <Card className={`relative flex flex-col ${lifetimeOwned ? 'border-green-600' : 'border-primary shadow-lg'}`}>
              {lifetimeOwned ? (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 hover:bg-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  You own this
                </Badge>
              ) : (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Best Value
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary">
                  <Crown className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">{NOBLE.name}</CardTitle>
                <CardDescription>One-time · lifetime</CardDescription>
              </CardHeader>
              <CardContent className="text-center flex-1">
                <div className="mb-4">
                  <span className="text-4xl font-bold">{formatPrice(NOBLE.priceInCents)}</span>
                  <span className="text-muted-foreground ml-1">once</span>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-semibold text-primary">Unlimited</span>
                  <span className="text-muted-foreground ml-1">forever</span>
                </div>
                <div className="space-y-2 text-sm text-left">
                  {['Unlimited SD & HD exports, forever', 'Unlimited saved projects', 'Pay once — never again'].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBuyNoble}
                  disabled={loading !== null || resolving || unlimited}
                >
                  {unlimited
                    ? 'Already Owned'
                    : loading === NOBLE.id
                      ? 'Loading...'
                      : `Buy ${NOBLE.name} · ${formatPrice(NOBLE.priceInCents)}`}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Start Free</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {SIGNUP_BONUS_TOKENS} free exports on signup, plus 1 free SD export every day (5–10s, 30fps)
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Go Unlimited</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Subscribe with Hero, or buy the Noble lifetime pass and never think about limits again
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Yours to Keep</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Every export is a standard WebM that drops straight into Foundry, Roll20, and D&amp;D Beyond
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Secure payment powered by Stripe.</p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">Questions, or want to see what other DMs are making?</p>
          <DiscordLink variant="button" label="Join our Discord community" />
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

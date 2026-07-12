'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TOKEN_PACKS, SUBSCRIPTION, SIGNUP_BONUS_TOKENS, formatPrice, isPackAvailable } from '@/lib/tokens'
import {
  createTokenPurchaseCheckout,
  createSubscriptionCheckout,
  createBillingPortalSession,
  getSubscriptionStatus,
  type SubscriptionInfo,
} from '@/app/actions/stripe'
import { Sparkles, Zap, Crown, Gem, Infinity as InfinityIcon, ArrowLeft, Check, Clock, Gift, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { DiscordLink } from '@/components/discord-link'
import { SiteFooter } from '@/components/site-footer'

const packIcons: Record<string, React.ReactNode> = {
  adventurer: <Zap className="w-8 h-8" />,
  hero: <Sparkles className="w-8 h-8" />,
  founders: <Gem className="w-8 h-8" />,
  noble: <Crown className="w-8 h-8" />,
}

// Result shape shared by the checkout server actions.
type ActionResult = { url?: string; error?: string; requiresAuth?: boolean }

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
  const resolving = status === undefined

  // Branded error surfacing: a sign-in prompt gets an inline "Sign In" action;
  // everything else is a plain error toast (replaces the old native alert()).
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

  const handlePurchase = (packId: string) => runCheckout(packId, () => createTokenPurchaseCheckout(packId))
  const handleSubscribe = () =>
    runCheckout(SUBSCRIPTION.id, () =>
      subscriptionActive ? createBillingPortalSession() : createSubscriptionCheckout(),
    )

  const exportPacks = TOKEN_PACKS.filter((p) => !p.unlimited)
  // While the Founders offer is live, show only it among the lifetime tiers —
  // Noble (identical access, higher price) is hidden until Founders ends. After
  // the deadline, limited-time packs drop out and Noble takes over.
  const foundersAvailable = TOKEN_PACKS.some((p) => p.founder && isPackAvailable(p))
  const lifetimePacks = TOKEN_PACKS.filter(
    (p) => p.unlimited && isPackAvailable(p) && (p.founder || !foundersAvailable),
  )
  const unlimitedCount = 1 + lifetimePacks.length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container max-w-6xl mx-auto flex-1 px-4 py-12">
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
          <h1 className="text-4xl font-serif font-bold tracking-wide mb-4 text-balance">Get Exports</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Buy a pack of exports, or go unlimited — render your animated maps as high-quality WebM
            videos for use in your favorite VTT.
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
              video in seconds.
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

        {/* Export packs */}
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {exportPacks.map((pack) => (
            <Card
              key={pack.id}
              className={`relative flex flex-col ${pack.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {pack.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto mb-4 p-3 rounded-full ${pack.popular ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                  {packIcons[pack.id]}
                </div>
                <CardTitle className="text-xl">{pack.name}</CardTitle>
                {pack.savings && <CardDescription>{pack.savings}</CardDescription>}
              </CardHeader>
              <CardContent className="text-center flex-1">
                <div className="mb-4">
                  <span className="text-4xl font-bold">{formatPrice(pack.priceInCents)}</span>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-semibold text-primary">{pack.tokens}</span>
                  <span className="text-muted-foreground ml-1">exports</span>
                </div>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{pack.tokens} exports in any resolution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>SD or HD, up to 30s, 60fps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Exports never expire</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  variant={pack.popular ? 'default' : 'outline'}
                  onClick={() => handlePurchase(pack.id)}
                  disabled={loading !== null}
                >
                  {loading === pack.id ? 'Loading...' : `Buy ${pack.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Unlimited: monthly subscription + lifetime passes */}
        <div className="mt-16 text-center mb-6">
          <h2 className="text-2xl font-serif font-bold tracking-wide">Go Unlimited</h2>
          <p className="text-muted-foreground mt-2">Export as much as you want — subscribe monthly, or buy once and own it forever.</p>
        </div>

        <div className={`grid gap-6 ${unlimitedCount >= 3 ? 'md:grid-cols-3 max-w-5xl' : 'md:grid-cols-2 max-w-3xl'} mx-auto items-stretch`}>
          {/* Monthly subscription */}
          <Card className={`relative flex flex-col ${subscriptionActive ? 'border-green-600' : ''}`}>
            {subscriptionActive && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 hover:bg-green-600">
                <Check className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 p-3 rounded-full bg-muted text-primary">
                <InfinityIcon className="w-8 h-8" />
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
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited SD &amp; HD exports</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited saved projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
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
                    : unlimited
                      ? 'Already Unlimited'
                      : `Subscribe · ${formatPrice(SUBSCRIPTION.priceInCents)}/mo`}
              </Button>
            </CardFooter>
          </Card>

          {/* Lifetime passes (Founders, Noble) */}
          {lifetimePacks.map((pack) => {
            const owned = unlimited
            const featured = pack.id === 'founders'
            return (
              <Card
                key={pack.id}
                className={`relative flex flex-col ${owned ? 'border-green-600' : featured ? 'border-primary shadow-lg' : ''}`}
              >
                {owned ? (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 hover:bg-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    You own this
                  </Badge>
                ) : featured && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Best Deal
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto mb-4 p-3 rounded-full ${featured ? 'bg-primary/10 text-primary' : 'bg-muted text-primary'}`}>
                    {packIcons[pack.id]}
                  </div>
                  <CardTitle className="text-xl">{pack.name}</CardTitle>
                  <CardDescription>One-time · lifetime</CardDescription>
                </CardHeader>
                <CardContent className="text-center flex-1">
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{formatPrice(pack.priceInCents)}</span>
                    <span className="text-muted-foreground ml-1">once</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-semibold text-primary">Unlimited</span>
                    <span className="text-muted-foreground ml-1">forever</span>
                  </div>
                  {pack.tagline && (
                    <p className="mb-4 text-sm italic text-muted-foreground text-balance">
                      {pack.tagline}
                    </p>
                  )}
                  {pack.badge && !owned && (
                    <div className="mb-4 flex items-center justify-center gap-1.5 text-xs font-medium text-amber-500">
                      <Clock className="w-3.5 h-3.5" />
                      {pack.badge}
                    </div>
                  )}
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Unlimited SD &amp; HD exports, forever</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Unlimited saved projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Pay once — never again</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    variant={featured ? 'default' : 'outline'}
                    onClick={() => handlePurchase(pack.id)}
                    disabled={loading !== null || resolving || owned}
                  >
                    {owned
                      ? 'Already Owned'
                      : loading === pack.id
                        ? 'Loading...'
                        : `Buy ${pack.name}`}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">How Exports Work</h2>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">One Flat Rate</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Every export costs 1 credit — any resolution, duration, or frame rate
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Go Unlimited</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Subscribe monthly, or buy a lifetime pass and never think about credits again
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Free Daily Export</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                1 free SD export every 24 hours (5–10s, 30fps)
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Exports never expire. Secure payment powered by Stripe.</p>
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

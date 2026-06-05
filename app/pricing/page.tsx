'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TOKEN_PACKS, formatPrice } from '@/lib/tokens'
import { createCheckoutSession } from '@/app/actions/stripe'
import { Coins, Sparkles, Zap, Crown, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

const packIcons: Record<string, React.ReactNode> = {
  starter: <Coins className="w-8 h-8" />,
  popular: <Zap className="w-8 h-8" />,
  pro: <Sparkles className="w-8 h-8" />,
  studio: <Crown className="w-8 h-8" />,
}

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (packId: string) => {
    setLoading(packId)
    try {
      const result = await createCheckoutSession(packId)
      if (result.url) {
        router.push(result.url)
      } else if (result.error) {
        console.error('[v0] Checkout error:', result.error)
        alert(result.error)
      }
    } catch (error) {
      console.error('[v0] Purchase error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Get Export Tokens</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Purchase tokens to export your animated maps as high-quality WebM videos for use in your favorite VTT.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TOKEN_PACKS.map((pack) => (
            <Card 
              key={pack.id} 
              className={`relative flex flex-col ${pack.popular ? 'border-primary shadow-lg scale-105' : ''}`}
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
                <CardDescription>{pack.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center flex-1">
                <div className="mb-4">
                  <span className="text-4xl font-bold">{formatPrice(pack.priceInCents)}</span>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-semibold text-primary">{pack.tokens}</span>
                  <span className="text-muted-foreground ml-1">tokens</span>
                </div>
                {pack.bonus > 0 && (
                  <Badge variant="secondary" className="mb-4">
                    +{pack.bonus} bonus tokens!
                  </Badge>
                )}
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>~{Math.floor(pack.tokens / 1)} SD exports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>~{Math.floor(pack.tokens / 2)} HD exports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>~{Math.floor(pack.tokens / 3)} 4K exports</span>
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

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">How Tokens Work</h2>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Base Cost</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                SD: 1 token, HD: 2 tokens, 4K: 3 tokens per export
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Duration Cost</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                +1 token per 10 seconds of video duration
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Free Daily Export</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Get 1 free SD export every 24 hours!
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Tokens never expire. Secure payment powered by Stripe.</p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Gift, Sparkles } from 'lucide-react'
import { Logo } from '@/components/logo'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { SIGNUP_BONUS_TOKENS } from '@/lib/tokens'

function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
          `${window.location.origin}/auth/callback`,
        data: {
          display_name: displayName || email.split('@')[0],
          referral_code: referralCode || undefined,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/auth/sign-up-success')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size={56} showWordmark={false} href="/" />
          </div>
          <CardTitle className="text-2xl font-serif tracking-wide">Create Account</CardTitle>
          <CardDescription>Start creating animated battle maps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-0">
          {/* The headline offer: real exports, free, the moment you sign up. */}
          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 to-primary/5 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Welcome gift</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="mt-1.5 text-2xl font-serif font-bold text-foreground">
              {SIGNUP_BONUS_TOKENS} free exports
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Added to your account instantly — no card required. Render your maps to video today.
            </p>
          </div>
          {referralCode && (
            <div className="p-3 text-sm bg-primary/10 text-primary rounded-lg flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Referral applied! You&apos;ll earn 5 bonus exports after your first purchase.
            </div>
          )}
          <GoogleAuthButton label="Sign up with Google" referralCode={referralCode} />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
            </div>
          </div>
        </CardContent>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Account
            </Button>
            <p className="text-xs text-muted-foreground text-center text-balance">
              By creating an account, you agree to our{' '}
              <Link href="/legal/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  )
}

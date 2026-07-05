'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

interface GoogleAuthButtonProps {
  /** Label shown on the button, e.g. "Sign in" or "Sign up". */
  label?: string
  /** Referral code (from a `?ref=` link) to carry through the OAuth flow. */
  referralCode?: string | null
}

export function GoogleAuthButton({ label = 'Continue with Google', referralCode }: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const base =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
      `${window.location.origin}/auth/callback`
    // Preserve the referral code so the callback can record it — Google signups
    // can't set signup metadata the way the email path does.
    const redirectTo = referralCode
      ? `${base}${base.includes('?') ? '&' : '?'}ref=${encodeURIComponent(referralCode)}`
      : base

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    // On success the browser is redirected to Google, so we only land here on error.
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-2">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GoogleIcon />}
        <span className="ml-2">{label}</span>
      </Button>
    </div>
  )
}

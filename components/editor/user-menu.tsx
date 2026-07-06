'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, LogOut, Coins, Shield, CreditCard, Scale } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Profile {
  token_balance: number
  is_admin: boolean
  display_name: string | null
}

export function UserMenu() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('token_balance, is_admin, display_name')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('token_balance, is_admin, display_name')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
        <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
          <Link href="/auth/login">Sign In</Link>
        </Button>
        <Button asChild size="sm" className="h-8 text-xs bg-primary text-primary-foreground">
          <Link href="/auth/sign-up">Sign Up</Link>
        </Button>
      </div>
    )
  }

  // Prefer the profile display name, then the local-part of the email, then a
  // generic fallback — so a signed-in user always sees a name, not just an icon.
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Account'

  return (
    <div className="flex items-center gap-2">
      {/* Token display */}
      <Link 
        href="/pricing"
        className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
      >
        <Coins className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">{profile?.token_balance ?? 0}</span>
      </Link>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-1.5 hover:bg-primary/10">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium max-w-[120px] truncate hidden sm:inline">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card border-border">
          <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
            {user.email}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
            <Link href="/account">
              <Settings className="w-3.5 h-3.5" />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
            <Link href="/pricing">
              <CreditCard className="w-3.5 h-3.5" />
              Buy Tokens
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
            <Link href="/legal">
              <Scale className="w-3.5 h-3.5" />
              Legal
            </Link>
          </DropdownMenuItem>
          {profile?.is_admin && (
            <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
              <Link href="/admin">
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-xs cursor-pointer text-destructive">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, User, Loader2 } from 'lucide-react'
import { Logo } from '@/components/logo'

export function AuthModal() {
  const { state, login, signup, closeAuthModal, dispatch } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isLogin = state.authModalMode === 'login'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        if (!name.trim()) {
          setError('Please enter your name')
          setIsSubmitting(false)
          return
        }
        await signup(email, password, name)
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMode = () => {
    setError('')
    dispatch({ type: 'OPEN_AUTH_MODAL', mode: isLogin ? 'signup' : 'login' })
  }

  return (
    <Dialog open={state.isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Logo size={56} showWordmark={false} />
              <div className="absolute inset-0 blur-xl bg-accent/20 -z-10" />
            </div>
          </div>
          <DialogTitle className="font-serif text-2xl text-primary">
            {isLogin ? 'Welcome Back, Cartographer' : 'Join the Guild'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isLogin
              ? 'Sign in to continue your magical cartography journey'
              : 'Create an account to start crafting animated battle maps'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground/80">
                Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-muted/50 border-primary/30 focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/80">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="wizard@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-muted/50 border-primary/30 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground/80">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Your secret spell"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 bg-muted/50 border-primary/30 focus:border-primary"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? (
              <>
                {"Don't have an account? "}
                <span className="text-primary font-medium">Sign up</span>
              </>
            ) : (
              <>
                {'Already have an account? '}
                <span className="text-primary font-medium">Sign in</span>
              </>
            )}
          </button>
        </div>

        {/* Demo notice */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground text-center">
            This is a demo. Enter any email and password to create a mock account.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

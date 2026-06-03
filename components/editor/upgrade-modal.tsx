'use client'

import { useAuth, TIER_INFO, type UserTier } from '@/lib/auth-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { 
  Coins, 
  Check, 
  Crown, 
  Sparkles, 
  Zap,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function TokenDisplay() {
  const { state, openUpgradeModal } = useAuth()
  
  if (!state.user) return null

  const tierInfo = TIER_INFO[state.user.tier]
  const tokenPercentage = (state.user.tokens / tierInfo.monthlyTokens) * 100

  return (
    <button
      onClick={openUpgradeModal}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted/80 border border-border hover:border-primary/30 transition-all group"
    >
      <div className="relative">
        <Coins className="w-4 h-4 text-primary" />
        <div className="absolute inset-0 blur-sm bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-foreground">{state.user.tokens}</span>
        <span className="text-xs text-muted-foreground">tokens</span>
      </div>
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${tokenPercentage}%` }}
        />
      </div>
    </button>
  )
}

interface TierCardProps {
  tier: UserTier
  isCurrentTier: boolean
  onSelect: () => void
}

function TierCard({ tier, isCurrentTier, onSelect }: TierCardProps) {
  const info = TIER_INFO[tier]
  const isPopular = tier === 'apprentice'
  
  const TierIcon = tier === 'free' ? Sparkles : tier === 'apprentice' ? Zap : Crown

  return (
    <div
      className={cn(
        'relative rounded-xl border p-5 transition-all',
        isCurrentTier 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50 bg-card/50',
        isPopular && !isCurrentTier && 'ring-2 ring-primary/50'
      )}
    >
      {isPopular && !isCurrentTier && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
          Most Popular
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          tier === 'free' ? 'bg-muted' : tier === 'apprentice' ? 'bg-primary/20' : 'bg-amber-500/20'
        )}>
          <TierIcon className={cn(
            'w-4 h-4',
            tier === 'free' ? 'text-muted-foreground' : tier === 'apprentice' ? 'text-primary' : 'text-amber-500'
          )} />
        </div>
        <div>
          <h3 className="font-serif font-semibold text-foreground">{info.name}</h3>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          {info.price === 0 ? (
            <span className="text-2xl font-bold text-foreground">Free</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-foreground">${info.price}</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {info.monthlyTokens} tokens per month
        </p>
      </div>

      <ul className="space-y-2 mb-5">
        {info.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="text-foreground/80">{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentTier ? (
        <div className="w-full py-2 px-4 rounded-lg bg-muted text-center text-sm font-medium text-muted-foreground">
          Current Plan
        </div>
      ) : (
        <Button
          onClick={onSelect}
          className={cn(
            'w-full',
            tier === 'master' 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white' 
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          )}
        >
          {tier === 'free' ? 'Downgrade' : 'Upgrade'}
        </Button>
      )}
    </div>
  )
}

export function UpgradeModal() {
  const { state, closeUpgradeModal, upgradeTier } = useAuth()

  if (!state.user) return null

  return (
    <Dialog open={state.isUpgradeModalOpen} onOpenChange={(open) => !open && closeUpgradeModal()}>
      <DialogContent className="bg-card border-border sm:max-w-3xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    'w-5 h-5',
                    i === 1 ? 'text-primary' : 'text-primary/50'
                  )} 
                  fill="currentColor"
                />
              ))}
            </div>
          </div>
          <DialogTitle className="font-serif text-2xl text-primary">
            Choose Your Path
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Unlock more exports and premium features for your animated maps
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <TierCard 
            tier="free" 
            isCurrentTier={state.user.tier === 'free'} 
            onSelect={() => upgradeTier('free')}
          />
          <TierCard 
            tier="apprentice" 
            isCurrentTier={state.user.tier === 'apprentice'} 
            onSelect={() => upgradeTier('apprentice')}
          />
          <TierCard 
            tier="master" 
            isCurrentTier={state.user.tier === 'master'} 
            onSelect={() => upgradeTier('master')}
          />
        </div>

        {/* Demo notice */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground text-center">
            This is a demo. Clicking upgrade will instantly switch your tier without payment.
            In production, this would redirect to Stripe Checkout.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

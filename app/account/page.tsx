import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Coins,
  ArrowLeft,
  Plus,
  Download,
  History,
  Gift,
  CheckCircle,
  Clock,
  XCircle,
  Gem
} from 'lucide-react'
import { formatPrice, SUBSCRIPTION } from '@/lib/tokens'
import { hasUnlimitedAccess, hasUnlimitedExports, type SubscriptionStatus } from '@/lib/subscription'
import { ReferralDashboard } from './referral-dashboard'
import { RedeemCouponForm } from './redeem-coupon-form'
import { ManageSubscriptionButton } from './manage-subscription-button'

export default async function AccountPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch token purchases
  const { data: purchases } = await supabase
    .from('token_purchases')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch exports
  const { data: exports } = await supabase
    .from('exports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch referrals where this user is the referrer
  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, status, reward_granted, created_at, referred_user_id')
    .eq('referrer_user_id', user.id)
    .order('created_at', { ascending: false })

  const referralStats = {
    total: referrals?.length ?? 0,
    rewarded: referrals?.filter((r) => r.reward_granted).length ?? 0,
    pending: referrals?.filter((r) => !r.reward_granted).length ?? 0,
  }

  // Check if user has free export available
  const today = new Date().toISOString().split('T')[0]
  const hasFreeExport = !profile?.free_export_date || profile.free_export_date !== today

  // Unlimited-access state. Lifetime (one-time purchase) and subscription are
  // distinguished so the card can show a renewal + manage button only for subs.
  const subscriptionStatus = profile?.subscription_status as SubscriptionStatus
  const lifetimeUnlimited = !!profile?.lifetime_unlimited
  const subscriptionActive = hasUnlimitedExports(subscriptionStatus)
  const unlimited = hasUnlimitedAccess({ lifetimeUnlimited, subscriptionStatus })
  const isFounder = !!profile?.is_founder
  const renewalDate = profile?.subscription_current_period_end
    ? new Date(profile.subscription_current_period_end).toLocaleDateString()
    : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          {isFounder && (
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-0 gap-1">
              <Gem className="w-3.5 h-3.5" />
              Founding Member
            </Badge>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Export Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                Export Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-4">
                {unlimited ? 'Unlimited' : (profile?.token_balance || 0)}
              </div>
              {unlimited ? (
                <Badge variant="secondary" className="mb-4">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {lifetimeUnlimited ? 'Lifetime unlimited' : `${SUBSCRIPTION.name} active`}
                </Badge>
              ) : hasFreeExport && (
                <Badge variant="secondary" className="mb-4">
                  <Gift className="w-3 h-3 mr-1" />
                  Free SD export available!
                </Badge>
              )}
              <Button asChild className="w-full">
                <Link href="/pricing">
                  <Plus className="w-4 h-4 mr-2" />
                  {unlimited ? 'View Plans' : 'Buy More Exports'}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Unlimited access */}
          <Card>
            <CardHeader>
              <CardTitle>Unlimited Exports</CardTitle>
              <CardDescription>
                {lifetimeUnlimited
                  ? 'You own lifetime unlimited exports.'
                  : subscriptionActive
                    ? `Your ${SUBSCRIPTION.name} gives you unlimited exports.`
                    : 'Go unlimited — subscribe monthly or buy a lifetime pass.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lifetimeUnlimited ? (
                <p className="text-sm text-muted-foreground">
                  Lifetime unlimited exports are active on your account — nothing to renew.
                </p>
              ) : subscriptionActive ? (
                <div className="space-y-3">
                  {renewalDate && (
                    <p className="text-sm text-muted-foreground">
                      Renews on <span className="font-medium text-foreground">{renewalDate}</span>
                    </p>
                  )}
                  <ManageSubscriptionButton />
                </div>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/pricing">
                    {formatPrice(SUBSCRIPTION.priceInCents)}/mo — or go lifetime
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Redeem Coupon */}
          <Card>
            <CardHeader>
              <CardTitle>Redeem Coupon</CardTitle>
              <CardDescription>Have a coupon code? Enter it below to claim your tokens.</CardDescription>
            </CardHeader>
            <CardContent>
              <RedeemCouponForm userId={user.id} />
            </CardContent>
          </Card>
        </div>

        {/* Referral Dashboard */}
        <div className="mb-8">
          <ReferralDashboard
            referralCode={profile?.referral_code || ''}
            tokensEarned={profile?.referral_tokens_earned || 0}
            stats={referralStats}
          />
        </div>

        {/* Purchase History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Purchase History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchases && purchases.length > 0 ? (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{purchase.pack_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">
                        {purchase.tokens_added > 0 ? `+${purchase.tokens_added} exports` : 'Unlimited'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(purchase.purchase_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">No purchases yet</p>
            )}
          </CardContent>
        </Card>

        {/* Export History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exports && exports.length > 0 ? (
              <div className="space-y-3">
                {exports.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {exp.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {exp.status === 'processing' && <Clock className="w-4 h-4 text-yellow-500" />}
                      {exp.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                      <div>
                        <p className="font-medium">
                          {exp.resolution.toUpperCase()} - {exp.duration_seconds}s
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(exp.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {exp.total_tokens_used > 0 ? `-${exp.total_tokens_used} export` : 'Free'}
                      </p>
                      <Badge variant={exp.status === 'completed' ? 'default' : 'secondary'}>
                        {exp.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">No exports yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

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
  Copy,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { formatPrice } from '@/lib/tokens'
import { CopyReferralButton } from './copy-referral-button'
import { RedeemCouponForm } from './redeem-coupon-form'

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

  // Check if user has free export available
  const today = new Date().toISOString().split('T')[0]
  const hasFreeExport = !profile?.free_export_date || profile.free_export_date !== today

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Token Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                Token Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-4">
                {profile?.token_balance || 0}
              </div>
              {hasFreeExport && (
                <Badge variant="secondary" className="mb-4">
                  <Gift className="w-3 h-3 mr-1" />
                  Free SD export available!
                </Badge>
              )}
              <Button asChild className="w-full">
                <Link href="/pricing">
                  <Plus className="w-4 h-4 mr-2" />
                  Buy More Tokens
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Referral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Refer Friends
              </CardTitle>
              <CardDescription>
                Earn 5 tokens for each friend who signs up!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
                <code className="flex-1 font-mono text-sm">
                  {profile?.referral_code || 'Loading...'}
                </code>
                <CopyReferralButton code={profile?.referral_code || ''} />
              </div>
              <p className="text-sm text-muted-foreground">
                Tokens earned from referrals: {profile?.referral_tokens_earned || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Redeem Coupon */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Redeem Coupon</CardTitle>
            <CardDescription>Have a coupon code? Enter it below to claim your tokens.</CardDescription>
          </CardHeader>
          <CardContent>
            <RedeemCouponForm userId={user.id} />
          </CardContent>
        </Card>

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
                      <p className="font-medium text-primary">+{purchase.tokens_added} tokens</p>
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
                        {exp.total_tokens_used > 0 ? `-${exp.total_tokens_used} tokens` : 'Free'}
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

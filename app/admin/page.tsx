import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Users, 
  Coins, 
  Download, 
  DollarSign,
  TrendingUp,
  Gift,
  Plus
} from 'lucide-react'
import { CreateCouponForm } from './create-coupon-form'

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  // Fetch stats - Using service role queries would be better but for now we use admin RLS
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: totalTokensData } = await supabase
    .from('profiles')
    .select('token_balance')

  const totalTokensInCirculation = totalTokensData?.reduce((sum, p) => sum + (p.token_balance || 0), 0) || 0

  const { count: totalExports } = await supabase
    .from('exports')
    .select('*', { count: 'exact', head: true })

  const { data: revenueData } = await supabase
    .from('token_purchases')
    .select('purchase_amount')

  const totalRevenue = revenueData?.reduce((sum, p) => sum + (p.purchase_amount || 0), 0) || 0

  // Recent purchases
  const { data: recentPurchases } = await supabase
    .from('token_purchases')
    .select('*, profiles(email, display_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  // Recent exports
  const { data: recentExports } = await supabase
    .from('exports')
    .select('*, profiles(email, display_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  // Active coupons
  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Tokens in Circulation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTokensInCirculation}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Total Exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalExports || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Purchases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPurchases && recentPurchases.length > 0 ? (
                <div className="space-y-3">
                  {recentPurchases.map((purchase: any) => (
                    <div key={purchase.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{purchase.profiles?.display_name || purchase.profiles?.email}</p>
                        <p className="text-muted-foreground">{purchase.pack_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+${(purchase.purchase_amount / 100).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No purchases yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Exports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Recent Exports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentExports && recentExports.length > 0 ? (
                <div className="space-y-3">
                  {recentExports.map((exp: any) => (
                    <div key={exp.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{exp.profiles?.display_name || exp.profiles?.email}</p>
                        <p className="text-muted-foreground">
                          {exp.resolution.toUpperCase()} - {exp.duration_seconds}s
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={exp.status === 'completed' ? 'default' : 'secondary'}>
                          {exp.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {exp.total_tokens_used > 0 ? `${exp.total_tokens_used} tokens` : 'Free'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No exports yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coupons Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Coupon Management
            </CardTitle>
            <CardDescription>Create and manage promotional coupons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="font-medium mb-3">Create New Coupon</h3>
              <CreateCouponForm />
            </div>

            <Separator className="my-6" />

            <h3 className="font-medium mb-3">Active Coupons</h3>
            {coupons && coupons.length > 0 ? (
              <div className="space-y-3">
                {coupons.map((coupon: any) => (
                  <div key={coupon.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <code className="font-mono font-bold">{coupon.code}</code>
                      <p className="text-sm text-muted-foreground">
                        {coupon.token_amount} tokens • {coupon.uses_count}/{coupon.max_uses || '∞'} uses
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {coupon.expires_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No coupons created yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

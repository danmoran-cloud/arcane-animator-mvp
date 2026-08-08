import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
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
  Plus,
  Share2,
  ShieldCheck,
  Gem
} from 'lucide-react'
import { CreateCouponForm } from './create-coupon-form'
import { CouponRow } from './coupon-row'
import { ManageUserTokensForm } from './manage-user-tokens-form'
import { ManageAdminsForm } from './manage-admins-form'
import { ExportUsersButton } from './export-users-button'

// Always render fresh on each visit so newly-signed-up users and updated
// balances/roles show up immediately (no cached/stale snapshot).
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, role')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  const isSuperAdmin = profile.role === 'superadmin'

  // Dashboard aggregates must read EVERY user's data, but profiles/exports/etc.
  // are locked down by RLS to each user's own rows. So — having just verified the
  // caller is an admin above — run the read-only dashboard queries through the
  // service-role client (same approach as listAllUsers). Without this the stats
  // only reflect the admin's own row (e.g. Total Users = 1).
  const admin = createAdminClient()

  // Fetch stats
  const { count: totalUsers } = await admin
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: totalTokensData } = await admin
    .from('profiles')
    .select('token_balance')

  const totalTokensInCirculation = totalTokensData?.reduce((sum, p) => sum + (p.token_balance || 0), 0) || 0

  const { count: totalExports } = await admin
    .from('exports')
    .select('*', { count: 'exact', head: true })

  const { data: revenueData } = await admin
    .from('token_purchases')
    .select('purchase_amount')

  const totalRevenue = revenueData?.reduce((sum, p) => sum + (p.purchase_amount || 0), 0) || 0

  // Founding members: users who bought the Founder's Tier. The Stripe webhook
  // sets profiles.is_founder on that purchase, so it's the durable source of
  // truth (survives even if a token_purchases row is missing). Ordered by
  // signup so the earliest founders appear first.
  const { data: foundingMembers } = await admin
    .from('profiles')
    .select('id, email, display_name, created_at')
    .eq('is_founder', true)
    .order('created_at', { ascending: true })

  const founderCount = foundingMembers?.length ?? 0

  // All lifetime-unlimited owners (Founders + Noble + admin-comped) for context.
  const { count: lifetimeUnlimitedCount } = await admin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('lifetime_unlimited', true)

  // Recent purchases
  const { data: recentPurchases } = await admin
    .from('token_purchases')
    .select('*, profiles(email, display_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  // Recent exports
  const { data: recentExports } = await admin
    .from('exports')
    .select('*, profiles(email, display_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  // Active coupons
  const { data: coupons } = await admin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  // Referral analytics
  const { data: allReferrals } = await admin
    .from('referrals')
    .select('id, status, reward_granted, referrer_user_id, created_at')

  const totalReferrals = allReferrals?.length ?? 0
  const rewardedReferrals = allReferrals?.filter((r) => r.reward_granted).length ?? 0
  const pendingReferrals = totalReferrals - rewardedReferrals
  const conversionRate = totalReferrals > 0 ? Math.round((rewardedReferrals / totalReferrals) * 100) : 0
  // Each rewarded referral grants 5 exports to referrer + 5 to referred = 10 total
  const referralTokensGranted = rewardedReferrals * 10

  // Top referrers (count referrals per referrer)
  const referrerCounts = new Map<string, { total: number; rewarded: number }>()
  for (const r of allReferrals ?? []) {
    const entry = referrerCounts.get(r.referrer_user_id) ?? { total: 0, rewarded: 0 }
    entry.total += 1
    if (r.reward_granted) entry.rewarded += 1
    referrerCounts.set(r.referrer_user_id, entry)
  }
  const topReferrerIds = [...referrerCounts.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)

  let topReferrers: { id: string; name: string; total: number; rewarded: number }[] = []
  if (topReferrerIds.length > 0) {
    const { data: referrerProfiles } = await admin
      .from('profiles')
      .select('id, email, display_name')
      .in('id', topReferrerIds.map(([id]) => id))

    topReferrers = topReferrerIds.map(([id, counts]) => {
      const p = referrerProfiles?.find((rp) => rp.id === id)
      return {
        id,
        name: p?.display_name || p?.email || 'Unknown user',
        total: counts.total,
        rewarded: counts.rewarded,
      }
    })
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
                Export Credits in Circulation
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

        {/* Founding Members */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-amber-500" />
                Founding Members
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-0">
                  {founderCount} founder{founderCount === 1 ? '' : 's'}
                </Badge>
                <Badge variant="secondary">
                  {lifetimeUnlimitedCount ?? 0} lifetime total
                </Badge>
              </div>
            </div>
            <CardDescription>
              Users who purchased the Founder&apos;s Tier. &quot;Lifetime total&quot; also counts Noble and admin-comped unlimited accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {foundingMembers && foundingMembers.length > 0 ? (
              <div className="space-y-3">
                {foundingMembers.map((member, i) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-6 text-right">#{i + 1}</span>
                      <div>
                        <p className="font-medium">{member.display_name || member.email || 'Unknown user'}</p>
                        {member.display_name && member.email && (
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No founding members yet</p>
            )}
          </CardContent>
        </Card>

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
                          {exp.total_tokens_used > 0 ? `${exp.total_tokens_used} export` : 'Free'}
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

        {/* User Token Management */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  User Export Management
                </CardTitle>
                <CardDescription>Look up a user by email, set their export balance, or grant lifetime unlimited</CardDescription>
              </div>
              <ExportUsersButton />
            </div>
          </CardHeader>
          <CardContent>
            <ManageUserTokensForm />
          </CardContent>
        </Card>

        {/* Admin Role Management — superadmin only */}
        {isSuperAdmin && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Admin Access
              </CardTitle>
              <CardDescription>
                Look up a user by email and set their access level. Admins can manage tokens and
                coupons; Super Admins can also manage roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManageAdminsForm currentUserId={user.id} />
            </CardContent>
          </Card>
        )}

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

            <h3 className="font-medium mb-3">Coupons</h3>
            {coupons && coupons.length > 0 ? (
              <div className="space-y-3">
                {coupons.map((coupon: any) => (
                  <CouponRow key={coupon.id} coupon={coupon} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No coupons created yet</p>
            )}
          </CardContent>
        </Card>

        {/* Referral Analytics Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Referral Analytics
            </CardTitle>
            <CardDescription>Track referral-driven growth and rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Referral stat grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-muted/50 border border-border p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Referrals
                </p>
                <p className="text-2xl font-bold mt-1">{totalReferrals}</p>
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Converted
                </p>
                <p className="text-2xl font-bold mt-1">{rewardedReferrals}</p>
                <p className="text-xs text-muted-foreground">{conversionRate}% conversion</p>
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Pending
                </p>
                <p className="text-2xl font-bold mt-1">{pendingReferrals}</p>
                <p className="text-xs text-muted-foreground">not yet rewarded</p>
              </div>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Coins className="w-4 h-4 text-primary" />
                  Exports Granted
                </p>
                <p className="text-2xl font-bold mt-1 text-primary">{referralTokensGranted}</p>
              </div>
            </div>

            <Separator />

            {/* Top referrers */}
            <div>
              <h3 className="font-medium mb-3">Top Referrers</h3>
              {topReferrers.length > 0 ? (
                <div className="space-y-3">
                  {topReferrers.map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">{ref.name}</p>
                      <div className="text-right text-sm">
                        <p className="font-medium">{ref.total} referred</p>
                        <p className="text-xs text-muted-foreground">{ref.rewarded} converted</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No referrals yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

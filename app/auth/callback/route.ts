import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const ref = searchParams.get('ref')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If this sign-in carried a referral code (a Google signup from a
      // referral link), record the referral here. The email/password path does
      // this via a DB trigger that reads signup metadata, but OAuth signups
      // can't set that metadata — so we replicate it. Best-effort: a failure
      // must never block the user from getting logged in.
      if (ref && data.user) {
        await applyReferral(ref, data.user.id).catch(() => {})
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}

/**
 * Link a newly-signed-up user to their referrer. Uses the service-role client
 * because inserting a referral row on behalf of another user is blocked by RLS
 * for the user's own session (the same reason the email path relies on a
 * SECURITY DEFINER trigger).
 */
async function applyReferral(referralCode: string, referredUserId: string) {
  const admin = createAdminClient()

  // Resolve the referrer from their shareable code.
  const { data: referrer } = await admin
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode)
    .maybeSingle()

  // Ignore unknown codes and self-referrals.
  if (!referrer || referrer.id === referredUserId) return

  // Only ever record one referral per referred user (guards repeat logins).
  const { data: existing } = await admin
    .from('referrals')
    .select('id')
    .eq('referred_user_id', referredUserId)
    .maybeSingle()

  if (existing) return

  await admin.from('referrals').insert({
    referrer_user_id: referrer.id,
    referred_user_id: referredUserId,
    status: 'pending',
    reward_granted: false,
  })
}

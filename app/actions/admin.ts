'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ASSIGNABLE_ROLES, type Role } from '@/lib/roles'

interface AdminUser {
  id: string
  email: string | null
  display_name: string | null
  token_balance: number
  role: Role
}

// Verify the caller is a signed-in admin. Returns the user on success, or an
// error string. Privileged writes that follow should use createAdminClient().
async function requireAdmin(): Promise<{ error: string } | { userId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return { error: 'Unauthorized' }
  return { userId: user.id }
}

// Verify the caller is a superadmin — the only tier allowed to change roles.
async function requireSuperAdmin(): Promise<{ error: string } | { userId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') return { error: 'Unauthorized' }
  return { userId: user.id }
}

export async function findUserByEmail(
  email: string,
): Promise<{ user?: AdminUser; error?: string }> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  // Service role: admins need to read profiles other than their own.
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, display_name, token_balance, role')
    .ilike('email', email.trim())
    .limit(1)
    .maybeSingle()

  if (error) return { error: error.message }
  if (!data) return { error: 'No user found with that email' }
  return { user: data as AdminUser }
}

export async function setUserRole(
  userId: string,
  role: Role,
): Promise<{ success?: boolean; user?: AdminUser; error?: string }> {
  const auth = await requireSuperAdmin()
  if ('error' in auth) return { error: auth.error }

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return { error: 'Invalid role' }
  }

  // Prevent self-lockout: a superadmin cannot demote their own account.
  if (userId === auth.userId && role !== 'superadmin') {
    return { error: 'You cannot change your own role' }
  }

  // Service role: RLS blocks editing another user's profile via the auth client.
  // The is_admin flag is kept in sync by a DB trigger on role changes.
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select('id, email, display_name, token_balance, role')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true, user: data as AdminUser }
}

export async function setUserTokenBalance(
  userId: string,
  newBalance: number,
): Promise<{ success?: boolean; user?: AdminUser; error?: string }> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  if (!Number.isFinite(newBalance) || newBalance < 0) {
    return { error: 'Balance must be a non-negative number' }
  }

  // Service role: RLS blocks editing another user's profile via the auth client.
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .update({ token_balance: Math.floor(newBalance) })
    .eq('id', userId)
    .select('id, email, display_name, token_balance')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true, user: data as AdminUser }
}

export async function createCoupon(data: {
  code: string
  tokenAmount: number
  maxUses?: number
  oneUsePerUser: boolean
  expiresAt?: string
}) {
  const supabase = await createClient()
  
  // Check admin status
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('coupons')
    .insert({
      code: data.code.toUpperCase(),
      token_amount: data.tokenAmount,
      max_uses: data.maxUses || null,
      one_use_per_user: data.oneUsePerUser,
      expires_at: data.expiresAt || null,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function toggleCouponActive(couponId: string, isActive: boolean) {
  const auth = await requireAdmin()
  if ('error' in auth) return { success: false, error: auth.error }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: isActive })
      .eq('id', couponId)

    if (error) return { success: false, error: error.message }
    // The client refreshes the route itself; no in-action revalidate render.
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Update failed' }
  }
}

export async function updateCouponExpiry(couponId: string, expiresAt: string | null) {
  const auth = await requireAdmin()
  if ('error' in auth) return { success: false, error: auth.error }

  // Normalize an empty/blank value to null (no expiry). A provided value must
  // parse to a valid date.
  let normalized: string | null = null
  if (expiresAt && expiresAt.trim()) {
    const parsed = new Date(expiresAt)
    if (Number.isNaN(parsed.getTime())) {
      return { success: false, error: 'Invalid expiry date' }
    }
    normalized = parsed.toISOString()
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('coupons')
      .update({ expires_at: normalized })
      .eq('id', couponId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Update failed' }
  }
}

export async function deleteCoupon(couponId: string) {
  const auth = await requireAdmin()
  if ('error' in auth) return { success: false, error: auth.error }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Delete failed' }
  }
}

export async function grantTokensToUser(userId: string, amount: number, reason: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return { success: false, error: 'Unauthorized' }
  }

  // Use the increment function
  const { error } = await supabase.rpc('increment_token_balance', {
    user_id: userId,
    amount: amount
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Log the grant
  await supabase.from('token_purchases').insert({
    user_id: userId,
    pack_name: `Admin Grant: ${reason}`,
    tokens_added: amount,
    purchase_amount: 0,
    status: 'admin_grant'
  })

  revalidatePath('/admin')
  return { success: true }
}

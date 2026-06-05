'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCoupon(formData: FormData) {
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

  const code = formData.get('code') as string
  const tokenAmount = parseInt(formData.get('tokenAmount') as string)
  const maxUses = formData.get('maxUses') ? parseInt(formData.get('maxUses') as string) : null
  const oneUsePerUser = formData.get('oneUsePerUser') === 'true'
  const expiresAt = formData.get('expiresAt') as string | null

  const { error } = await supabase
    .from('coupons')
    .insert({
      code: code.toUpperCase(),
      token_amount: tokenAmount,
      max_uses: maxUses,
      one_use_per_user: oneUsePerUser,
      expires_at: expiresAt || null,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function toggleCouponActive(couponId: string, isActive: boolean) {
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

  const { error } = await supabase
    .from('coupons')
    .update({ is_active: isActive })
    .eq('id', couponId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
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

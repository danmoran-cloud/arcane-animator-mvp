'use server'

import { createClient } from '@/lib/supabase/server'

export async function redeemCoupon(code: string, userId: string): Promise<{ success: boolean; tokens?: number; error?: string }> {
  const supabase = await createClient()

  // Find the coupon
  const { data: coupon, error: couponError } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (couponError || !coupon) {
    return { success: false, error: 'Invalid coupon code' }
  }

  // Check if expired
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { success: false, error: 'This coupon has expired' }
  }

  // Check max uses
  if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
    return { success: false, error: 'This coupon has reached its maximum uses' }
  }

  // Check if user already redeemed (if one_use_per_user)
  if (coupon.one_use_per_user) {
    const { data: existingRedemption } = await supabase
      .from('coupon_redemptions')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', userId)
      .single()

    if (existingRedemption) {
      return { success: false, error: 'You have already redeemed this coupon' }
    }
  }

  // Redeem the coupon
  const { error: redemptionError } = await supabase
    .from('coupon_redemptions')
    .insert({
      coupon_id: coupon.id,
      user_id: userId,
      tokens_added: coupon.token_amount,
    })

  if (redemptionError) {
    return { success: false, error: 'Failed to redeem coupon' }
  }

  // Increment coupon uses
  await supabase
    .from('coupons')
    .update({ uses_count: coupon.uses_count + 1 })
    .eq('id', coupon.id)

  // Add tokens to user
  const { error: tokenError } = await supabase.rpc('increment_token_balance', {
    user_id: userId,
    amount: coupon.token_amount,
  })

  if (tokenError) {
    return { success: false, error: 'Failed to add tokens' }
  }

  return { success: true, tokens: coupon.token_amount }
}

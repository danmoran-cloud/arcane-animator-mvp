'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateExportCost, isFreeExportEligible, BASE_TOKEN_COST } from '@/lib/tokens'
import type { ExportResolution } from '@/lib/export-types'

export interface ExportAuthResult {
  authorized: boolean
  userId?: string
  tokenBalance?: number
  cost?: number
  // Whether the user's once-daily free allowance is still unused today.
  dailyFreeAvailable?: boolean
  // Whether the free allowance applies to THIS export (eligible tier + unused).
  freeApplied?: boolean
  error?: string
}

export async function checkExportAuthorization(
  resolution: ExportResolution,
  durationSeconds: number,
  frameRate: number
): Promise<ExportAuthResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { authorized: false, error: 'Please sign in to export' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('token_balance, free_export_date')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { authorized: false, error: 'Profile not found' }
  }

  const cost = calculateExportCost(resolution, durationSeconds, frameRate)
  const today = new Date().toISOString().split('T')[0]
  const dailyFreeAvailable = !profile.free_export_date || profile.free_export_date !== today
  const freeApplied =
    dailyFreeAvailable && isFreeExportEligible(resolution, durationSeconds, frameRate)

  if (freeApplied) {
    return {
      authorized: true,
      userId: user.id,
      tokenBalance: profile.token_balance,
      cost: 0,
      dailyFreeAvailable,
      freeApplied: true,
    }
  }

  // Check token balance
  if (profile.token_balance >= cost) {
    return {
      authorized: true,
      userId: user.id,
      tokenBalance: profile.token_balance,
      cost,
      dailyFreeAvailable,
      freeApplied: false,
    }
  }

  return {
    authorized: false,
    userId: user.id,
    tokenBalance: profile.token_balance,
    cost,
    dailyFreeAvailable,
    freeApplied: false,
    error: `Not enough tokens. You need ${cost} tokens but have ${profile.token_balance}.`,
  }
}

export async function getReferralCode(): Promise<{ referralCode: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { referralCode: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  return { referralCode: profile?.referral_code ?? null }
}

export async function recordExport(
  userId: string,
  resolution: ExportResolution,
  durationSeconds: number,
  frameRate: number,
  useFreeExport: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const cost = calculateExportCost(resolution, durationSeconds, frameRate)
  const baseCost = BASE_TOKEN_COST[resolution] ?? BASE_TOKEN_COST.sd
  // Everything beyond the base (duration steps + 60fps surcharge).
  const durationCost = cost - baseCost

  if (useFreeExport) {
    // Use free export - update the date
    const today = new Date().toISOString().split('T')[0]
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ free_export_date: today })
      .eq('id', userId)

    if (updateError) {
      return { success: false, error: 'Failed to use free export' }
    }

    // Record the export
    await supabase.from('exports').insert({
      user_id: userId,
      export_type: 'webm',
      resolution,
      duration_seconds: durationSeconds,
      base_token_cost: 0,
      duration_token_cost: 0,
      total_tokens_used: 0,
      status: 'completed',
    })

    return { success: true }
  }

  // Deduct tokens
  const { data: deducted, error: deductError } = await supabase.rpc('deduct_tokens_for_export', {
    user_id: userId,
    amount: cost,
  })

  if (deductError || !deducted) {
    return { success: false, error: 'Failed to deduct tokens' }
  }

  // Record the export
  await supabase.from('exports').insert({
    user_id: userId,
    export_type: 'webm',
    resolution,
    duration_seconds: durationSeconds,
    base_token_cost: baseCost,
    duration_token_cost: durationCost,
    total_tokens_used: cost,
    status: 'completed',
  })

  return { success: true }
}

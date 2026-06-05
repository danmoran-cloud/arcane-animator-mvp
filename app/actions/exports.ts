'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateExportCost } from '@/lib/tokens'
import type { ExportResolution } from '@/lib/export-types'

export interface ExportAuthResult {
  authorized: boolean
  userId?: string
  tokenBalance?: number
  cost?: number
  hasFreeExport?: boolean
  error?: string
}

export async function checkExportAuthorization(
  resolution: ExportResolution,
  durationSeconds: number
): Promise<ExportAuthResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  console.log('[v0] checkExportAuthorization - user:', user?.id, 'authError:', authError?.message)
  
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

  const cost = calculateExportCost(resolution, durationSeconds)
  const today = new Date().toISOString().split('T')[0]
  const hasFreeExport = !profile.free_export_date || profile.free_export_date !== today

  // Free export for SD resolution only
  if (hasFreeExport && resolution === 'sd') {
    return {
      authorized: true,
      userId: user.id,
      tokenBalance: profile.token_balance,
      cost: 0,
      hasFreeExport: true,
    }
  }

  // Check token balance
  if (profile.token_balance >= cost) {
    return {
      authorized: true,
      userId: user.id,
      tokenBalance: profile.token_balance,
      cost,
      hasFreeExport: false,
    }
  }

  return {
    authorized: false,
    userId: user.id,
    tokenBalance: profile.token_balance,
    cost,
    hasFreeExport: false,
    error: `Not enough tokens. You need ${cost} tokens but have ${profile.token_balance}.`,
  }
}

export async function recordExport(
  userId: string,
  resolution: ExportResolution,
  durationSeconds: number,
  useFreeExport: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const cost = calculateExportCost(resolution, durationSeconds)
  const baseCost = resolution === 'sd' ? 1 : resolution === 'hd' ? 2 : 3
  const durationCost = Math.ceil(durationSeconds / 10)

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

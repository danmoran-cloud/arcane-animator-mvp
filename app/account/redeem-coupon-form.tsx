'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { redeemCoupon } from '@/app/actions/coupons'
import { useRouter } from 'next/navigation'

export function RedeemCouponForm({ userId }: { userId: string }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setMessage(null)

    const result = await redeemCoupon(code.trim().toUpperCase(), userId)
    
    if (result.success) {
      setMessage({ type: 'success', text: `Successfully redeemed! +${result.tokens} export${result.tokens === 1 ? '' : 's'} added.` })
      setCode('')
      router.refresh()
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to redeem coupon' })
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="font-mono"
        />
        <Button type="submit" disabled={loading || !code.trim()}>
          {loading ? 'Redeeming...' : 'Redeem'}
        </Button>
      </div>
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </form>
  )
}

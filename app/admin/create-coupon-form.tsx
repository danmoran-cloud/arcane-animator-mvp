'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createCoupon } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'

export function CreateCouponForm() {
  const [code, setCode] = useState('')
  const [tokenAmount, setTokenAmount] = useState('5')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [oneUsePerUser, setOneUsePerUser] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setMessage(null)

    const result = await createCoupon({
      code: code.trim().toUpperCase(),
      tokenAmount: parseInt(tokenAmount),
      maxUses: maxUses ? parseInt(maxUses) : undefined,
      oneUsePerUser,
      expiresAt: expiresAt || undefined,
    })

    if (result.success) {
      setMessage({ type: 'success', text: 'Coupon created successfully!' })
      setCode('')
      setTokenAmount('5')
      setMaxUses('')
      setExpiresAt('')
      router.refresh()
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to create coupon' })
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code</Label>
          <Input
            id="code"
            placeholder="WELCOME2024"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tokenAmount">Token Amount</Label>
          <Input
            id="tokenAmount"
            type="number"
            min="1"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxUses">Max Uses (blank = unlimited)</Label>
          <Input
            id="maxUses"
            type="number"
            min="1"
            placeholder="Unlimited"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expires (blank = never)</Label>
          <Input
            id="expiresAt"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Options</Label>
          <div className="flex items-center gap-2 h-10">
            <Checkbox
              id="oneUsePerUser"
              checked={oneUsePerUser}
              onCheckedChange={(checked) => setOneUsePerUser(checked as boolean)}
            />
            <Label htmlFor="oneUsePerUser" className="text-sm font-normal">
              One use per user
            </Label>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading || !code.trim()}>
          {loading ? 'Creating...' : 'Create Coupon'}
        </Button>
        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  )
}

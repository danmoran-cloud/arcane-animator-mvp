'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Power, Trash2, CalendarClock, Check, X } from 'lucide-react'
import { toggleCouponActive, updateCouponExpiry, deleteCoupon } from '@/app/actions/admin'

interface Coupon {
  id: string
  code: string
  token_amount: number
  uses_count: number
  max_uses: number | null
  is_active: boolean
  expires_at: string | null
}

// Convert an ISO timestamp to the yyyy-mm-dd value a <input type="date"> expects.
function toDateInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function CouponRow({ coupon }: { coupon: Coupon }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [editingExpiry, setEditingExpiry] = useState(false)
  const [expiryDraft, setExpiryDraft] = useState(toDateInput(coupon.expires_at))
  const [error, setError] = useState<string | null>(null)

  const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false

  const run = async (fn: () => Promise<{ success: boolean; error?: string }>) => {
    setBusy(true)
    setError(null)
    try {
      const result = await fn()
      if (result.success) {
        router.refresh()
        return true
      }
      setError(result.error || 'Something went wrong')
      return false
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      return false
    } finally {
      // Always clear the busy flag so the row's controls never get stuck
      // disabled if the action throws.
      setBusy(false)
    }
  }

  const handleToggle = () => run(() => toggleCouponActive(coupon.id, !coupon.is_active))

  const handleSaveExpiry = async () => {
    const ok = await run(() => updateCouponExpiry(coupon.id, expiryDraft || null))
    if (ok) setEditingExpiry(false)
  }

  const handleDelete = () => run(() => deleteCoupon(coupon.id))

  return (
    <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <code className="font-mono font-bold">{coupon.code}</code>
          <p className="text-sm text-muted-foreground">
            {coupon.token_amount} tokens • {coupon.uses_count}/{coupon.max_uses || '∞'} uses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
              {coupon.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {coupon.expires_at && (
              <p className={`text-xs mt-1 ${isExpired ? 'text-red-600' : 'text-muted-foreground'}`}>
                {isExpired ? 'Expired' : 'Expires'}: {new Date(coupon.expires_at).toLocaleDateString()}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            title={editingExpiry ? 'Cancel' : 'Edit expiry'}
            disabled={busy}
            onClick={() => {
              setExpiryDraft(toDateInput(coupon.expires_at))
              setEditingExpiry((v) => !v)
            }}
          >
            <CalendarClock className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title={coupon.is_active ? 'Deactivate' : 'Activate'}
            disabled={busy}
            onClick={handleToggle}
          >
            <Power className={`w-4 h-4 ${coupon.is_active ? 'text-green-600' : 'text-muted-foreground'}`} />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Delete" disabled={busy}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete coupon {coupon.code}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the coupon. Existing redemption records are kept, but
                  the code can no longer be redeemed. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {editingExpiry && (
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="date"
            value={expiryDraft}
            onChange={(e) => setExpiryDraft(e.target.value)}
            className="h-8 w-auto"
          />
          <Button size="icon" variant="ghost" className="h-8 w-8" title="Save expiry" disabled={busy} onClick={handleSaveExpiry}>
            <Check className="w-4 h-4 text-green-600" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Clear expiry"
            disabled={busy}
            onClick={() => setExpiryDraft('')}
          >
            <X className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">Blank = never expires</span>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

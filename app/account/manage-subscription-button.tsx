'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'
import { createBillingPortalSession } from '@/app/actions/stripe'

// Opens the Stripe-hosted billing portal so the user can update or cancel their
// subscription. Used from the account page's subscription card.
export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const result = await createBillingPortalSession()
      if (result.url) {
        window.location.href = result.url
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('[v0] Billing portal error:', error)
      toast.error('Could not open billing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleClick} disabled={loading}>
      <CreditCard className="w-4 h-4 mr-2" />
      {loading ? 'Opening…' : 'Manage Subscription'}
    </Button>
  )
}

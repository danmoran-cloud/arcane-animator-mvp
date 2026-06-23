'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { findUserByEmail, setUserTokenBalance } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'

interface FoundUser {
  id: string
  email: string | null
  display_name: string | null
  token_balance: number
}

export function ManageUserTokensForm() {
  const [email, setEmail] = useState('')
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null)
  const [newBalance, setNewBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setMessage(null)
    setFoundUser(null)

    const result = await findUserByEmail(email.trim())
    if (result.user) {
      setFoundUser(result.user)
      setNewBalance(String(result.user.token_balance))
    } else {
      setMessage({ type: 'error', text: result.error || 'User not found' })
    }

    setLoading(false)
  }

  const handleUpdate = async () => {
    if (!foundUser) return

    const parsed = parseInt(newBalance, 10)
    if (Number.isNaN(parsed) || parsed < 0) {
      setMessage({ type: 'error', text: 'Enter a valid non-negative number' })
      return
    }

    setLoading(true)
    setMessage(null)

    const result = await setUserTokenBalance(foundUser.id, parsed)
    if (result.success && result.user) {
      setFoundUser(result.user)
      setNewBalance(String(result.user.token_balance))
      setMessage({ type: 'success', text: `Balance updated to ${result.user.token_balance} tokens` })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update balance' })
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleLookup} className="flex flex-wrap items-end gap-3">
        <div className="space-y-2 flex-1 min-w-[220px]">
          <Label htmlFor="userEmail">User Email</Label>
          <Input
            id="userEmail"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" disabled={loading || !email.trim()}>
          {loading ? 'Searching...' : 'Look up'}
        </Button>
      </form>

      {foundUser && (
        <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
          <div>
            <p className="font-medium">{foundUser.display_name || foundUser.email}</p>
            <p className="text-sm text-muted-foreground">{foundUser.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Current balance:{' '}
              <span className="font-semibold text-foreground">{foundUser.token_balance}</span> tokens
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2 flex-1 min-w-[180px]">
              <Label htmlFor="newBalance">New Balance</Label>
              <Input
                id="newBalance"
                type="number"
                min="0"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
              />
            </div>
            <Button type="button" onClick={handleUpdate} disabled={loading}>
              {loading ? 'Updating...' : 'Set Balance'}
            </Button>
          </div>
        </div>
      )}

      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Gem, Infinity as InfinityIcon } from 'lucide-react'
import {
  findUserByEmail,
  listAllUsers,
  setUserTokenBalance,
  setUserLifetimeUnlimited,
} from '@/app/actions/admin'
import { hasUnlimitedAccess, type SubscriptionStatus } from '@/lib/subscription'
import { useRouter } from 'next/navigation'

interface FoundUser {
  id: string
  email: string | null
  display_name: string | null
  token_balance: number
  lifetime_unlimited?: boolean
  subscription_status?: string | null
  is_founder?: boolean
}

// Whether a user currently has unlimited exports (lifetime or subscription).
function isUnlimited(u: FoundUser): boolean {
  return hasUnlimitedAccess({
    lifetimeUnlimited: u.lifetime_unlimited,
    subscriptionStatus: u.subscription_status as SubscriptionStatus,
  })
}

export function ManageUserTokensForm() {
  const [email, setEmail] = useState('')
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null)
  const [newBalance, setNewBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Browse-all-users state
  const [allUsers, setAllUsers] = useState<FoundUser[] | null>(null)
  const [listLoading, setListLoading] = useState(false)
  const [filter, setFilter] = useState('')

  const router = useRouter()

  const selectUser = (u: FoundUser) => {
    setFoundUser(u)
    setNewBalance(String(u.token_balance))
    setMessage(null)
  }

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setMessage(null)
    setFoundUser(null)

    const result = await findUserByEmail(email.trim())
    if (result.user) {
      selectUser(result.user)
    } else {
      setMessage({ type: 'error', text: result.error || 'User not found' })
    }

    setLoading(false)
  }

  const handleToggleList = async () => {
    // Collapse if already open.
    if (allUsers) {
      setAllUsers(null)
      return
    }

    setListLoading(true)
    setMessage(null)

    const result = await listAllUsers()
    if (result.users) {
      setAllUsers(result.users)
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to load users' })
    }

    setListLoading(false)
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
      const updated = result.user as FoundUser
      selectUser(updated)
      // Reflect the new balance in the browse list too, if it's open.
      setAllUsers((prev) =>
        prev ? prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)) : prev,
      )
      setMessage({ type: 'success', text: `Balance updated to ${updated.token_balance} exports` })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update balance' })
    }

    setLoading(false)
  }

  const handleToggleLifetime = async () => {
    if (!foundUser) return
    const next = !foundUser.lifetime_unlimited

    setLoading(true)
    setMessage(null)

    const result = await setUserLifetimeUnlimited(foundUser.id, next)
    if (result.success && result.user) {
      const updated = result.user as FoundUser
      selectUser(updated)
      setAllUsers((prev) =>
        prev ? prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)) : prev,
      )
      setMessage({
        type: 'success',
        text: next ? 'Granted lifetime unlimited exports' : 'Revoked lifetime unlimited exports',
      })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update unlimited access' })
    }

    setLoading(false)
  }

  const filteredUsers = allUsers?.filter((u) => {
    if (!filter.trim()) return true
    const q = filter.trim().toLowerCase()
    return (
      (u.email || '').toLowerCase().includes(q) ||
      (u.display_name || '').toLowerCase().includes(q)
    )
  })

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
        <Button type="button" variant="ghost" onClick={handleToggleList} disabled={listLoading}>
          {listLoading ? 'Loading...' : allUsers ? 'Hide all users' : 'List all users'}
        </Button>
      </form>

      {allUsers && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Input
              placeholder="Filter by name or email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 flex-1"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {filteredUsers?.length ?? 0} of {allUsers.length}
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-md border border-border divide-y divide-border">
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => selectUser(u)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    foundUser?.id === u.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{u.display_name || u.email || 'Unknown user'}</p>
                    {u.display_name && u.email && (
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    )}
                  </div>
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                    {u.is_founder && <Gem className="w-3 h-3 text-amber-500" />}
                    {isUnlimited(u) ? (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <InfinityIcon className="w-3 h-3" /> Unlimited
                      </span>
                    ) : (
                      `${u.token_balance} exports`
                    )}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">No matching users</p>
            )}
          </div>
        </div>
      )}

      {foundUser && (
        <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{foundUser.display_name || foundUser.email}</p>
              {foundUser.is_founder && (
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-0 gap-1">
                  <Gem className="w-3 h-3" />
                  Founder
                </Badge>
              )}
              {isUnlimited(foundUser) && (
                <Badge variant="secondary" className="gap-1">
                  <InfinityIcon className="w-3 h-3" />
                  {foundUser.lifetime_unlimited ? 'Lifetime' : 'Subscription'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{foundUser.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Export balance:{' '}
              <span className="font-semibold text-foreground">{foundUser.token_balance}</span> exports
              {isUnlimited(foundUser) && ' · unlimited exports active'}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2 flex-1 min-w-[180px]">
              <Label htmlFor="newBalance">New Balance (exports)</Label>
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
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-sm text-muted-foreground">
              Lifetime unlimited exports:{' '}
              <span className="font-medium text-foreground">
                {foundUser.lifetime_unlimited ? 'On' : 'Off'}
              </span>
            </p>
            <Button
              type="button"
              variant={foundUser.lifetime_unlimited ? 'outline' : 'default'}
              onClick={handleToggleLifetime}
              disabled={loading}
            >
              {foundUser.lifetime_unlimited ? 'Revoke Lifetime' : 'Grant Lifetime'}
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

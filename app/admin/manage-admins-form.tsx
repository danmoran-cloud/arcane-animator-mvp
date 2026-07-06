'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { findUserByEmail, listAllUsers, setUserRole } from '@/app/actions/admin'
import type { Role } from '@/lib/roles'

interface FoundUser {
  id: string
  email: string | null
  display_name: string | null
  role: Role
}

const ROLE_LABELS: Record<Role, string> = {
  user: 'User (no admin access)',
  admin: 'Admin (manage tokens & coupons)',
  superadmin: 'Super Admin (also manages roles)',
}

const ROLE_BADGE: Record<Role, { label: string; variant: 'default' | 'secondary' }> = {
  user: { label: 'User', variant: 'secondary' },
  admin: { label: 'Admin', variant: 'default' },
  superadmin: { label: 'Super Admin', variant: 'default' },
}

export function ManageAdminsForm({ currentUserId }: { currentUserId: string }) {
  const [email, setEmail] = useState('')
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role>('user')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Browse-all-users state
  const [allUsers, setAllUsers] = useState<FoundUser[] | null>(null)
  const [listLoading, setListLoading] = useState(false)
  const [filter, setFilter] = useState('')

  const router = useRouter()

  const selectUser = (u: FoundUser) => {
    setFoundUser(u)
    setSelectedRole(u.role)
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

  const isSelf = foundUser?.id === currentUserId

  const handleUpdate = async () => {
    if (!foundUser) return

    setLoading(true)
    setMessage(null)

    const result = await setUserRole(foundUser.id, selectedRole)
    if (result.success && result.user) {
      const updated = result.user as FoundUser
      selectUser(updated)
      // Reflect the new role in the browse list too, if it's open.
      setAllUsers((prev) =>
        prev ? prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u)) : prev,
      )
      setMessage({ type: 'success', text: `Role updated to ${ROLE_BADGE[updated.role].label}` })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update role' })
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
          <Label htmlFor="adminEmail">User Email</Label>
          <Input
            id="adminEmail"
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
                  <Badge variant={ROLE_BADGE[u.role].variant} className="shrink-0">
                    {ROLE_BADGE[u.role].label}
                  </Badge>
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{foundUser.display_name || foundUser.email}</p>
              <p className="text-sm text-muted-foreground">{foundUser.email}</p>
            </div>
            <Badge variant={ROLE_BADGE[foundUser.role].variant}>
              {ROLE_BADGE[foundUser.role].label}
            </Badge>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2 flex-1 min-w-[240px]">
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as Role)}
                disabled={isSelf}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={handleUpdate}
              disabled={loading || isSelf || selectedRole === foundUser.role}
            >
              {loading ? 'Saving...' : 'Update Role'}
            </Button>
          </div>

          {isSelf && (
            <p className="text-xs text-muted-foreground">
              You can&apos;t change your own role.
            </p>
          )}
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

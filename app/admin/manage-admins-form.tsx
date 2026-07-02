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
import { findUserByEmail, setUserRole, type Role } from '@/app/actions/admin'

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
      setSelectedRole(result.user.role)
    } else {
      setMessage({ type: 'error', text: result.error || 'User not found' })
    }

    setLoading(false)
  }

  const isSelf = foundUser?.id === currentUserId

  const handleUpdate = async () => {
    if (!foundUser) return

    setLoading(true)
    setMessage(null)

    const result = await setUserRole(foundUser.id, selectedRole)
    if (result.success && result.user) {
      setFoundUser(result.user)
      setSelectedRole(result.user.role)
      setMessage({ type: 'success', text: `Role updated to ${ROLE_BADGE[result.user.role].label}` })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update role' })
    }

    setLoading(false)
  }

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
      </form>

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

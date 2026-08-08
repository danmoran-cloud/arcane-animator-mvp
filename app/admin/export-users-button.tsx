'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { listAllUsers } from '@/app/actions/admin'

// Escape a value for CSV: wrap in quotes and double any embedded quotes. Null/undefined
// become an empty field. Guards against emails/names that contain commas or quotes.
function csvCell(value: string | number | boolean | null | undefined): string {
  const s = value === null || value === undefined ? '' : String(value)
  return `"${s.replace(/"/g, '""')}"`
}

// Pull every user via the existing admin action and download an emails CSV. The
// action already enforces admin auth server-side, so this button is safe to render
// on the admin page without re-checking here.
export function ExportUsersButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setError(null)

    const result = await listAllUsers()
    if (result.error || !result.users) {
      setError(result.error || 'Failed to load users')
      setLoading(false)
      return
    }

    // Email first (the point of the export), then a few useful context columns.
    const header = ['email', 'display_name', 'role', 'token_balance', 'is_founder']
    const rows = result.users.map((u) =>
      [u.email, u.display_name, u.role, u.token_balance, u.is_founder ?? false].map(csvCell).join(','),
    )
    // Lead with a UTF-8 BOM so Excel opens accented names correctly.
    const csv = '﻿' + [header.join(','), ...rows].join('\r\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arcane-animator-users-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setLoading(false)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={handleExport} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Export Emails (CSV)
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

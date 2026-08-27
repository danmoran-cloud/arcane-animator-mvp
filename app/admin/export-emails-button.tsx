'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { exportUserEmails } from '@/app/actions/admin'

// Quote a CSV field only when it contains a comma, quote, or newline, doubling any
// embedded quotes — the standard (RFC 4180) escaping every spreadsheet understands.
function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

// Admin-only control: fetches every user's contact row and downloads it as a CSV
// (Name, Email, Joined). Runs entirely client-side once the data comes back, so
// nothing leaves the browser except the file the admin saves.
export function ExportEmailsButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    try {
      const { users, error } = await exportUserEmails()
      if (error || !users) {
        setError(error ?? 'Export failed')
        return
      }

      const header = ['Email', 'Name', 'Role', 'Balance', 'Founder', 'Joined']
      const rows = users.map((u) => [
        csvField(u.email ?? ''),
        csvField(u.display_name ?? ''),
        csvField(u.role ?? ''),
        csvField(String(u.token_balance ?? 0)),
        csvField(u.is_founder ? 'yes' : 'no'),
        csvField(new Date(u.created_at).toISOString().slice(0, 10)),
      ])
      // Prepend a BOM so Excel reads the file as UTF-8 (accented names, etc.).
      const csv = '﻿' + [header, ...rows].map((r) => r.join(',')).join('\r\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `arcane-animator-users-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" onClick={handleExport} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
        Export emails (CSV)
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

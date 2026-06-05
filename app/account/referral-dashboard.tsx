'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { buildReferralLink, buildShareMessage } from '@/lib/site-config'
import { Gift, Copy, Check, Users, Coins, Share2, Clock } from 'lucide-react'

interface ReferralDashboardProps {
  referralCode: string
  tokensEarned: number
  stats: {
    total: number
    rewarded: number
    pending: number
  }
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
function RedditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.071 2.961-.913a.33.33 0 00-.464-.464c-.541.541-1.689.726-2.494.726-.805 0-1.953-.185-2.494-.726a.326.326 0 00-.232-.093z" />
    </svg>
  )
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export function ReferralDashboard({ referralCode, tokensEarned, stats }: ReferralDashboardProps) {
  const [copied, setCopied] = useState(false)
  const referralLink = buildReferralLink(referralCode)
  const message = buildShareMessage()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareTargets = [
    {
      name: 'X',
      icon: <XIcon />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`,
    },
    {
      name: 'Reddit',
      icon: <RedditIcon />,
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(referralLink)}&title=${encodeURIComponent('Animated battle maps for your campaign')}`,
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Referral Program
        </CardTitle>
        <CardDescription>
          Share your link. When a friend signs up and makes their first purchase, you both earn 5 bonus tokens.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/50 border border-border p-3 text-center">
            <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Signed up</p>
          </div>
          <div className="rounded-lg bg-muted/50 border border-border p-3 text-center">
            <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
            <Coins className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{tokensEarned}</p>
            <p className="text-xs text-muted-foreground">Tokens earned</p>
          </div>
        </div>

        {/* Referral link */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Your referral link</p>
          <div className="flex gap-2">
            <Input readOnly value={referralLink} className="text-xs font-mono" />
            <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <Badge variant="secondary" className="font-mono">Code: {referralCode}</Badge>
        </div>

        {/* Share buttons */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium">Spread the word</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {shareTargets.map((target) => (
              <Button key={target.name} asChild variant="outline" size="sm" className="gap-2">
                <a href={target.url} target="_blank" rel="noopener noreferrer">
                  {target.icon}
                  {target.name}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

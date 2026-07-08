'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getReferralCode } from '@/app/actions/exports'
import { buildReferralLink, buildShareMessage } from '@/lib/site-config'
import { Check, Copy, Gift, Share2, Loader2 } from 'lucide-react'

interface ShareSectionProps {
  // Optional hosted URL for the exported file (Copy Link button shows only if present)
  hostedUrl?: string | null
  // Which part of the section to render. Defaults to 'all'.
  // 'referral' renders only the "Earn bonus exports" referral block.
  // 'social' renders the hosted link + social share buttons.
  section?: 'all' | 'referral' | 'social'
}

// Inline brand glyphs (lucide has no brand marks). Kept as small inline SVGs.
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
function RedditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.071 2.961-.913a.33.33 0 00-.464-.464c-.541.541-1.689.726-2.494.726-.805 0-1.953-.185-2.494-.726a.326.326 0 00-.232-.093z" />
    </svg>
  )
}
function BlueskyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M5.78 3.36c2.44 1.83 5.06 5.54 6.22 7.53 1.16-1.99 3.78-5.7 6.22-7.53 1.76-1.32 4.62-2.34 4.62.93 0 .65-.37 5.5-.6 6.28-.77 2.73-3.56 3.43-6.04 3.01 4.34.74 5.44 3.18 3.06 5.63-4.52 4.65-6.5-1.17-7-2.66-.09-.27-.14-.4-.14-.29 0-.11-.05.02-.14.29-.5 1.49-2.48 7.31-7 2.66-2.38-2.45-1.28-4.89 3.06-5.63-2.48.42-5.27-.28-6.04-3.01-.23-.78-.6-5.63-.6-6.28 0-3.27 2.86-2.25 4.62-.93z" />
    </svg>
  )
}
function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.369a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.009c.12.099.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export function ShareSection({ hostedUrl, section = 'all' }: ShareSectionProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedHosted, setCopiedHosted] = useState(false)

  useEffect(() => {
    getReferralCode().then(({ referralCode }) => {
      setReferralCode(referralCode)
      setLoading(false)
    })
  }, [])

  const referralLink = buildReferralLink(referralCode)
  const message = buildShareMessage()
  const fullText = `${message}\n\n${referralLink}`

  const shareTargets = [
    {
      name: 'X',
      icon: <XIcon />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`,
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`,
    },
    {
      name: 'Reddit',
      icon: <RedditIcon />,
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(referralLink)}&title=${encodeURIComponent('I just animated a battle map for my campaign')}`,
    },
    {
      name: 'Bluesky',
      icon: <BlueskyIcon />,
      url: `https://bsky.app/intent/compose?text=${encodeURIComponent(fullText)}`,
    },
  ]

  const handleCopyReferral = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyHosted = async () => {
    if (!hostedUrl) return
    await navigator.clipboard.writeText(hostedUrl)
    setCopiedHosted(true)
    setTimeout(() => setCopiedHosted(false), 2000)
  }

  // Discord has no web intent — copy the full message for pasting.
  const handleDiscord = async () => {
    await navigator.clipboard.writeText(fullText)
    window.open('https://discord.com/channels/@me', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-4">
      {/* Hosted file link */}
      {section !== 'referral' && hostedUrl && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Shareable link</p>
          <div className="flex gap-2">
            <Input readOnly value={hostedUrl} className="text-xs font-mono" />
            <Button variant="outline" size="icon" onClick={handleCopyHosted} className="shrink-0">
              {copiedHosted ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Share buttons */}
      {section !== 'referral' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium">Share your creation</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {shareTargets.map((target) => (
              <Button
                key={target.name}
                asChild
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <a href={target.url} target="_blank" rel="noopener noreferrer">
                  {target.icon}
                  {target.name}
                </a>
              </Button>
            ))}
            <Button variant="outline" size="sm" className="gap-2" onClick={handleDiscord}>
              <DiscordIcon />
              Discord
            </Button>
          </div>
        </div>
      )}

      {/* Referral section */}
      {section !== 'social' && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Gift className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Earn bonus exports</p>
              <p className="text-xs text-muted-foreground text-pretty">
                When a friend signs up with your link and makes their first purchase, you both get 5 bonus exports.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading your referral link...
            </div>
          ) : referralCode ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input readOnly value={referralLink} className="text-xs font-mono" />
                <Button variant="outline" size="icon" onClick={handleCopyReferral} className="shrink-0">
                  {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Badge variant="secondary" className="font-mono">
                Code: {referralCode}
              </Badge>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Sign in to get your referral link.</p>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Monitor } from 'lucide-react'
import { Logo } from '@/components/logo'
import { DiscordLink } from '@/components/discord-link'

/**
 * Full-screen advisory shown when the editor is opened on a phone/tablet. The
 * canvas editor needs a large screen, a mouse and a keyboard, so we point mobile
 * visitors to a computer and invite them to our Discord in the meantime.
 *
 * Scope this to the editor only; the marketing/pricing/legal pages read fine on
 * mobile and shouldn't be interrupted.
 */
export function MobileNotice() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ua = navigator.userAgent || ''
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)
    // Touch-first devices that don't match the UA list (e.g. iPadOS posing as
    // desktop Safari) still get caught when the viewport is narrow.
    const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false
    const smallViewport = window.innerWidth < 1024

    if (isMobileUA || (coarsePointer && smallViewport)) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 overflow-y-auto bg-background/97 px-6 py-10 text-center backdrop-blur">
      <Logo size={72} showWordmark={false} />

      <div className="flex items-center gap-2 text-primary">
        <Monitor className="h-5 w-5" />
        <h1 className="font-serif text-xl">Best on a Computer</h1>
      </div>

      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        The Arcane Animator editor is built for a desktop or laptop browser — it needs a
        larger screen, a mouse, and a keyboard to place, resize, and animate effects on
        your map. For the best experience, please open this page on a computer.
      </p>

      <div className="mt-2 flex flex-col items-center gap-3">
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          In the meantime, come hang out with the community — get updates, ask questions,
          and see what others are making.
        </p>
        <DiscordLink variant="button" label="Join us on Discord" className="px-6 py-3 text-base" />
      </div>
    </div>
  )
}

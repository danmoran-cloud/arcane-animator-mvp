'use client'

import { useEffect, useRef } from 'react'
import type { EffectSettings } from '@/lib/effects-library'
import type { ExclusionZone } from '@/lib/types'
import { getRenderer, getEffectAssets, loadAssets, prepareEffect, subscribeFrame, getQuality, clipToExclusions } from '@/lib/effects'

interface EffectCanvasProps {
  effectId: string
  settings: EffectSettings
  width: number
  height: number
  exclusions?: ExclusionZone[]
}

// Renders any registry effect via the shared draw() contract, driven by the
// SINGLE shared animation clock (lib/effects/clock.ts) rather than its own rAF
// loop — so N effect layers cost one rAF tick, all on one synced timeline, with
// adaptive quality under load. Live setting changes are read from a ref so slider
// edits apply without restarting the animation.
export function EffectCanvas({ effectId, settings, width, height, exclusions }: EffectCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const exclusionsRef = useRef(exclusions)
  exclusionsRef.current = exclusions

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderer = getRenderer(effectId)
    if (!renderer) return

    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
    canvas.width = Math.max(1, Math.round(width * dpr))
    canvas.height = Math.max(1, Math.round(height * dpr))

    let cancelled = false
    let unsubscribe = () => {}

    const drawFrame = (timeMs: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      clipToExclusions(ctx, exclusionsRef.current, { x: 0, y: 0, width, height })
      renderer.draw(effectId, {
        ctx,
        timeMs,
        bounds: { x: 0, y: 0, width, height },
        opacity: 1,
        settings: settingsRef.current,
        quality: getQuality(),
      })
      ctx.restore()
    }

    Promise.all([prepareEffect(effectId), loadAssets(getEffectAssets(effectId))]).then(() => {
      if (!cancelled) unsubscribe = subscribeFrame(drawFrame)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [effectId, width, height])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}

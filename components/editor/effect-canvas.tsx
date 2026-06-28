'use client'

import { useEffect, useRef } from 'react'
import type { EffectSettings } from '@/lib/effects-library'
import type { ExclusionZone } from '@/lib/types'
import { getRenderer, getEffectAssets, loadAssets, prepareEffect, subscribeFrame, getRenderScale, clipToExclusions } from '@/lib/effects'

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

    let cancelled = false
    let unsubscribe = () => {}

    const drawFrame = (timeMs: number) => {
      // Adapt the backing-store RESOLUTION (not the particle count) to load, so the
      // preview softens under heavy stacks but its brightness/density still matches
      // the full-resolution, full-count export. The element is CSS-sized to the
      // layer, so a smaller backing store simply upscales.
      const scale = dpr * getRenderScale()
      const bw = Math.max(1, Math.round(width * scale))
      const bh = Math.max(1, Math.round(height * scale))
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw
        canvas.height = bh
      }
      // Map the effect's logical (width × height) space onto the current backing store.
      ctx.setTransform(bw / width, 0, 0, bh / height, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      clipToExclusions(ctx, exclusionsRef.current, { x: 0, y: 0, width, height })
      renderer.draw(effectId, {
        ctx,
        timeMs,
        bounds: { x: 0, y: 0, width, height },
        opacity: 1,
        // Full particle count, identical to the exporter — count must not depend on load.
        settings: settingsRef.current,
        quality: 1,
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

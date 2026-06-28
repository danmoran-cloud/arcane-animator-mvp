'use client'

// Shared animation clock for the editor preview.
//
// Every EffectCanvas subscribes to ONE global requestAnimationFrame loop instead
// of running its own — so N effect layers cost one rAF tick, all driven by a
// single timestamp (perfectly in sync). The loop also runs an adaptive governor:
// it watches the smoothed frame time and scales a global RENDER-RESOLUTION factor
// (1 → 0.5) down under load and back up when the page is light again. EffectCanvas
// sizes its backing store by this factor, so stacking many heavy layers degrades
// by getting softer (fewer pixels to fill) rather than by THINNING PARTICLES.
//
// This matters for WYSIWYG: particle COUNT must NOT depend on load, because count
// drives additive brightness and fog density. Both the preview and the exporter
// render full particle counts (quality = 1); only the preview's pixel resolution
// flexes under load, which does not change how bright or dense an effect looks.

type Subscriber = (timeMs: number) => void

const subscribers = new Set<Subscriber>()
let rafId = 0
let running = false

let renderScale = 1
let lastTime = 0
let smoothedDelta = 16.7 // ms, EMA of frame time

const TARGET_SLOW = 24 // > ~42fps worth of frame time → reduce resolution
const TARGET_FAST = 19 // < ~52fps worth of frame time → recover resolution
const SCALE_MIN = 0.5

function tick(now: number) {
  if (lastTime) {
    const dt = now - lastTime
    // Ignore huge gaps (e.g. backgrounded tab) so the governor doesn't overreact.
    if (dt < 100) {
      smoothedDelta = smoothedDelta * 0.9 + dt * 0.1
      if (smoothedDelta > TARGET_SLOW && renderScale > SCALE_MIN) {
        renderScale = Math.max(SCALE_MIN, renderScale - 0.04)
      } else if (smoothedDelta < TARGET_FAST && renderScale < 1) {
        renderScale = Math.min(1, renderScale + 0.02)
      }
    }
  }
  lastTime = now

  // Snapshot so a subscriber unsubscribing mid-iteration is safe.
  for (const fn of [...subscribers]) {
    try {
      fn(now)
    } catch {
      // a misbehaving renderer must not kill the whole loop
    }
  }

  rafId = requestAnimationFrame(tick)
}

/** Subscribe a per-frame draw callback. Returns an unsubscribe function. */
export function subscribeFrame(fn: Subscriber): () => void {
  subscribers.add(fn)
  if (!running) {
    running = true
    lastTime = 0
    rafId = requestAnimationFrame(tick)
  }
  return () => {
    subscribers.delete(fn)
    if (subscribers.size === 0) {
      running = false
      cancelAnimationFrame(rafId)
    }
  }
}

/** Current adaptive render-resolution factor (0.5–1). EffectCanvas scales its
 *  backing-store size by this under load. Does NOT affect particle counts. */
export function getRenderScale(): number {
  return renderScale
}

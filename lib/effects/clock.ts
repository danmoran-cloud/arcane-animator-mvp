'use client'

// Shared animation clock for the editor preview.
//
// Every EffectCanvas subscribes to ONE global requestAnimationFrame loop instead
// of running its own — so N effect layers cost one rAF tick, all driven by a
// single timestamp (perfectly in sync). The loop also runs an adaptive QUALITY
// governor: it watches the smoothed frame time and scales a global quality factor
// (1 → 0.25) down under load and back up when the page is light again. Particle
// systems multiply their particle count by this factor, so stacking many heavy
// layers degrades gracefully instead of tanking the frame rate.
//
// This governor is PREVIEW-ONLY. The exporter renders offline with quality = 1,
// so exported frames are always full quality and deterministic.

type Subscriber = (timeMs: number) => void

const subscribers = new Set<Subscriber>()
let rafId = 0
let running = false

let quality = 1
let lastTime = 0
let smoothedDelta = 16.7 // ms, EMA of frame time

const TARGET_SLOW = 24 // > ~42fps worth of frame time → reduce quality
const TARGET_FAST = 19 // < ~52fps worth of frame time → recover quality
const QUALITY_MIN = 0.25

function tick(now: number) {
  if (lastTime) {
    const dt = now - lastTime
    // Ignore huge gaps (e.g. backgrounded tab) so the governor doesn't overreact.
    if (dt < 100) {
      smoothedDelta = smoothedDelta * 0.9 + dt * 0.1
      if (smoothedDelta > TARGET_SLOW && quality > QUALITY_MIN) {
        quality = Math.max(QUALITY_MIN, quality - 0.04)
      } else if (smoothedDelta < TARGET_FAST && quality < 1) {
        quality = Math.min(1, quality + 0.02)
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

/** Current adaptive quality factor (0.25–1). Particle counts scale by this in preview. */
export function getQuality(): number {
  return quality
}

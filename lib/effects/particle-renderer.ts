import type { EffectRenderer, EffectRenderContext } from './render-core'

// ===== Procedural particle renderer (Phase 3) =====
//
// Atmospheric effects rendered as PROCEDURAL particles instead of pre-baked sprite
// sheets. Every particle's position is an analytic function of absolute time + a
// fixed seed — there is NO frame-to-frame integration. That is what lets the live
// preview (real-time rAF) and the exporter (arbitrary, possibly out-of-order time
// samples) produce identical frames, and it lets the density / speed / direction /
// color / intensity sliders drive real emitter parameters.
//
// Draws with Canvas2D (fits the synchronous draw() contract with zero setup). The
// systems below are backend-agnostic; a PixiJS backend can later consume the same
// per-particle math for GPU-batched rendering, initialized via prepare().

type Settings = EffectRenderContext['settings']
type Bounds = EffectRenderContext['bounds']

// Deterministic hash → [0,1). GLSL-style fract(sin); stable across runs/machines.
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
// Particle count from the density slider, scaled by the preview quality factor
// (1 in export) so heavy scenes shed particles under load instead of stalling.
function countFrom(settings: Settings, min: number, max: number, quality: number): number {
  return Math.max(1, Math.round(lerp(min, max, (settings.density ?? 50) / 100) * quality))
}
function intensityAlpha(settings: Settings): number {
  return Math.max(0.12, (settings.intensity ?? 70) / 100)
}

// Cached soft radial "glow" sprite per color, for additive systems (embers,
// fireflies). Built lazily so the module is SSR-safe. drawImage of a pre-rendered
// gradient is far cheaper than createRadialGradient per particle per frame.
const glowCache = new Map<string, HTMLCanvasElement>()
function glowSprite(color: string): HTMLCanvasElement {
  let c = glowCache.get(color)
  if (c) return c
  const size = 64
  c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, color)
  grad.addColorStop(0.4, color)
  grad.addColorStop(1, 'transparent')
  g.fillStyle = grad
  g.beginPath()
  g.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  g.fill()
  glowCache.set(color, c)
  return c
}

interface ParticleSystem {
  draw(ctx: CanvasRenderingContext2D, bounds: Bounds, timeMs: number, opacity: number, settings: Settings, quality: number): void
}

// ── Rain: falling streaks, direction-tilted ────────────────────────────────────
const rainSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 40, 460, quality)
    const color = settings.color || '#dbeafe'
    const alpha = intensityAlpha(settings)
    const speed = lerp(0.4, 1.6, (settings.speed ?? 60) / 100)
    const rad = (((settings.direction ?? 180) - 180) * Math.PI) / 180
    const vx = Math.sin(rad)
    const vy = Math.cos(rad)

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.strokeStyle = color
    ctx.lineCap = 'round'
    ctx.lineWidth = 1.2

    const span = (H + 120) / Math.max(vy, 0.35)
    for (let i = 0; i < count; i++) {
      const rVar = hash(i * 13.7 + 5.3)
      const t01 = (hash(i * 7.13 + 1.7) + (timeMs / 1000) * speed * lerp(0.7, 1.3, rVar)) % 1
      const dist = t01 * span
      const px = bx + hash(i) * (W + 80) - 40 + vx * dist
      const py = by - 60 + vy * dist
      const len = lerp(10, 26, rVar)
      const edge = Math.max(0, Math.min(1, Math.min(t01 * 6, (1 - t01) * 6)))
      ctx.globalAlpha = opacity * alpha * edge
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(px - vx * len, py - vy * len)
      ctx.stroke()
    }
    ctx.restore()
  },
}

// ── Snow: drifting flakes with horizontal sway ─────────────────────────────────
const snowSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 30, 320, quality)
    const color = settings.color || '#ffffff'
    const alpha = intensityAlpha(settings)
    const fall = lerp(0.05, 0.28, (settings.speed ?? 30) / 100)
    const wind = (((settings.direction ?? 180) - 180) / 90) * 40
    const tSec = timeMs / 1000

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.fillStyle = color

    for (let i = 0; i < count; i++) {
      const rVar = hash(i * 13.7 + 5.3)
      const rPhase = hash(i * 7.13 + 1.7)
      const t01 = (rPhase + tSec * fall * lerp(0.6, 1.4, rVar)) % 1
      const sway = Math.sin(tSec * (0.4 + rVar) + rPhase * 6.28) * lerp(6, 22, rVar)
      const px = bx + hash(i) * W + sway + wind * t01
      const py = by + t01 * (H + 40) - 20
      const size = lerp(1.4, 4.5, hash(i * 3.1 + 9.4))
      const edge = Math.max(0, Math.min(1, Math.min(t01 * 6, (1 - t01) * 6)))
      ctx.globalAlpha = opacity * alpha * lerp(0.5, 1, rVar) * edge
      ctx.beginPath()
      ctx.arc(px, py, size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  },
}

// ── Embers: glowing sparks rising and fading (additive) ────────────────────────
const embersSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 20, 240, quality)
    const color = settings.color || '#ff7a1a'
    const alpha = intensityAlpha(settings)
    const rise = lerp(0.12, 0.5, (settings.speed ?? 45) / 100)
    const tSec = timeMs / 1000
    const sprite = glowSprite(color)

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0; i < count; i++) {
      const rVar = hash(i * 13.7 + 5.3)
      const rPhase = hash(i * 7.13 + 1.7)
      const t01 = (rPhase + tSec * rise * lerp(0.7, 1.3, rVar)) % 1
      const drift = Math.sin(tSec * (1 + rVar * 2) + rPhase * 6.28) * lerp(4, 18, rVar)
      const px = bx + hash(i) * W + drift
      const py = by + H - t01 * (H + 30) + 15
      const flicker = 0.55 + 0.45 * Math.sin(tSec * 9 + i)
      const size = lerp(2, 6, hash(i * 3.1 + 9.4)) * (1 - t01 * 0.5)
      ctx.globalAlpha = opacity * alpha * (1 - t01) * flicker
      ctx.drawImage(sprite, px - size, py - size, size * 2, size * 2)
    }
    ctx.restore()
  },
}

// ── Fog: a few large soft blobs drifting sideways ──────────────────────────────
const fogSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 3, 14, quality)
    const color = settings.color || '#cbd5e1'
    const alpha = intensityAlpha(settings) * 0.22
    const drift = lerp(0.01, 0.06, (settings.speed ?? 20) / 100)
    const tSec = timeMs / 1000
    const sprite = glowSprite(color)

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()

    for (let i = 0; i < count; i++) {
      const rPhase = hash(i * 7.13 + 1.7)
      const rSize = hash(i * 9.3 + 4.1)
      const rSpeed = hash(i * 11.1 + 7.7)
      const t = (rPhase + tSec * drift * lerp(0.6, 1.4, rSpeed)) % 1
      const px = bx + t * (W + 220) - 110
      const py = by + hash(i * 5.2 + 2.3) * H + Math.sin(tSec * 0.2 + rPhase * 6.28) * H * 0.05
      const size = lerp(0.45, 1.0, rSize) * Math.min(W, H)
      const edge = Math.max(0, Math.min(1, Math.min(t * 5, (1 - t) * 5)))
      ctx.globalAlpha = opacity * alpha * edge
      ctx.drawImage(sprite, px - size, py - size, size * 2, size * 2)
    }
    ctx.restore()
  },
}

// ── Fireflies: wandering glow dots that pulse (additive) ────────────────────────
const firefliesSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 8, 60, quality)
    const color = settings.color || '#fde047'
    const alpha = intensityAlpha(settings)
    const wander = lerp(0.05, 0.22, (settings.speed ?? 40) / 100)
    const tSec = timeMs / 1000
    const sprite = glowSprite(color)

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0; i < count; i++) {
      const rx = hash(i * 3.1 + 1.2)
      const ry = hash(i * 5.4 + 2.6)
      const fx = hash(i * 7.7 + 3.9)
      const fy = hash(i * 11.3 + 4.4)
      const rPhase = hash(i * 13.9 + 5.1)
      const t = tSec * wander
      const px = bx + (0.5 + 0.45 * Math.sin(t * (0.7 + fx) + rx * 6.28)) * W
      const py = by + (0.5 + 0.45 * Math.sin(t * (0.6 + fy) + ry * 6.28 + 1.7)) * H
      const pulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(tSec * 4 + rPhase * 6.28))
      const size = lerp(2, 4, hash(i * 2.2 + 8.1))
      ctx.globalAlpha = opacity * alpha * pulse
      ctx.drawImage(sprite, px - size, py - size, size * 2, size * 2)
    }
    ctx.restore()
  },
}

// ── Dust: tiny motes drifting with gentle Brownian-ish wander ──────────────────
const dustSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 40, 420, quality)
    const color = settings.color || '#fde68a'
    const alpha = intensityAlpha(settings) * 0.7
    const drift = lerp(0.1, 0.4, (settings.speed ?? 30) / 100)
    const tSec = timeMs / 1000

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.fillStyle = color

    for (let i = 0; i < count; i++) {
      const rx = hash(i * 3.1 + 1.2)
      const ry = hash(i * 5.4 + 2.6)
      const fx = hash(i * 7.7 + 3.9)
      const fy = hash(i * 11.3 + 4.4)
      const rPhase = hash(i * 13.9 + 5.1)
      const t = tSec * drift
      const px = bx + hash(i) * W + Math.sin(t * (0.3 + fx) + rx * 6.28) * lerp(8, 32, rx)
      const py = by + hash(i * 5.2 + 2.3) * H + Math.cos(t * (0.25 + fy) + ry * 6.28) * lerp(8, 32, ry)
      const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(tSec * 2 + rPhase * 6.28))
      const size = lerp(0.6, 2, hash(i * 2.2 + 8.1))
      ctx.globalAlpha = opacity * alpha * twinkle
      ctx.beginPath()
      ctx.arc(px, py, size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  },
}

// ── Smoke: soft plumes rising from the bottom, growing and fading ──────────────
const smokeSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 6, 34, quality)
    const color = settings.color || '#9ca3af'
    const alpha = intensityAlpha(settings) * 0.22
    const rise = lerp(0.04, 0.18, (settings.speed ?? 30) / 100)
    const tSec = timeMs / 1000
    const sprite = glowSprite(color)

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()

    for (let i = 0; i < count; i++) {
      const rLane = hash(i)
      const rPhase = hash(i * 7.13 + 1.7)
      const rSize = hash(i * 9.3 + 4.1)
      const rVar = hash(i * 11.1 + 7.7)
      const t = (rPhase + tSec * rise * lerp(0.6, 1.4, rVar)) % 1
      const px = bx + rLane * W + Math.sin(tSec * 0.3 + rPhase * 6.28) * lerp(10, 44, rSize) * t
      const py = by + H - t * (H + 60) + 30
      const size = lerp(0.16, 0.4, rSize) * Math.min(W, H) * (0.5 + t)
      const fade = Math.min(1, t * 5) * (1 - t)
      ctx.globalAlpha = opacity * alpha * fade
      ctx.drawImage(sprite, px - size, py - size, size * 2, size * 2)
    }
    ctx.restore()
  },
}

// ── Bubbles: rising rings with a wobble and a highlight ────────────────────────
const bubblesSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 10, 90, quality)
    const color = settings.color || '#a5f3fc'
    const alpha = intensityAlpha(settings)
    const rise = lerp(0.1, 0.4, (settings.speed ?? 40) / 100)
    const tSec = timeMs / 1000

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.strokeStyle = color
    ctx.lineWidth = 1.3

    for (let i = 0; i < count; i++) {
      const rLane = hash(i)
      const rPhase = hash(i * 7.13 + 1.7)
      const rVar = hash(i * 13.7 + 5.3)
      const rSize = hash(i * 3.1 + 9.4)
      const t = (rPhase + tSec * rise * lerp(0.7, 1.3, rVar)) % 1
      const wobble = Math.sin(tSec * (2 + rVar * 3) + rPhase * 6.28) * lerp(3, 12, rVar)
      const px = bx + rLane * W + wobble
      const py = by + H - t * (H + 30) + 15
      const size = lerp(2, 7, rSize)
      const fade = Math.min(1, t * 5) * (1 - t)
      ctx.globalAlpha = opacity * alpha * fade
      ctx.beginPath()
      ctx.arc(px, py, size, 0, Math.PI * 2)
      ctx.stroke()
      // small highlight
      ctx.globalAlpha = opacity * alpha * fade * 0.8
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(px - size * 0.3, py - size * 0.3, Math.max(0.6, size * 0.18), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  },
}

// ── Sparkles: twinkling additive points that flash on and off ──────────────────
const sparklesSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 20, 170, quality)
    const color = settings.color || '#ffffff'
    const alpha = intensityAlpha(settings)
    const rate = lerp(1.5, 5, (settings.speed ?? 50) / 100)
    const tSec = timeMs / 1000
    const sprite = glowSprite(color)

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0; i < count; i++) {
      const rx = hash(i * 3.1 + 1.2)
      const ry = hash(i * 5.4 + 2.6)
      const rPhase = hash(i * 13.9 + 5.1)
      const rSize = hash(i * 2.2 + 8.1)
      const px = bx + (hash(i) + Math.sin(tSec * 0.1 + rx * 6.28) * 0.02) * W
      const py = by + (hash(i * 5.2 + 2.3) + Math.cos(tSec * 0.1 + ry * 6.28) * 0.02) * H
      // Sharp on/off twinkle via cubed sine.
      const tw = Math.pow(0.5 + 0.5 * Math.sin(tSec * rate * (0.6 + rSize) + rPhase * 6.28), 3)
      const size = lerp(1.5, 4.5, rSize) * (0.4 + tw)
      ctx.globalAlpha = opacity * alpha * tw
      ctx.drawImage(sprite, px - size, py - size, size * 2, size * 2)
    }
    ctx.restore()
  },
}

const SYSTEMS: Record<string, ParticleSystem> = {
  'particle-rain': rainSystem,
  'particle-snow': snowSystem,
  'particle-embers': embersSystem,
  'particle-fog': fogSystem,
  'particle-fireflies': firefliesSystem,
  'particle-dust': dustSystem,
  'particle-smoke': smokeSystem,
  'particle-bubbles': bubblesSystem,
  'particle-sparkles': sparklesSystem,
}

export const particleRenderer: EffectRenderer = {
  id: 'particles',
  match: (effectId) => effectId in SYSTEMS,
  draw(effectId, { ctx, timeMs, bounds, opacity, settings, quality }) {
    SYSTEMS[effectId]?.draw(ctx, bounds, timeMs, opacity, settings, quality ?? 1)
  },
}

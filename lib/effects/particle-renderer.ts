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
// Shared "view from the sky" perspective for the top-down effects. A particle has a
// ground target (gx,gy — absolute px within the box) and a height z in [0,1] (1 = high
// up near the overhead camera, 0 = resting on the map). Particles higher up are pushed
// farther from the frame centre and render larger — radial parallax toward the
// vanishing point directly below the camera — so the eye reads vertical motion: things
// falling toward, or rising away from, the ground below you.
const SKY_PARALLAX = 0.9
function skyProject(cx: number, cy: number, gx: number, gy: number, z: number) {
  const m = 1 + z * SKY_PARALLAX
  return { x: cx + (gx - cx) * m, y: cy + (gy - cy) * m, depth: 0.4 + z }
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

// ── Top-down rain: drops falling toward the map, seen from the sky ─────────────
// Each drop falls from high (z=1) to the ground (z=0). skyProject() streaks it
// inward toward the vanishing point and shrinks it as it drops, so you read real
// vertical motion from above; it then bursts into a small impact ripple where it
// lands. See skyProject() for the shared perspective model.
const rainTopSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 30, 300, quality)
    const color = settings.color || '#bfdbfe'
    const alpha = intensityAlpha(settings)
    const rate = lerp(0.5, 1.8, (settings.speed ?? 60) / 100)
    const tSec = timeMs / 1000
    const cx = bx + W / 2
    const cy = by + H / 2
    // Splash ripple radius kept small (~20% of the original) so impacts read as
    // tight pinpricks rather than large rings.
    const maxRipple = Math.min(W, H) * 0.01 + 1.2
    const FALL = 0.78 // fraction of the cycle spent falling; the rest is the splash

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineCap = 'round'

    for (let i = 0; i < count; i++) {
      const rVar = hash(i * 7.3 + 2.2)
      const rPhase = hash(i * 5.1 + 0.7)
      const gx = bx + hash(i * 1.7 + 0.3) * W
      const gy = by + hash(i * 3.9 + 1.1) * H
      const prog = (rPhase + tSec * rate * lerp(0.7, 1.3, rVar)) % 1

      if (prog < FALL) {
        // Falling: z accelerates toward the ground (1 - u² ≈ gravity). Radial
        // parallax + shrink make the drop read as plunging toward the map below.
        const u = prog / FALL
        const z = 1 - u * u
        const here = skyProject(cx, cy, gx, gy, z)
        const tail = skyProject(cx, cy, gx, gy, Math.min(1, z + 0.07 + 0.06 * rVar))
        const appear = Math.min(1, u * 8)
        ctx.lineWidth = lerp(0.7, 1.7, rVar) * here.depth
        ctx.globalAlpha = opacity * alpha * appear * (0.45 + 0.55 * z)
        ctx.beginPath()
        ctx.moveTo(here.x, here.y)
        ctx.lineTo(tail.x, tail.y)
        ctx.stroke()
        // bright head
        ctx.globalAlpha = opacity * alpha * appear
        ctx.beginPath()
        ctx.arc(here.x, here.y, lerp(0.5, 1.4, rVar) * here.depth, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Impact ripple at the landing point.
        const t = (prog - FALL) / (1 - FALL)
        const r = t * maxRipple + 0.3
        const fade = 1 - t
        ctx.lineWidth = 1.1
        ctx.globalAlpha = opacity * alpha * fade * 0.9
        ctx.beginPath()
        ctx.arc(gx, gy, r, 0, Math.PI * 2)
        ctx.stroke()
        if (t > 0.35) {
          ctx.globalAlpha = opacity * alpha * fade * 0.4
          ctx.beginPath()
          ctx.arc(gx, gy, r * 0.55, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }
    ctx.restore()
  },
}

// ── Top-down snow: flakes settling toward the map, seen from the sky ───────────
// Same overhead perspective as the rain: each flake falls from z=1 to z=0, pushed
// inward + shrinking via skyProject(), with a gentle lateral sway and a soft fade
// in/out at the top and bottom of the fall so it loops without popping.
const snowTopSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 30, 320, quality)
    const color = settings.color || '#ffffff'
    const alpha = intensityAlpha(settings)
    const rate = lerp(0.05, 0.22, (settings.speed ?? 30) / 100)
    const tSec = timeMs / 1000
    const cx = bx + W / 2
    const cy = by + H / 2

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.fillStyle = color

    for (let i = 0; i < count; i++) {
      const rVar = hash(i * 13.7 + 5.3)
      const rPhase = hash(i * 7.13 + 1.7)
      const prog = (rPhase + tSec * rate * lerp(0.6, 1.4, rVar)) % 1
      const z = 1 - prog
      const sway = Math.sin(tSec * (0.5 + rVar) + rPhase * 6.28) * lerp(4, 16, rVar)
      const gx = bx + hash(i) * W + sway
      const gy = by + hash(i * 3.9 + 1.1) * H
      const p = skyProject(cx, cy, gx, gy, z)
      const size = lerp(0.8, 3.2, hash(i * 3.1 + 9.4)) * p.depth
      const edge = Math.min(1, prog * 6) * Math.min(1, (1 - prog) * 6)
      const twinkle = 0.7 + 0.3 * Math.sin(tSec * 1.5 + rPhase * 6.28)
      ctx.globalAlpha = opacity * alpha * lerp(0.45, 1, rVar) * edge * twinkle
      ctx.beginPath()
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  },
}

// ── Top-down leaves: autumn leaves spiralling down to the ground, seen from above ─
// Leaves fall from z=1 to z=0 (skyProject inward + shrink) while spinning and
// flipping edge-on (the vertical squash). Per-leaf autumn tints keep the litter
// from reading as one flat colour; a soft fade in/out hides the loop seam.
const leavesTopSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 14, 140, quality)
    const baseColor = settings.color || '#c2410c'
    const alpha = intensityAlpha(settings)
    const rate = lerp(0.04, 0.18, (settings.speed ?? 40) / 100)
    const tSec = timeMs / 1000
    const cx = bx + W / 2
    const cy = by + H / 2
    const palette = ['#b45309', '#c2410c', '#a16207', '#9a3412', baseColor]

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()

    for (let i = 0; i < count; i++) {
      const rVar = hash(i * 13.7 + 5.3)
      const rPhase = hash(i * 7.13 + 1.7)
      const prog = (rPhase + tSec * rate * lerp(0.6, 1.4, rVar)) % 1
      const z = 1 - prog
      const sway = Math.sin(tSec * (0.4 + rVar) + rPhase * 6.28) * lerp(6, 20, rVar)
      const gx = bx + hash(i) * W + sway
      const gy = by + hash(i * 3.9 + 1.1) * H
      const p = skyProject(cx, cy, gx, gy, z)
      const spin = tSec * lerp(0.6, 2.4, rVar) * (rVar > 0.5 ? 1 : -1) + rPhase * 6.28
      const tumble = Math.abs(Math.sin(tSec * (1 + rVar * 1.5) + rPhase * 6.28))
      const len = lerp(4, 9, hash(i * 3.1 + 9.4)) * p.depth
      const edge = Math.min(1, prog * 6) * Math.min(1, (1 - prog) * 6)
      const a = opacity * alpha * (0.4 + 0.6 * tumble) * edge

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(spin)
      ctx.scale(1, 0.35 + 0.65 * tumble)
      ctx.globalAlpha = a
      ctx.fillStyle = palette[i % palette.length]
      ctx.beginPath()
      ctx.moveTo(0, -len)
      ctx.quadraticCurveTo(len * 0.7, 0, 0, len)
      ctx.quadraticCurveTo(-len * 0.7, 0, 0, -len)
      ctx.fill()
      ctx.globalAlpha = a * 0.5
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'
      ctx.lineWidth = 0.7
      ctx.beginPath()
      ctx.moveTo(0, -len)
      ctx.lineTo(0, len)
      ctx.stroke()
      ctx.restore()
    }
    ctx.restore()
  },
}

// ── Top-down embers: sparks rising toward the sky camera (additive) ────────────
// The inverse of the falling effects: embers start on the ground (z=0) and rise
// toward you (z=1), drifting outward and growing via skyProject() as they near the
// camera, flickering, then burning out before they reach the top.
const embersTopSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 20, 240, quality)
    const color = settings.color || '#ff7a1a'
    const alpha = intensityAlpha(settings)
    const rate = lerp(0.06, 0.24, (settings.speed ?? 45) / 100)
    const tSec = timeMs / 1000
    const cx = bx + W / 2
    const cy = by + H / 2
    const sprite = glowSprite(color)

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0; i < count; i++) {
      const rVar = hash(i * 13.7 + 5.3)
      const rPhase = hash(i * 7.13 + 1.7)
      const prog = (rPhase + tSec * rate * lerp(0.7, 1.3, rVar)) % 1
      const z = prog // rise toward the camera
      const sway = Math.sin(tSec * (0.8 + rVar) + rPhase * 6.28) * lerp(4, 14, rVar)
      const gx = bx + hash(i) * W + sway
      const gy = by + hash(i * 3.9 + 1.1) * H
      const p = skyProject(cx, cy, gx, gy, z)
      const flicker = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(tSec * (5 + rVar * 6) + i), 2)
      const edge = Math.min(1, prog * 6) * (1 - prog) // fade in fast, burn out near the top
      const size = lerp(1.2, 4, hash(i * 3.1 + 9.4)) * p.depth
      ctx.globalAlpha = opacity * alpha * flicker * edge
      ctx.drawImage(sprite, p.x - size, p.y - size, size * 2, size * 2)
    }
    ctx.restore()
  },
}

// ===== Light Source pack — procedural glow / star / sparkle systems =====
// These replace the sprite-sheet versions of the radial light effects with crisp,
// scalable, fully colour/speed/intensity-controllable particle renders. All are
// additive and centred on the layer.

function glowAmount(settings: Settings): number {
  return (settings.glowIntensity ?? 80) / 100
}

// ── Glowing orb: a steady warm light that breathes, with a bright core + motes ──
const glowingOrbSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const color = settings.color || '#facc15'
    const alpha = intensityAlpha(settings)
    const glow = glowAmount(settings)
    const tSec = timeMs / 1000
    const cx = bx + W / 2, cy = by + H / 2
    const R = Math.min(W, H) * 0.46
    const sprite = glowSprite(color)
    const breathe = 0.85 + 0.15 * Math.sin(tSec * lerp(0.8, 2.4, (settings.speed ?? 35) / 100))

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    // Soft outer halo.
    const s1 = R * breathe
    ctx.globalAlpha = opacity * alpha * 0.5 * glow
    ctx.drawImage(sprite, cx - s1, cy - s1, s1 * 2, s1 * 2)
    // Bright core.
    const s2 = R * 0.34 * (0.9 + 0.1 * Math.sin(tSec * 2.2))
    ctx.globalAlpha = opacity * alpha * 0.9
    ctx.drawImage(sprite, cx - s2, cy - s2, s2 * 2, s2 * 2)
    // A few slowly orbiting motes.
    const count = countFrom(settings, 4, 16, quality)
    for (let i = 0; i < count; i++) {
      const rPhase = hash(i * 5.1 + 0.7)
      const rad = lerp(0.3, 0.85, hash(i * 3.1 + 1.2)) * R
      const ang = tSec * lerp(0.2, 0.6, hash(i * 7.7 + 2.2)) * (hash(i) > 0.5 ? 1 : -1) + rPhase * 6.28
      const px = cx + Math.cos(ang) * rad, py = cy + Math.sin(ang) * rad
      const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(tSec * 3 + rPhase * 6.28))
      const sz = lerp(2, 5, hash(i * 2.2 + 8.1)) * tw
      ctx.globalAlpha = opacity * alpha * tw * 0.75
      ctx.drawImage(sprite, px - sz, py - sz, sz * 2, sz * 2)
    }
    ctx.restore()
  },
}

// Shared lens-flare "star" (N evenly spaced rays + a bright core glow).
function drawStar(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, color: string,
  sprite: HTMLCanvasElement, rays: number, len: number, lineW: number, spin: number,
  rayAlpha: number, coreScale: number, coreAlpha: number,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(spin)
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  for (let k = 0; k < rays; k++) {
    ctx.rotate((2 * Math.PI) / rays)
    const l = k % 2 === 0 ? len : len * 0.6
    ctx.lineWidth = k % 2 === 0 ? lineW : lineW * 0.6
    ctx.globalAlpha = rayAlpha * (k % 2 === 0 ? 1 : 0.55)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -l)
    ctx.stroke()
  }
  const cs = R * coreScale
  ctx.globalAlpha = coreAlpha
  ctx.drawImage(sprite, -cs, -cs, cs * 2, cs * 2)
  ctx.restore()
}

// ── Soft star glow: diffuse halo + a gentle 4/8-point flare that slowly turns ──
const softStarGlowSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const color = settings.color || '#fde68a'
    const alpha = intensityAlpha(settings)
    const glow = glowAmount(settings)
    const tSec = timeMs / 1000
    const cx = bx + W / 2, cy = by + H / 2
    const R = Math.min(W, H) * 0.46
    const sprite = glowSprite(color)
    const tw = 0.85 + 0.15 * Math.sin(tSec * lerp(0.6, 1.8, (settings.speed ?? 35) / 100))

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = opacity * alpha * 0.5 * glow
    ctx.drawImage(sprite, cx - R, cy - R, R * 2, R * 2)
    drawStar(ctx, cx, cy, R, color, sprite, 8, R * 1.05 * tw, 2, tSec * 0.15,
      opacity * alpha * 0.6 * tw, 0.3, opacity * alpha * 0.9)
    ctx.restore()
  },
}

// ── Radiant starburst: bright pulsing star with many rotating rays ─────────────
const radiantStarburstSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const color = settings.color || '#fde047'
    const alpha = intensityAlpha(settings)
    const glow = glowAmount(settings)
    const tSec = timeMs / 1000
    const cx = bx + W / 2, cy = by + H / 2
    const R = Math.min(W, H) * 0.46
    const sprite = glowSprite(color)
    const spd = (settings.speed ?? 45) / 100
    const pulse = 0.8 + 0.2 * Math.sin(tSec * lerp(1.5, 5, spd))

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = opacity * alpha * 0.5 * glow * pulse
    ctx.drawImage(sprite, cx - R * 0.9, cy - R * 0.9, R * 1.8, R * 1.8)
    drawStar(ctx, cx, cy, R, color, sprite, 16, R * pulse, 3, tSec * lerp(0.2, 0.8, spd),
      opacity * alpha * 0.6, 0.28 * pulse, opacity * alpha)
    ctx.restore()
  },
}

// ── Sparkle starburst: central glow surrounded by hard-twinkling sparkles ───────
const sparkleStarburstSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const color = settings.color || '#fbbf24'
    const alpha = intensityAlpha(settings)
    const rate = lerp(2, 6, (settings.speed ?? 50) / 100)
    const tSec = timeMs / 1000
    const cx = bx + W / 2, cy = by + H / 2
    const R = Math.min(W, H) * 0.46
    const sprite = glowSprite(color)
    const count = countFrom(settings, 16, 90, quality)

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    // Central glow.
    const cs = R * 0.3 * (0.9 + 0.1 * Math.sin(tSec * 3))
    ctx.globalAlpha = opacity * alpha * 0.6 * glowAmount(settings)
    ctx.drawImage(sprite, cx - cs, cy - cs, cs * 2, cs * 2)
    // Twinkling sparkles spread over the disc (sqrt for uniform density).
    for (let i = 0; i < count; i++) {
      const ang = hash(i * 3.1 + 1.2) * 6.28
      const rad = Math.sqrt(hash(i * 5.4 + 2.6)) * R
      const rPhase = hash(i * 13.9 + 5.1), rSize = hash(i * 2.2 + 8.1)
      const px = cx + Math.cos(ang) * rad, py = cy + Math.sin(ang) * rad
      const twk = Math.pow(0.5 + 0.5 * Math.sin(tSec * rate * (0.6 + rSize) + rPhase * 6.28), 3)
      const sz = lerp(1.5, 4.5, rSize) * (0.4 + twk)
      ctx.globalAlpha = opacity * alpha * twk
      ctx.drawImage(sprite, px - sz, py - sz, sz * 2, sz * 2)
    }
    ctx.restore()
  },
}

// ── Sparkler burst: a firework fountain — sparks streak outward and crackle out ─
const sparklerBurstSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const color = settings.color || '#fff0b0'
    const alpha = intensityAlpha(settings)
    const rate = lerp(0.8, 2.2, (settings.speed ?? 60) / 100)
    const tSec = timeMs / 1000
    const cx = bx + W / 2, cy = by + H / 2
    const R = Math.min(W, H) * 0.48
    const count = countFrom(settings, 40, 200, quality)

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineCap = 'round'
    for (let i = 0; i < count; i++) {
      const rAng = hash(i * 1.7 + 0.3), rVar = hash(i * 7.3 + 2.2), rPhase = hash(i * 5.1 + 0.7)
      const prog = (rPhase + tSec * rate * lerp(0.7, 1.4, rVar)) % 1
      const ang = rAng * 6.28 + Math.sin(tSec * 2 + i) * 0.05
      const dist = prog * R
      const px = cx + Math.cos(ang) * dist, py = cy + Math.sin(ang) * dist
      const fade = 1 - prog
      const crackle = 0.5 + 0.5 * Math.sin(tSec * 30 + i * 3.3)
      const tail = Math.max(0, dist - lerp(4, 12, rVar))
      const tx = cx + Math.cos(ang) * tail, ty = cy + Math.sin(ang) * tail
      ctx.globalAlpha = opacity * alpha * fade * crackle
      ctx.lineWidth = lerp(0.6, 1.6, rVar)
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(tx, ty)
      ctx.stroke()
      ctx.globalAlpha = opacity * alpha * fade * (0.6 + 0.4 * crackle)
      ctx.beginPath()
      ctx.arc(px, py, lerp(0.6, 1.6, rVar), 0, Math.PI * 2)
      ctx.fill()
    }
    // Bright burning centre.
    const sprite = glowSprite(color)
    const cs = R * 0.12
    ctx.globalAlpha = opacity * alpha * 0.9
    ctx.drawImage(sprite, cx - cs, cy - cs, cs * 2, cs * 2)
    ctx.restore()
  },
}

// ===== Water pack — flowing current + caustic light web =====

// ── Flowing water: highlight streaks riding a closed-form flow field ────────────
// A current of additive highlight streaks advected along the `direction` axis. The
// flow field is STATIC (sampled, never integrated), so the live preview and the
// exporter agree frame-for-frame. Each streak lives in flow-space (u along the
// current, v across it): u cycles over the box diagonal L and wraps so the whole
// field drifts seamlessly at any angle; a per-streak sine meander on v gives the
// water its curling, braided look. A bright `color` highlight rides over a softer,
// wider `secondaryColor` body; fully additive.
const waterFlowSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const count = countFrom(settings, 90, 700, quality)
    const color = settings.color || '#bae6fd'
    const body = settings.secondaryColor || '#38bdf8'
    const alpha = intensityAlpha(settings)
    const glow = (settings.glowIntensity ?? 60) / 100
    const speed = lerp(0.05, 0.3, (settings.speed ?? 50) / 100)
    const tSec = timeMs / 1000
    const rad = ((settings.direction ?? 90) * Math.PI) / 180
    const fdx = Math.cos(rad), fdy = Math.sin(rad)   // flow axis
    const pdx = -fdy, pdy = fdx                       // perpendicular axis
    const cx = bx + W / 2, cy = by + H / 2
    const L = Math.hypot(W, H) + 80                   // covers the box at any angle

    const SEG = 7 // segments per streamline — enough to read as a smooth curve

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // A streamline is a short curve traced back along the flow axis; the lateral
    // meander is sampled at each point *along* its length so the line bends with the
    // current instead of staying a straight dash. Tracing the same closed-form curve
    // helper for both the wide body and the bright core keeps them registered.
    const trace = (u0: number, vBase: number, rVar: number, rPhase: number, lenU: number) => {
      ctx.beginPath()
      for (let s = 0; s <= SEG; s++) {
        const uu = u0 - (s / SEG) * lenU
        const mv = Math.sin(uu * 0.02 + vBase * 0.02 + tSec * (0.5 + rVar) + rPhase * 6.28) * lerp(6, 20, rVar)
        const v = vBase + mv
        const px = cx + fdx * uu + pdx * v
        const py = cy + fdy * uu + pdy * v
        if (s === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
    }

    for (let i = 0; i < count; i++) {
      const rVar = hash(i * 13.7 + 5.3)
      const rPhase = hash(i * 7.13 + 1.7)
      const u0 = ((hash(i) + tSec * speed * lerp(0.7, 1.3, rVar)) % 1) * L - L / 2
      const vBase = (hash(i * 3.9 + 1.1) - 0.5) * L
      const lenU = lerp(20, 52, rVar) * (0.7 + glow * 0.6)
      // Edge fade hides the wrap where the streamline enters/leaves at u = ±L/2.
      const edge = Math.max(0, Math.min(1, Math.min((u0 + L / 2) / 50, (L / 2 - u0 + lenU) / 50)))
      if (edge <= 0) continue
      // Soft, wide translucent body — many of these overlap into a flowing sheet.
      ctx.strokeStyle = body
      ctx.lineWidth = lerp(2, 4.5, rVar)
      ctx.globalAlpha = opacity * alpha * edge * 0.22
      trace(u0, vBase, rVar, rPhase, lenU)
      ctx.stroke()
      // Bright thin highlight riding the same curve.
      ctx.strokeStyle = color
      ctx.lineWidth = lerp(0.6, 1.5, rVar)
      ctx.globalAlpha = opacity * alpha * edge * (0.45 + 0.45 * rVar)
      trace(u0, vBase, rVar, rPhase, lenU * 0.85)
      ctx.stroke()
    }
    ctx.restore()
  },
}

// ── Caustics: rippling underwater light web from a closed-form interference field ─
// The bright filaments are the ridges of a sum-of-sines wave field sampled on a grid
// and splatted as additive glow blobs; raising the field to a power sharpens those
// ridges into the characteristic caustic webbing. Everything is an analytic function
// of absolute time, so it loops and matches between preview and export. density sets
// the grid fineness (eased down by the preview quality factor), speed the ripple
// rate, intensity the contrast, glowIntensity the brightness.
const causticsSystem: ParticleSystem = {
  draw(ctx, b, timeMs, opacity, settings, quality) {
    const { x: bx, y: by, width: W, height: H } = b
    const color = settings.color || '#7dd3fc'
    const tint = settings.secondaryColor || '#e0f2fe'
    const alpha = intensityAlpha(settings)
    const glow = (settings.glowIntensity ?? 70) / 100
    const tSec = (timeMs / 1000) * lerp(0.3, 1.2, (settings.speed ?? 45) / 100)
    const sharp = lerp(2.5, 5.5, (settings.intensity ?? 80) / 100)
    const dens = (settings.density ?? 55) / 100
    // Derive the grid step from a roughly FIXED cell budget rather than the layer
    // size, so a large or high-resolution layer can't explode the per-frame cost.
    // (That cost is what previously made caustics heavy enough to starve the
    // real-time exporter.) Preview quality shrinks the budget further under load.
    const targetCells = lerp(200, 560, dens) * (quality || 1)
    const step = Math.max(6, Math.sqrt((W * H) / targetCells))
    const a = lerp(0.05, 0.12, dens) / (settings.scale || 1)
    const sprite = glowSprite(color)
    const sprite2 = glowSprite(tint)

    ctx.save()
    ctx.beginPath()
    ctx.rect(bx, by, W, H)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'

    for (let gx = bx; gx <= bx + W; gx += step) {
      for (let gy = by; gy <= by + H; gy += step) {
        // Jitter the sample point so the grid never reads as straight rows.
        const jx = gx + Math.sin(gy * 0.05 + tSec) * step * 0.3
        const jy = gy + Math.cos(gx * 0.05 - tSec) * step * 0.3
        const n =
          Math.sin(jx * a + tSec) +
          Math.sin(jy * a * 1.1 - tSec * 0.9) +
          Math.sin((jx + jy) * a * 0.7 + tSec * 1.2) +
          Math.sin((jx - jy) * a * 0.9 - tSec * 0.7)
        const vv = n / 4
        if (vv <= 0) continue
        const bright = Math.pow(vv, sharp)
        if (bright < 0.05) continue // skip near-dark cells — saves draws on heavy frames
        const size = step * lerp(0.5, 1.3, bright)
        ctx.globalAlpha = opacity * alpha * glow * bright
        ctx.drawImage(sprite, jx - size, jy - size, size * 2, size * 2)
        // Brightest crests get a cool-white core for sparkle.
        if (bright > 0.5) {
          const s2 = size * 0.5
          ctx.globalAlpha = opacity * alpha * (bright - 0.5) * 1.4
          ctx.drawImage(sprite2, jx - s2, jy - s2, s2 * 2, s2 * 2)
        }
      }
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
  'particle-rain-top': rainTopSystem,
  'particle-snow-top': snowTopSystem,
  'particle-leaves-top': leavesTopSystem,
  'particle-embers-top': embersTopSystem,
  'particle-water-flow': waterFlowSystem,
  'particle-caustics': causticsSystem,
  // Light Source pack — procedural replacements for the radial glow/star sprites.
  'lightsource-glowing-orb': glowingOrbSystem,
  'lightsource-soft-star-glow': softStarGlowSystem,
  'lightsource-radiant-starburst': radiantStarburstSystem,
  'lightsource-sparkle-starburst': sparkleStarburstSystem,
  'lightsource-sparkler-burst': sparklerBurstSystem,
}

export const particleRenderer: EffectRenderer = {
  id: 'particles',
  match: (effectId) => effectId in SYSTEMS,
  draw(effectId, { ctx, timeMs, bounds, opacity, settings, quality }) {
    SYSTEMS[effectId]?.draw(ctx, bounds, timeMs, opacity, settings, quality ?? 1)
  },
}

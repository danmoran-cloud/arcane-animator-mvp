import type { EffectRenderer, EffectRenderContext } from './render-core'

// ===== Procedural vector renderer (Phase 4) =====
//
// Magic circles and portals drawn as VECTOR paths on the canvas instead of
// pre-baked sprite sheets. Like the particle renderer, every frame is an analytic
// function of absolute time (rotations = time * rate), so the live preview and the
// exporter render identical frames, and the color / speed / intensity / glow
// sliders drive the look directly. Vector art is crisp at any resolution,
// recolorable, tiny, and loops perfectly — the goals "Lottie magic circles" aimed
// for, with no runtime dependency or external animation files.

type Settings = EffectRenderContext['settings']
type Bounds = EffectRenderContext['bounds']

const TAU = Math.PI * 2

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// ── Drawing primitives (all centered at the current transform origin) ──────────
function ring(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, TAU)
  ctx.stroke()
}

function regularPolygon(ctx: CanvasRenderingContext2D, r: number, sides: number, rot: number) {
  ctx.beginPath()
  for (let i = 0; i <= sides; i++) {
    const a = rot + (i / sides) * TAU - Math.PI / 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()
}

// Star polygon {n/k}: connect every k-th of n points. (gcd(n,k)=1 visits all.)
function starPolygon(ctx: CanvasRenderingContext2D, r: number, n: number, k: number, rot: number) {
  ctx.beginPath()
  let idx = 0
  for (let i = 0; i <= n; i++) {
    const a = rot + (idx / n) * TAU - Math.PI / 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
    idx = (idx + k) % n
  }
  ctx.closePath()
  ctx.stroke()
}

// Ring of small runic glyphs facing outward.
function runeRing(ctx: CanvasRenderingContext2D, r: number, count: number, rot: number, size: number) {
  for (let i = 0; i < count; i++) {
    const a = rot + (i / count) * TAU
    ctx.save()
    ctx.translate(Math.cos(a) * r, Math.sin(a) * r)
    ctx.rotate(a + Math.PI / 2)
    const seed = hash(i * 2.3 + 1.1)
    ctx.beginPath()
    ctx.moveTo(0, -size)
    ctx.lineTo(0, size)
    // one or two crossbars, varied per glyph
    const bars = seed > 0.5 ? 2 : 1
    for (let b = 0; b < bars; b++) {
      const yy = -size + ((b + 1) * size * 2) / (bars + 1)
      const w = size * (0.4 + hash(i * 5.7 + b) * 0.5)
      ctx.moveTo(-w, yy)
      ctx.lineTo(w, yy)
    }
    ctx.stroke()
    ctx.restore()
  }
}

// Short tick marks around a ring.
function tickRing(ctx: CanvasRenderingContext2D, r: number, count: number, rot: number, len: number) {
  for (let i = 0; i < count; i++) {
    const a = rot + (i / count) * TAU
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    ctx.lineTo(Math.cos(a) * (r + len), Math.sin(a) * (r + len))
    ctx.stroke()
  }
}

interface VectorSystem {
  draw(ctx: CanvasRenderingContext2D, bounds: Bounds, timeMs: number, opacity: number, settings: Settings): void
}

// ── Magic circle: concentric counter-rotating rings + a star + runes ───────────
interface CircleSpec {
  star?: { n: number; k: number } // star polygon
  hexagram?: boolean // two triangles (Star of David)
  innerPolygon?: number // sides of a small inner polygon
  runes?: number // rune count on the rune ring
  ticks?: number // tick count on the outer ring
  defaultColor: string
}

function makeMagicCircle(spec: CircleSpec): VectorSystem {
  return {
    draw(ctx, b, timeMs, opacity, settings) {
      const cx = b.x + b.width / 2
      const cy = b.y + b.height / 2
      const R = (Math.min(b.width, b.height) / 2) * 0.92
      const color = settings.color || spec.defaultColor
      const alpha = opacity * Math.max(0.3, (settings.intensity ?? 85) / 100)
      const glow = (settings.glowIntensity ?? 80) / 100
      const spin = ((settings.speed ?? 35) / 100) * (timeMs / 1000) * 0.6

      ctx.save()
      ctx.translate(cx, cy)
      ctx.globalAlpha = alpha
      ctx.strokeStyle = color
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      if (glow > 0) {
        ctx.shadowColor = color
        ctx.shadowBlur = 14 * glow
      }

      // Outer ring + ticks (slow CW)
      ctx.lineWidth = R * 0.012
      ring(ctx, R)
      if (spec.ticks) {
        ctx.lineWidth = R * 0.018
        tickRing(ctx, R, spec.ticks, spin, R * 0.05)
      }

      // Rune ring (CCW)
      const runeR = R * 0.8
      ctx.lineWidth = R * 0.01
      ring(ctx, runeR)
      if (spec.runes) runeRing(ctx, runeR * 0.92, spec.runes, -spin * 1.4, R * 0.05)

      // Mid ring
      ctx.lineWidth = R * 0.012
      ring(ctx, R * 0.62)

      // Star / hexagram (CW, faster)
      ctx.lineWidth = R * 0.016
      const starR = R * 0.6
      if (spec.hexagram) {
        regularPolygon(ctx, starR, 3, spin * 1.6)
        regularPolygon(ctx, starR, 3, spin * 1.6 + Math.PI / 3)
      } else if (spec.star) {
        starPolygon(ctx, starR, spec.star.n, spec.star.k, spin * 1.6)
      }

      // Inner polygon + dot
      if (spec.innerPolygon) {
        ctx.lineWidth = R * 0.012
        regularPolygon(ctx, R * 0.28, spec.innerPolygon, -spin * 2)
      }
      ctx.beginPath()
      ctx.arc(0, 0, R * 0.05, 0, TAU)
      ctx.fillStyle = color
      ctx.fill()

      ctx.restore()
    },
  }
}

// ── Portal: swirling spiral arms + glowing rim + dark core ─────────────────────
function makePortal(defaultColor: string, defaultSecondary: string, flicker: boolean): VectorSystem {
  return {
    draw(ctx, b, timeMs, opacity, settings) {
      const cx = b.x + b.width / 2
      const cy = b.y + b.height / 2
      const R = (Math.min(b.width, b.height) / 2) * 0.9
      const color = settings.color || defaultColor
      const sec = settings.secondaryColor || defaultSecondary
      const baseAlpha = opacity * Math.max(0.3, (settings.intensity ?? 90) / 100)
      const glow = (settings.glowIntensity ?? 90) / 100
      const tSec = timeMs / 1000
      const spin = ((settings.speed ?? 50) / 100) * tSec * 1.4
      const flick = flicker ? 0.8 + 0.2 * Math.sin(tSec * 18) : 1

      ctx.save()
      ctx.translate(cx, cy)
      ctx.globalCompositeOperation = 'lighter'
      if (glow > 0) {
        ctx.shadowColor = color
        ctx.shadowBlur = 18 * glow
      }

      // Swirling arms (spiral paths)
      const arms = 5
      ctx.lineCap = 'round'
      for (let a = 0; a < arms; a++) {
        const base = (a / arms) * TAU + spin
        ctx.globalAlpha = baseAlpha * 0.7 * flick
        ctx.strokeStyle = a % 2 ? sec : color
        ctx.lineWidth = R * 0.04
        ctx.beginPath()
        for (let s = 0; s <= 1; s += 0.04) {
          const ang = base + s * Math.PI * 1.6
          const rr = R * (0.16 + s * 0.82)
          const x = Math.cos(ang) * rr
          const y = Math.sin(ang) * rr
          if (s === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // Glowing rim
      ctx.globalAlpha = baseAlpha * flick
      ctx.strokeStyle = sec
      ctx.lineWidth = R * 0.05
      ctx.beginPath()
      ctx.arc(0, 0, R * 0.98, 0, TAU)
      ctx.stroke()

      // Bright inner ring
      ctx.globalAlpha = baseAlpha * 0.8 * flick
      ctx.lineWidth = R * 0.03
      ctx.beginPath()
      ctx.arc(0, 0, R * 0.5, spin * 2, spin * 2 + Math.PI * 1.5)
      ctx.stroke()

      // Dark core (occludes the additive swirl center)
      ctx.globalCompositeOperation = 'source-over'
      ctx.shadowBlur = 0
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.4)
      core.addColorStop(0, 'rgba(6,6,12,0.95)')
      core.addColorStop(0.7, 'rgba(6,6,12,0.5)')
      core.addColorStop(1, 'transparent')
      ctx.globalAlpha = baseAlpha
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.arc(0, 0, R * 0.4, 0, TAU)
      ctx.fill()

      ctx.restore()
    },
  }
}

const SYSTEMS: Record<string, VectorSystem> = {
  'vector-pentagram': makeMagicCircle({ star: { n: 5, k: 2 }, runes: 12, ticks: 36, innerPolygon: 5, defaultColor: '#c084fc' }),
  'vector-hexagram': makeMagicCircle({ hexagram: true, runes: 12, ticks: 24, innerPolygon: 6, defaultColor: '#22d3ee' }),
  'vector-heptagram': makeMagicCircle({ star: { n: 7, k: 3 }, runes: 14, ticks: 28, innerPolygon: 7, defaultColor: '#60a5fa' }),
  'vector-arcane-circle': makeMagicCircle({ runes: 18, ticks: 48, innerPolygon: 8, defaultColor: '#fbbf24' }),
  'vector-rune-circle': makeMagicCircle({ runes: 16, ticks: 32, innerPolygon: 3, defaultColor: '#4ade80' }),
  'vector-portal': makePortal('#a855f7', '#d8b4fe', false),
  'vector-fire-portal': makePortal('#ff7a1a', '#ffd166', true),
}

export const vectorRenderer: EffectRenderer = {
  id: 'vector',
  match: (effectId) => effectId in SYSTEMS,
  draw(effectId, { ctx, timeMs, bounds, opacity, settings }) {
    SYSTEMS[effectId]?.draw(ctx, bounds, timeMs, opacity, settings)
  },
}

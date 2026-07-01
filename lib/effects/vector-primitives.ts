// ===== Reusable procedural vector primitives =====
//
// Deterministic Canvas2D drawing helpers shared by the vector-fx systems
// (lib/effects/vector-fx.ts). Every helper is a pure function of the parameters it
// is given — animation is driven by an absolute `timeMs` passed in — so the live
// preview and the exporter render identical frames, and effects loop seamlessly and
// stay crisp at any resolution (HD/4K).
//
// Primitives land alongside the category that first needs them (so each is shipped
// verified). Divine introduces: animatedRings, lightBeam, runeCircleArt,
// driftParticles + the shared readVfx / withGlow helpers.

import type { EffectRenderContext } from './render-core'

type Settings = EffectRenderContext['settings']

export const TAU = Math.PI * 2

// GLSL-style deterministic hash → [0,1). Stable across runs/machines.
export function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

// Normalized view of the vector-fx settings, with every field defaulted so a
// renderer never reads undefined. Raw 0–100 sliders become 0–1 where convenient.
export interface VfxParams {
  color: string
  color2: string
  glowColor: string
  alpha: number       // 0..1 base opacity from intensity
  glow: number        // 0..1 glow strength
  thickness: number   // 0..1 normalized stroke weight
  speed: number       // 0..1
  density: number     // 0..1
  dirRad: number       // direction in radians (0 = +x, math convention)
  dirDeg: number       // direction in degrees (raw)
  turbulence: number  // 0..1
  branching: number   // 0..1
  ringCount: number   // integer >= 1
  pulse: number       // 0..1
  spread: number      // 0..1
  scaleX: number      // >0
  scaleY: number      // >0
}

export function readVfx(s: Settings): VfxParams {
  const dirDeg = s.direction ?? 90
  return {
    color: s.color || '#ffffff',
    color2: s.secondaryColor || s.color || '#ffffff',
    glowColor: s.glowColor || s.color || '#ffffff',
    alpha: clamp((s.intensity ?? 80) / 100, 0.1, 1),
    glow: clamp((s.glowIntensity ?? 70) / 100, 0, 1),
    thickness: clamp((s.thickness ?? 30) / 100, 0.02, 1),
    speed: clamp((s.speed ?? 40) / 100, 0, 1),
    density: clamp((s.density ?? 50) / 100, 0, 1),
    dirRad: (dirDeg * Math.PI) / 180,
    dirDeg,
    turbulence: clamp((s.turbulence ?? 0) / 100, 0, 1),
    branching: clamp((s.branching ?? 0) / 100, 0, 1),
    ringCount: Math.max(1, Math.round(s.ringCount ?? 3)),
    pulse: clamp((s.pulseFrequency ?? 30) / 100, 0, 1),
    spread: clamp((s.spread ?? 50) / 100, 0, 1),
    scaleX: clamp(s.scaleX ?? 1, 0.1, 3),
    scaleY: clamp(s.scaleY ?? 1, 0.1, 3),
  }
}

// Run a draw callback inside a save/restore with a glow shadow + composite set up.
// `additive` uses 'lighter' so overlapping strokes build toward white (good for
// light/energy); otherwise normal source-over.
export function withGlow(
  ctx: CanvasRenderingContext2D,
  opts: { glowColor: string; glowPx: number; additive?: boolean },
  draw: () => void,
) {
  ctx.save()
  if (opts.additive) ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (opts.glowPx > 0) {
    ctx.shadowColor = opts.glowColor
    ctx.shadowBlur = opts.glowPx
  }
  draw()
  ctx.restore()
}

// ── Concentric rings, optionally expanding outward + pulsing (halos, ripples,
//    radiant pulses). `expand` scrolls each ring outward over `period` seconds. ──
export function animatedRings(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rMax: number,
  opts: {
    count: number
    timeMs: number
    color: string
    lineWidth: number
    alpha: number
    expand?: boolean       // ripples travel outward and fade
    pulse?: number          // 0..1 breathing of the whole set
    speed?: number          // 0..1
    squashY?: number        // vertical squash for a tilted ring (1 = circle)
    rMin?: number           // inner radius fraction (0..1 of rMax)
    wobble?: number         // 0..1 wavy radius (heat-shimmer / distortion)
  },
) {
  const { count, timeMs, color, lineWidth, alpha } = opts
  const tSec = timeMs / 1000
  const squash = opts.squashY ?? 1
  const rMin = (opts.rMin ?? 0.0) * rMax
  const breathe = opts.pulse ? 1 + 0.06 * opts.pulse * Math.sin(tSec * (1 + 3 * (opts.speed ?? 0.4))) : 1
  const wob = opts.wobble ?? 0
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  for (let i = 0; i < count; i++) {
    let frac: number
    let a = alpha
    if (opts.expand) {
      // Each ring marches from center → edge on its own offset phase, fading out.
      const phase = (tSec * (0.15 + 0.5 * (opts.speed ?? 0.4)) + i / count) % 1
      frac = phase
      a = alpha * Math.min(1, phase * 4) * (1 - phase)
    } else {
      frac = count > 1 ? lerp(rMin / rMax, 1, i / (count - 1 || 1)) : 0.8
    }
    const r = frac * rMax * breathe
    if (r <= 0.5) continue
    ctx.globalAlpha = a
    ctx.beginPath()
    if (wob > 0) {
      // Wavy ring: radius perturbed around the circle + scrolling in time.
      const N = 48, freq = 6
      for (let k = 0; k <= N; k++) {
        const ang = (k / N) * TAU
        const m = 1 + wob * 0.14 * Math.sin(ang * freq + tSec * 3 + i * 1.7)
        const px = cx + Math.cos(ang) * r * m
        const py = cy + Math.sin(ang) * r * squash * m
        if (k === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    } else {
      ctx.ellipse(cx, cy, r, r * squash, 0, 0, TAU)
    }
    ctx.stroke()
  }
}

// ── Flowing streaks: glowing fluid lines advected along a direction, wrapping
//    seamlessly. A bright `color` core rides a softer, wider `color2` body. Used for
//    lava flow lines, river flow, mana streams. Additive. ──
export function flowStreaks(
  ctx: CanvasRenderingContext2D,
  b: { x: number; y: number; width: number; height: number },
  opts: {
    count: number; timeMs: number; color: string; color2: string
    lineWidth: number; alpha: number; dirDeg: number; speed: number; turbulence: number
    additive?: boolean
  },
) {
  const { x: bx, y: by, width: W, height: H } = b
  const tSec = opts.timeMs / 1000
  const rad = (opts.dirDeg * Math.PI) / 180
  const fdx = Math.sin(rad), fdy = -Math.cos(rad) // 180° = down
  const pdx = -fdy, pdy = fdx
  const cx = bx + W / 2, cy = by + H / 2
  const L = Math.hypot(W, H) + 80
  const SEG = 7
  const speed = lerp(0.05, 0.35, opts.speed)
  ctx.save()
  ctx.beginPath()
  ctx.rect(bx, by, W, H)
  ctx.clip()
  if (opts.additive !== false) ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const trace = (u0: number, vBase: number, rVar: number, rPhase: number, lenU: number) => {
    ctx.beginPath()
    for (let s = 0; s <= SEG; s++) {
      const uu = u0 - (s / SEG) * lenU
      const mv = Math.sin(uu * 0.02 + vBase * 0.02 + tSec * (0.5 + rVar) + rPhase * TAU) * lerp(6, 22, rVar) * (0.4 + opts.turbulence)
      const v = vBase + mv
      const px = cx + fdx * uu + pdx * v
      const py = cy + fdy * uu + pdy * v
      if (s === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
  }
  for (let i = 0; i < opts.count; i++) {
    const rVar = hash(i * 13.7 + 5.3)
    const rPhase = hash(i * 7.13 + 1.7)
    const u0 = ((hash(i) + tSec * speed * lerp(0.7, 1.3, rVar)) % 1) * L - L / 2
    const vBase = (hash(i * 3.9 + 1.1) - 0.5) * L
    const lenU = lerp(24, 60, rVar)
    const edge = Math.max(0, Math.min(1, Math.min((u0 + L / 2) / 50, (L / 2 - u0 + lenU) / 50)))
    if (edge <= 0) continue
    ctx.strokeStyle = opts.color2
    ctx.lineWidth = opts.lineWidth * 2.4
    ctx.globalAlpha = opts.alpha * edge * 0.25
    trace(u0, vBase, rVar, rPhase, lenU)
    ctx.stroke()
    ctx.strokeStyle = opts.color
    ctx.lineWidth = opts.lineWidth
    ctx.globalAlpha = opts.alpha * edge * (0.5 + 0.4 * rVar)
    trace(u0, vBase, rVar, rPhase, lenU * 0.85)
    ctx.stroke()
  }
  ctx.restore()
}

// ── Branching veins / cracks radiating from a point. Deterministic recursion seeded
//    by a running counter. `grow` (0..1) limits how far they extend (animate it for
//    "expanding cracks"); `jagged` adds sharp kinks; `glowPulse` makes the lava
//    "breathe" through the cracks. Used for magma veins, lava cracks, corruption,
//    necrotic tendrils, dungeon floor cracks. ──
export function branchingVeins(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  opts: {
    timeMs: number; color: string; lineWidth: number; alpha: number
    roots: number; depth: number; length: number; spread: number; branching: number
    grow?: number; jagged?: boolean; glowPulse?: boolean
  },
) {
  const tSec = opts.timeMs / 1000
  const grow = opts.grow ?? 1
  const branchProb = opts.branching
  let seedC = 1
  ctx.save()
  ctx.strokeStyle = opts.color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const drawSeg = (x: number, y: number, ang: number, len: number, d: number) => {
    const segs = opts.jagged ? 3 : 2
    const grown = len * grow
    let px = x, py = y, a = ang
    ctx.lineWidth = Math.max(0.4, opts.lineWidth * ((d + 1) / (opts.depth + 1)))
    ctx.globalAlpha = opts.alpha * (opts.glowPulse ? 0.6 + 0.4 * Math.sin(tSec * 2 + hash(seedC) * TAU) : 1)
    ctx.beginPath()
    ctx.moveTo(px, py)
    for (let s = 1; s <= segs; s++) {
      const kink = opts.jagged ? (hash(seedC++ * 1.7) - 0.5) * 0.9 : (hash(seedC++ * 1.7) - 0.5) * 0.35
      a += kink
      px += (Math.cos(a) * grown) / segs
      py += (Math.sin(a) * grown) / segs
      ctx.lineTo(px, py)
    }
    ctx.stroke()
    if (d > 0) {
      const nb = 1 + (hash(seedC++ * 2.3) < branchProb ? 1 : 0) + (hash(seedC++ * 3.1) < branchProb ? 1 : 0)
      for (let bI = 0; bI < nb; bI++) {
        const da = (hash(seedC++ * 4.7) - 0.5) * opts.spread * 2
        drawSeg(px, py, a + da, len * 0.72, d - 1)
      }
    }
  }
  for (let r = 0; r < opts.roots; r++) {
    const a0 = (r / opts.roots) * TAU + hash(r * 3.3) * 0.5
    drawSeg(cx, cy, a0, opts.length, opts.depth)
  }
  ctx.restore()
}

// ── Rotating spiral arms, optionally with ember dots sliding outward along them.
//    Additive. Used for ember spiral, whirlpool, portal spiral, draining-life spiral. ──
export function animatedSpiral(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rMax: number,
  opts: {
    timeMs: number; color: string; color2: string; lineWidth: number; alpha: number
    arms: number; speed: number; turns: number; embers?: boolean
  },
) {
  const tSec = opts.timeMs / 1000
  const spin = opts.speed * tSec
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  for (let a = 0; a < opts.arms; a++) {
    const base = (a / opts.arms) * TAU + spin
    ctx.strokeStyle = a % 2 ? opts.color2 : opts.color
    ctx.lineWidth = opts.lineWidth
    ctx.globalAlpha = opts.alpha * 0.8
    ctx.beginPath()
    for (let s = 0; s <= 1.0001; s += 0.04) {
      const ang = base + s * opts.turns * TAU
      const rr = rMax * (0.12 + s * 0.88)
      const px = cx + Math.cos(ang) * rr
      const py = cy + Math.sin(ang) * rr
      if (s === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
    if (opts.embers) {
      const dots = 6
      for (let e = 0; e < dots; e++) {
        const s = (e / dots + tSec * opts.speed * 0.3) % 1
        const ang = base + s * opts.turns * TAU
        const rr = rMax * (0.12 + s * 0.88)
        ctx.globalAlpha = opts.alpha * (1 - s)
        ctx.fillStyle = opts.color
        ctx.beginPath()
        ctx.arc(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, opts.lineWidth * 0.9, 0, TAU)
        ctx.fill()
      }
    }
  }
  ctx.restore()
}

// ── A soft light shaft / beam from (x,y) along `angle`, length L, half-width w.
//    Built from a radial-ish gradient mapped onto a rotated rectangle so it has a
//    bright core that fades at the edges and tip. Used for god rays / sacred beam. ──
export function lightBeam(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, angle: number, length: number, halfWidth: number,
  opts: { color: string; alpha: number; fadeTip?: boolean },
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  // Across-beam gradient (soft sides): -halfWidth..+halfWidth maps to transparent→
  // color→transparent. The along-beam fade is applied with a second gradient pass.
  const grad = ctx.createLinearGradient(0, -halfWidth, 0, halfWidth)
  grad.addColorStop(0, 'transparent')
  grad.addColorStop(0.5, opts.color)
  grad.addColorStop(1, 'transparent')
  ctx.globalAlpha = opts.alpha
  ctx.fillStyle = grad
  ctx.fillRect(0, -halfWidth, length, halfWidth * 2)
  if (opts.fadeTip !== false) {
    // Fade the far end so the shaft dissolves into light instead of cutting off.
    const tip = ctx.createLinearGradient(0, 0, length, 0)
    tip.addColorStop(0, 'transparent')
    tip.addColorStop(0.15, 'rgba(0,0,0,0)')
    tip.addColorStop(1, 'rgba(0,0,0,1)')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = tip
    ctx.fillRect(0, -halfWidth, length, halfWidth * 2)
  }
  ctx.restore()
}

// ── Rune circle art: concentric rings + tick ring + a ring of runic glyphs that
//    counter-rotate. A general building block for magic/divine/necrotic circles. ──
export function runeCircleArt(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, R: number,
  opts: { timeMs: number; color: string; lineWidth: number; alpha: number; runes: number; speed: number; rings?: number },
) {
  const tSec = opts.timeMs / 1000
  const spin = opts.speed * tSec * 0.6
  ctx.save()
  ctx.translate(cx, cy)
  ctx.globalAlpha = opts.alpha
  ctx.strokeStyle = opts.color
  ctx.fillStyle = opts.color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.lineWidth = opts.lineWidth
  // Concentric rings (outer → inner), count configurable.
  const ringN = Math.max(1, opts.rings ?? 3)
  for (let r = 0; r < ringN; r++) {
    const rf = 1 - (r / ringN) * 0.5
    ctx.beginPath()
    ctx.arc(0, 0, R * rf, 0, TAU)
    ctx.stroke()
  }
  // Tick ring on the outer edge (rotates CW).
  const ticks = Math.max(12, opts.runes * 2)
  ctx.lineWidth = opts.lineWidth * 1.3
  for (let i = 0; i < ticks; i++) {
    const a = spin + (i / ticks) * TAU
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R)
    ctx.lineTo(Math.cos(a) * R * 1.05, Math.sin(a) * R * 1.05)
    ctx.stroke()
  }
  // Rune glyphs (counter-rotate), each a small varied stroke mark.
  const runeR = R * 0.71
  const gs = R * 0.05
  ctx.lineWidth = opts.lineWidth
  for (let i = 0; i < opts.runes; i++) {
    const a = -spin * 1.4 + (i / opts.runes) * TAU
    ctx.save()
    ctx.translate(Math.cos(a) * runeR, Math.sin(a) * runeR)
    ctx.rotate(a + Math.PI / 2)
    const seed = hash(i * 2.3 + 1.1)
    ctx.beginPath()
    ctx.moveTo(0, -gs)
    ctx.lineTo(0, gs)
    const bars = seed > 0.5 ? 2 : 1
    for (let b = 0; b < bars; b++) {
      const yy = -gs + ((b + 1) * gs * 2) / (bars + 1)
      const w = gs * (0.4 + hash(i * 5.7 + b) * 0.5)
      ctx.moveTo(-w, yy)
      ctx.lineTo(w, yy)
    }
    ctx.stroke()
    ctx.restore()
  }
  // Center dot.
  ctx.beginPath()
  ctx.arc(0, 0, R * 0.04, 0, TAU)
  ctx.fill()
  ctx.restore()
}

// ── Tendrils: writhing tentacle-like strokes snaking outward from a center, each
//    integrating a wavering heading over its length and over time. Used for shadow
//    tendrils, creeping corruption, grasping roots. ──
export function tendrils(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  opts: { timeMs: number; color: string; lineWidth: number; alpha: number; count: number; length: number; turbulence: number; speed: number; glowPulse?: boolean },
) {
  const tSec = opts.timeMs / 1000
  const writhe = 0.25 + opts.turbulence
  const SEG = 12
  const step = opts.length / SEG
  ctx.save()
  ctx.strokeStyle = opts.color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let i = 0; i < opts.count; i++) {
    const seed = hash(i * 5.1 + 1.1)
    let ang = (i / opts.count) * TAU + hash(i * 3.3) * 0.5
    let px = cx, py = cy
    ctx.lineWidth = opts.lineWidth
    ctx.globalAlpha = opts.alpha * (opts.glowPulse ? 0.6 + 0.4 * Math.sin(tSec * 2 + seed * TAU) : 1)
    ctx.beginPath()
    ctx.moveTo(px, py)
    for (let s = 1; s <= SEG; s++) {
      ang += Math.sin(s * 0.6 + tSec * (1 + seed) * opts.speed * 2 + seed * TAU) * writhe * 0.5
      px += Math.cos(ang) * step
      py += Math.sin(ang) * step
      ctx.lineTo(px, py)
    }
    ctx.stroke()
  }
  ctx.restore()
}

// ── Spider web: an orb web — radial spokes + concentric polygonal threads joining
//    them, with a `grow` fraction (0..1) so it can spin out over time, plus a subtle
//    wobble. ──
export function spiderWeb(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, R: number,
  opts: { timeMs: number; color: string; lineWidth: number; alpha: number; spokes: number; rings: number; grow: number; turbulence: number },
) {
  const tSec = opts.timeMs / 1000
  const grow = opts.grow
  ctx.save()
  ctx.translate(cx, cy)
  ctx.strokeStyle = opts.color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = opts.lineWidth
  ctx.globalAlpha = opts.alpha
  // Radial spokes.
  for (let s = 0; s < opts.spokes; s++) {
    const a = (s / opts.spokes) * TAU
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(a) * R * grow, Math.sin(a) * R * grow)
    ctx.stroke()
  }
  // Concentric capture threads connecting adjacent spokes.
  for (let r = 1; r <= opts.rings; r++) {
    const rr = (r / opts.rings) * R * grow
    if (rr <= 1) continue
    ctx.beginPath()
    for (let s = 0; s <= opts.spokes; s++) {
      const a = (s / opts.spokes) * TAU
      const wob = 1 + opts.turbulence * 0.03 * Math.sin(tSec * 1.5 + s + r)
      const x = Math.cos(a) * rr * wob
      const y = Math.sin(a) * rr * wob
      if (s === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }
  ctx.restore()
}

// ── Targeting reticle: outer ring + rotating bracket arcs + counter-rotating
//    crosshair ticks + a pulsing inner lock ring. Spell targeting / trap warning. ──
export function targetingReticle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, R: number,
  opts: { timeMs: number; color: string; lineWidth: number; alpha: number; speed: number },
) {
  const tSec = opts.timeMs / 1000
  const spin = opts.speed * tSec * 0.9
  ctx.save()
  ctx.translate(cx, cy)
  ctx.strokeStyle = opts.color
  ctx.fillStyle = opts.color
  ctx.lineCap = 'round'
  ctx.lineWidth = opts.lineWidth
  ctx.globalAlpha = opts.alpha
  // Outer ring.
  ctx.beginPath()
  ctx.arc(0, 0, R, 0, TAU)
  ctx.stroke()
  // Rotating bracket arcs.
  ctx.save()
  ctx.rotate(spin)
  for (let q = 0; q < 4; q++) {
    const a0 = (q * Math.PI) / 2 + 0.25
    ctx.beginPath()
    ctx.arc(0, 0, R * 0.82, a0, a0 + Math.PI / 2 - 0.5)
    ctx.stroke()
  }
  ctx.restore()
  // Counter-rotating crosshair ticks.
  ctx.save()
  ctx.rotate(-spin * 0.6)
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * R * 0.42, Math.sin(a) * R * 0.42)
    ctx.lineTo(Math.cos(a) * R * 0.96, Math.sin(a) * R * 0.96)
    ctx.stroke()
  }
  ctx.restore()
  // Pulsing inner lock ring + center dot.
  const lock = 0.28 + 0.12 * Math.sin(tSec * 4)
  ctx.beginPath()
  ctx.arc(0, 0, R * lock, 0, TAU)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, R * 0.05, 0, TAU)
  ctx.fill()
  ctx.restore()
}

// ── Particles drifting along a direction with sway/turbulence, looping seamlessly.
//    `glyph` optionally draws a shape (rotated to travel) instead of a soft dot —
//    used for golden motes (dot) and angelic feathers (feather glyph). ──
export function driftParticles(
  ctx: CanvasRenderingContext2D,
  b: { x: number; y: number; width: number; height: number },
  opts: {
    count: number
    timeMs: number
    color: string
    alpha: number
    speed: number       // 0..1
    dirDeg: number       // travel direction (degrees; 180 = down)
    turbulence: number  // 0..1 lateral sway amount
    size: number        // base particle size px
    glyph?: (ctx: CanvasRenderingContext2D, size: number, heading: number, flip: number) => void
  },
) {
  const { x: bx, y: by, width: W, height: H } = b
  const tSec = opts.timeMs / 1000
  const rad = (opts.dirDeg * Math.PI) / 180
  const vx = Math.sin(rad) // 180° → 0x, downwards uses cos
  const vy = -Math.cos(rad) // 180° (down) → vy=+1
  const span = Math.hypot(W, H) + 80
  const fall = lerp(0.04, 0.2, opts.speed)
  ctx.save()
  ctx.beginPath()
  ctx.rect(bx, by, W, H)
  ctx.clip()
  for (let i = 0; i < opts.count; i++) {
    const rVar = hash(i * 13.7 + 5.3)
    const rPhase = hash(i * 7.13 + 1.7)
    const t01 = (rPhase + tSec * fall * lerp(0.6, 1.4, rVar)) % 1
    const sway = Math.sin(tSec * (0.4 + rVar) + rPhase * TAU) * lerp(6, 26, rVar) * (0.3 + opts.turbulence)
    // Start point spread across the inflow edge, then travel along (vx,vy).
    const startX = bx + hash(i) * W
    const startY = by + hash(i * 3.1 + 2.2) * H
    const dist = (t01 - 0.5) * span
    const px = startX + vx * dist - vy * sway
    const py = startY + vy * dist + vx * sway
    const edge = Math.min(1, t01 * 6) * Math.min(1, (1 - t01) * 6)
    const sz = opts.size * lerp(0.6, 1.3, hash(i * 3.1 + 9.4))
    ctx.globalAlpha = opts.alpha * edge
    if (opts.glyph) {
      const flip = Math.abs(Math.sin(tSec * (1 + rVar) + rPhase * TAU))
      const heading = rad + Math.sin(tSec * (0.5 + rVar) + rPhase * TAU) * 0.5
      ctx.save()
      ctx.translate(px, py)
      ctx.fillStyle = opts.color
      ctx.strokeStyle = opts.color
      opts.glyph(ctx, sz, heading, flip)
      ctx.restore()
    } else {
      ctx.fillStyle = opts.color
      ctx.beginPath()
      ctx.arc(px, py, sz, 0, TAU)
      ctx.fill()
    }
  }
  ctx.restore()
}

// ── Wave lines: stacked sinusoidal lines scrolling sideways (water surface, wind).
//    `amplitude` in px, `wavelength` in px. A bright `color`/`color2` alternation. ──
export function waveLines(
  ctx: CanvasRenderingContext2D,
  b: { x: number; y: number; width: number; height: number },
  opts: {
    count: number; timeMs: number; color: string; color2: string
    lineWidth: number; alpha: number; speed: number; amplitude: number; wavelength: number
  },
) {
  const { x: bx, y: by, width: W, height: H } = b
  const tSec = opts.timeMs / 1000
  const k = (Math.PI * 2) / Math.max(20, opts.wavelength)
  const sp = lerp(0.4, 3, opts.speed)
  ctx.save()
  ctx.beginPath()
  ctx.rect(bx, by, W, H)
  ctx.clip()
  ctx.lineCap = 'round'
  for (let r = 0; r < opts.count; r++) {
    const baseY = by + ((r + 0.5) / opts.count) * H
    const ph = hash(r * 3.3) * TAU
    ctx.strokeStyle = r % 2 ? opts.color2 : opts.color
    ctx.lineWidth = opts.lineWidth
    ctx.globalAlpha = opts.alpha * lerp(0.55, 1, hash(r * 1.7))
    ctx.beginPath()
    for (let x = bx - 10; x <= bx + W + 10; x += 6) {
      const y = baseY
        + Math.sin(x * k + tSec * sp + ph) * opts.amplitude
        + Math.sin(x * k * 0.5 - tSec * sp * 0.7 + ph) * opts.amplitude * 0.5
      if (x === bx - 10) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.restore()
}

// ── Caustic lines: an additive web of wavy horizontal + vertical light filaments
//    that ripple over time — underwater light dancing on the floor. ──
export function causticLines(
  ctx: CanvasRenderingContext2D,
  b: { x: number; y: number; width: number; height: number },
  opts: { count: number; timeMs: number; color: string; color2: string; lineWidth: number; alpha: number; speed: number; turbulence: number },
) {
  const { x: bx, y: by, width: W, height: H } = b
  const tSec = (opts.timeMs / 1000) * lerp(0.3, 1.2, opts.speed)
  const amp = Math.min(W, H) * 0.05 * (0.6 + opts.turbulence)
  ctx.save()
  ctx.beginPath()
  ctx.rect(bx, by, W, H)
  ctx.clip()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  for (let r = 0; r < opts.count; r++) {
    const baseY = by + ((r + 0.5) / opts.count) * H
    const ph = hash(r * 3.3) * TAU
    ctx.strokeStyle = opts.color
    ctx.lineWidth = opts.lineWidth
    ctx.globalAlpha = opts.alpha * lerp(0.4, 0.9, hash(r * 2.1))
    ctx.beginPath()
    for (let x = bx; x <= bx + W; x += 8) {
      const y = baseY + Math.sin(x * 0.03 + tSec + ph) * amp + Math.sin(x * 0.013 - tSec * 1.3 + ph) * amp * 0.6
      if (x === bx) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  for (let c = 0; c < opts.count; c++) {
    const baseX = bx + ((c + 0.5) / opts.count) * W
    const ph = hash(c * 5.1 + 9) * TAU
    ctx.strokeStyle = opts.color2
    ctx.lineWidth = opts.lineWidth * 0.8
    ctx.globalAlpha = opts.alpha * lerp(0.3, 0.7, hash(c * 1.9))
    ctx.beginPath()
    for (let y = by; y <= by + H; y += 8) {
      const x = baseX + Math.sin(y * 0.03 + tSec * 1.1 + ph) * amp + Math.sin(y * 0.012 - tSec + ph) * amp * 0.6
      if (y === by) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.restore()
}

// ── Impact rings: scattered points each emitting a small expanding ripple ring on
//    its own staggered cycle (rain hitting water, dripping). ──
export function impactRings(
  ctx: CanvasRenderingContext2D,
  b: { x: number; y: number; width: number; height: number },
  opts: { count: number; timeMs: number; color: string; lineWidth: number; alpha: number; speed: number; maxR: number },
) {
  const { x: bx, y: by, width: W, height: H } = b
  const tSec = opts.timeMs / 1000
  const rate = lerp(0.4, 1.6, opts.speed)
  ctx.save()
  ctx.beginPath()
  ctx.rect(bx, by, W, H)
  ctx.clip()
  ctx.strokeStyle = opts.color
  ctx.lineCap = 'round'
  for (let i = 0; i < opts.count; i++) {
    const cx = bx + hash(i * 1.7 + 0.3) * W
    const cy = by + hash(i * 3.9 + 1.1) * H
    const ph = hash(i * 5.1 + 0.7)
    const t = (ph + tSec * rate * lerp(0.7, 1.3, hash(i * 2.2))) % 1
    const r = t * opts.maxR
    const fade = 1 - t
    ctx.lineWidth = opts.lineWidth
    ctx.globalAlpha = opts.alpha * fade
    ctx.beginPath()
    ctx.arc(cx, cy, r + 0.5, 0, TAU)
    ctx.stroke()
    if (t > 0.3) {
      ctx.globalAlpha = opts.alpha * fade * 0.5
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.55, 0, TAU)
      ctx.stroke()
    }
  }
  ctx.restore()
}

// A simple feather glyph for driftParticles (vane + shaft), drawn centered, pointing
// "down" along +y before the caller's rotation; `flip` squashes it edge-on to tumble.
export function featherGlyph(ctx: CanvasRenderingContext2D, size: number, heading: number, flip: number) {
  const len = size * 2.2
  ctx.rotate(heading)
  ctx.scale(0.4 + 0.6 * flip, 1)
  const w = len * 0.32
  ctx.beginPath()
  ctx.moveTo(0, -len)
  ctx.quadraticCurveTo(w, -len * 0.2, 0, len)
  ctx.quadraticCurveTo(-w, -len * 0.2, 0, -len)
  ctx.fill()
}

// A leaf glyph for driftParticles (rounded blade + midrib), tumbling edge-on via flip.
export function leafGlyph(ctx: CanvasRenderingContext2D, size: number, heading: number, flip: number) {
  const len = size * 1.7
  ctx.rotate(heading)
  ctx.scale(0.45 + 0.55 * flip, 1)
  ctx.beginPath()
  ctx.moveTo(0, -len)
  ctx.quadraticCurveTo(len * 0.85, 0, 0, len)
  ctx.quadraticCurveTo(-len * 0.85, 0, 0, -len)
  ctx.fill()
  ctx.save()
  ctx.globalAlpha *= 0.5
  ctx.lineWidth = Math.max(0.5, size * 0.12)
  ctx.beginPath()
  ctx.moveTo(0, -len)
  ctx.lineTo(0, len)
  ctx.stroke()
  ctx.restore()
}

// ── Tornado funnel: stacked rotating ellipses tapering from a wide top to a narrow
//    bottom, with strands spiraling down the cone. Swaying drives `turbulence`. ──
export function tornadoFunnel(
  ctx: CanvasRenderingContext2D,
  b: { x: number; y: number; width: number; height: number },
  opts: { timeMs: number; color: string; color2: string; lineWidth: number; alpha: number; speed: number; turbulence: number; strands: number },
) {
  const { x: bx, y: by, width: W, height: H } = b
  const tSec = opts.timeMs / 1000
  const cx = bx + W / 2
  const topW = W * 0.42, botW = W * 0.06
  const top = by + H * 0.06, bot = by + H * 0.96
  const swayAmp = W * 0.05 * (0.4 + opts.turbulence)
  const spin = opts.speed * 4
  ctx.save()
  ctx.beginPath()
  ctx.rect(bx, by, W, H)
  ctx.clip()
  ctx.lineCap = 'round'
  const swayAt = (f: number) => Math.sin(tSec * 2 + f * 4) * swayAmp
  const halfWAt = (f: number) => lerp(topW, botW, f)
  // Stacked body rings.
  const rings = 14
  for (let i = 0; i < rings; i++) {
    const f = i / (rings - 1)
    const cy = lerp(top, bot, f)
    ctx.strokeStyle = i % 2 ? opts.color2 : opts.color
    ctx.lineWidth = opts.lineWidth
    ctx.globalAlpha = opts.alpha * lerp(0.7, 0.3, f)
    ctx.beginPath()
    ctx.ellipse(cx + swayAt(f), cy, halfWAt(f), halfWAt(f) * 0.28, 0, 0, TAU)
    ctx.stroke()
  }
  // Spiraling strands down the cone.
  for (let s = 0; s < opts.strands; s++) {
    const ph = s / opts.strands
    ctx.strokeStyle = opts.color
    ctx.lineWidth = opts.lineWidth * 0.8
    ctx.globalAlpha = opts.alpha * 0.6
    ctx.beginPath()
    for (let f = 0; f <= 1.001; f += 0.05) {
      const cy = lerp(top, bot, f)
      const hw = halfWAt(f)
      const ang = ph * TAU + tSec * spin + f * 6
      const x = cx + swayAt(f) + Math.cos(ang) * hw
      const y = cy + Math.sin(ang) * hw * 0.28
      if (f === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.restore()
}

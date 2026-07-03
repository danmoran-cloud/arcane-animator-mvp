import type { EffectRenderer, EffectRenderContext } from './render-core'
import {
  TAU, hash, lerp, readVfx, withGlow,
  animatedRings, lightBeam, runeCircleArt, driftParticles, featherGlyph,
  flowStreaks, branchingVeins, animatedSpiral, waveLines, causticLines, impactRings,
  tornadoFunnel, leafGlyph, targetingReticle, tendrils, spiderWeb,
} from './vector-primitives'

// ===== Vector FX renderer =====
//
// Procedural, editable, resolution-independent map overlays grouped into themed
// categories (Divine, Lava, Water, …). Each system draws one frame as an analytic
// function of absolute time into the layer's bounds, so the live preview and the
// exporter match by construction, effects loop seamlessly, and they stay crisp at
// any export resolution. Systems are keyed by a `vfx-<category>-<name>` id and built
// from the shared primitives in vector-primitives.ts.

type Settings = EffectRenderContext['settings']
type Bounds = EffectRenderContext['bounds']

interface VfxSystem {
  draw(ctx: CanvasRenderingContext2D, bounds: Bounds, timeMs: number, opacity: number, settings: Settings): void
}

// Soft radial glow fill (bright center → transparent edge).
function softGlow(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, alpha: number) {
  if (r <= 0 || alpha <= 0) return
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  g.addColorStop(0, color)
  g.addColorStop(0.5, color)
  g.addColorStop(1, 'transparent')
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, TAU)
  ctx.fill()
  ctx.restore()
}

// ===== DIVINE =====

// Holy Halo — a glowing tilted ring with soft inner radiance, gently bobbing.
const holyHalo: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2
    const cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.78
    const tSec = timeMs / 1000
    const breathe = 0.9 + 0.1 * Math.sin(tSec * (0.5 + p.speed))
    const lw = Math.max(1, R * 0.12 * p.thickness)
    const glowPx = 24 * p.glow
    softGlow(ctx, cx, cy, R * 0.7 * breathe, p.glowColor, opacity * p.alpha * 0.4)
    withGlow(ctx, { glowColor: p.glowColor, glowPx, additive: true }, () => {
      // Main bright halo ring (tilted ellipse).
      ctx.globalAlpha = opacity * p.alpha
      ctx.strokeStyle = p.color
      ctx.lineWidth = lw
      ctx.beginPath()
      ctx.ellipse(cx, cy, R * breathe, R * 0.42 * breathe, 0, 0, TAU)
      ctx.stroke()
      // A couple of fainter concentric companion rings.
      animatedRings(ctx, cx, cy, R * breathe, {
        count: p.ringCount, timeMs, color: p.color2, lineWidth: lw * 0.5,
        alpha: opacity * p.alpha * 0.5, squashY: 0.42, rMin: 0.8, speed: p.speed,
      })
    })
  },
}

// Radiant Pulse — concentric rings of light pulsing outward + a soft core.
const radiantPulse: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2
    const cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.92
    const tSec = timeMs / 1000
    const corePulse = 0.5 + 0.5 * Math.sin(tSec * (1 + 4 * p.pulse))
    softGlow(ctx, cx, cy, R * 0.34 * (0.8 + 0.2 * corePulse), p.glowColor, opacity * p.alpha * 0.55)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 20 * p.glow, additive: true }, () => {
      animatedRings(ctx, cx, cy, R, {
        count: Math.max(2, p.ringCount + 2), timeMs, color: p.color,
        lineWidth: Math.max(1, R * 0.05 * p.thickness), alpha: opacity * p.alpha,
        expand: true, speed: lerp(p.speed, 1, p.pulse),
      })
    })
  },
}

// God Rays — a fan of radiant shafts sweeping across the layer from a source point.
const godRays: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2
    const cy = b.y + b.height / 2
    const diag = Math.hypot(b.width, b.height)
    const tSec = timeMs / 1000
    // Travel vector (180° = down, matching the app's direction convention).
    const vx = Math.sin(p.dirRad), vy = -Math.cos(p.dirRad)
    // Source sits opposite the travel direction so rays cross the whole layer.
    const ox = cx - vx * diag * 0.6
    const oy = cy - vy * diag * 0.6
    const baseAngle = Math.atan2(vy, vx)
    const rays = Math.round(lerp(5, 16, p.density))
    const fan = lerp(0.15, 1.3, p.spread)
    const halfW = Math.max(2, diag * 0.04 * p.thickness)
    ctx.save()
    ctx.beginPath()
    ctx.rect(b.x, b.y, b.width, b.height)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < rays; i++) {
      const f = rays > 1 ? i / (rays - 1) - 0.5 : 0
      const ang = baseAngle + f * fan
      const shimmer = 0.5 + 0.5 * Math.sin(tSec * (0.4 + p.speed) + hash(i * 3.1) * TAU)
      lightBeam(ctx, ox, oy, ang, diag * 1.4, halfW * lerp(0.6, 1.2, hash(i * 5.7)), {
        color: i % 2 ? p.color2 : p.color, alpha: opacity * p.alpha * 0.5 * shimmer,
      })
    }
    ctx.restore()
  },
}

// Blessing Circle — a radiant rune circle of protection.
const blessingCircle: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2
    const cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.9
    softGlow(ctx, cx, cy, R * 0.5, p.glowColor, opacity * p.alpha * 0.3)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 14 * p.glow }, () => {
      runeCircleArt(ctx, cx, cy, R, {
        timeMs, color: p.color, lineWidth: Math.max(1, R * 0.02 * (0.5 + p.thickness)),
        alpha: opacity * p.alpha, runes: p.ringCount, speed: p.speed,
      })
    })
  },
}

// Falling Golden Motes — soft golden flecks drifting down.
const fallingGoldenMotes: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const count = Math.round(lerp(20, 160, p.density))
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 8 * p.glow, additive: true }, () => {
      driftParticles(ctx, b, {
        count, timeMs, color: p.color, alpha: opacity * p.alpha,
        speed: p.speed, dirDeg: settings.direction ?? 180, turbulence: 0.3 + p.turbulence,
        size: Math.max(1.2, Math.min(b.width, b.height) * 0.006),
      })
    })
  },
}

// Sacred Beam — a wide vertical column of holy light with a brighter pulsing core.
const sacredBeam: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2
    const tSec = timeMs / 1000
    const pulse = 0.8 + 0.2 * Math.sin(tSec * (1 + 4 * p.pulse))
    const halfW = Math.max(4, b.width * 0.4 * p.thickness)
    ctx.save()
    ctx.beginPath()
    ctx.rect(b.x, b.y, b.width, b.height)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'
    // Wide soft body, then a narrower bright core — both vertical columns.
    lightBeam(ctx, cx, b.y - 4, Math.PI / 2, b.height + 8, halfW * pulse, {
      color: p.color2, alpha: opacity * p.alpha * 0.5, fadeTip: false,
    })
    lightBeam(ctx, cx, b.y - 4, Math.PI / 2, b.height + 8, halfW * 0.4 * pulse, {
      color: p.color, alpha: opacity * p.alpha * 0.8, fadeTip: false,
    })
    ctx.restore()
  },
}

// Angelic Feather Drift — luminous feathers drifting and tumbling down.
const angelicFeatherDrift: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const count = Math.round(lerp(8, 48, p.density))
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 6 * p.glow, additive: false }, () => {
      driftParticles(ctx, b, {
        count, timeMs, color: p.color, alpha: opacity * p.alpha,
        speed: p.speed * 0.7, dirDeg: settings.direction ?? 185, turbulence: 0.5 + p.turbulence,
        size: Math.max(3, Math.min(b.width, b.height) * 0.018),
        glyph: featherGlyph,
      })
    })
  },
}

// ===== LAVA =====

// Lava Flow Lines — glowing molten streaks flowing downhill.
const lavaFlowLines: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 10 * p.glow, additive: false }, () => {
      flowStreaks(ctx, b, {
        count: Math.round(lerp(30, 160, p.density)), timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1, Math.min(b.width, b.height) * 0.02 * p.thickness),
        alpha: opacity * p.alpha, dirDeg: settings.direction ?? 180, speed: p.speed, turbulence: p.turbulence,
      })
    })
  },
}

// Heat Distortion Rings — wavy concentric rings rising/shimmering with heat.
const heatDistortionRings: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.92
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 8 * p.glow, additive: true }, () => {
      animatedRings(ctx, cx, cy, R, {
        count: Math.max(3, p.ringCount + 2), timeMs, color: p.color,
        lineWidth: Math.max(1, R * 0.03 * p.thickness), alpha: opacity * p.alpha * 0.8,
        expand: true, speed: p.speed, wobble: 0.5 + p.turbulence,
      })
    })
  },
}

// Lava Pulse — a molten core glowing and pulsing with expanding shockwave rings.
const lavaPulse: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.9
    const tSec = timeMs / 1000
    const pulse = 0.5 + 0.5 * Math.sin(tSec * (1 + 4 * p.pulse))
    softGlow(ctx, cx, cy, R * 0.5 * (0.8 + 0.2 * pulse), p.glowColor, opacity * p.alpha * 0.6)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 16 * p.glow, additive: true }, () => {
      animatedRings(ctx, cx, cy, R, {
        count: Math.max(2, p.ringCount), timeMs, color: p.color,
        lineWidth: Math.max(1.5, R * 0.05 * p.thickness), alpha: opacity * p.alpha,
        expand: true, speed: lerp(p.speed, 1, p.pulse),
      })
    })
  },
}

// Ember Spiral — additive spiral arms with embers spiraling outward.
const emberSpiral: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.92
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 12 * p.glow, additive: true }, () => {
      animatedSpiral(ctx, cx, cy, R, {
        timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1.5, R * 0.03 * p.thickness), alpha: opacity * p.alpha,
        arms: Math.round(lerp(3, 6, p.density)), speed: p.speed, turns: 1.6, embers: true,
      })
    })
  },
}

// Volcanic Warning Glow — a pulsing hazard glow with a bold warning ring.
const volcanicWarningGlow: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.88
    const tSec = timeMs / 1000
    const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(tSec * (1.2 + 4 * p.pulse)))
    softGlow(ctx, cx, cy, R * pulse, p.glowColor, opacity * p.alpha * 0.5 * pulse)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 18 * p.glow, additive: true }, () => {
      ctx.globalAlpha = opacity * p.alpha * (0.5 + 0.5 * pulse)
      ctx.strokeStyle = p.color
      ctx.lineWidth = Math.max(2, R * 0.06 * p.thickness)
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.92, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = opacity * p.alpha * 0.4 * pulse
      ctx.lineWidth = Math.max(1, R * 0.02 * p.thickness)
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.7, 0, TAU)
      ctx.stroke()
    })
  },
}

// ===== WATER =====

// River Flow Lines — cool highlight streaks flowing along a current.
const riverFlowLines: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 6 * p.glow, additive: false }, () => {
      flowStreaks(ctx, b, {
        count: Math.round(lerp(40, 200, p.density)), timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1, Math.min(b.width, b.height) * 0.014 * p.thickness),
        alpha: opacity * p.alpha, dirDeg: settings.direction ?? 90, speed: p.speed, turbulence: p.turbulence,
      })
    })
  },
}

// Whirlpool Spiral — swirling arms drawn inward, with a dark drain core.
const whirlpoolSpiral: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.92
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 6 * p.glow, additive: true }, () => {
      animatedSpiral(ctx, cx, cy, R, {
        timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1.2, R * 0.025 * p.thickness), alpha: opacity * p.alpha,
        arms: Math.round(lerp(3, 6, p.density)), speed: p.speed, turns: 2.2,
      })
    })
    // Dark drain core.
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.3)
    core.addColorStop(0, 'rgba(2,12,20,0.85)')
    core.addColorStop(1, 'transparent')
    ctx.save()
    ctx.globalAlpha = opacity * p.alpha
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(cx, cy, R * 0.3, 0, TAU)
    ctx.fill()
    ctx.restore()
  },
}

// Ripple Rings — concentric ripples expanding outward.
const rippleRings: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.92
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 5 * p.glow, additive: false }, () => {
      animatedRings(ctx, cx, cy, R, {
        count: Math.max(3, p.ringCount + 2), timeMs, color: p.color,
        lineWidth: Math.max(1, R * 0.025 * p.thickness), alpha: opacity * p.alpha,
        expand: true, speed: p.speed,
      })
    })
  },
}

// Wave Lines — stacked sinusoidal swells scrolling across the surface.
const waterWaveLines: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 4 * p.glow, additive: false }, () => {
      waveLines(ctx, b, {
        count: Math.round(lerp(5, 16, p.density)), timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1, Math.min(b.width, b.height) * 0.01 * p.thickness),
        alpha: opacity * p.alpha, speed: p.speed,
        amplitude: b.height * 0.03 * (0.5 + p.turbulence), wavelength: lerp(180, 60, p.density),
      })
    })
  },
}

// Rain Impact Rings — scattered ripple rings popping where drops land.
const rainImpactRings: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 3 * p.glow, additive: false }, () => {
      impactRings(ctx, b, {
        count: Math.round(lerp(12, 70, p.density)), timeMs, color: p.color,
        lineWidth: Math.max(1, Math.min(b.width, b.height) * 0.01 * p.thickness),
        alpha: opacity * p.alpha, speed: p.speed, maxR: Math.min(b.width, b.height) * 0.08,
      })
    })
  },
}

// Waterfall Flow Streaks — fast vertical foam streaks falling.
const waterfallFlowStreaks: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 5 * p.glow, additive: false }, () => {
      flowStreaks(ctx, b, {
        count: Math.round(lerp(60, 260, p.density)), timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1, Math.min(b.width, b.height) * 0.012 * p.thickness),
        alpha: opacity * p.alpha, dirDeg: settings.direction ?? 180, speed: Math.max(0.5, p.speed), turbulence: p.turbulence * 0.5,
      })
    })
  },
}

// Underwater Caustic Lines — a rippling web of light filaments.
const underwaterCausticLines: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    causticLines(ctx, b, {
      count: Math.round(lerp(4, 10, p.density)), timeMs, color: p.color, color2: p.color2,
      lineWidth: Math.max(1, Math.min(b.width, b.height) * 0.012 * p.thickness),
      alpha: opacity * p.alpha, speed: p.speed, turbulence: p.turbulence,
    })
  },
}

// ===== WIND =====

// Gust Lines — long pale streaks blowing across in a direction.
const gustLines: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 4 * p.glow, additive: true }, () => {
      flowStreaks(ctx, b, {
        count: Math.round(lerp(20, 90, p.density)), timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1, Math.min(b.width, b.height) * 0.012 * p.thickness),
        alpha: opacity * p.alpha, dirDeg: settings.direction ?? 90, speed: Math.max(0.5, p.speed), turbulence: p.turbulence * 0.4,
      })
    })
  },
}

// Swirling Wind — open curling spiral arms (a slow vortex of air).
const swirlingWind: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.95
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 4 * p.glow, additive: true }, () => {
      animatedSpiral(ctx, cx, cy, R, {
        timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1, R * 0.02 * p.thickness), alpha: opacity * p.alpha,
        arms: Math.round(lerp(2, 5, p.density)), speed: p.speed, turns: 2.6,
      })
    })
  },
}

// Tornado Spiral — a rotating funnel of stacked rings + spiraling strands.
const tornadoSpiral: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 4 * p.glow, additive: false }, () => {
      tornadoFunnel(ctx, b, {
        timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1, Math.min(b.width, b.height) * 0.01 * p.thickness),
        alpha: opacity * p.alpha, speed: p.speed, turbulence: p.turbulence, strands: Math.round(lerp(2, 5, p.density)),
      })
    })
  },
}

// Directional Wind Field — dense uniform streamlines flowing one way.
const directionalWindField: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 3 * p.glow, additive: true }, () => {
      flowStreaks(ctx, b, {
        count: Math.round(lerp(60, 220, p.density)), timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(0.8, Math.min(b.width, b.height) * 0.008 * p.thickness),
        alpha: opacity * p.alpha, dirDeg: settings.direction ?? 90, speed: p.speed, turbulence: p.turbulence * 0.2,
      })
    })
  },
}

// Leaf Drift Path — leaves carried on the wind, tumbling along a direction.
const leafDriftPath: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const count = Math.round(lerp(8, 50, p.density))
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 2 * p.glow, additive: false }, () => {
      driftParticles(ctx, b, {
        count, timeMs, color: p.color, alpha: opacity * p.alpha,
        speed: p.speed, dirDeg: settings.direction ?? 135, turbulence: 0.6 + p.turbulence,
        size: Math.max(3, Math.min(b.width, b.height) * 0.016), glyph: leafGlyph,
      })
    })
  },
}

// Smoke Curl Lines — soft curling wisps meandering upward.
const smokeCurlLines: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 6 * p.glow, additive: false }, () => {
      flowStreaks(ctx, b, {
        count: Math.round(lerp(14, 60, p.density)), timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1.5, Math.min(b.width, b.height) * 0.02 * p.thickness),
        alpha: opacity * p.alpha, dirDeg: settings.direction ?? 0, speed: p.speed * 0.6, turbulence: 0.8 + p.turbulence,
      })
    })
  },
}

// Blizzard Wind Streaks — fast, dense pale streaks driving across the scene.
const blizzardWindStreaks: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 3 * p.glow, additive: true }, () => {
      flowStreaks(ctx, b, {
        count: Math.round(lerp(80, 300, p.density)), timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(0.8, Math.min(b.width, b.height) * 0.008 * p.thickness),
        alpha: opacity * p.alpha, dirDeg: settings.direction ?? 110, speed: Math.max(0.6, p.speed), turbulence: p.turbulence * 0.3,
      })
    })
  },
}

// ===== MAGIC =====

// Arcane Circle — full magic circle: concentric rings, ticks and counter-rotating runes.
const arcaneCircle: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.9
    softGlow(ctx, cx, cy, R * 0.4, p.glowColor, opacity * p.alpha * 0.2)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 12 * p.glow }, () => {
      runeCircleArt(ctx, cx, cy, R, {
        timeMs, color: p.color, lineWidth: Math.max(1, R * 0.02 * (0.5 + p.thickness)),
        alpha: opacity * p.alpha, runes: p.ringCount, speed: p.speed, rings: 3,
      })
    })
  },
}

// Rotating Rune Ring — a single ring of runes spinning (lighter than a full circle).
const rotatingRuneRing: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.9
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 12 * p.glow }, () => {
      runeCircleArt(ctx, cx, cy, R, {
        timeMs, color: p.color, lineWidth: Math.max(1, R * 0.02 * (0.5 + p.thickness)),
        alpha: opacity * p.alpha, runes: p.ringCount, speed: Math.max(0.4, p.speed), rings: 1,
      })
    })
  },
}

// Mana Stream — additive arcane energy flowing along a direction.
const manaStream: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 8 * p.glow, additive: true }, () => {
      flowStreaks(ctx, b, {
        count: Math.round(lerp(40, 180, p.density)), timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1, Math.min(b.width, b.height) * 0.014 * p.thickness),
        alpha: opacity * p.alpha, dirDeg: settings.direction ?? 90, speed: p.speed, turbulence: p.turbulence,
      })
    })
  },
}

// Portal Spiral — energetic spiral arms with a glowing rim and dark core.
const portalSpiral: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.92
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 14 * p.glow, additive: true }, () => {
      animatedSpiral(ctx, cx, cy, R, {
        timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1.5, R * 0.03 * p.thickness), alpha: opacity * p.alpha,
        arms: Math.round(lerp(4, 7, p.density)), speed: p.speed, turns: 1.8,
      })
      // Glowing rim.
      ctx.globalAlpha = opacity * p.alpha
      ctx.strokeStyle = p.color2
      ctx.lineWidth = Math.max(2, R * 0.05 * p.thickness)
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.96, 0, TAU)
      ctx.stroke()
    })
    // Dark core.
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.42)
    core.addColorStop(0, 'rgba(8,4,18,0.92)')
    core.addColorStop(0.7, 'rgba(8,4,18,0.5)')
    core.addColorStop(1, 'transparent')
    ctx.save()
    ctx.globalAlpha = opacity * p.alpha
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(cx, cy, R * 0.42, 0, TAU)
    ctx.fill()
    ctx.restore()
  },
}

// Spell Targeting Circle — a rotating targeting reticle locking on.
const spellTargetingCircle: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.88
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 10 * p.glow }, () => {
      targetingReticle(ctx, cx, cy, R, {
        timeMs, color: p.color, lineWidth: Math.max(1.5, R * 0.02 * (0.5 + p.thickness)),
        alpha: opacity * p.alpha, speed: p.speed,
      })
    })
  },
}

// Leyline Current — a branching network of glowing ley lines pulsing with energy.
const leylineCurrent: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const reach = Math.min(b.width, b.height) * 0.4
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 10 * p.glow, additive: true }, () => {
      branchingVeins(ctx, cx, cy, {
        timeMs, color: p.color, lineWidth: Math.max(1.2, reach * 0.025 * (0.5 + p.thickness)),
        alpha: opacity * p.alpha, roots: Math.round(lerp(4, 8, p.density)), depth: 4,
        length: reach, spread: lerp(0.3, 0.9, p.spread), branching: p.branching, glowPulse: true,
      })
    })
  },
}

// Energy Beam — a bright directional energy beam with a glowing core, pulsing.
const energyBeam: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const diag = Math.hypot(b.width, b.height)
    const tSec = timeMs / 1000
    const vx = Math.sin(p.dirRad), vy = -Math.cos(p.dirRad)
    const ox = cx - vx * diag * 0.6, oy = cy - vy * diag * 0.6
    const ang = Math.atan2(vy, vx)
    const halfW = Math.max(3, diag * 0.05 * p.thickness)
    const pulse = 0.8 + 0.2 * Math.sin(tSec * (1.5 + 5 * p.pulse))
    ctx.save()
    ctx.beginPath()
    ctx.rect(b.x, b.y, b.width, b.height)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'
    lightBeam(ctx, ox, oy, ang, diag * 1.4, halfW * pulse, { color: p.color2, alpha: opacity * p.alpha * 0.5, fadeTip: false })
    lightBeam(ctx, ox, oy, ang, diag * 1.4, halfW * 0.35 * pulse, { color: p.color, alpha: opacity * p.alpha * 0.9, fadeTip: false })
    ctx.restore()
  },
}

// ===== NECROTIC =====

// Shadow Tendrils — writhing dark tendrils grasping outward.
const shadowTendrils: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const reach = Math.min(b.width, b.height) * 0.46
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 10 * p.glow, additive: true }, () => {
      tendrils(ctx, cx, cy, {
        timeMs, color: p.color, lineWidth: Math.max(1.5, reach * 0.03 * (0.5 + p.thickness)),
        alpha: opacity * p.alpha, count: Math.round(lerp(5, 12, p.density)),
        length: reach, turbulence: p.turbulence, speed: p.speed, glowPulse: true,
      })
    })
  },
}

// Corruption Veins — spreading sickly veins, breathing with decay.
const corruptionVeins: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const reach = Math.min(b.width, b.height) * 0.4
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 10 * p.glow, additive: true }, () => {
      branchingVeins(ctx, cx, cy, {
        timeMs, color: p.color, lineWidth: Math.max(1.2, reach * 0.03 * (0.5 + p.thickness)),
        alpha: opacity * p.alpha, roots: Math.round(lerp(4, 9, p.density)), depth: 4,
        length: reach, spread: lerp(0.4, 1.1, p.spread), branching: p.branching, glowPulse: true,
      })
    })
  },
}

// Soul Wisps — pale spirit lights rising and fading.
const soulWisps: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const count = Math.round(lerp(10, 50, p.density))
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 10 * p.glow, additive: true }, () => {
      driftParticles(ctx, b, {
        count, timeMs, color: p.color, alpha: opacity * p.alpha,
        speed: p.speed * 0.7, dirDeg: settings.direction ?? 0, turbulence: 0.6 + p.turbulence,
        size: Math.max(2, Math.min(b.width, b.height) * 0.01),
      })
    })
  },
}

// Necrotic Pulse — sickly shockwave rings expanding outward.
const necroticPulse: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.92
    softGlow(ctx, cx, cy, R * 0.4, p.glowColor, opacity * p.alpha * 0.4)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 14 * p.glow, additive: true }, () => {
      animatedRings(ctx, cx, cy, R, {
        count: Math.max(2, p.ringCount), timeMs, color: p.color,
        lineWidth: Math.max(1.5, R * 0.04 * p.thickness), alpha: opacity * p.alpha,
        expand: true, speed: lerp(p.speed, 1, p.pulse),
      })
    })
  },
}

// Black Mist Curl — murky non-glowing curls of decay drifting up.
const blackMistCurl: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    flowStreaks(ctx, b, {
      count: Math.round(lerp(14, 60, p.density)), timeMs, color: p.color, color2: p.color2,
      lineWidth: Math.max(2, Math.min(b.width, b.height) * 0.022 * p.thickness),
      alpha: opacity * p.alpha * 0.7, dirDeg: settings.direction ?? 0, speed: p.speed * 0.6,
      turbulence: 0.9 + p.turbulence, additive: false,
    })
  },
}

// Draining Life Spiral — a vortex pulling energy inward.
const drainingLifeSpiral: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.92
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 10 * p.glow, additive: true }, () => {
      animatedSpiral(ctx, cx, cy, R, {
        timeMs, color: p.color, color2: p.color2,
        lineWidth: Math.max(1.2, R * 0.025 * p.thickness), alpha: opacity * p.alpha,
        arms: Math.round(lerp(3, 6, p.density)), speed: p.speed, turns: 2.4, embers: true,
      })
    })
  },
}

// Cursed Rune Ring — a baleful rune circle of green/purple curse-light.
const cursedRuneRing: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.9
    softGlow(ctx, cx, cy, R * 0.4, p.glowColor, opacity * p.alpha * 0.2)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 12 * p.glow }, () => {
      runeCircleArt(ctx, cx, cy, R, {
        timeMs, color: p.color, lineWidth: Math.max(1, R * 0.02 * (0.5 + p.thickness)),
        alpha: opacity * p.alpha, runes: p.ringCount, speed: p.speed, rings: 2,
      })
    })
  },
}

// ===== DUNGEON =====

// Dust Motes Path — fine dust drifting slowly through the air.
const dustMotesPath: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const count = Math.round(lerp(30, 160, p.density))
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 4 * p.glow, additive: true }, () => {
      driftParticles(ctx, b, {
        count, timeMs, color: p.color, alpha: opacity * p.alpha,
        speed: p.speed * 0.5, dirDeg: settings.direction ?? 135, turbulence: 0.5 + p.turbulence,
        size: Math.max(0.8, Math.min(b.width, b.height) * 0.004),
      })
    })
  },
}

// Trap Warning Glyph — a pulsing warning reticle marking a trap.
const trapWarningGlyph: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.86
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 12 * p.glow, additive: true }, () => {
      targetingReticle(ctx, cx, cy, R, {
        timeMs, color: p.color, lineWidth: Math.max(1.5, R * 0.025 * (0.5 + p.thickness)),
        alpha: opacity * p.alpha, speed: p.speed,
      })
    })
  },
}

// Dripping Water Rings — slow sparse ripples where water drips.
const drippingWaterRings: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 3 * p.glow, additive: false }, () => {
      impactRings(ctx, b, {
        count: Math.round(lerp(4, 24, p.density)), timeMs, color: p.color,
        lineWidth: Math.max(1, Math.min(b.width, b.height) * 0.01 * p.thickness),
        alpha: opacity * p.alpha, speed: p.speed * 0.6, maxR: Math.min(b.width, b.height) * 0.1,
      })
    })
  },
}

// Spider Web Growth — an orb web spinning out and shimmering.
const spiderWebGrowth: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.95
    const cycle = ((timeMs / 1000) * lerp(0.05, 0.2, p.speed)) % 1
    const grow = Math.min(1, cycle * 1.5)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 2 * p.glow, additive: false }, () => {
      spiderWeb(ctx, cx, cy, R, {
        timeMs, color: p.color, lineWidth: Math.max(0.8, R * 0.012 * (0.5 + p.thickness)),
        alpha: opacity * p.alpha, spokes: Math.round(lerp(8, 16, p.density)),
        rings: Math.round(lerp(4, 8, p.density)), grow, turbulence: p.turbulence,
      })
    })
  },
}

// Falling Debris Lines — bits of rubble streaking down.
const fallingDebrisLines: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const count = Math.round(lerp(20, 90, p.density))
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 1 * p.glow, additive: false }, () => {
      driftParticles(ctx, b, {
        count, timeMs, color: p.color, alpha: opacity * p.alpha,
        speed: Math.max(0.5, p.speed), dirDeg: settings.direction ?? 180, turbulence: 0.2 + p.turbulence * 0.4,
        size: Math.max(1, Math.min(b.width, b.height) * 0.006),
      })
    })
  },
}

// Ancient Rune Glow — a faint, slowly pulsing single rune ring carved in stone.
const ancientRuneGlow: VfxSystem = {
  draw(ctx, b, timeMs, opacity, settings) {
    const p = readVfx(settings)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const R = (Math.min(b.width, b.height) / 2) * 0.9
    const tSec = timeMs / 1000
    const pulse = 0.6 + 0.4 * Math.sin(tSec * (0.6 + 3 * p.pulse))
    softGlow(ctx, cx, cy, R * 0.45, p.glowColor, opacity * p.alpha * 0.3 * pulse)
    withGlow(ctx, { glowColor: p.glowColor, glowPx: 14 * p.glow * pulse, additive: true }, () => {
      runeCircleArt(ctx, cx, cy, R, {
        timeMs, color: p.color, lineWidth: Math.max(1, R * 0.018 * (0.5 + p.thickness)),
        alpha: opacity * p.alpha * pulse, runes: p.ringCount, speed: p.speed, rings: 1,
      })
    })
  },
}

const SYSTEMS: Record<string, VfxSystem> = {
  'vfx-divine-holy-halo': holyHalo,
  'vfx-divine-radiant-pulse': radiantPulse,
  'vfx-divine-god-rays': godRays,
  'vfx-divine-blessing-circle': blessingCircle,
  'vfx-divine-falling-golden-motes': fallingGoldenMotes,
  'vfx-divine-sacred-beam': sacredBeam,
  'vfx-divine-angelic-feather-drift': angelicFeatherDrift,
  // Lava
  'vfx-lava-flow-lines': lavaFlowLines,
  'vfx-lava-heat-distortion-rings': heatDistortionRings,
  'vfx-lava-pulse': lavaPulse,
  'vfx-lava-ember-spiral': emberSpiral,
  'vfx-lava-volcanic-warning-glow': volcanicWarningGlow,
  // Water
  'vfx-water-river-flow-lines': riverFlowLines,
  'vfx-water-whirlpool-spiral': whirlpoolSpiral,
  'vfx-water-ripple-rings': rippleRings,
  'vfx-water-wave-lines': waterWaveLines,
  'vfx-water-rain-impact-rings': rainImpactRings,
  'vfx-water-waterfall-flow-streaks': waterfallFlowStreaks,
  'vfx-water-underwater-caustic-lines': underwaterCausticLines,
  // Wind
  'vfx-wind-gust-lines': gustLines,
  'vfx-wind-swirling-wind': swirlingWind,
  'vfx-wind-tornado-spiral': tornadoSpiral,
  'vfx-wind-directional-field': directionalWindField,
  'vfx-wind-leaf-drift-path': leafDriftPath,
  'vfx-wind-smoke-curl-lines': smokeCurlLines,
  'vfx-wind-blizzard-wind-streaks': blizzardWindStreaks,
  // Magic
  'vfx-magic-arcane-circle': arcaneCircle,
  'vfx-magic-rotating-rune-ring': rotatingRuneRing,
  'vfx-magic-mana-stream': manaStream,
  'vfx-magic-portal-spiral': portalSpiral,
  'vfx-magic-spell-targeting-circle': spellTargetingCircle,
  'vfx-magic-leyline-current': leylineCurrent,
  'vfx-magic-energy-beam': energyBeam,
  // Necrotic
  'vfx-necrotic-shadow-tendrils': shadowTendrils,
  'vfx-necrotic-corruption-veins': corruptionVeins,
  'vfx-necrotic-soul-wisps': soulWisps,
  'vfx-necrotic-pulse': necroticPulse,
  'vfx-necrotic-black-mist-curl': blackMistCurl,
  'vfx-necrotic-draining-life-spiral': drainingLifeSpiral,
  'vfx-necrotic-cursed-rune-ring': cursedRuneRing,
  // Dungeon
  'vfx-dungeon-dust-motes-path': dustMotesPath,
  'vfx-dungeon-trap-warning-glyph': trapWarningGlyph,
  'vfx-dungeon-dripping-water-rings': drippingWaterRings,
  'vfx-dungeon-spider-web-growth': spiderWebGrowth,
  'vfx-dungeon-falling-debris-lines': fallingDebrisLines,
  'vfx-dungeon-ancient-rune-glow': ancientRuneGlow,
}

export const vectorFxRenderer: EffectRenderer = {
  id: 'vector-fx',
  match: (effectId) => effectId.startsWith('vfx-') && effectId in SYSTEMS,
  draw(effectId, { ctx, timeMs, bounds, opacity, settings }) {
    SYSTEMS[effectId]?.draw(ctx, bounds, timeMs, opacity, settings)
  },
}

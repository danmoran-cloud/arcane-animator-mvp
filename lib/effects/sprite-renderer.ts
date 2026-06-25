import { SPRITE_SHEETS } from '@/lib/sprite-sheets'
import { getCachedImage } from './image-cache'
import type { EffectRenderContext, EffectRenderer } from './render-core'

// Sprite-sheet renderer for every atlas-driven pack (Magic, Light Source, Light
// Source Revised, Subterranean, Cemetery, Launch, Rain, Caustics, New).
// Per-sheet geometry AND presentation (glow / tint / blend / fps) come from
// SPRITE_SHEETS, so one code path serves them all and the frame is wall-clock
// indexed — preview and export stay in sync and never pan across a cell.

// Base frame rate at speed=100 when a sheet doesn't specify its own.
const DEFAULT_FPS = 16

type Bounds = EffectRenderContext['bounds']

// Radial color wash (used for the ambient glow and the caustics tint).
function radialWash(
  ctx: CanvasRenderingContext2D,
  b: Bounds,
  colorStop: string,
  alpha: number,
  cxFrac: number,
  cyFrac: number,
  rFrac: number,
) {
  if (alpha <= 0) return
  const cx = b.x + b.width * cxFrac
  const cy = b.y + b.height * cyFrac
  const radius = Math.min(b.width, b.height) * rFrac
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  g.addColorStop(0, colorStop)
  g.addColorStop(1, 'transparent')
  ctx.globalAlpha = alpha
  ctx.fillStyle = g
  ctx.fillRect(b.x, b.y, b.width, b.height)
}

export const spriteRenderer: EffectRenderer = {
  id: 'sprite-sheet',
  match: (effectId) => effectId in SPRITE_SHEETS,
  assets: (effectId) => {
    const sheet = SPRITE_SHEETS[effectId]
    return sheet ? [sheet.url] : []
  },
  draw(effectId, { ctx, timeMs, bounds, opacity, settings }) {
    const sheet = SPRITE_SHEETS[effectId]
    if (!sheet) return

    const color = settings.color || '#ffffff'
    const img = getCachedImage(sheet.url)
    const wantGlow = sheet.glow ?? true
    const wantTint = sheet.tint ?? false
    const glowIntensity = settings.glowIntensity ?? 60

    ctx.save()

    // Ambient color glow behind the sprite (light sources, magic, launch…).
    if (wantGlow && glowIntensity > 0) {
      radialWash(ctx, bounds, color + '33', opacity * (glowIntensity / 100), 0.5, 0.5, 0.5)
    }
    // Color tint wash from the upper area (underwater caustics).
    if (wantTint && glowIntensity > 0) {
      radialWash(ctx, bounds, color + '22', opacity * (glowIntensity / 100), 0.5, 0.4, 0.75)
    }

    if (!img) {
      // Sprite not decoded yet — show a soft placeholder so the layer isn't
      // invisible during the first frames (skip when a wash already drew one).
      if (!wantGlow && !wantTint) {
        radialWash(ctx, bounds, color + '44', opacity, 0.5, 0.5, 0.5)
      }
      ctx.restore()
      return
    }

    const fps = ((settings.speed || 45) / 100) * (sheet.fps ?? DEFAULT_FPS)
    const frameIndex = fps > 0 ? Math.floor((timeMs / 1000) * fps) % sheet.frames : 0
    const frameWidth = img.width / sheet.cols
    const frameHeight = img.height / sheet.rows
    const col = frameIndex % sheet.cols
    const row = Math.floor(frameIndex / sheet.cols)

    const intensity = settings.intensity ?? 80
    if (sheet.blend === 'screen') ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = opacity * Math.max(0.35, intensity / 100)
    ctx.drawImage(
      img,
      col * frameWidth, row * frameHeight, frameWidth, frameHeight,
      bounds.x, bounds.y, bounds.width, bounds.height,
    )

    ctx.restore()
  },
}

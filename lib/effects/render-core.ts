import type { EffectSettings } from '@/lib/effects-library'

// Core render contract shared by every effect, regardless of how it is drawn
// (sprite sheet today; particle/Pixi and vector/Lottie later). A renderer draws
// a single frame for a given wall-clock time into a 2D canvas context within the
// given bounds. The same contract drives the editor preview and the exporter, so
// "what you see is what you export" is guaranteed by construction.

export interface EffectBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface EffectRenderContext {
  ctx: CanvasRenderingContext2D
  /** Animation time in milliseconds (wall-clock based, monotonic). */
  timeMs: number
  bounds: EffectBounds
  /** Layer opacity, 0..1. Renderers must multiply their own alpha by this. */
  opacity: number
  /** Effect settings. Partial because layers may omit fields — renderers must
   *  defensively default any value they read. */
  settings: Partial<EffectSettings>
  /**
   * Preview quality factor (0.25–1). Particle renderers scale their particle
   * count by this so the editor degrades gracefully under load. The exporter
   * leaves it at 1 (full quality). Defaults to 1 when omitted.
   */
  quality?: number
}

export interface EffectRenderer {
  /** Stable identifier for this renderer (not the effect id). */
  id: string
  /** Whether this renderer handles the given effect id. */
  match(effectId: string): boolean
  /** Asset URLs that must be preloaded before draw() produces output. */
  assets?(effectId: string): string[]
  /**
   * Async one-time setup (e.g. initializing a GPU context). Both the preview and
   * the exporter await this before their first draw(), so draw() itself stays
   * synchronous and reproducible.
   */
  prepare?(effectId: string): Promise<void>
  draw(effectId: string, c: EffectRenderContext): void
}

const registry: EffectRenderer[] = []

export function registerRenderer(renderer: EffectRenderer): void {
  if (!registry.some((r) => r.id === renderer.id)) {
    registry.push(renderer)
  }
}

/** First renderer that claims the effect id, or undefined (falls back to legacy DOM/canvas). */
export function getRenderer(effectId: string): EffectRenderer | undefined {
  return registry.find((r) => r.match(effectId))
}

export function getEffectAssets(effectId: string): string[] {
  return getRenderer(effectId)?.assets?.(effectId) ?? []
}

/** Run a renderer's async setup, if any. Safe to call repeatedly. */
export async function prepareEffect(effectId: string): Promise<void> {
  await getRenderer(effectId)?.prepare?.(effectId)
}

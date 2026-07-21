// UVTT -> Arcane Animator translation. Parses a .dd2vtt/.uvtt file and maps its
// grid-unit geometry into the editor's canvas coordinate space, plus helpers to
// turn the result into real layers (map, grid, light effects, wall exclusions).
//
// STATUS: parser + layer builders are complete and self-contained; they are not
// yet wired to any importer UI or store action. Wiring TODOs are marked below.

import { v4 as uuidv4 } from 'uuid'
import { fitToMaxEdge } from '@/lib/editor-store'
import type { Layer, ExpandedEffectLayer, GridLayer, ExclusionZone, Size, Position } from '@/lib/types'
import type {
  Uvtt,
  UvttImportResult,
  UvttLight,
  PlacedLight,
  CanvasPolyline,
} from './types'

// Default effect dropped at each UVTT light. 'torch' is a warm procedural glow
// whose radius scales with the layer size, so it reads well at any light range.
const DEFAULT_LIGHT_EFFECT_ID = 'torch'

// Parse raw file text (from a File/upload or fetch) into a validated Uvtt object.
// Throws with a clear message if the JSON is missing the fields we rely on.
export function parseUvttJson(text: string): Uvtt {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Not valid JSON — is this a .dd2vtt / .uvtt file?')
  }
  const u = data as Partial<Uvtt>
  if (!u || typeof u !== 'object' || !u.resolution || !u.image) {
    throw new Error('Missing "resolution" or "image" — not a UVTT file.')
  }
  const res = u.resolution
  if (!res.pixels_per_grid || !res.map_size) {
    throw new Error('UVTT "resolution" is missing pixels_per_grid or map_size.')
  }
  return u as Uvtt
}

// Normalize a UVTT color ("RRGGBB", "AARRGGBB", or "RRGGBBAA", with/without '#')
// down to "#rrggbb". Falls back to a warm default if it can't be read.
function normalizeColor(raw: string | undefined): string {
  if (!raw) return '#ff9500'
  const hex = raw.replace(/^#/, '')
  // 8 hex chars = has an alpha byte; the RGB triplet may lead (RRGGBBAA) or
  // trail (AARRGGBB). Dungeondraft emits AARRGGBB, so prefer the last 6.
  if (hex.length === 8) return `#${hex.slice(2)}`
  if (hex.length === 6) return `#${hex}`
  return '#ff9500'
}

// Core coordinate transform. UVTT coords are grid units offset from map_origin;
// this converts one point into canvas units given the grid size in canvas px.
function makeToCanvas(originX: number, originY: number, gridSizeCanvasPx: number) {
  return (p: { x: number; y: number }): Position => ({
    x: (p.x - originX) * gridSizeCanvasPx,
    y: (p.y - originY) * gridSizeCanvasPx,
  })
}

// Translate a full UVTT into canvas-space constructs. Pure/synchronous — image
// dimensions come from the spec (map_size * pixels_per_grid), so no decoding needed.
export function uvttToImportResult(u: Uvtt): UvttImportResult {
  const { pixels_per_grid, map_size, map_origin } = u.resolution
  const originX = map_origin?.x ?? 0
  const originY = map_origin?.y ?? 0

  const pixelWidth = map_size.x * pixels_per_grid
  const pixelHeight = map_size.y * pixels_per_grid

  // The base map fills the (capped) canvas edge-to-edge at the origin, so a single
  // scale relates source pixels to canvas units.
  const canvasSize: Size = fitToMaxEdge(pixelWidth, pixelHeight)
  const scale = pixelWidth > 0 ? canvasSize.width / pixelWidth : 1
  const gridSizeCanvasPx = pixels_per_grid * scale

  const toCanvas = makeToCanvas(originX, originY, gridSizeCanvasPx)

  const wallSources = [...(u.line_of_sight ?? []), ...(u.objects_line_of_sight ?? [])]
  const walls: CanvasPolyline[] = wallSources.map((poly) => {
    const points = poly.map(toCanvas)
    const first = points[0]
    const last = points[points.length - 1]
    const closed =
      points.length > 2 && !!first && !!last && first.x === last.x && first.y === last.y
    return { points, closed }
  })

  const portals = (u.portals ?? []).map((p) => ({
    position: toCanvas(p.position),
    bounds: (p.bounds ?? []).map(toCanvas),
    rotation: p.rotation ?? 0,
    closed: p.closed ?? true,
  }))

  const lights: PlacedLight[] = (u.lights ?? []).map((light: UvttLight) => ({
    center: toCanvas(light.position),
    radiusCanvasPx: (light.range || 1) * gridSizeCanvasPx,
    effectId: DEFAULT_LIGHT_EFFECT_ID,
    color: normalizeColor(light.color),
  }))

  return {
    image: {
      dataUrl: u.image.startsWith('data:') ? u.image : `data:image/png;base64,${u.image}`,
      pixelWidth,
      pixelHeight,
    },
    canvasSize,
    gridSizeCanvasPx,
    lights,
    walls,
    portals,
    raw: u,
  }
}

// Convenience: parse text straight through to the import result.
export function parseUvtt(text: string): UvttImportResult {
  return uvttToImportResult(parseUvttJson(text))
}

// ===== Layer builders — turn an import result into real editor layers =====

// Base map layer filling the canvas at the origin, pinned like a normal base map.
export function buildMapLayer(result: UvttImportResult, name: string): Layer {
  return {
    id: uuidv4(),
    name,
    type: 'map',
    src: result.image.dataUrl,
    position: { x: 0, y: 0 },
    size: { ...result.canvasSize },
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    pinned: true,
    zIndex: 0,
  }
}

// Grid layer sized to the UVTT's pixels_per_grid (in canvas units), covering the map.
export function buildGridLayer(result: UvttImportResult): GridLayer {
  return {
    id: uuidv4(),
    name: 'Square Grid',
    type: 'grid',
    gridType: 'square',
    gridSize: Math.round(result.gridSizeCanvasPx),
    position: { x: 0, y: 0 },
    size: { ...result.canvasSize },
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 1,
  }
}

// One animated light effect per UVTT light, centered on the light and sized to its
// range. `defaultSettings` should come from the matching entry in effectsLibrary so
// the effect has its full settings; we only override color + geometry here.
export function buildLightLayers(
  result: UvttImportResult,
  defaultSettings: Record<string, unknown>,
  startZIndex: number,
): ExpandedEffectLayer[] {
  return result.lights.map((light, i) => {
    const diameter = Math.max(40, Math.round(light.radiusCanvasPx * 2))
    return {
      id: uuidv4(),
      name: `Light ${i + 1}`,
      type: 'effect',
      effectId: light.effectId,
      category: 'light-procedural',
      settings: { ...defaultSettings, color: light.color },
      position: {
        x: Math.round(light.center.x - diameter / 2),
        y: Math.round(light.center.y - diameter / 2),
      },
      size: { width: diameter, height: diameter },
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: startZIndex + i,
      blendMode: 'screen', // additive-ish glow reads best over the map
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
}

// Convert a CLOSED wall loop into an ExclusionZone for an effect layer. Exclusion
// points are normalized 0..1 relative to the target layer's bounds; a full-canvas
// effect layer therefore normalizes against canvasSize. Open walls return null —
// they're line-of-sight segments, not fillable regions.
export function wallLoopToExclusion(
  wall: CanvasPolyline,
  layerBounds: { position: Position; size: Size },
): ExclusionZone | null {
  if (!wall.closed) return null
  const { position, size } = layerBounds
  if (size.width === 0 || size.height === 0) return null
  return {
    points: wall.points.map((p) => ({
      x: (p.x - position.x) / size.width,
      y: (p.y - position.y) / size.height,
    })),
  }
}

// TODO(wiring): expose an "Import UVTT" action that (1) reads a File as text,
// (2) parseUvtt, (3) dispatches ADD_LAYER for buildMapLayer with canvasSize, then
// buildGridLayer and buildLightLayers (looking up defaultSettings from
// effectsLibrary by effectId). Round-trip export (Direction B) reuses `raw`.

// Universal VTT (UVTT / .dd2vtt / .uvtt) format — the JSON a tool like
// Dungeondraft/Foundry exports for a map. Coordinates in `line_of_sight`,
// `portals`, and `lights` are expressed in GRID-SQUARE units (not pixels);
// multiply by `resolution.pixels_per_grid` to get source-image pixels.
//
// Spec is loosely versioned via the top-level `format` number (0.2 / 0.3 today).
// Fields other tools sometimes omit are marked optional so a lenient parse works.

export interface UvttPoint {
  x: number
  y: number
}

export interface UvttResolution {
  // Offset (in grid units) of the map's top-left from the image origin. Usually 0,0.
  map_origin: UvttPoint
  // Map extent in grid squares. image_px = map_size * pixels_per_grid.
  map_size: UvttPoint
  pixels_per_grid: number
}

// A door/window opening in the walls. `bounds` are the two endpoints of the
// portal span (grid units); `position` is its center. `closed` false = passable.
export interface UvttPortal {
  position: UvttPoint
  bounds: UvttPoint[]
  rotation: number
  closed: boolean
  freestanding?: boolean
}

// A light source the destination VTT renders at play time. `range` is the radius
// in grid units. `color` is a hex string — historically "RRGGBB", sometimes with
// a leading or trailing alpha byte; parse leniently (take the RGB triplet).
export interface UvttLight {
  position: UvttPoint
  range: number
  intensity: number
  color: string
  shadows?: boolean
}

export interface UvttEnvironment {
  baked_lighting?: boolean
  ambient_light?: string
}

export interface Uvtt {
  format: number
  resolution: UvttResolution
  // Wall polylines that block line of sight. Each entry is an ordered list of
  // vertices; a segment runs between consecutive vertices. NOT necessarily closed.
  line_of_sight?: UvttPoint[][]
  // Same as line_of_sight but for map objects (furniture, pillars). Optional.
  objects_line_of_sight?: UvttPoint[][]
  portals?: UvttPortal[]
  lights?: UvttLight[]
  environment?: UvttEnvironment
  // Base64-encoded PNG of the map, WITHOUT the `data:` URI prefix.
  image: string
}

// ===== Import result — UVTT translated into Arcane Animator's coordinate space =====
//
// The editor caps the canvas to MAX_CANVAS_EDGE (see lib/editor-store), so source
// image pixels and canvas units differ by a scale factor. Everything below is
// already expressed in CANVAS units (the coordinate space layers live in), with
// `gridSizeCanvasPx` = pixels_per_grid * that scale.

import type { Size, Position } from '@/lib/types'

// A wall as a canvas-space polyline (for visualization, exclusion derivation, or
// round-trip export back to UVTT).
export interface CanvasPolyline {
  points: Position[]
  // Whether the polyline's first and last points coincide (a closed loop that can
  // become an ExclusionZone). Open walls can't be exclusion regions.
  closed: boolean
}

export interface CanvasPortal {
  position: Position
  bounds: Position[]
  rotation: number
  closed: boolean
}

// A UVTT light mapped to a place to drop one of the app's light effects.
export interface PlacedLight {
  // Center of the light, in canvas units.
  center: Position
  // Radius in canvas units (range * gridSizeCanvasPx).
  radiusCanvasPx: number
  // Suggested effect + tint pulled from the UVTT light.
  effectId: string
  color: string // "#rrggbb"
}

export interface UvttImportResult {
  image: {
    dataUrl: string // ready to use as a map layer `src`
    pixelWidth: number
    pixelHeight: number
  }
  // Canvas size the base map should adopt (already run through fitToMaxEdge).
  canvasSize: Size
  // One grid square, in canvas pixels — feed straight into GridLayer.gridSize.
  gridSizeCanvasPx: number
  lights: PlacedLight[]
  walls: CanvasPolyline[]
  portals: CanvasPortal[]
  // The untouched source, kept so an export can round-trip LoS/portal/light data.
  raw: Uvtt
}

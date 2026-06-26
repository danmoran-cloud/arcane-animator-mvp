import type { EffectPack, EffectSettings, EffectId } from './effects-library'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

// Base layer properties
interface BaseLayer {
  id: string
  name: string
  position: Position
  size: Size
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean      // When true, this layer moves with all other locked layers
  zIndex: number
}

// Map layer (static image)
export interface MapLayer extends BaseLayer {
  type: 'map'
  src: string
}

// Asset layer (static overlay)
export interface AssetLayer extends BaseLayer {
  type: 'asset'
  src: string
}

// A no-effect region (freeform polygon) within an effect layer. Points are
// normalized 0..1 relative to the layer's bounds, so they survive resize and map
// the same way in the editor preview and the exporter.
export interface ExclusionZone {
  points: Position[]
}

// Effect layer (animated)
export interface ExpandedEffectLayer extends BaseLayer {
  type: 'effect'
  effectId: string
  category: EffectPack
  settings: Partial<EffectSettings>
  // Regions the effect must NOT render in (e.g. a house on the map).
  exclusions?: ExclusionZone[]
}

export type GridType = 'square' | 'hex'

// Grid layer (square or hex overlay). Covers the whole canvas and renders like any
// other layer, so it can be reordered, hidden, and have its opacity adjusted. By
// default it's inserted just above the base map and below effect/asset layers.
export interface GridLayer extends BaseLayer {
  type: 'grid'
  gridType: GridType
  gridSize: number
  color?: string
}

export type Layer = MapLayer | AssetLayer | ExpandedEffectLayer | GridLayer

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  layers: Layer[]
  gridEnabled: boolean
  gridType: GridType
  gridSize: number
  canvasSize: Size
}

// Undo/redo history. Holds immutable snapshots of the project before each
// undoable change. `lastKey` coalesces a continuous gesture (e.g. a drag = many
// MOVE_LAYER actions) into a single undo step.
export interface HistoryState {
  past: Project[]
  future: Project[]
  lastKey: string | null
}

export interface EditorState {
  project: Project | null
  selectedLayerId: string | null
  zoom: number
  panOffset: Position
  isDragging: boolean
  isResizing: boolean
  /** Size of the visible canvas viewport in screen pixels (for centering new layers) */
  viewportSize: { width: number; height: number }
  history: HistoryState
}

// Re-exports for backwards compatibility
export type { EffectPack, EffectSettings, EffectId }
export type EffectCategory = EffectPack
export type UnifiedEffectSettings = EffectSettings
export type BaseEffectComponent = EffectId
export type PerformanceLevel = 'low' | 'medium' | 'high'
export type GenreTag = 'fantasy' | 'scifi' | 'natural'
export type EffectTypeTag = 'weather' | 'light' | 'magic' | 'ambient'

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

// Effect layer (animated)
export interface ExpandedEffectLayer extends BaseLayer {
  type: 'effect'
  effectId: string
  category: EffectPack
  settings: Partial<EffectSettings>
}

export type Layer = MapLayer | AssetLayer | ExpandedEffectLayer

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  layers: Layer[]
  gridEnabled: boolean
  gridSize: number
  canvasSize: Size
}

export interface EditorState {
  project: Project | null
  selectedLayerId: string | null
  zoom: number
  panOffset: Position
  isDragging: boolean
  isResizing: boolean
}

// Re-exports for backwards compatibility
export type { EffectPack, EffectSettings, EffectId }
export type EffectCategory = EffectPack
export type UnifiedEffectSettings = EffectSettings
export type BaseEffectComponent = EffectId
export type PerformanceLevel = 'low' | 'medium' | 'high'
export type GenreTag = 'fantasy' | 'scifi' | 'natural'
export type EffectTypeTag = 'weather' | 'light' | 'magic' | 'ambient'

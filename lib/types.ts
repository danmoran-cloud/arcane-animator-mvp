import type { 
  EffectCategory, 
  UnifiedEffectSettings, 
  BaseEffectComponent,
  PerformanceLevel,
  GenreTag,
  EffectTypeTag 
} from './effects-library'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

// Re-export effect types from effects-library
export type { 
  EffectCategory, 
  UnifiedEffectSettings, 
  BaseEffectComponent,
  PerformanceLevel,
  GenreTag,
  EffectTypeTag 
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
  locked: boolean
  zIndex: number
  blendMode?: string
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

// Expanded Effect layer (animated) - new system
export interface ExpandedEffectLayer extends BaseLayer {
  type: 'effect'
  effectId: string
  category: EffectCategory
  baseComponent: BaseEffectComponent
  settings: Partial<UnifiedEffectSettings>
  performance: PerformanceLevel
  genreTags: GenreTag[]
  effectTags: EffectTypeTag[]
}

export type Layer = MapLayer | AssetLayer | ExpandedEffectLayer

export interface Asset {
  id: string
  name: string
  category: string
  thumbnail: string
  src: string
}

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

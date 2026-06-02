export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

// Effect types
export type EffectType = 
  | 'fog'
  | 'rain'
  | 'snow'
  | 'torchlight'
  | 'campfire'
  | 'runes'
  | 'portal'
  | 'waterRipple'
  | 'lavaShimmer'
  | 'dustMotes'

// Effect-specific settings
export interface FogSettings {
  speed: number
  density: number
  tint: string
}

export interface RainSettings {
  speed: number
  intensity: number
  angle: number
}

export interface SnowSettings {
  speed: number
  flakeSize: number
  density: number
}

export interface TorchlightSettings {
  flickerSpeed: number
  radius: number
  color: string
}

export interface CampfireSettings {
  flickerSpeed: number
  emberCount: number
  radius: number
}

export interface RunesSettings {
  rotationSpeed: number
  glowIntensity: number
  color: string
}

export interface PortalSettings {
  swirlSpeed: number
  glowIntensity: number
  color: string
}

export interface WaterRippleSettings {
  waveSpeed: number
  rippleScale: number
  tint: string
}

export interface LavaShimmerSettings {
  shimmerSpeed: number
  glowIntensity: number
}

export interface DustMotesSettings {
  speed: number
  density: number
}

export type EffectSettings = 
  | FogSettings
  | RainSettings
  | SnowSettings
  | TorchlightSettings
  | CampfireSettings
  | RunesSettings
  | PortalSettings
  | WaterRippleSettings
  | LavaShimmerSettings
  | DustMotesSettings

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
export interface EffectLayer extends BaseLayer {
  type: 'effect'
  effectType: EffectType
  settings: EffectSettings
}

export type Layer = MapLayer | AssetLayer | EffectLayer

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  thumbnail: string
  src: string
}

export type AssetCategory = 'weather' | 'fire' | 'water' | 'magic' | 'atmosphere' | 'light' | 'user'

// Effect definition for the library
export interface EffectDefinition {
  id: string
  name: string
  description: string
  effectType: EffectType
  category: EffectCategory
  defaultSettings: EffectSettings
  defaultSize: Size
}

export type EffectCategory = 'weather' | 'fire' | 'water' | 'magic' | 'atmosphere' | 'light'

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

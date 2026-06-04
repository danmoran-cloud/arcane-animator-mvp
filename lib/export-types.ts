// Export configuration types

export type ExportFormat = 'webm' | 'mp4'

export type ExportResolution = 'sd' | 'hd' | '4k'

export interface ResolutionConfig {
  label: string
  width: number
  height: number
}

export const RESOLUTION_CONFIGS: Record<ExportResolution, ResolutionConfig> = {
  sd: { label: 'SD (1280x720)', width: 1280, height: 720 },
  hd: { label: 'HD (1920x1080)', width: 1920, height: 1080 },
  '4k': { label: '4K (3840x2160)', width: 3840, height: 2160 },
}

export type ExportDuration = 5 | 10 | 15 | 30

export type ExportFrameRate = 24 | 30 | 60

export interface ExportSettings {
  format: ExportFormat
  resolution: ExportResolution
  duration: ExportDuration
  frameRate: ExportFrameRate
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'webm',
  resolution: 'hd',
  duration: 10,
  frameRate: 30,
}

export type ExportStatus = 
  | 'idle'
  | 'preparing'
  | 'rendering'
  | 'encoding'
  | 'finalizing'
  | 'complete'
  | 'error'

export interface ExportProgress {
  status: ExportStatus
  progress: number // 0-100
  currentFrame?: number
  totalFrames?: number
  message?: string
  error?: string
}

export interface ExportManifest {
  width: number
  height: number
  fps: number
  duration: number
  totalFrames: number
  layers: ExportLayerManifest[]
}

export interface ExportLayerManifest {
  id: string
  type: 'map' | 'asset' | 'effect'
  name: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  opacity: number
  visible: boolean
  zIndex: number
  // For map/asset layers
  src?: string
  // For effect layers
  effectId?: string
  effectSettings?: Record<string, unknown>
}

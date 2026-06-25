// Export configuration types

export type ExportFormat = 'webm' | 'mp4'

export type ExportResolution = 'sd' | 'hd'

export interface ResolutionConfig {
  label: string
  /**
   * Target size for the longest edge, in pixels. Actual export dimensions are
   * derived from the project's aspect ratio (see getExportDimensions) so the map
   * fills the frame edge-to-edge instead of being letterboxed into a fixed 16:9.
   */
  longEdge: number
}

export const RESOLUTION_CONFIGS: Record<ExportResolution, ResolutionConfig> = {
  sd: { label: 'SD', longEdge: 1280 },
  hd: { label: 'HD', longEdge: 1920 },
}

/**
 * Derive even-numbered export dimensions that preserve the project's aspect
 * ratio, scaling so the longest edge matches the chosen quality tier. Even
 * dimensions keep the VP8/VP9 encoders happy.
 */
export function getExportDimensions(
  longEdge: number,
  canvas: { width: number; height: number },
): { width: number; height: number } {
  const aspect = canvas.width / canvas.height
  let width: number
  let height: number
  if (aspect >= 1) {
    width = longEdge
    height = Math.round(longEdge / aspect)
  } else {
    height = longEdge
    width = Math.round(longEdge * aspect)
  }
  return { width: width - (width % 2), height: height - (height % 2) }
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

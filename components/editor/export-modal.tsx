'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Download, 
  Film, 
  Monitor, 
  Clock, 
  Gauge,
  CheckCircle,
  AlertCircle,
  Loader2,
  Coins,
  Gift,
  LogIn,
} from 'lucide-react'
import { 
  ExportSettings, 
  ExportProgress, 
  ExportFormat,
  ExportResolution,
  ExportDuration,
  ExportFrameRate,
  DEFAULT_EXPORT_SETTINGS,
  RESOLUTION_CONFIGS,
  getExportDimensions,
} from '@/lib/export-types'
import { calculateExportCost } from '@/lib/tokens'
import { SPRITE_SHEETS } from '@/lib/sprite-sheets'
import { getRenderer, loadImage, prepareEffect, clipToExclusions } from '@/lib/effects'
import { Muxer, ArrayBufferTarget } from 'webm-muxer'
import { checkExportAuthorization, recordExport, type ExportAuthResult } from '@/app/actions/exports'
import { ShareSection } from './share-section'
import type { Project, Layer, ExpandedEffectLayer, GridLayer } from '@/lib/types'
import Link from 'next/link'

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
}

const STATUS_MESSAGES: Record<string, string> = {
  idle: 'Ready to export',
  preparing: 'Preparing project...',
  rendering: 'Rendering frames...',
  encoding: 'Encoding video...',
  finalizing: 'Finalizing export...',
  complete: 'Rendering complete!',
  error: 'Export failed',
}

// All atlas-driven sprite packs (Magic, Light Source, Light Source Revised,
// Subterranean, Cemetery, Launch, Rain, Caustics, New) share one renderer:
// per-sheet geometry + presentation (blend/glow/tint/fps) live in
// lib/sprite-sheets.ts (SPRITE_SHEETS) and draw via lib/effects (getRenderer),
// the same path the editor preview uses.

export function ExportModal({ open, onOpenChange, project }: ExportModalProps) {
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS)
  const [progress, setProgress] = useState<ExportProgress>({ status: 'idle', progress: 0 })
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [exportedAt, setExportedAt] = useState<Date | null>(null)
  const [authResult, setAuthResult] = useState<ExportAuthResult | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(false)
  // Sharpest longest-edge (px) the project's bitmap art can actually fill;
  // null when there are no image layers (vector effects scale infinitely).
  const [sourceLongEdge, setSourceLongEdge] = useState<number | null>(null)
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const abortController = useRef<AbortController | null>(null)

  const isExporting = ['preparing', 'rendering', 'encoding', 'finalizing'].includes(progress.status)
  const exportCost = calculateExportCost(settings.resolution, settings.duration, settings.frameRate)
  const targetLongEdge = RESOLUTION_CONFIGS[settings.resolution].longEdge
  const exportDimensions = project
    ? getExportDimensions(targetLongEdge, project.canvasSize)
    : null
  // Warn (don't block) when the chosen tier would only upscale the source art.
  // 10% tolerance avoids nagging when the source is a hair under the target.
  const isUpscaling = sourceLongEdge !== null && targetLongEdge > sourceLongEdge * 1.1
  // Target encoder bitrate (shared by the file-size estimate and the recorder).
  const videoBitrate = settings.resolution === 'hd' ? 10_000_000 : 5_000_000
  // Approx file size: VBR targets ~bitrate over the clip, independent of fps.
  const estimatedSizeMb = (videoBitrate * settings.duration) / 8 / 1_000_000

  // Check authorization when modal opens or settings change
  useEffect(() => {
    if (open) {
      checkAuth()
    }
  }, [open, settings.resolution, settings.duration, settings.frameRate])

  const checkAuth = async () => {
    setCheckingAuth(true)
    const result = await checkExportAuthorization(
      settings.resolution,
      settings.duration,
      settings.frameRate,
    )
    setAuthResult(result)
    setCheckingAuth(false)
  }

  // Preload images when modal opens
  useEffect(() => {
    if (open && project) {
      preloadImages(project.layers)
    }
  }, [open, project])

  const preloadImages = async (layers: Layer[]) => {
    const imageLayers = layers.filter(l => l.type === 'map' || l.type === 'asset') as Array<{ src: string }>
    
    for (const layer of imageLayers) {
      if (!imageCache.current.has(layer.src)) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((resolve) => {
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = layer.src
        })
        imageCache.current.set(layer.src, img)
      }
    }
    
    // Preload all atlas-driven sprite packs present in the project into the
    // SHARED render cache so the registry renderer (used by both preview and
    // export) can read them.
    for (const [id, sheet] of Object.entries(SPRITE_SHEETS)) {
      const used = layers.some(l => l.type === 'effect' && (l as ExpandedEffectLayer).effectId === id)
      if (used) {
        await loadImage(sheet.url)
      }
    }

    // Run any renderer-specific async setup (e.g. particle/GPU backends) for the
    // effects actually used, so their draw() is ready when frame rendering starts.
    const effectIds = new Set(
      layers.filter(l => l.type === 'effect').map(l => (l as ExpandedEffectLayer).effectId),
    )
    for (const effectId of effectIds) {
      await prepareEffect(effectId)
    }

    // Measure the sharpest resolution the bitmap layers can fill, expressed as a
    // longest-edge target, so we can warn when a tier would just upscale them.
    if (project) {
      const canvasLong = Math.max(project.canvasSize.width, project.canvasSize.height)
      let best = 0
      for (const layer of layers) {
        if (layer.type !== 'map' && layer.type !== 'asset') continue
        const img = imageCache.current.get((layer as { src: string }).src)
        if (!img?.naturalWidth) continue
        // Source pixels per canvas unit — take the sharper of the two axes.
        const density = Math.max(
          img.naturalWidth / layer.size.width,
          img.naturalHeight / layer.size.height,
        )
        best = Math.max(best, density * canvasLong)
      }
      setSourceLongEdge(best > 0 ? Math.round(best) : null)
    }
  }

  const handleExport = async () => {
    if (!project || !authResult?.authorized || !authResult.userId) return

    setProgress({ status: 'preparing', progress: 0, message: 'Preparing export...' })
    setDownloadUrl(null)

    try {
      // Record the export and deduct tokens first
      const recordResult = await recordExport(
        authResult.userId,
        settings.resolution,
        settings.duration,
        settings.frameRate,
        authResult.freeApplied || false
      )

      if (!recordResult.success) {
        throw new Error(recordResult.error || 'Failed to process export')
      }

      const { width, height } = getExportDimensions(
        RESOLUTION_CONFIGS[settings.resolution].longEdge,
        project.canvasSize,
      )
      const totalFrames = settings.duration * settings.frameRate

      // Create offscreen canvas for rendering
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!

      // Preload all images
      await preloadImages(project.layers)

      setProgress({ status: 'rendering', progress: 5, message: 'Starting render...', currentFrame: 0, totalFrames })

      const onProgress = (frame: number, total: number) => {
        setProgress({
          status: 'rendering',
          progress: 5 + (frame / total) * 85,
          currentFrame: frame,
          totalFrames: total,
          message: `Rendering frame ${frame} of ${total}`,
        })
      }

      // Prefer WebCodecs: it encodes each rendered frame with an explicit, evenly
      // spaced timestamp, so playback is perfectly smooth and the duration is exact,
      // regardless of how long any frame took to render. Fall back to MediaRecorder
      // (real-time capture) only where WebCodecs/VP9/VP8 isn't available.
      const codecChoice = await pickVideoCodec(width, height, videoBitrate, settings.frameRate)

      const blob = codecChoice
        ? await encodeWithWebCodecs(
            canvas, ctx, project, width, height, totalFrames, settings.frameRate,
            videoBitrate, codecChoice.encoderCodec, codecChoice.muxerCodec, onProgress, imageCache.current,
          )
        : await encodeWithMediaRecorder(
            canvas, ctx, project, width, height, totalFrames, settings.frameRate,
            videoBitrate, onProgress, imageCache.current,
          )

      setProgress({ status: 'encoding', progress: 90, message: 'Encoding video...' })

      // Guard: a valid render is always at least a few KB. If we produced (next to)
      // nothing, surface a clear error instead of handing over a blank file.
      if (blob.size < 2048) {
        throw new Error(
          'The export came out empty. Try a shorter duration, a lower resolution, or fewer/lighter effects.',
        )
      }

      setProgress({ status: 'finalizing', progress: 95, message: 'Creating download...' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setExportedAt(new Date())
      setProgress({ status: 'complete', progress: 100, message: 'Rendering complete!' })

    } catch (error) {
      console.error('[v0] Export error:', error)
      setProgress({ 
        status: 'error', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Export failed'
      })
    }
  }

  const handleDownload = () => {
    if (!downloadUrl || !project) return
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_export.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleClose = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(null)
    }
    setExportedAt(null)
    setProgress({ status: 'idle', progress: 0 })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-primary flex items-center gap-2">
            {progress.status === 'complete' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Film className="w-5 h-5" />
            )}
            {progress.status === 'complete' ? 'Rendering Complete' : 'Export Animated Map'}
          </DialogTitle>
          <DialogDescription>
            {progress.status === 'complete'
              ? 'Download, share, and grow your collection of animated maps'
              : 'Export your animated map as a video file for use in VTTs'}
          </DialogDescription>
        </DialogHeader>

        {progress.status === 'idle' ? (
          <div className="space-y-5 py-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Film className="w-4 h-4 text-muted-foreground" />
                Format
              </Label>
              <div className="flex h-10 items-center rounded-md border border-border bg-muted/50 px-3 text-sm text-foreground">
                WebM
              </div>
              <p className="text-xs text-muted-foreground">
                WebM is supported by Foundry VTT, Roll20, D&D Beyond Maps, and most browsers
              </p>
            </div>

            {/* Resolution Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                Resolution
              </Label>
              <Select
                value={settings.resolution}
                onValueChange={(v) => setSettings(s => ({ ...s, resolution: v as ExportResolution }))}
              >
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sd">SD (up to 1280px)</SelectItem>
                  <SelectItem value="hd">HD (up to 1920px)</SelectItem>
                </SelectContent>
              </Select>
              {isUpscaling && (
                <p className="flex items-start gap-1.5 text-xs text-amber-500">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    Your map art is only ~{sourceLongEdge}px on its longest side, so{' '}
                    {RESOLUTION_CONFIGS[settings.resolution].label} will upscale it without adding
                    real detail.
                    {settings.resolution === 'hd' && ' SD looks just as sharp here and is free.'}
                  </span>
                </p>
              )}
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Duration
              </Label>
              <Select
                value={settings.duration.toString()}
                onValueChange={(v) => setSettings(s => ({ ...s, duration: parseInt(v) as ExportDuration }))}
              >
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frame Rate Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                Frame Rate
              </Label>
              <Select
                value={settings.frameRate.toString()}
                onValueChange={(v) => setSettings(s => ({ ...s, frameRate: parseInt(v) as ExportFrameRate }))}
              >
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 FPS (Cinematic)</SelectItem>
                  <SelectItem value="30">30 FPS (Standard)</SelectItem>
                  <SelectItem value="60">60 FPS (Smooth)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Info */}
            <div className="rounded-lg bg-muted/30 p-3 border border-border">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Estimated output:</strong>{' '}
                {settings.duration * settings.frameRate} frames at{' '}
                {exportDimensions ? `${exportDimensions.width}×${exportDimensions.height}` : '—'}
                {' · ~'}{estimatedSizeMb.toFixed(1)} MB
              </p>
            </div>

            {/* Token Cost Display */}
            <div className="rounded-lg bg-primary/5 p-4 border border-primary/20 space-y-3">
              {checkingAuth ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking account...
                </div>
              ) : authResult ? (
                <>
                  {!authResult.userId ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LogIn className="w-4 h-4" />
                        Sign in to export
                      </div>
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <Link href="/auth/login">Sign In</Link>
                      </Button>
                    </div>
                  ) : authResult.unlimited ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-600">
                        Unlimited exports — this export is free
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Daily free allowance status */}
                      {authResult.dailyFreeAvailable ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Gift className="w-4 h-4 text-green-500 shrink-0" />
                          <span className="text-green-600">
                            Free daily export available
                            {!authResult.freeApplied && ' — SD at 5s or 10s, 30fps'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Gift className="w-4 h-4 shrink-0" />
                          <span>Daily free export already used today</span>
                        </div>
                      )}

                      {/* Cost of this export */}
                      {authResult.freeApplied ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-green-600">This export is free</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Coins className="w-5 h-5 text-primary" />
                              <span className="font-medium">
                                Cost: {exportCost} {exportCost === 1 ? 'export' : 'exports'}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Balance: {authResult.tokenBalance || 0}
                            </span>
                          </div>
                          {!authResult.authorized && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-destructive">{authResult.error}</span>
                              <Button asChild size="sm" variant="outline">
                                <Link href="/pricing">Buy Exports</Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        ) : progress.status === 'complete' ? (
          <div className="py-2 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {/* Success header */}
            <div className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-green-500/10">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <h3 className="font-serif text-lg text-primary">Your animated map is ready.</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Help other Game Masters discover animated maps and earn bonus exports through referrals.
              </p>
            </div>

            {/* Preview */}
            {downloadUrl && (
              <div className="rounded-lg overflow-hidden border border-border bg-black">
                <video
                  src={downloadUrl}
                  className="w-full max-h-64 object-contain"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            )}

            {/* Export details */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/40 border border-border p-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Resolution</p>
                <p className="text-sm font-medium">{settings.resolution.toUpperCase()}</p>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border p-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">{settings.duration}s</p>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border p-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {(exportedAt ?? new Date()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Referral - earn bonus exports (above the download button) */}
            <ShareSection section="referral" />

            {/* Download button */}
            {downloadUrl && (
              <Button
                onClick={handleDownload}
                className="w-full bg-primary text-primary-foreground gap-2"
              >
                <Download className="w-4 h-4" />
                Export File
              </Button>
            )}

            {/* Social share (below the download button) */}
            <div className="pt-2 border-t border-border">
              <ShareSection section="social" />
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            {/* Progress Display */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {progress.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  )}
                  <span className="text-sm font-medium">
                    {STATUS_MESSAGES[progress.status]}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress.progress)}%
                </span>
              </div>
              
              <Progress value={progress.progress} className="h-2" />
              
              {progress.currentFrame && progress.totalFrames && (
                <p className="text-xs text-muted-foreground text-center">
                  Frame {progress.currentFrame} of {progress.totalFrames}
                </p>
              )}

              {progress.error && (
                <p className="text-xs text-destructive text-center">
                  {progress.error}
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {progress.status === 'idle' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleExport}
                disabled={!project || !authResult?.authorized || checkingAuth}
                className="bg-primary text-primary-foreground gap-2"
              >
                <Film className="w-4 h-4" />
                {authResult?.unlimited || authResult?.freeApplied
                  ? 'Export Free'
                  : `Export (${exportCost} ${exportCost === 1 ? 'export' : 'exports'})`}
              </Button>
            </>
          )}
          {progress.status === 'complete' && (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
          {progress.status === 'error' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleExport}>
                Retry
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type ProgressFn = (frame: number, total: number) => void

// Pick the best available encoder/codec pair, or null if WebCodecs can't be used.
// Returns the WebCodecs codec string (for VideoEncoder.configure) and the matching
// webm-muxer codec id. Tries VP9 at descending levels, then VP8.
async function pickVideoCodec(
  width: number,
  height: number,
  bitrate: number,
  framerate: number,
): Promise<{ encoderCodec: string; muxerCodec: 'V_VP9' | 'V_VP8' } | null> {
  if (typeof window === 'undefined' || typeof (window as { VideoEncoder?: unknown }).VideoEncoder === 'undefined') {
    return null
  }
  const candidates: Array<{ encoderCodec: string; muxerCodec: 'V_VP9' | 'V_VP8' }> = [
    { encoderCodec: 'vp09.00.41.08', muxerCodec: 'V_VP9' }, // VP9 profile0, level 4.1 (≥1080p60), 8-bit
    { encoderCodec: 'vp09.00.40.08', muxerCodec: 'V_VP9' }, // VP9 level 4.0 (1080p30)
    { encoderCodec: 'vp09.00.10.08', muxerCodec: 'V_VP9' }, // VP9 level 1.0 (small)
    { encoderCodec: 'vp8', muxerCodec: 'V_VP8' },
  ]
  for (const c of candidates) {
    try {
      const support = await VideoEncoder.isConfigSupported({ codec: c.encoderCodec, width, height, bitrate, framerate })
      if (support.supported) return c
    } catch {
      // try the next candidate
    }
  }
  return null
}

// Deterministic encode: render each frame, then hand it to a WebCodecs VideoEncoder
// with an explicit, evenly spaced timestamp. Frame timing is baked in, so the result
// is perfectly smooth and exactly `totalFrames / framerate` seconds long no matter
// how long any individual frame took to render.
async function encodeWithWebCodecs(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  project: Project,
  width: number,
  height: number,
  totalFrames: number,
  framerate: number,
  bitrate: number,
  encoderCodec: string,
  muxerCodec: 'V_VP9' | 'V_VP8',
  onProgress: ProgressFn,
  imageCache: Map<string, HTMLImageElement>,
): Promise<Blob> {
  const target = new ArrayBufferTarget()
  const muxer = new Muxer({ target, video: { codec: muxerCodec, width, height, frameRate: framerate } })

  let encodeError: unknown = null
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => { encodeError = e },
  })
  encoder.configure({ codec: encoderCodec, width, height, bitrate, framerate })

  const frameDurUs = 1_000_000 / framerate
  const keyEvery = Math.max(1, Math.round(framerate * 2)) // keyframe ~every 2s

  for (let frame = 0; frame < totalFrames; frame++) {
    if (encodeError) throw encodeError
    await renderFrame(ctx, project, width, height, (frame / framerate) * 1000, imageCache)

    const videoFrame = new VideoFrame(canvas, {
      timestamp: Math.round(frame * frameDurUs),
      duration: Math.round(frameDurUs),
    })
    encoder.encode(videoFrame, { keyFrame: frame % keyEvery === 0 })
    videoFrame.close()

    onProgress(frame + 1, totalFrames)

    // Apply backpressure so the encode queue can't grow unbounded; always yield.
    if (encoder.encodeQueueSize > 4) {
      while (encoder.encodeQueueSize > 2) {
        await new Promise((r) => setTimeout(r, 4))
      }
    } else {
      await new Promise((r) => setTimeout(r, 0))
    }
  }

  await encoder.flush()
  encoder.close()
  if (encodeError) throw encodeError

  muxer.finalize()
  return new Blob([target.buffer], { type: 'video/webm' })
}

// Fallback path: real-time capture via MediaRecorder. captureStream(fps) samples the
// canvas on a wall-clock timeline, so the loop yields a macrotask EVERY frame —
// including when behind schedule — otherwise a heavy scene starves the recorder and
// produces an empty file.
async function encodeWithMediaRecorder(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  project: Project,
  width: number,
  height: number,
  totalFrames: number,
  framerate: number,
  bitrate: number,
  onProgress: ProgressFn,
  imageCache: Map<string, HTMLImageElement>,
): Promise<Blob> {
  const stream = canvas.captureStream(framerate)
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm;codecs=vp8'
  const mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate })

  const chunks: Blob[] = []
  mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
  const recordingComplete = new Promise<Blob>((resolve) => {
    mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }))
  })

  mediaRecorder.start()
  const frameDuration = 1000 / framerate
  const startTime = performance.now()

  for (let frame = 0; frame < totalFrames; frame++) {
    await renderFrame(ctx, project, width, height, (frame / framerate) * 1000, imageCache)
    onProgress(frame + 1, totalFrames)
    const elapsed = performance.now() - startTime
    const expectedTime = frame * frameDuration
    if (elapsed < expectedTime) {
      await new Promise((resolve) => setTimeout(resolve, expectedTime - elapsed))
    } else {
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }

  mediaRecorder.stop()
  return recordingComplete
}

// Helper function to render a single frame
async function renderFrame(
  ctx: CanvasRenderingContext2D,
  project: Project,
  width: number,
  height: number,
  time: number,
  imageCache: Map<string, HTMLImageElement>
): Promise<void> {
  // Clear canvas with dark background
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, width, height)

  // Calculate scale to fit project canvas into export resolution
  const scaleX = width / project.canvasSize.width
  const scaleY = height / project.canvasSize.height
  const scale = Math.min(scaleX, scaleY)

  // Center offset
  const offsetX = (width - project.canvasSize.width * scale) / 2
  const offsetY = (height - project.canvasSize.height * scale) / 2

  ctx.save()
  ctx.translate(offsetX, offsetY)
  ctx.scale(scale, scale)

  // Sort layers by zIndex
  const sortedLayers = [...project.layers].sort((a, b) => a.zIndex - b.zIndex)

  for (const layer of sortedLayers) {
    if (!layer.visible) continue

    ctx.save()
    ctx.globalAlpha = layer.opacity

    // Apply layer transforms
    const centerX = layer.position.x + layer.size.width / 2
    const centerY = layer.position.y + layer.size.height / 2
    ctx.translate(centerX, centerY)
    ctx.rotate((layer.rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)

    if (layer.type === 'map' || layer.type === 'asset') {
      // Draw image layer from cache
      const img = imageCache.get(layer.src)
      if (img) {
        ctx.drawImage(img, layer.position.x, layer.position.y, layer.size.width, layer.size.height)
      }
    } else if (layer.type === 'effect') {
      // Draw the effect on its own transparent layer, then composite — mirrors the
      // editor's per-layer canvases so additive effects don't blow out over the map.
      renderEffectIsolated(ctx, layer as ExpandedEffectLayer, time, imageCache, width, height)
    } else if (layer.type === 'grid') {
      drawGridLayer(ctx, layer as GridLayer)
    }

    ctx.restore()
  }

  ctx.restore()
}

// Draw a grid layer onto the export canvas, matching the editor's GridOverlay
// geometry (square lines or pointy-top hexes). Layer opacity is already applied
// via ctx.globalAlpha by the caller.
function drawGridLayer(ctx: CanvasRenderingContext2D, layer: GridLayer) {
  const { gridSize } = layer
  const ox = layer.position.x
  const oy = layer.position.y
  const W = layer.size.width
  const H = layer.size.height

  ctx.save()
  ctx.beginPath()
  ctx.rect(ox, oy, W, H)
  ctx.clip()
  ctx.strokeStyle = layer.color || 'rgba(214, 188, 250, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()

  if (layer.gridType === 'hex') {
    const hexSize = gridSize / 2
    const hexWidth = Math.sqrt(3) * hexSize
    const hexHeight = 2 * hexSize
    const vertSpacing = hexHeight * 0.75
    const cols = Math.ceil(W / hexWidth) + 2
    const rows = Math.ceil(H / vertSpacing) + 2
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = ox + col * hexWidth + (row % 2 === 1 ? hexWidth / 2 : 0)
        const cy = oy + row * vertSpacing
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2
          const x = cx + hexSize * Math.cos(angle)
          const y = cy + hexSize * Math.sin(angle)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
      }
    }
  } else {
    for (let x = 0; x <= W; x += gridSize) {
      ctx.moveTo(ox + x, oy)
      ctx.lineTo(ox + x, oy + H)
    }
    for (let y = 0; y <= H; y += gridSize) {
      ctx.moveTo(ox, oy + y)
      ctx.lineTo(ox + W, oy + y)
    }
  }
  ctx.stroke()
  ctx.restore()
}

// Reused offscreen "layer" canvas. Effects render onto this transparent surface so
// their own compositing (e.g. additive 'lighter') accumulates against transparency
// rather than against the map — then the finished layer is blended over the map with
// the layer's opacity. This reproduces the editor, where every effect lives on its
// own DOM canvas. Without it, additive effects 'lighter' straight onto bright map
// pixels and blow out, and layer opacity is applied per-particle instead of to the
// whole layer.
let layerCanvas: HTMLCanvasElement | null = null
let layerCtx: CanvasRenderingContext2D | null = null

function renderEffectIsolated(
  mainCtx: CanvasRenderingContext2D,
  layer: ExpandedEffectLayer,
  time: number,
  imageCache: Map<string, HTMLImageElement>,
  canvasW: number,
  canvasH: number,
): void {
  if (!layerCanvas || layerCanvas.width !== canvasW || layerCanvas.height !== canvasH) {
    layerCanvas = document.createElement('canvas')
    layerCanvas.width = canvasW
    layerCanvas.height = canvasH
    layerCtx = layerCanvas.getContext('2d')
  }
  const fx = layerCtx
  if (!fx) {
    // Fallback: draw directly if an offscreen context couldn't be created.
    renderEffect(mainCtx, layer, time, imageCache, layer.opacity)
    return
  }

  // Render the effect at full strength onto the transparent layer, using the main
  // canvas's current transform so it lands in the same place (position + rotation).
  const m = mainCtx.getTransform()
  fx.setTransform(1, 0, 0, 1, 0, 0)
  fx.globalAlpha = 1
  fx.globalCompositeOperation = 'source-over'
  fx.clearRect(0, 0, canvasW, canvasH)
  fx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f)
  renderEffect(fx, layer, time, imageCache, 1)

  // Composite the finished layer over the scene with the layer's opacity and its
  // chosen blend mode (matches the preview's CSS mix-blend-mode). 'normal' maps to
  // source-over. The blend-mode strings are valid GlobalCompositeOperation values.
  mainCtx.save()
  mainCtx.setTransform(1, 0, 0, 1, 0, 0)
  mainCtx.globalAlpha = layer.opacity
  mainCtx.globalCompositeOperation =
    layer.blendMode && layer.blendMode !== 'normal'
      ? (layer.blendMode as GlobalCompositeOperation)
      : 'source-over'
  mainCtx.drawImage(layerCanvas, 0, 0)
  mainCtx.restore()
}

// Render effect with time-based animation. `opacity` is the alpha the effect draws
// at; isolated rendering passes 1 here and applies the layer opacity when the
// offscreen layer is composited (see renderEffectIsolated), exactly like the editor.
function renderEffect(
  ctx: CanvasRenderingContext2D,
  layer: ExpandedEffectLayer,
  time: number,
  imageCache: Map<string, HTMLImageElement>,
  opacity: number
): void {
  const { position, size, effectId, settings } = layer
  const color = (settings?.color as string) || '#ff6b00'
  const secondaryColor = (settings?.secondaryColor as string) || '#ffcc00'
  const speed = (settings?.speed as number) || 50
  
  const centerX = position.x + size.width / 2
  const centerY = position.y + size.height / 2
  const radius = Math.min(size.width, size.height) / 2
  
  // Time-based animation values
  const normalizedTime = (time * speed / 100) / 1000
  const pulse = 0.5 + 0.5 * Math.sin(normalizedTime * Math.PI * 2)
  const fastPulse = 0.5 + 0.5 * Math.sin(normalizedTime * Math.PI * 4)

  ctx.save()
  // Circle shape: clip the effect to an inscribed ellipse, matching the preview's
  // border-radius:50% on the layer container. Intersects with the exclusion clip below.
  if (layer.shape === 'circle') {
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, size.width / 2, size.height / 2, 0, 0, Math.PI * 2)
    ctx.clip()
  }
  // Punch out the layer's exclusion zones so the effect skips them (matches preview).
  clipToExclusions(ctx, layer.exclusions, { x: position.x, y: position.y, width: size.width, height: size.height })

  // Effects with a registry renderer (the shared sprite-sheet packs today;
  // particle/vector backends later) draw through the exact same code path as the
  // editor preview — so export matches preview by construction. Sprite images are
  // preloaded into the shared cache in preloadImages().
  const renderer = getRenderer(effectId)
  if (renderer) {
    renderer.draw(effectId, {
      ctx,
      timeMs: time,
      bounds: { x: position.x, y: position.y, width: size.width, height: size.height },
      opacity,
      settings,
    })
    ctx.restore()
    return
  }

  switch (effectId) {
    case 'torch':
    case 'campfire':
    case 'brazier':
    case 'lantern':
    case 'candles':
    case 'magical-light': {
      // Flickering light effect
      const flickerIntensity = 0.7 + 0.3 * Math.sin(normalizedTime * Math.PI * 8 + Math.random() * 0.1)
      
      // Outer glow
      const outerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * (0.9 + pulse * 0.2))
      outerGradient.addColorStop(0, color + '60')
      outerGradient.addColorStop(0.5, color + '30')
      outerGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = outerGradient
      ctx.fillRect(position.x, position.y, size.width, size.height)
      
      // Inner glow
      const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.4 * flickerIntensity)
      innerGradient.addColorStop(0, secondaryColor + 'cc')
      innerGradient.addColorStop(0.5, color + '88')
      innerGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = innerGradient
      ctx.fillRect(position.x, position.y, size.width, size.height)
      break
    }

    case 'lightning-storm': {
      // Random lightning flashes
      const flashPhase = (normalizedTime * 2) % 1
      if (flashPhase < 0.05 || (flashPhase > 0.1 && flashPhase < 0.12)) {
        ctx.fillStyle = color + 'aa'
        ctx.fillRect(position.x, position.y, size.width, size.height)
      }
      break
    }

    case 'waterfall': {
      // Filled flowing water band (70% width, centered)
      const bandWidth = size.width * 0.7
      const bandX = position.x + (size.width - bandWidth) / 2
      const flowGradient = ctx.createLinearGradient(bandX, position.y, bandX, position.y + size.height)
      flowGradient.addColorStop(0, color + 'cc')
      flowGradient.addColorStop(0.6, color + 'aa')
      flowGradient.addColorStop(1, (secondaryColor || '#ffffff') + '88')
      ctx.fillStyle = flowGradient
      ctx.fillRect(bandX, position.y, bandWidth, size.height)

      // Flowing highlight streaks
      ctx.strokeStyle = (secondaryColor || '#ffffff') + '99'
      ctx.lineWidth = 3
      const streakOffset = (normalizedTime * 200) % 60
      for (let i = 0; i < 8; i++) {
        const x = bandX + (i + 0.5) * bandWidth / 8
        const waveOffset = Math.sin(normalizedTime * 4 + i) * 3
        ctx.beginPath()
        ctx.moveTo(x + waveOffset, position.y - 60 + streakOffset)
        ctx.lineTo(x - waveOffset, position.y + size.height)
        ctx.stroke()
      }
      // Mist at bottom
      const mistGradient = ctx.createLinearGradient(position.x, position.y + size.height * 0.7, position.x, position.y + size.height)
      mistGradient.addColorStop(0, 'transparent')
      mistGradient.addColorStop(1, (secondaryColor || '#ffffff') + '66')
      ctx.fillStyle = mistGradient
      ctx.fillRect(position.x, position.y, size.width, size.height)
      break
    }

    case 'floating-runes': {
      // Floating magical symbols
      ctx.fillStyle = color + 'cc'
      ctx.font = `${radius * 0.3}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const runes = ['\u16A0', '\u16A2', '\u16A6', '\u16A8', '\u16B1', '\u16B9'] // Elder Futhark runes
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + normalizedTime
        const dist = radius * 0.5
        const x = centerX + Math.cos(angle) * dist
        const y = centerY + Math.sin(angle) * dist + Math.sin(normalizedTime * 2 + i) * 5
        ctx.globalAlpha = layer.opacity * (0.5 + 0.5 * Math.sin(normalizedTime * 3 + i))
        ctx.fillText(runes[i % runes.length], x, y)
      }
      ctx.globalAlpha = layer.opacity
      // Center glow
      const runeGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.3)
      runeGlow.addColorStop(0, color + '40')
      runeGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = runeGlow
      ctx.fillRect(position.x, position.y, size.width, size.height)
      break
    }

    case 'necrotic-corruption': {
      // Dark spreading tendrils
      ctx.strokeStyle = color + '80'
      ctx.lineWidth = 3
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const length = radius * (0.6 + 0.3 * Math.sin(normalizedTime + i))
        const wobble = Math.sin(normalizedTime * 2 + i * 2) * 10
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.quadraticCurveTo(
          centerX + Math.cos(angle) * length * 0.5 + wobble,
          centerY + Math.sin(angle) * length * 0.5,
          centerX + Math.cos(angle) * length,
          centerY + Math.sin(angle) * length
        )
        ctx.stroke()
      }
      // Sickly glow
      const necroGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.5)
      necroGlow.addColorStop(0, (secondaryColor || '#84cc16') + '60')
      necroGlow.addColorStop(1, color + '30')
      ctx.fillStyle = necroGlow
      ctx.fillRect(position.x, position.y, size.width, size.height)
      break
    }

    case 'spirit-apparitions': {
      // Ghostly floating shapes
      ctx.fillStyle = color + '40'
      for (let i = 0; i < 4; i++) {
        const ghostX = position.x + ((i * size.width / 4) + normalizedTime * 30) % size.width
        const ghostY = position.y + size.height * 0.3 + Math.sin(normalizedTime + i * 2) * 20
        const ghostSize = radius * 0.2
        
        ctx.globalAlpha = layer.opacity * (0.3 + 0.3 * Math.sin(normalizedTime * 2 + i))
        ctx.beginPath()
        ctx.ellipse(ghostX, ghostY, ghostSize * 0.6, ghostSize, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = layer.opacity
      break
    }

    case 'energy-shields': {
      // Hexagonal force field
      ctx.strokeStyle = color + '80'
      ctx.lineWidth = 2
      const hexSize = radius * 0.15
      const hexH = hexSize * Math.sqrt(3)
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
          const hx = position.x + col * hexSize * 1.5 + (row % 2) * hexSize * 0.75
          const hy = position.y + row * hexH * 0.5
          const pulseAlpha = 0.3 + 0.7 * Math.sin(normalizedTime * 3 + row + col)
          ctx.globalAlpha = layer.opacity * pulseAlpha
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 6
            const px = hx + hexSize * 0.4 * Math.cos(angle)
            const py = hy + hexSize * 0.4 * Math.sin(angle)
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.stroke()
        }
      }
      ctx.globalAlpha = layer.opacity
      break
    }

    case 'data-streams': {
      // Falling matrix-style code
      ctx.fillStyle = color
      ctx.font = `${radius * 0.08}px monospace`
      const chars = '01アイウエオカキクケコ'
      const columns = 12
      for (let col = 0; col < columns; col++) {
        const x = position.x + (col * size.width / columns)
        const charCount = 8
        for (let i = 0; i < charCount; i++) {
          const y = position.y + ((i * 20 + normalizedTime * 100 + col * 30) % size.height)
          const charAlpha = 1 - (i / charCount)
          ctx.globalAlpha = layer.opacity * charAlpha
          const char = chars[Math.floor((normalizedTime * 10 + col + i) % chars.length)]
          ctx.fillText(char, x, y)
        }
      }
      ctx.globalAlpha = layer.opacity
      break
    }

    case 'reactor-core': {
      // Pulsing energy core
      const corePulse = 0.7 + 0.3 * Math.sin(normalizedTime * Math.PI * 4)
      
      // Outer energy ring
      ctx.strokeStyle = color + '60'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.7 * corePulse, 0, Math.PI * 2)
      ctx.stroke()
      
      // Inner energy ring
      ctx.strokeStyle = secondaryColor + '80'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.4 * corePulse, 0, Math.PI * 2)
      ctx.stroke()
      
      // Core glow
      const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.3 * corePulse)
      coreGlow.addColorStop(0, secondaryColor + 'ff')
      coreGlow.addColorStop(0.5, color + 'aa')
      coreGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = coreGlow
      ctx.fillRect(position.x, position.y, size.width, size.height)
      
      // Energy arcs
      ctx.strokeStyle = secondaryColor + 'cc'
      ctx.lineWidth = 2
      for (let i = 0; i < 4; i++) {
        const arcAngle = normalizedTime * 2 + (i / 4) * Math.PI * 2
        const arcRadius = radius * 0.5
        ctx.beginPath()
        ctx.arc(centerX, centerY, arcRadius, arcAngle, arcAngle + Math.PI * 0.3)
        ctx.stroke()
      }
      break
    }

    case 'arcane-circles':
    case 'portals': {
      // Rotating magic circle
      ctx.strokeStyle = color + '80'
      ctx.lineWidth = 2
      const rotationAngle = normalizedTime * Math.PI * 2
      
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotationAngle)
      
      // Outer ring
      ctx.beginPath()
      ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2)
      ctx.stroke()
      
      // Inner ring
      ctx.beginPath()
      ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2)
      ctx.stroke()
      
      // Runes/segments
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(Math.cos(angle) * radius * 0.5, Math.sin(angle) * radius * 0.5)
        ctx.lineTo(Math.cos(angle) * radius * 0.8, Math.sin(angle) * radius * 0.8)
        ctx.stroke()
      }
      
      ctx.restore()
      
      // Center glow
      const centerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.3)
      centerGlow.addColorStop(0, color + '60')
      centerGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = centerGlow
      ctx.fillRect(position.x, position.y, size.width, size.height)
      break
    }

    default: {
      // Generic pulsing glow for other effects
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius * (0.8 + pulse * 0.4)
      )
      gradient.addColorStop(0, color + 'cc')
      gradient.addColorStop(0.5, color + '66')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(position.x, position.y, size.width, size.height)
    }
  }

  ctx.restore()
}

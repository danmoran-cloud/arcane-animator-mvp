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
} from '@/lib/export-types'
import { calculateExportCost } from '@/lib/tokens'
import { checkExportAuthorization, recordExport, type ExportAuthResult } from '@/app/actions/exports'
import { ShareSection } from './share-section'
import type { Project, Layer, ExpandedEffectLayer } from '@/lib/types'
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
  complete: 'Export complete!',
  error: 'Export failed',
}

export function ExportModal({ open, onOpenChange, project }: ExportModalProps) {
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS)
  const [progress, setProgress] = useState<ExportProgress>({ status: 'idle', progress: 0 })
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [exportedAt, setExportedAt] = useState<Date | null>(null)
  const [authResult, setAuthResult] = useState<ExportAuthResult | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(false)
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const abortController = useRef<AbortController | null>(null)

  const isExporting = ['preparing', 'rendering', 'encoding', 'finalizing'].includes(progress.status)
  const exportCost = calculateExportCost(settings.resolution, settings.duration)

  // Check authorization when modal opens or settings change
  useEffect(() => {
    if (open) {
      checkAuth()
    }
  }, [open, settings.resolution, settings.duration])

  const checkAuth = async () => {
    setCheckingAuth(true)
    const result = await checkExportAuthorization(settings.resolution, settings.duration)
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
    
    // Preload torch-2 sprite sheet if any torch-2 effects exist
    const torch2SpriteUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fire1_64-kpuvZ5egbmbnm855kp1iCwuhNz9LAZ.png'
    const hasTorch2 = layers.some(l => l.type === 'effect' && (l as ExpandedEffectLayer).effectId === 'torch-2')
    if (hasTorch2 && !imageCache.current.has(torch2SpriteUrl)) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = torch2SpriteUrl
      })
      imageCache.current.set(torch2SpriteUrl, img)
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
        authResult.hasFreeExport || false
      )

      if (!recordResult.success) {
        throw new Error(recordResult.error || 'Failed to process export')
      }

      const { width, height } = RESOLUTION_CONFIGS[settings.resolution]
      const totalFrames = settings.duration * settings.frameRate
      const frameDuration = 1000 / settings.frameRate

      // Create offscreen canvas for rendering
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!

      // Preload all images
      await preloadImages(project.layers)

      setProgress({ status: 'rendering', progress: 5, message: 'Starting render...', currentFrame: 0, totalFrames })

      // Setup MediaRecorder for WebM capture
      const stream = canvas.captureStream(settings.frameRate)
      
      // Check for VP9 support, fall back to VP8
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9'
        : 'video/webm;codecs=vp8'
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: settings.resolution === '4k' ? 20000000 : 
                           settings.resolution === 'hd' ? 10000000 : 5000000,
      })

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      const recordingComplete = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' })
          resolve(blob)
        }
      })

      // Start recording
      mediaRecorder.start()

      // Render frames with timing
      const startTime = performance.now()
      
      for (let frame = 0; frame < totalFrames; frame++) {
        const animationTime = (frame / settings.frameRate) * 1000
        
        // Render frame
        await renderFrame(ctx, project, width, height, animationTime, imageCache.current)

        // Update progress
        const progressPercent = 5 + (frame / totalFrames) * 85
        setProgress({
          status: 'rendering',
          progress: progressPercent,
          currentFrame: frame + 1,
          totalFrames,
          message: `Rendering frame ${frame + 1} of ${totalFrames}`,
        })

        // Wait to maintain frame rate timing
        const elapsed = performance.now() - startTime
        const expectedTime = frame * frameDuration
        if (elapsed < expectedTime) {
          await new Promise(resolve => setTimeout(resolve, expectedTime - elapsed))
        }
      }

      // Stop recording and wait for completion
      setProgress({ status: 'encoding', progress: 90, message: 'Encoding video...' })
      mediaRecorder.stop()
      
      const blob = await recordingComplete
      
      setProgress({ status: 'finalizing', progress: 95, message: 'Creating download...' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setExportedAt(new Date())
      setProgress({ status: 'complete', progress: 100, message: 'Export complete!' })

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
            {progress.status === 'complete' ? 'Export Complete' : 'Export Animated Map'}
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
              <Select
                value={settings.format}
                onValueChange={(v) => setSettings(s => ({ ...s, format: v as ExportFormat }))}
              >
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webm">WebM (Recommended)</SelectItem>
                  <SelectItem value="mp4" disabled>MP4 (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                WebM is supported by Foundry VTT, Roll20, and most browsers
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
                  <SelectItem value="sd">SD (1280x720)</SelectItem>
                  <SelectItem value="hd">HD (1920x1080)</SelectItem>
                  <SelectItem value="4k">4K (3840x2160)</SelectItem>
                </SelectContent>
              </Select>
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
                {settings.duration * settings.frameRate} frames at {RESOLUTION_CONFIGS[settings.resolution].width}x{RESOLUTION_CONFIGS[settings.resolution].height}
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
                  ) : authResult.hasFreeExport && settings.resolution === 'sd' ? (
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-600">Free daily export available!</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-primary" />
                          <span className="font-medium">Cost: {exportCost} tokens</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Balance: {authResult.tokenBalance || 0}
                        </span>
                      </div>
                      {!authResult.authorized && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-destructive">{authResult.error}</span>
                          <Button asChild size="sm" variant="outline">
                            <Link href="/pricing">Buy Tokens</Link>
                          </Button>
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
                Help other Game Masters discover animated maps and earn bonus tokens through referrals.
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

            {/* Download button */}
            {downloadUrl && (
              <Button
                onClick={handleDownload}
                className="w-full bg-primary text-primary-foreground gap-2"
              >
                <Download className="w-4 h-4" />
                Download WebM
              </Button>
            )}

            {/* Share + referral */}
            <div className="pt-2 border-t border-border">
              <ShareSection />
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
                {authResult?.hasFreeExport && settings.resolution === 'sd' ? 'Export Free' : `Export (${exportCost} tokens)`}
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
      // Draw effect layer with animation
      renderEffect(ctx, layer as ExpandedEffectLayer, time, imageCache)
    }

    ctx.restore()
  }

  ctx.restore()
}

// Render effect with time-based animation
function renderEffect(
  ctx: CanvasRenderingContext2D,
  layer: ExpandedEffectLayer,
  time: number,
  imageCache: Map<string, HTMLImageElement>
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

  switch (effectId) {
    case 'torch-2': {
      // Sprite sheet animation - 60 frames, 64x64 each, 10 columns x 6 rows
      const spriteUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fire1_64-kpuvZ5egbmbnm855kp1iCwuhNz9LAZ.png'
      const spriteImg = imageCache.get(spriteUrl)
      
      if (spriteImg) {
        const frameWidth = 64
        const frameHeight = 64
        const columns = 10
        const totalFrames = 60
        
        // Calculate current frame based on time
        const frameIndex = Math.floor((normalizedTime * 30) % totalFrames)
        const col = frameIndex % columns
        const row = Math.floor(frameIndex / columns)
        
        // Source coordinates in sprite sheet
        const sx = col * frameWidth
        const sy = row * frameHeight
        
        // Stretch the sprite frame to FILL the entire layer bounds on both axes,
        // matching the editor preview (object-fit: fill / background-size: 100% 100%).
        const drawX = position.x
        const drawY = position.y
        const drawWidth = size.width
        const drawHeight = size.height
        
        // Draw ambient glow first
        const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
        glowGradient.addColorStop(0, color + '50')
        glowGradient.addColorStop(0.5, color + '25')
        glowGradient.addColorStop(1, 'transparent')
        ctx.fillStyle = glowGradient
        ctx.fillRect(position.x, position.y, size.width, size.height)
        
        // Draw sprite frame with additive blending to simulate screen blend mode
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(
          spriteImg,
          sx, sy, frameWidth, frameHeight,
          drawX, drawY, drawWidth, drawHeight
        )
        ctx.globalCompositeOperation = 'source-over'
      } else {
        // Fallback to basic glow if sprite not loaded
        const flickerIntensity = 0.7 + 0.3 * Math.sin(normalizedTime * Math.PI * 8)
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * flickerIntensity)
        gradient.addColorStop(0, secondaryColor + 'cc')
        gradient.addColorStop(0.5, color + '66')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fillRect(position.x, position.y, size.width, size.height)
      }
      break
    }

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

    case 'rain': {
      // Rain drops falling
      ctx.strokeStyle = color + '60'
      ctx.lineWidth = 1
      const dropCount = 30
      for (let i = 0; i < dropCount; i++) {
        const x = position.x + (i * size.width / dropCount + normalizedTime * 50) % size.width
        const y = position.y + ((i * 37 + normalizedTime * 300) % size.height)
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - 2, y + 15)
        ctx.stroke()
      }
      break
    }

    case 'snow': {
      // Snow particles
      ctx.fillStyle = color + 'cc'
      const flakeCount = 25
      for (let i = 0; i < flakeCount; i++) {
        const baseX = (i * 73) % size.width
        const drift = Math.sin(normalizedTime * 2 + i) * 10
        const x = position.x + (baseX + drift + size.width) % size.width
        const y = position.y + ((i * 43 + normalizedTime * 50) % size.height)
        const flakeSize = 2 + (i % 3)
        ctx.beginPath()
        ctx.arc(x, y, flakeSize, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }

    case 'fog':
    case 'mist': {
      // Drifting fog
      const fogOffset = Math.sin(normalizedTime * 0.5) * 20
      const gradient = ctx.createRadialGradient(
        centerX + fogOffset, centerY, 0,
        centerX + fogOffset, centerY, radius * (1.2 + pulse * 0.3)
      )
      gradient.addColorStop(0, color + '40')
      gradient.addColorStop(0.5, color + '20')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(position.x, position.y, size.width, size.height)
      break
    }

    case 'water-ripples': {
      // Concentric ripples
      ctx.strokeStyle = color + '40'
      ctx.lineWidth = 1
      for (let i = 0; i < 4; i++) {
        const rippleRadius = ((normalizedTime * 50 + i * 30) % radius)
        const alpha = 1 - rippleRadius / radius
        ctx.globalAlpha = layer.opacity * alpha
        ctx.beginPath()
        ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = layer.opacity
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

    case 'wind': {
      // Wind streaks
      ctx.strokeStyle = color + '30'
      ctx.lineWidth = 2
      const direction = ((settings?.direction as number) || 90) * Math.PI / 180
      for (let i = 0; i < 15; i++) {
        const startX = position.x + ((i * 67 + normalizedTime * 200) % size.width)
        const startY = position.y + (i * size.height / 15)
        const length = 30 + (i % 3) * 20
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(startX + Math.cos(direction) * length, startY + Math.sin(direction) * length)
        ctx.stroke()
      }
      break
    }

    case 'dust-storm': {
      // Swirling dust particles
      ctx.fillStyle = color + '60'
      const particleCount = 40
      for (let i = 0; i < particleCount; i++) {
        const angle = normalizedTime * 2 + (i * 0.5)
        const dist = (i * 13 + normalizedTime * 100) % (radius * 0.8)
        const x = centerX + Math.cos(angle) * dist + Math.sin(normalizedTime + i) * 20
        const y = centerY + Math.sin(angle * 0.7) * dist * 0.5
        const pSize = 2 + (i % 4)
        ctx.beginPath()
        ctx.arc(x, y, pSize, 0, Math.PI * 2)
        ctx.fill()
      }
      // Overlay haze
      const hazeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      hazeGradient.addColorStop(0, color + '20')
      hazeGradient.addColorStop(1, color + '40')
      ctx.fillStyle = hazeGradient
      ctx.fillRect(position.x, position.y, size.width, size.height)
      break
    }

    case 'blizzard': {
      // Intense snow with wind
      ctx.fillStyle = color + 'dd'
      const blizzardCount = 50
      const windDir = ((settings?.direction as number) || 60) * Math.PI / 180
      for (let i = 0; i < blizzardCount; i++) {
        const drift = normalizedTime * 150
        const x = position.x + ((i * 41 + drift * Math.cos(windDir)) % size.width + size.width) % size.width
        const y = position.y + ((i * 29 + drift * Math.sin(windDir) + normalizedTime * 80) % size.height)
        const flakeSize = 1 + (i % 4)
        ctx.beginPath()
        ctx.arc(x, y, flakeSize, 0, Math.PI * 2)
        ctx.fill()
      }
      // White overlay for visibility reduction
      ctx.fillStyle = color + '15'
      ctx.fillRect(position.x, position.y, size.width, size.height)
      break
    }

    case 'waterfall': {
      // Cascading water lines
      ctx.strokeStyle = color + '70'
      ctx.lineWidth = 3
      for (let i = 0; i < 8; i++) {
        const x = position.x + size.width * 0.2 + (i * size.width * 0.6 / 8)
        const waveOffset = Math.sin(normalizedTime * 4 + i) * 3
        ctx.beginPath()
        ctx.moveTo(x + waveOffset, position.y)
        ctx.lineTo(x - waveOffset, position.y + size.height)
        ctx.stroke()
      }
      // Mist at bottom
      const mistGradient = ctx.createLinearGradient(position.x, position.y + size.height * 0.7, position.x, position.y + size.height)
      mistGradient.addColorStop(0, 'transparent')
      mistGradient.addColorStop(1, (secondaryColor || '#ffffff') + '60')
      ctx.fillStyle = mistGradient
      ctx.fillRect(position.x, position.y, size.width, size.height)
      break
    }

    case 'lava-flow': {
      // Glowing lava with cracks
      const lavaGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      lavaGradient.addColorStop(0, secondaryColor + 'cc')
      lavaGradient.addColorStop(0.5, color + '99')
      lavaGradient.addColorStop(1, color + '44')
      ctx.fillStyle = lavaGradient
      ctx.fillRect(position.x, position.y, size.width, size.height)
      // Glowing cracks
      ctx.strokeStyle = secondaryColor + 'ff'
      ctx.lineWidth = 2
      for (let i = 0; i < 5; i++) {
        const crackX = position.x + (i * size.width / 5) + Math.sin(normalizedTime + i) * 10
        ctx.beginPath()
        ctx.moveTo(crackX, position.y + size.height * 0.3)
        ctx.lineTo(crackX + 10, position.y + size.height * 0.5)
        ctx.lineTo(crackX - 5, position.y + size.height * 0.7)
        ctx.stroke()
      }
      break
    }

    case 'swamp-bubbles': {
      // Murky water with bubbles
      ctx.fillStyle = color + '50'
      ctx.fillRect(position.x, position.y, size.width, size.height)
      // Rising bubbles
      ctx.strokeStyle = secondaryColor + '60'
      ctx.lineWidth = 1
      for (let i = 0; i < 12; i++) {
        const bubbleX = position.x + (i * size.width / 12) + Math.sin(i) * 10
        const bubbleY = position.y + size.height - ((normalizedTime * 40 + i * 30) % size.height)
        const bubbleSize = 3 + (i % 4)
        ctx.beginPath()
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2)
        ctx.stroke()
      }
      break
    }

    case 'ice-crystals': {
      // Frozen shimmer
      const iceGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      iceGradient.addColorStop(0, color + '60')
      iceGradient.addColorStop(0.7, color + '30')
      iceGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = iceGradient
      ctx.fillRect(position.x, position.y, size.width, size.height)
      // Sparkle points
      ctx.fillStyle = (secondaryColor || '#ffffff') + 'cc'
      for (let i = 0; i < 8; i++) {
        const sparklePhase = (normalizedTime * 3 + i * 0.5) % 1
        if (sparklePhase < 0.3) {
          const sx = position.x + ((i * 97) % size.width)
          const sy = position.y + ((i * 61) % size.height)
          ctx.beginPath()
          ctx.arc(sx, sy, 2 * sparklePhase * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      break
    }

    case 'smoke-vents': {
      // Rising smoke columns
      for (let i = 0; i < 5; i++) {
        const ventX = position.x + size.width * 0.2 + (i * size.width * 0.6 / 5)
        const smokeGradient = ctx.createRadialGradient(
          ventX, position.y + size.height, 0,
          ventX + Math.sin(normalizedTime + i) * 20, position.y, radius * 0.5
        )
        smokeGradient.addColorStop(0, color + '60')
        smokeGradient.addColorStop(0.5, color + '30')
        smokeGradient.addColorStop(1, 'transparent')
        ctx.fillStyle = smokeGradient
        ctx.fillRect(position.x, position.y, size.width, size.height)
      }
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

    case 'divine-light': {
      // Heavenly rays from above
      const rayCount = 8
      ctx.strokeStyle = color + '40'
      ctx.lineWidth = radius * 0.1
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + normalizedTime * 0.2
        const rayLength = radius * (0.8 + 0.2 * Math.sin(normalizedTime * 2 + i))
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(centerX + Math.cos(angle) * rayLength, centerY + Math.sin(angle) * rayLength)
        ctx.stroke()
      }
      // Bright center
      const divineGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.4)
      divineGlow.addColorStop(0, (secondaryColor || '#ffffff') + 'ee')
      divineGlow.addColorStop(0.5, color + '88')
      divineGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = divineGlow
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

    case 'holograms': {
      // Flickering scan lines
      const scanLineCount = 20
      ctx.strokeStyle = color + '60'
      ctx.lineWidth = 1
      for (let i = 0; i < scanLineCount; i++) {
        const y = position.y + (i * size.height / scanLineCount) + ((normalizedTime * 50) % (size.height / scanLineCount))
        const flicker = Math.random() > 0.9 ? 0 : 1
        ctx.globalAlpha = layer.opacity * flicker
        ctx.beginPath()
        ctx.moveTo(position.x, y)
        ctx.lineTo(position.x + size.width, y)
        ctx.stroke()
      }
      ctx.globalAlpha = layer.opacity
      // Holographic glow
      const holoGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      holoGlow.addColorStop(0, color + '30')
      holoGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = holoGlow
      ctx.fillRect(position.x, position.y, size.width, size.height)
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

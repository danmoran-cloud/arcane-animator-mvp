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
import type { Project, Layer, ExpandedEffectLayer } from '@/lib/types'

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
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const abortController = useRef<AbortController | null>(null)

  const isExporting = ['preparing', 'rendering', 'encoding', 'finalizing'].includes(progress.status)

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
  }

  const handleExport = async () => {
    if (!project) return

    setProgress({ status: 'preparing', progress: 0, message: 'Preparing export...' })
    setDownloadUrl(null)

    try {
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
    setProgress({ status: 'idle', progress: 0 })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-primary flex items-center gap-2">
            <Film className="w-5 h-5" />
            Export Animated Map
          </DialogTitle>
          <DialogDescription>
            Export your animated map as a video file for use in VTTs
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
          </div>
        ) : (
          <div className="py-6 space-y-4">
            {/* Progress Display */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {progress.status === 'complete' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : progress.status === 'error' ? (
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

            {/* Download Button */}
            {progress.status === 'complete' && downloadUrl && (
              <div className="pt-4 border-t border-border">
                <Button 
                  onClick={handleDownload}
                  className="w-full bg-primary text-primary-foreground gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download WebM
                </Button>
              </div>
            )}
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
                disabled={!project}
                className="bg-primary text-primary-foreground gap-2"
              >
                <Film className="w-4 h-4" />
                Start Export
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
      renderEffect(ctx, layer as ExpandedEffectLayer, time)
    }

    ctx.restore()
  }

  ctx.restore()
}

// Render effect with time-based animation
function renderEffect(
  ctx: CanvasRenderingContext2D,
  layer: ExpandedEffectLayer,
  time: number
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
    case 'torch':
    case 'torch-2':
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

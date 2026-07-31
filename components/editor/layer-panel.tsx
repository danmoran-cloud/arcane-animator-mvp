'use client'

import { useState } from 'react'
import {
  Eye, EyeOff, Lock, Unlock, Link, Unlink, Trash2, Copy,
  ChevronUp, ChevronDown, ChevronRight, RotateCcw, Shuffle, Sliders,
  Flame, Cloud, Snowflake, Droplets, Waves, Zap, Wind,
  Sparkles, CircleDot, Gem, Sun, Skull, Ghost,
  Monitor, Lightbulb, Shield, Binary, Atom, Plane, Image, Map, Grid3X3, Hexagon, Maximize2,
  Pin, PinOff, Frame
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEditor } from '@/lib/editor-store'
import { getEffectById, getEffectControlSupport, EFFECT_PACKS, type EffectPack, type EffectSettings } from '@/lib/effects-library'
import type { Layer, ExpandedEffectLayer, LayerBlendMode, Size } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'

const BLEND_MODES: LayerBlendMode[] = ['normal', 'screen', 'lighten', 'multiply', 'overlay', 'soft-light', 'color-dodge']

// Optional/advanced settings keys whose label + range drive the conditional Advanced
// sliders. A control only renders if the effect's defaults declare that key.
const ADVANCED_KEYS: { key: keyof EffectSettings; label: string; min: number; max: number; step: number }[] = [
  { key: 'direction', label: 'Direction', min: 0, max: 360, step: 1 },
  { key: 'ringCount', label: 'Ring Count', min: 1, max: 24, step: 1 },
  { key: 'branching', label: 'Branching', min: 0, max: 100, step: 1 },
  { key: 'turbulence', label: 'Turbulence', min: 0, max: 100, step: 1 },
  { key: 'pulseFrequency', label: 'Pulse Frequency', min: 0, max: 100, step: 1 },
  { key: 'spread', label: 'Spread', min: 0, max: 100, step: 1 },
]

// A reusable labelled slider row for a 0–100-style effect setting.
function SettingSlider({ label, value, onChange, min = 0, max = 100, step = 1, suffix, disabled, disabledHint }: {
  label: string; value: number; onChange: (v: number) => void
  min?: number; max?: number; step?: number; suffix?: string
  disabled?: boolean; disabledHint?: string
}) {
  return (
    <div className={cn('space-y-1.5', disabled && 'opacity-40')} title={disabled ? disabledHint : undefined}>
      <div className="flex items-center justify-between">
        <Label className="text-[10px] text-muted-foreground">{label}</Label>
        <span className="text-[10px] text-muted-foreground">{Math.round(value)}{suffix}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} disabled={disabled} />
    </div>
  )
}

function ColorRow({ label, value, onChange, disabled, disabledHint }: {
  label: string; value: string; onChange: (v: string) => void
  disabled?: boolean; disabledHint?: string
}) {
  return (
    <div className={cn('space-y-1.5', disabled && 'opacity-40')} title={disabled ? disabledHint : undefined}>
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
          className={cn('w-8 h-6 rounded border border-border', disabled ? 'cursor-not-allowed' : 'cursor-pointer')} />
        <Input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="h-6 text-xs flex-1" />
      </div>
    </div>
  )
}

// HSL→hex for the Randomize button (vivid, high-lightness colors). h:0-360, s/l:0-100.
function hslToHex(h: number, s: number, l: number): string {
  const ln = l / 100
  const a = (s / 100) * Math.min(ln, 1 - ln)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'cloud-rain': Cloud,
  'cloud': Cloud,
  'snowflake': Snowflake,
  'flame': Flame,
  'droplets': Droplets,
  'waves': Waves,
  'zap': Zap,
  'wind': Wind,
  'circle': CircleDot,
  'circle-dot': CircleDot,
  'gem': Gem,
  'sparkles': Sparkles,
  'sparkle': Sparkles,
  'sun': Sun,
  'skull': Skull,
  'ghost': Ghost,
  'monitor': Monitor,
  'lightbulb': Lightbulb,
  'shield': Shield,
  'binary': Binary,
  'atom': Atom,
  'plane': Plane,
}

function getLayerIcon(layer: Layer) {
  if (layer.type === 'map') return Map
  if (layer.type === 'asset') return Image
  if (layer.type === 'grid') return layer.gridType === 'hex' ? Hexagon : Grid3X3
  if (layer.type === 'effect') {
    const effect = getEffectById(layer.effectId)
    if (effect) return iconMap[effect.icon] || Sparkles
  }
  return Sparkles
}

function getLayerColor(layer: Layer): string {
  if (layer.type === 'effect') {
    const effect = getEffectById(layer.effectId)
    if (effect) return EFFECT_PACKS[effect.pack as EffectPack].color
  }
  return '#64748b'
}

interface LayerRowProps {
  layer: Layer
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  onSelect: () => void
  onToggleVisibility: () => void
  onToggleLock: () => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveForward: () => void
  onMoveBackward: () => void
}

function LayerRow({
  layer,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onMoveForward,
  onMoveBackward
}: LayerRowProps) {
  const IconComponent = getLayerIcon(layer)
  const color = getLayerColor(layer)
  
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-1 px-2 py-1.5 cursor-pointer transition-all whitespace-nowrap w-max min-w-full",
        "border-l-2 border-transparent",
        isSelected && "bg-accent/20 border-l-accent",
        !isSelected && "hover:bg-muted/50"
      )}
    >
      {/* Visibility */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleVisibility() }}
        className="p-0.5 hover:bg-muted rounded shrink-0"
      >
        {layer.visible ? (
          <Eye className="w-3 h-3 text-muted-foreground" />
        ) : (
          <EyeOff className="w-3 h-3 text-muted-foreground/50" />
        )}
      </button>

      {/* Link - linked layers move together */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleLock() }}
        className="p-0.5 hover:bg-muted rounded shrink-0"
        title={layer.locked ? "Linked (moves with other linked layers)" : "Not linked"}
      >
        {layer.locked ? (
          <Link className="w-3 h-3 text-primary" />
        ) : (
          <Unlink className="w-3 h-3 text-muted-foreground/50" />
        )}
      </button>

      {/* Actions: reorder, duplicate, delete — kept to the left of the name */}
      <button
        onClick={(e) => { e.stopPropagation(); onMoveForward() }}
        disabled={isFirst}
        className="p-0.5 hover:bg-muted rounded shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move forward (toward front)"
      >
        <ChevronUp className="w-3 h-3 text-muted-foreground" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onMoveBackward() }}
        disabled={isLast}
        className="p-0.5 hover:bg-muted rounded shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move backward (toward back)"
      >
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDuplicate() }}
        className="p-0.5 hover:bg-muted rounded shrink-0"
        title="Duplicate"
      >
        <Copy className="w-3 h-3 text-muted-foreground" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="p-0.5 hover:bg-destructive/20 rounded shrink-0"
        title="Delete"
      >
        <Trash2 className="w-3 h-3 text-destructive" />
      </button>

      {/* Icon */}
      <div
        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <IconComponent className="w-3 h-3" style={{ color }} />
      </div>

      {/* Name - full text (box scrolls horizontally for long names) */}
      <span className={cn(
        "text-xs pr-2",
        layer.visible ? "text-foreground" : "text-muted-foreground"
      )}>
        {layer.name}
      </span>
    </div>
  )
}

function Inspector({ layer }: { layer: Layer | null }) {
  const { state, updateLayer, dispatch } = useEditor()
  const [advancedOpen, setAdvancedOpen] = useState(false)

  // Reshape the canvas (and thus the export) to match this layer, dropping it at
  // the origin to fill the frame. Handy after swapping in a differently-shaped map.
  const handleFitCanvasToLayer = () => {
    if (!layer) return
    dispatch({ type: 'FIT_CANVAS_TO_LAYER', layerId: layer.id })
  }

  // One-click "fill the canvas". Effect/grid layers have no image to lose, so they
  // simply cover the whole canvas. Image layers (map/asset) are instead fit inside
  // the canvas at their own aspect ratio and centered, so the picture is scaled as
  // large as possible without cropping (preview object-cover) or distorting (export
  // drawImage) any of it. Rotation is reset either way (a rotated rect can't align).
  const fillCanvasExactly = (l: Layer, canvas: Size) => {
    updateLayer(l.id, {
      position: { x: 0, y: 0 },
      size: { width: canvas.width, height: canvas.height },
      rotation: 0,
    })
  }

  const handleExpandToCanvas = () => {
    if (!layer) return
    const canvas = state.project?.canvasSize
    if (!canvas) return

    const isImage =
      (layer.type === 'map' || layer.type === 'asset') &&
      /^(data:|\/|https?:)/.test(layer.src)

    if (!isImage) {
      fillCanvasExactly(layer, canvas)
      return
    }

    // Read the source image's natural size, then "contain" it within the canvas:
    // scale by the smaller axis ratio so the whole image fits, and center it.
    const src = layer.src
    const layerId = layer.id
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const iw = img.naturalWidth
      const ih = img.naturalHeight
      if (!iw || !ih) {
        // No usable dimensions — fall back to covering the canvas exactly.
        updateLayer(layerId, {
          position: { x: 0, y: 0 },
          size: { width: canvas.width, height: canvas.height },
          rotation: 0,
        })
        return
      }
      const scale = Math.min(canvas.width / iw, canvas.height / ih)
      const width = iw * scale
      const height = ih * scale
      updateLayer(layerId, {
        position: { x: (canvas.width - width) / 2, y: (canvas.height - height) / 2 },
        size: { width, height },
        rotation: 0,
      })
    }
    img.onerror = () => fillCanvasExactly({ ...layer, id: layerId } as Layer, canvas)
    img.src = src
  }

  if (!layer) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xs text-muted-foreground text-center">
          Select a layer to edit its properties
        </p>
      </div>
    )
  }
  
  const effectDef = layer.type === 'effect' ? getEffectById(layer.effectId) : null
  
  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    updateLayer(layer.id, {
      position: { ...layer.position, [axis]: value }
    })
  }
  
  const handleSizeChange = (dim: 'width' | 'height', value: number) => {
    updateLayer(layer.id, {
      size: { ...layer.size, [dim]: value }
    })
  }
  
  const handleSettingsChange = (key: string, value: number | string | boolean) => {
    if (layer.type !== 'effect') return
    updateLayer(layer.id, {
      settings: { ...(layer as ExpandedEffectLayer).settings, [key]: value }
    })
  }

  // Read an effect setting with the effect's default as the fallback.
  const setting = <K extends keyof EffectSettings>(key: K): EffectSettings[K] | undefined => {
    if (layer.type !== 'effect') return undefined
    const s = (layer as ExpandedEffectLayer).settings as EffectSettings
    return (s[key] ?? effectDef?.defaultSettings[key]) as EffectSettings[K] | undefined
  }

  // Reset all effect settings to the effect's catalog defaults.
  const handleReset = () => {
    if (layer.type !== 'effect' || !effectDef) return
    updateLayer(layer.id, { settings: { ...effectDef.defaultSettings }, blendMode: 'normal' })
  }

  // Randomize: jitter numeric settings and re-hue the colors for quick variation.
  const handleRandomize = () => {
    if (layer.type !== 'effect' || !effectDef) return
    const base = { ...effectDef.defaultSettings, ...(layer as ExpandedEffectLayer).settings } as EffectSettings
    const next: Record<string, number | string | boolean> = { ...base }
    const jitter = (v: number) => Math.round(Math.max(0, Math.min(100, v + (Math.random() - 0.5) * 50)))
    for (const k of ['speed', 'intensity', 'density', 'thickness', 'turbulence', 'branching', 'pulseFrequency', 'spread', 'glowIntensity'] as const) {
      if (base[k] !== undefined) next[k] = jitter(base[k] as number)
    }
    if (base.ringCount !== undefined) next.ringCount = 1 + Math.floor(Math.random() * 18)
    if (base.direction !== undefined) next.direction = Math.floor(Math.random() * 360)
    for (const k of ['color', 'secondaryColor', 'glowColor'] as const) {
      if (base[k] !== undefined) next[k] = hslToHex(Math.floor(Math.random() * 360), 70 + Math.random() * 25, 55 + Math.random() * 20)
    }
    updateLayer(layer.id, { settings: next as Partial<EffectSettings> })
  }

  const effectLayer = layer.type === 'effect' ? (layer as ExpandedEffectLayer) : null

  // Which effect controls actually do something for this effect. Sprite effects
  // ignore most look controls (they play a baked atlas), so those get greyed out.
  const support = effectDef
    ? getEffectControlSupport(effectDef)
    : { isSprite: false, color: true, secondaryColor: true, glowColor: true, glowIntensity: true, density: true, scaleXY: true, thickness: true, blend: true }
  const spriteHint = support.isSprite ? 'Not adjustable for sprite effects' : undefined

  return (
    <ScrollArea className="flex-1 h-full [&>[data-radix-scroll-area-viewport]]:!overflow-y-scroll">
      <div className="p-3 space-y-4">
        {/* Layer name */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Layer Name</Label>
          <Input
            value={layer.name}
            onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
            className="h-7 text-xs"
          />
        </div>
        
        {/* Transform section */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-foreground font-serif tracking-wide">
            Transform
          </h4>
          
          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">X</Label>
              <Input
                type="number"
                value={Math.round(layer.position.x)}
                onChange={(e) => handlePositionChange('x', Number(e.target.value))}
                className="h-6 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Y</Label>
              <Input
                type="number"
                value={Math.round(layer.position.y)}
                onChange={(e) => handlePositionChange('y', Number(e.target.value))}
                className="h-6 text-xs"
              />
            </div>
          </div>
          
          {/* Size */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Width</Label>
              <Input
                type="number"
                value={Math.round(layer.size.width)}
                onChange={(e) => handleSizeChange('width', Number(e.target.value))}
                className="h-6 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Height</Label>
              <Input
                type="number"
                value={Math.round(layer.size.height)}
                onChange={(e) => handleSizeChange('height', Number(e.target.value))}
                className="h-6 text-xs"
              />
            </div>
          </div>

          {/* Expand to fill the whole canvas in one click */}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 gap-1.5 text-xs"
            onClick={handleExpandToCanvas}
            title="Resize this layer to fill the entire canvas"
          >
            <Maximize2 className="w-3 h-3" />
            Expand to Fill Canvas
          </Button>

          {/* Reshape the canvas to this layer — mirror of "Expand to Fill Canvas".
              Only meaningful for image layers, whose shape should drive the frame. */}
          {(layer.type === 'map' || layer.type === 'asset') && (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 gap-1.5 text-xs"
              onClick={handleFitCanvasToLayer}
              title="Resize the canvas (and export) to match this layer's shape"
            >
              <Frame className="w-3 h-3" />
              Fit Canvas to Layer
            </Button>
          )}

          {/* Pin position — when pinned, the layer can't be dragged/resized/rotated
              on the canvas (still selectable). Defaults on for the base map so it
              can't be nudged by accident. */}
          <Button
            variant={layer.pinned ? 'secondary' : 'outline'}
            size="sm"
            className="w-full h-7 gap-1.5 text-xs"
            onClick={() => updateLayer(layer.id, { pinned: !layer.pinned })}
            title={layer.pinned ? 'Position pinned — click to allow moving & resizing' : 'Pin to lock position and size on the canvas'}
          >
            {layer.pinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
            {layer.pinned ? 'Position Pinned' : 'Position Unpinned'}
          </Button>

          {/* Rotation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Rotation</Label>
              <span className="text-[10px] text-muted-foreground">{Math.round(layer.rotation)}°</span>
            </div>
            <Slider
              value={[layer.rotation]}
              onValueChange={([v]) => updateLayer(layer.id, { rotation: v })}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Opacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Opacity</Label>
              <span className="text-[10px] text-muted-foreground">{Math.round(layer.opacity * 100)}%</span>
            </div>
            <Slider
              value={[layer.opacity * 100]}
              onValueChange={([v]) => updateLayer(layer.id, { opacity: v / 100 })}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Effect-specific controls */}
        {layer.type === 'effect' && effectDef && effectLayer && (
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground font-serif tracking-wide">
                Effect Controls
              </h4>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Reset to default" onClick={handleReset}>
                  <RotateCcw className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Randomize" onClick={handleRandomize}>
                  <Shuffle className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Sprite effects play a pre-baked atlas, so most look controls below
                do nothing. Detect that and grey out the inert ones (still visible
                so the layout/teaching stays consistent). */}
            {spriteHint && (
              <p className="text-[10px] leading-snug text-muted-foreground/80 italic">
                This is a sprite effect — greyed controls don&apos;t affect it.
              </p>
            )}

            <SettingSlider label="Speed" value={setting('speed') ?? 50} onChange={(v) => handleSettingsChange('speed', v)} />
            <SettingSlider label="Intensity" value={setting('intensity') ?? 80} onChange={(v) => handleSettingsChange('intensity', v)} />
            <SettingSlider label="Density" value={setting('density') ?? 50} onChange={(v) => handleSettingsChange('density', v)}
              disabled={support.isSprite && !support.density} disabledHint={spriteHint} />
            {effectDef.defaultSettings.glowIntensity !== undefined && (
              <SettingSlider label="Glow Strength" value={setting('glowIntensity') ?? 70} onChange={(v) => handleSettingsChange('glowIntensity', v)}
                disabled={support.isSprite && !support.glowIntensity} disabledHint={spriteHint} />
            )}
            {effectDef.defaultSettings.thickness !== undefined && (
              <SettingSlider label="Thickness" value={setting('thickness') ?? 30} onChange={(v) => handleSettingsChange('thickness', v)}
                disabled={support.isSprite && !support.thickness} disabledHint={spriteHint} />
            )}

            <ColorRow label="Color 1" value={setting('color') ?? '#ffffff'} onChange={(v) => handleSettingsChange('color', v)}
              disabled={support.isSprite && !support.color} disabledHint={spriteHint} />
            <ColorRow label="Color 2" value={setting('secondaryColor') ?? setting('color') ?? '#ffffff'} onChange={(v) => handleSettingsChange('secondaryColor', v)}
              disabled={support.isSprite && !support.secondaryColor} disabledHint={spriteHint} />
            <ColorRow label="Glow Color" value={setting('glowColor') ?? setting('color') ?? '#ffffff'} onChange={(v) => handleSettingsChange('glowColor', v)}
              disabled={support.isSprite && !support.glowColor} disabledHint={spriteHint} />

            {/* Scale X / Y */}
            <div className={cn('grid grid-cols-2 gap-2', support.isSprite && !support.scaleXY && 'opacity-40')}
              title={support.isSprite && !support.scaleXY ? spriteHint : undefined}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Scale X</Label>
                  <span className="text-[10px] text-muted-foreground">{(setting('scaleX') ?? 1).toFixed(2)}</span>
                </div>
                <Slider value={[setting('scaleX') ?? 1]} onValueChange={([v]) => handleSettingsChange('scaleX', v)} min={0.1} max={3} step={0.05}
                  disabled={support.isSprite && !support.scaleXY} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Scale Y</Label>
                  <span className="text-[10px] text-muted-foreground">{(setting('scaleY') ?? 1).toFixed(2)}</span>
                </div>
                <Slider value={[setting('scaleY') ?? 1]} onValueChange={([v]) => handleSettingsChange('scaleY', v)} min={0.1} max={3} step={0.05}
                  disabled={support.isSprite && !support.scaleXY} />
              </div>
            </div>

            {/* Shape — mask the effect to the full rectangle or an inscribed circle. */}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">Shape</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['square', 'circle'] as const).map((s) => {
                  const active = (effectLayer.shape ?? 'square') === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateLayer(layer.id, { shape: s })}
                      className={cn(
                        'h-7 rounded-md border text-xs capitalize transition-colors',
                        active ? 'border-primary bg-muted text-primary' : 'border-border text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Blend mode — hidden for sprite effects (baked compositing). */}
            {support.blend && (
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground">Blend Mode</Label>
                <select
                  value={effectLayer.blendMode ?? 'normal'}
                  onChange={(e) => updateLayer(layer.id, { blendMode: e.target.value as LayerBlendMode })}
                  className="h-7 w-full rounded-md border border-border bg-background px-2 text-xs capitalize"
                >
                  {BLEND_MODES.map((m) => (
                    <option key={m} value={m}>{m.replace('-', ' ')}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Loop */}
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Loop</Label>
              <Switch checked={setting('loop') !== false} onCheckedChange={(v) => handleSettingsChange('loop', v)} />
            </div>

            {/* Advanced (only when the effect declares advanced keys) */}
            {ADVANCED_KEYS.some((a) => effectDef.defaultSettings[a.key] !== undefined) && (
              <div className="pt-1 border-t border-border/60">
                <button
                  onClick={() => setAdvancedOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground py-1"
                >
                  {advancedOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  <Sliders className="w-3 h-3" />
                  Advanced
                </button>
                {advancedOpen && (
                  <div className="space-y-3 pt-1">
                    {ADVANCED_KEYS.filter((a) => effectDef.defaultSettings[a.key] !== undefined).map((a) => (
                      <SettingSlider
                        key={a.key}
                        label={a.label}
                        value={(setting(a.key) as number) ?? a.min}
                        onChange={(v) => handleSettingsChange(a.key, v)}
                        min={a.min}
                        max={a.max}
                        step={a.step}
                        suffix={a.key === 'direction' ? '°' : ''}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

export function LayerPanel() {
  const { state, selectLayer, updateLayer, removeLayer, duplicateLayer, moveLayerOrder } = useEditor()
  const layers = state.project?.layers ?? []
  const selectedLayer = layers.find(l => l.id === state.selectedLayerId) ?? null
  
  // Sort layers by zIndex (highest first for visual stack order)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex)
  
  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar border-l border-sidebar-border flex flex-col overflow-hidden">
      {/* Layers header */}
      <div className="px-3 py-3 border-b border-sidebar-border flex-shrink-0">
        <h2 className="font-serif text-sm font-semibold text-sidebar-foreground tracking-wide">
          Layers
        </h2>
      </div>
      
      {/* Layer stack - scrolls vertically (long lists) and horizontally (long names) */}
      <div className="border-b border-sidebar-border flex-shrink-0 max-h-[40%]">
        <div className="max-h-48 overflow-auto">
          {sortedLayers.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                No layers yet. Add an effect from the left panel.
              </p>
            </div>
          ) : (
            <div className="py-1">
              {sortedLayers.map((layer, index) => (
                <LayerRow
                  key={layer.id}
                  layer={layer}
                  isSelected={layer.id === state.selectedLayerId}
                  isFirst={index === 0}
                  isLast={index === sortedLayers.length - 1}
                  onSelect={() => selectLayer(layer.id)}
                  onToggleVisibility={() => updateLayer(layer.id, { visible: !layer.visible })}
                  onToggleLock={() => updateLayer(layer.id, { locked: !layer.locked })}
                  onDelete={() => removeLayer(layer.id)}
                  onDuplicate={() => duplicateLayer(layer.id)}
                  onMoveForward={() => moveLayerOrder(layer.id, 'forward')}
                  onMoveBackward={() => moveLayerOrder(layer.id, 'backward')}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inspector header */}
      <div className="px-3 py-2 border-b border-sidebar-border bg-muted/30 flex-shrink-0">
        <h3 className="font-serif text-xs font-semibold text-sidebar-foreground tracking-wide">
          {selectedLayer ? selectedLayer.name : 'Properties'}
        </h3>
      </div>
      
      {/* Inspector - scrollable */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Inspector layer={selectedLayer} />
      </div>
    </aside>
  )
}

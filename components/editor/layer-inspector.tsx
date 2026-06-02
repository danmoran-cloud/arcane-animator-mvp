'use client'

import { useEditor } from '@/lib/editor-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { 
  EffectLayer, 
  EffectType,
  FogSettings,
  RainSettings,
  SnowSettings,
  TorchlightSettings,
  CampfireSettings,
  RunesSettings,
  PortalSettings,
  WaterRippleSettings,
  LavaShimmerSettings,
  DustMotesSettings,
} from '@/lib/types'
import {
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RotateCw,
  Move,
  Maximize2,
  Palette,
  Sparkles,
  Gauge,
  Wind,
  Droplets,
  Flame,
  Settings2
} from 'lucide-react'

// Color picker component
function ColorInput({ 
  value, 
  onChange, 
  label 
}: { 
  value: string
  onChange: (value: string) => void
  label: string 
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded border border-border"
          style={{ backgroundColor: value }}
        />
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-full bg-muted/30 border-border"
        />
      </div>
    </div>
  )
}

// Effect-specific control panels
function FogControls({ 
  settings, 
  onUpdate 
}: { 
  settings: FogSettings
  onUpdate: (updates: Partial<FogSettings>) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Speed</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.speed * 100)}%</span>
        </div>
        <Slider
          value={[settings.speed]}
          onValueChange={([v]) => onUpdate({ speed: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Density</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.density * 100)}%</span>
        </div>
        <Slider
          value={[settings.density]}
          onValueChange={([v]) => onUpdate({ density: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <ColorInput
        value={settings.tint}
        onChange={(tint) => onUpdate({ tint })}
        label="Tint Color"
      />
    </div>
  )
}

function RainControls({ 
  settings, 
  onUpdate 
}: { 
  settings: RainSettings
  onUpdate: (updates: Partial<RainSettings>) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Speed</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.speed * 100)}%</span>
        </div>
        <Slider
          value={[settings.speed]}
          onValueChange={([v]) => onUpdate({ speed: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Intensity</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.intensity * 100)}%</span>
        </div>
        <Slider
          value={[settings.intensity]}
          onValueChange={([v]) => onUpdate({ intensity: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Angle</Label>
          <span className="text-xs text-muted-foreground">{settings.angle}deg</span>
        </div>
        <Slider
          value={[settings.angle]}
          onValueChange={([v]) => onUpdate({ angle: v })}
          min={-45}
          max={45}
          step={5}
        />
      </div>
    </div>
  )
}

function SnowControls({ 
  settings, 
  onUpdate 
}: { 
  settings: SnowSettings
  onUpdate: (updates: Partial<SnowSettings>) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Speed</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.speed * 100)}%</span>
        </div>
        <Slider
          value={[settings.speed]}
          onValueChange={([v]) => onUpdate({ speed: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Flake Size</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.flakeSize * 100)}%</span>
        </div>
        <Slider
          value={[settings.flakeSize]}
          onValueChange={([v]) => onUpdate({ flakeSize: v })}
          min={0.2}
          max={1}
          step={0.1}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Density</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.density * 100)}%</span>
        </div>
        <Slider
          value={[settings.density]}
          onValueChange={([v]) => onUpdate({ density: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
    </div>
  )
}

function TorchlightControls({ 
  settings, 
  onUpdate 
}: { 
  settings: TorchlightSettings
  onUpdate: (updates: Partial<TorchlightSettings>) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Flicker Speed</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.flickerSpeed * 100)}%</span>
        </div>
        <Slider
          value={[settings.flickerSpeed]}
          onValueChange={([v]) => onUpdate({ flickerSpeed: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Radius</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.radius * 100)}%</span>
        </div>
        <Slider
          value={[settings.radius]}
          onValueChange={([v]) => onUpdate({ radius: v })}
          min={0.3}
          max={1}
          step={0.05}
        />
      </div>
      <ColorInput
        value={settings.color}
        onChange={(color) => onUpdate({ color })}
        label="Glow Color"
      />
    </div>
  )
}

function CampfireControls({ 
  settings, 
  onUpdate 
}: { 
  settings: CampfireSettings
  onUpdate: (updates: Partial<CampfireSettings>) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Flicker Speed</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.flickerSpeed * 100)}%</span>
        </div>
        <Slider
          value={[settings.flickerSpeed]}
          onValueChange={([v]) => onUpdate({ flickerSpeed: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Ember Count</Label>
          <span className="text-xs text-muted-foreground">{settings.emberCount}</span>
        </div>
        <Slider
          value={[settings.emberCount]}
          onValueChange={([v]) => onUpdate({ emberCount: v })}
          min={4}
          max={24}
          step={2}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Radius</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.radius * 100)}%</span>
        </div>
        <Slider
          value={[settings.radius]}
          onValueChange={([v]) => onUpdate({ radius: v })}
          min={0.3}
          max={1}
          step={0.05}
        />
      </div>
    </div>
  )
}

function RunesControls({ 
  settings, 
  onUpdate 
}: { 
  settings: RunesSettings
  onUpdate: (updates: Partial<RunesSettings>) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Rotation Speed</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.rotationSpeed * 100)}%</span>
        </div>
        <Slider
          value={[settings.rotationSpeed]}
          onValueChange={([v]) => onUpdate({ rotationSpeed: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Glow Intensity</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.glowIntensity * 100)}%</span>
        </div>
        <Slider
          value={[settings.glowIntensity]}
          onValueChange={([v]) => onUpdate({ glowIntensity: v })}
          min={0.2}
          max={1}
          step={0.05}
        />
      </div>
      <ColorInput
        value={settings.color}
        onChange={(color) => onUpdate({ color })}
        label="Rune Color"
      />
    </div>
  )
}

function PortalControls({ 
  settings, 
  onUpdate 
}: { 
  settings: PortalSettings
  onUpdate: (updates: Partial<PortalSettings>) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Swirl Speed</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.swirlSpeed * 100)}%</span>
        </div>
        <Slider
          value={[settings.swirlSpeed]}
          onValueChange={([v]) => onUpdate({ swirlSpeed: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Glow Intensity</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.glowIntensity * 100)}%</span>
        </div>
        <Slider
          value={[settings.glowIntensity]}
          onValueChange={([v]) => onUpdate({ glowIntensity: v })}
          min={0.2}
          max={1}
          step={0.05}
        />
      </div>
      <ColorInput
        value={settings.color}
        onChange={(color) => onUpdate({ color })}
        label="Portal Color"
      />
    </div>
  )
}

function WaterRippleControls({ 
  settings, 
  onUpdate 
}: { 
  settings: WaterRippleSettings
  onUpdate: (updates: Partial<WaterRippleSettings>) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Wave Speed</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.waveSpeed * 100)}%</span>
        </div>
        <Slider
          value={[settings.waveSpeed]}
          onValueChange={([v]) => onUpdate({ waveSpeed: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Ripple Scale</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.rippleScale * 100)}%</span>
        </div>
        <Slider
          value={[settings.rippleScale]}
          onValueChange={([v]) => onUpdate({ rippleScale: v })}
          min={0.2}
          max={1}
          step={0.05}
        />
      </div>
      <ColorInput
        value={settings.tint}
        onChange={(tint) => onUpdate({ tint })}
        label="Water Tint"
      />
    </div>
  )
}

function LavaShimmerControls({ 
  settings, 
  onUpdate 
}: { 
  settings: LavaShimmerSettings
  onUpdate: (updates: Partial<LavaShimmerSettings>) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Shimmer Speed</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.shimmerSpeed * 100)}%</span>
        </div>
        <Slider
          value={[settings.shimmerSpeed]}
          onValueChange={([v]) => onUpdate({ shimmerSpeed: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Glow Intensity</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.glowIntensity * 100)}%</span>
        </div>
        <Slider
          value={[settings.glowIntensity]}
          onValueChange={([v]) => onUpdate({ glowIntensity: v })}
          min={0.2}
          max={1}
          step={0.05}
        />
      </div>
    </div>
  )
}

function DustMotesControls({ 
  settings, 
  onUpdate 
}: { 
  settings: DustMotesSettings
  onUpdate: (updates: Partial<DustMotesSettings>) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Speed</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.speed * 100)}%</span>
        </div>
        <Slider
          value={[settings.speed]}
          onValueChange={([v]) => onUpdate({ speed: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Density</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.density * 100)}%</span>
        </div>
        <Slider
          value={[settings.density]}
          onValueChange={([v]) => onUpdate({ density: v })}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
    </div>
  )
}

// Effect controls dispatcher
function EffectControls({ 
  layer, 
  onUpdate 
}: { 
  layer: EffectLayer
  onUpdate: (updates: Record<string, unknown>) => void 
}) {
  const effectType = layer.effectType

  switch (effectType) {
    case 'fog':
      return <FogControls settings={layer.settings as FogSettings} onUpdate={onUpdate} />
    case 'rain':
      return <RainControls settings={layer.settings as RainSettings} onUpdate={onUpdate} />
    case 'snow':
      return <SnowControls settings={layer.settings as SnowSettings} onUpdate={onUpdate} />
    case 'torchlight':
      return <TorchlightControls settings={layer.settings as TorchlightSettings} onUpdate={onUpdate} />
    case 'campfire':
      return <CampfireControls settings={layer.settings as CampfireSettings} onUpdate={onUpdate} />
    case 'runes':
      return <RunesControls settings={layer.settings as RunesSettings} onUpdate={onUpdate} />
    case 'portal':
      return <PortalControls settings={layer.settings as PortalSettings} onUpdate={onUpdate} />
    case 'waterRipple':
      return <WaterRippleControls settings={layer.settings as WaterRippleSettings} onUpdate={onUpdate} />
    case 'lavaShimmer':
      return <LavaShimmerControls settings={layer.settings as LavaShimmerSettings} onUpdate={onUpdate} />
    case 'dustMotes':
      return <DustMotesControls settings={layer.settings as DustMotesSettings} onUpdate={onUpdate} />
    default:
      return null
  }
}

// Get effect type display name
function getEffectTypeName(effectType: EffectType): string {
  const names: Record<EffectType, string> = {
    fog: 'Rolling Fog',
    rain: 'Rainfall',
    snow: 'Snowfall',
    torchlight: 'Torchlight',
    campfire: 'Campfire',
    runes: 'Magical Runes',
    portal: 'Portal',
    waterRipple: 'Water Ripple',
    lavaShimmer: 'Lava Shimmer',
    dustMotes: 'Dust Motes',
  }
  return names[effectType] || effectType
}

export function LayerInspector() {
  const { state, dispatch, updateEffectSettings } = useEditor()
  
  const selectedLayer = state.project?.layers.find(l => l.id === state.selectedLayerId)

  const handleUpdateLayer = (updates: Partial<typeof selectedLayer>) => {
    if (!selectedLayer) return
    dispatch({
      type: 'UPDATE_LAYER',
      layerId: selectedLayer.id,
      updates,
    })
  }

  const handleUpdateEffectSettings = (updates: Record<string, unknown>) => {
    if (!selectedLayer || selectedLayer.type !== 'effect') return
    updateEffectSettings(selectedLayer.id, updates)
  }

  const handleDuplicate = () => {
    if (!selectedLayer) return
    dispatch({ type: 'DUPLICATE_LAYER', layerId: selectedLayer.id })
  }

  const handleDelete = () => {
    if (!selectedLayer) return
    dispatch({ type: 'REMOVE_LAYER', layerId: selectedLayer.id })
  }

  if (!state.project) {
    return (
      <div className="w-72 border-l border-border bg-sidebar flex flex-col h-full">
        <div className="p-3 border-b border-border">
          <h2 className="font-serif text-sm font-semibold text-primary tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Layer Inspector
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground text-sm text-center">
            Create a project to begin editing layers
          </p>
        </div>
      </div>
    )
  }

  if (!selectedLayer) {
    return (
      <div className="w-72 border-l border-border bg-sidebar flex flex-col h-full">
        <div className="p-3 border-b border-border">
          <h2 className="font-serif text-sm font-semibold text-primary tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Layer Inspector
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground text-sm text-center">
            Select a layer to view its properties
          </p>
        </div>
      </div>
    )
  }

  const isEffectLayer = selectedLayer.type === 'effect'

  return (
    <div className="w-72 border-l border-border bg-sidebar flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h2 className="font-serif text-sm font-semibold text-primary tracking-wide flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Layer Inspector
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Layer Name */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Layer Name
            </Label>
            <Input
              value={selectedLayer.name}
              onChange={(e) => handleUpdateLayer({ name: e.target.value })}
              className="h-8 bg-muted/30 border-border"
            />
            {isEffectLayer && (
              <div className="flex items-center gap-2 mt-1">
                <Sparkles className="w-3 h-3 text-primary/60" />
                <span className="text-xs text-primary/60">
                  {getEffectTypeName((selectedLayer as EffectLayer).effectType)}
                </span>
              </div>
            )}
          </div>

          <Separator className="bg-border/50" />

          {/* Position */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <Move className="w-3 h-3" />
              Position
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">X</Label>
                <Input
                  type="number"
                  value={Math.round(selectedLayer.position.x)}
                  onChange={(e) => handleUpdateLayer({ 
                    position: { ...selectedLayer.position, x: Number(e.target.value) } 
                  })}
                  className="h-8 bg-muted/30 border-border"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Y</Label>
                <Input
                  type="number"
                  value={Math.round(selectedLayer.position.y)}
                  onChange={(e) => handleUpdateLayer({ 
                    position: { ...selectedLayer.position, y: Number(e.target.value) } 
                  })}
                  className="h-8 bg-muted/30 border-border"
                />
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <Maximize2 className="w-3 h-3" />
              Size
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Width</Label>
                <Input
                  type="number"
                  value={Math.round(selectedLayer.size.width)}
                  onChange={(e) => handleUpdateLayer({ 
                    size: { ...selectedLayer.size, width: Number(e.target.value) } 
                  })}
                  className="h-8 bg-muted/30 border-border"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Height</Label>
                <Input
                  type="number"
                  value={Math.round(selectedLayer.size.height)}
                  onChange={(e) => handleUpdateLayer({ 
                    size: { ...selectedLayer.size, height: Number(e.target.value) } 
                  })}
                  className="h-8 bg-muted/30 border-border"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Rotation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <RotateCw className="w-3 h-3" />
              Rotation
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[selectedLayer.rotation]}
                onValueChange={([value]) => handleUpdateLayer({ rotation: value })}
                min={0}
                max={360}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={selectedLayer.rotation}
                onChange={(e) => handleUpdateLayer({ rotation: Number(e.target.value) })}
                className="h-8 w-16 bg-muted/30 border-border"
              />
              <span className="text-xs text-muted-foreground">deg</span>
            </div>
          </div>

          {/* Opacity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <Palette className="w-3 h-3" />
              Opacity
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[selectedLayer.opacity * 100]}
                onValueChange={([value]) => handleUpdateLayer({ opacity: value / 100 })}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={Math.round(selectedLayer.opacity * 100)}
                onChange={(e) => handleUpdateLayer({ opacity: Number(e.target.value) / 100 })}
                className="h-8 w-16 bg-muted/30 border-border"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>

          {/* Effect-specific controls */}
          {isEffectLayer && (
            <>
              <Separator className="bg-border/50" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                  <Settings2 className="w-3 h-3" />
                  Effect Settings
                </div>
                <EffectControls 
                  layer={selectedLayer as EffectLayer} 
                  onUpdate={handleUpdateEffectSettings}
                />
              </div>
            </>
          )}

          <Separator className="bg-border/50" />

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedLayer.locked ? (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Unlock className="w-4 h-4 text-muted-foreground" />
                )}
                <Label className="text-sm">Lock Layer</Label>
              </div>
              <Switch
                checked={selectedLayer.locked}
                onCheckedChange={(checked) => handleUpdateLayer({ locked: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedLayer.visible ? (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
                <Label className="text-sm">Visible</Label>
              </div>
              <Switch
                checked={selectedLayer.visible}
                onCheckedChange={(checked) => handleUpdateLayer({ visible: checked })}
              />
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 border-border hover:border-primary/50 hover:bg-muted/30"
              onClick={handleDuplicate}
            >
              <Copy className="w-4 h-4" />
              Duplicate Layer
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 border-destructive/50 text-destructive hover:border-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete Layer
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { 
  Eye, EyeOff, Lock, Unlock, Link, Unlink, Trash2, Copy,
  ChevronUp, ChevronDown,
  Flame, Cloud, Snowflake, Droplets, Waves, Zap, Wind,
  Sparkles, CircleDot, Gem, Sun, Skull, Ghost,
  Monitor, Lightbulb, Shield, Binary, Atom, Plane, Image, Map
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEditor } from '@/lib/editor-store'
import { getEffectById, EFFECT_PACKS, type EffectPack } from '@/lib/effects-library'
import type { Layer, ExpandedEffectLayer } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'

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
  const { updateLayer } = useEditor()
  
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
  
  const handleSettingsChange = (key: string, value: number | string) => {
    if (layer.type !== 'effect') return
    updateLayer(layer.id, {
      settings: { ...(layer as ExpandedEffectLayer).settings, [key]: value }
    })
  }
  
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
        {layer.type === 'effect' && effectDef && (
          <div className="space-y-3 pt-2 border-t border-border">
            <h4 className="text-xs font-semibold text-foreground font-serif tracking-wide">
              Effect Controls
            </h4>
            
            {/* Speed */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Speed</Label>
                <span className="text-[10px] text-muted-foreground">
                  {(layer as ExpandedEffectLayer).settings?.speed ?? effectDef.defaultSettings.speed}
                </span>
              </div>
              <Slider
                value={[(layer as ExpandedEffectLayer).settings?.speed ?? effectDef.defaultSettings.speed]}
                onValueChange={([v]) => handleSettingsChange('speed', v)}
                min={0}
                max={100}
                step={1}
              />
            </div>
            
            {/* Intensity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Intensity</Label>
                <span className="text-[10px] text-muted-foreground">
                  {(layer as ExpandedEffectLayer).settings?.intensity ?? effectDef.defaultSettings.intensity}
                </span>
              </div>
              <Slider
                value={[(layer as ExpandedEffectLayer).settings?.intensity ?? effectDef.defaultSettings.intensity]}
                onValueChange={([v]) => handleSettingsChange('intensity', v)}
                min={0}
                max={100}
                step={1}
              />
            </div>
            
            {/* Density */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Density</Label>
                <span className="text-[10px] text-muted-foreground">
                  {(layer as ExpandedEffectLayer).settings?.density ?? effectDef.defaultSettings.density}
                </span>
              </div>
              <Slider
                value={[(layer as ExpandedEffectLayer).settings?.density ?? effectDef.defaultSettings.density]}
                onValueChange={([v]) => handleSettingsChange('density', v)}
                min={0}
                max={100}
                step={1}
              />
            </div>
            
            {/* Color */}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={(layer as ExpandedEffectLayer).settings?.color ?? effectDef.defaultSettings.color}
                  onChange={(e) => handleSettingsChange('color', e.target.value)}
                  className="w-8 h-6 rounded border border-border cursor-pointer"
                />
                <Input
                  value={(layer as ExpandedEffectLayer).settings?.color ?? effectDef.defaultSettings.color}
                  onChange={(e) => handleSettingsChange('color', e.target.value)}
                  className="h-6 text-xs flex-1"
                />
              </div>
            </div>
            
            {/* Glow Intensity (if applicable) */}
            {effectDef.defaultSettings.glowIntensity !== undefined && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Glow</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {(layer as ExpandedEffectLayer).settings?.glowIntensity ?? effectDef.defaultSettings.glowIntensity}
                  </span>
                </div>
                <Slider
                  value={[(layer as ExpandedEffectLayer).settings?.glowIntensity ?? effectDef.defaultSettings.glowIntensity ?? 50]}
                  onValueChange={([v]) => handleSettingsChange('glowIntensity', v)}
                  min={0}
                  max={100}
                  step={1}
                />
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

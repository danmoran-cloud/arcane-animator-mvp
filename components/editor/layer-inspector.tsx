'use client'

import { useEditor } from '@/lib/editor-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { Layer, ExpandedEffectLayer } from '@/lib/types'
import { getEffectById } from '@/lib/effects-library'
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
  Settings2,
  Sliders
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

// Dynamic parameter controls for expanded effects
function ExpandedEffectControls({ 
  layer, 
  onUpdate 
}: { 
  layer: ExpandedEffectLayer
  onUpdate: (key: string, value: number | string | boolean) => void 
}) {
  const effectDef = getEffectById(layer.effectId)
  if (!effectDef) return null

  return (
    <div className="space-y-4">
      {effectDef.parameters.map((param) => {
        const currentValue = layer.parameterValues[param.key] ?? param.default

        if (param.type === 'range') {
          return (
            <div key={param.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">{param.label}</Label>
                <span className="text-xs text-muted-foreground">
                  {typeof currentValue === 'number' ? Math.round(currentValue * 100) : currentValue}%
                </span>
              </div>
              <Slider
                value={[currentValue as number]}
                onValueChange={([v]) => onUpdate(param.key, v)}
                min={param.min}
                max={param.max}
                step={param.step}
              />
            </div>
          )
        }

        if (param.type === 'color') {
          return (
            <ColorInput
              key={param.key}
              value={currentValue as string}
              onChange={(v) => onUpdate(param.key, v)}
              label={param.label}
            />
          )
        }

        if (param.type === 'boolean') {
          return (
            <div key={param.key} className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">{param.label}</Label>
              <Switch
                checked={currentValue as boolean}
                onCheckedChange={(v) => onUpdate(param.key, v)}
              />
            </div>
          )
        }

        if (param.type === 'select' && param.options) {
          return (
            <div key={param.key} className="space-y-2">
              <Label className="text-xs text-muted-foreground">{param.label}</Label>
              <div className="flex flex-wrap gap-1">
                {param.options.map((option) => (
                  <Button
                    key={option}
                    variant={currentValue === option ? "secondary" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onUpdate(param.key, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

export function LayerInspector() {
  const { state, dispatch, updateExpandedEffectParameter } = useEditor()
  
  const selectedLayer = state.project?.layers.find(l => l.id === state.selectedLayerId)

  const handleUpdateLayer = (updates: Partial<Layer>) => {
    if (!selectedLayer) return
    dispatch({
      type: 'UPDATE_LAYER',
      layerId: selectedLayer.id,
      updates,
    })
  }

  const handleUpdateEffectParam = (key: string, value: number | string | boolean) => {
    if (!selectedLayer || selectedLayer.type !== 'effect') return
    updateExpandedEffectParameter(selectedLayer.id, key, value)
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
  const effectLayer = isEffectLayer ? (selectedLayer as ExpandedEffectLayer) : null
  const effectDef = effectLayer ? getEffectById(effectLayer.effectId) : null

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
        <div className="p-3 space-y-4">
          {/* Layer Name */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Layer Name</Label>
            <Input
              value={selectedLayer.name}
              onChange={(e) => handleUpdateLayer({ name: e.target.value })}
              className="h-8 bg-muted/30 border-border"
            />
          </div>

          {/* Effect Info Badge */}
          {effectDef && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                style={{ 
                  backgroundColor: `${effectDef.color}20`,
                  color: effectDef.color
                }}
              >
                {effectDef.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{effectDef.name}</p>
                <p className="text-xs text-muted-foreground truncate">{effectDef.category}</p>
              </div>
            </div>
          )}

          {/* Visibility and Lock */}
          <div className="flex items-center gap-2">
            <Button
              variant={selectedLayer.visible ? "secondary" : "outline"}
              size="sm"
              className="flex-1 h-8"
              onClick={() => handleUpdateLayer({ visible: !selectedLayer.visible })}
            >
              {selectedLayer.visible ? (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Visible
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Hidden
                </>
              )}
            </Button>
            <Button
              variant={selectedLayer.locked ? "secondary" : "outline"}
              size="sm"
              className="flex-1 h-8"
              onClick={() => handleUpdateLayer({ locked: !selectedLayer.locked })}
            >
              {selectedLayer.locked ? (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 mr-1" />
                  Unlocked
                </>
              )}
            </Button>
          </div>

          <Separator className="bg-border/50" />

          {/* Transform Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-primary/70" />
              <span className="font-serif text-xs font-semibold text-primary">Transform</span>
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">X Position</Label>
                <Input
                  type="number"
                  value={selectedLayer.x}
                  onChange={(e) => handleUpdateLayer({ x: parseInt(e.target.value) || 0 })}
                  className="h-8 bg-muted/30 border-border"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Y Position</Label>
                <Input
                  type="number"
                  value={selectedLayer.y}
                  onChange={(e) => handleUpdateLayer({ y: parseInt(e.target.value) || 0 })}
                  className="h-8 bg-muted/30 border-border"
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Width</Label>
                <Input
                  type="number"
                  value={selectedLayer.width}
                  onChange={(e) => handleUpdateLayer({ width: parseInt(e.target.value) || 100 })}
                  className="h-8 bg-muted/30 border-border"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Height</Label>
                <Input
                  type="number"
                  value={selectedLayer.height}
                  onChange={(e) => handleUpdateLayer({ height: parseInt(e.target.value) || 100 })}
                  className="h-8 bg-muted/30 border-border"
                />
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RotateCw className="w-3 h-3 text-muted-foreground" />
                <Label className="text-xs text-muted-foreground">Rotation</Label>
                <span className="text-xs text-muted-foreground ml-auto">{selectedLayer.rotation}°</span>
              </div>
              <Slider
                value={[selectedLayer.rotation]}
                onValueChange={([v]) => handleUpdateLayer({ rotation: v })}
                min={0}
                max={360}
                step={1}
              />
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Appearance Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary/70" />
              <span className="font-serif text-xs font-semibold text-primary">Appearance</span>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Opacity</Label>
                <span className="text-xs text-muted-foreground">{Math.round(selectedLayer.opacity * 100)}%</span>
              </div>
              <Slider
                value={[selectedLayer.opacity]}
                onValueChange={([v]) => handleUpdateLayer({ opacity: v })}
                min={0}
                max={1}
                step={0.01}
              />
            </div>
          </div>

          {/* Effect-Specific Controls */}
          {effectLayer && effectDef && (
            <>
              <Separator className="bg-border/50" />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary/70" />
                  <span className="font-serif text-xs font-semibold text-primary">Effect Parameters</span>
                </div>
                <ExpandedEffectControls 
                  layer={effectLayer} 
                  onUpdate={handleUpdateEffectParam}
                />
              </div>
            </>
          )}

          <Separator className="bg-border/50" />

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary/70" />
              <span className="font-serif text-xs font-semibold text-primary">Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleDuplicate}
              >
                <Copy className="w-3 h-3 mr-1" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

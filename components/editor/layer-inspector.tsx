'use client'

import { useEditor } from '@/lib/editor-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  Palette
} from 'lucide-react'

export function LayerInspector() {
  const { state, dispatch } = useEditor()
  
  const selectedLayer = state.project?.layers.find(l => l.id === state.selectedLayerId)

  const handleUpdateLayer = (updates: Partial<typeof selectedLayer>) => {
    if (!selectedLayer) return
    dispatch({
      type: 'UPDATE_LAYER',
      layerId: selectedLayer.id,
      updates,
    })
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

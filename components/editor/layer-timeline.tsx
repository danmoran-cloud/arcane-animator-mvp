'use client'

import { useEditor } from '@/lib/editor-store'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  GripVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers,
  ChevronUp,
  ChevronDown,
  Image,
  Sparkles
} from 'lucide-react'

interface LayerRowProps {
  layer: {
    id: string
    name: string
    type: 'map' | 'asset'
    visible: boolean
    locked: boolean
  }
  isSelected: boolean
  onSelect: () => void
  onToggleVisibility: () => void
  onToggleLock: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

function LayerRow({
  layer,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: LayerRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer group",
        isSelected 
          ? "bg-arcane-blue/20 border border-arcane-blue/40" 
          : "hover:bg-muted/30 border border-transparent"
      )}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" />
      
      {/* Layer type icon */}
      <div className={cn(
        "w-6 h-6 rounded flex items-center justify-center",
        layer.type === 'map' ? "bg-emerald-magic/20" : "bg-purple-energy/20"
      )}>
        {layer.type === 'map' ? (
          <Image className="w-3 h-3 text-emerald-magic" />
        ) : (
          <Sparkles className="w-3 h-3 text-purple-energy" />
        )}
      </div>
      
      {/* Layer name */}
      <span className={cn(
        "flex-1 text-sm truncate",
        isSelected ? "text-foreground" : "text-foreground/80"
      )}>
        {layer.name}
      </span>
      
      {/* Controls */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation()
            onMoveUp()
          }}
          disabled={!canMoveUp}
        >
          <ChevronUp className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation()
            onMoveDown()
          }}
          disabled={!canMoveDown}
        >
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>
      
      {/* Visibility toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisibility()
        }}
      >
        {layer.visible ? (
          <Eye className="w-3 h-3 text-muted-foreground" />
        ) : (
          <EyeOff className="w-3 h-3 text-muted-foreground/50" />
        )}
      </Button>
      
      {/* Lock toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          onToggleLock()
        }}
      >
        {layer.locked ? (
          <Lock className="w-3 h-3 text-primary/70" />
        ) : (
          <Unlock className="w-3 h-3 text-muted-foreground/50" />
        )}
      </Button>
    </div>
  )
}

export function LayerTimeline() {
  const { state, dispatch } = useEditor()
  
  const layers = state.project?.layers || []
  // Display layers in reverse order (top layer first in the list)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex)

  const handleSelectLayer = (layerId: string) => {
    dispatch({ type: 'SELECT_LAYER', layerId })
  }

  const handleToggleVisibility = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId)
    if (layer) {
      dispatch({
        type: 'UPDATE_LAYER',
        layerId,
        updates: { visible: !layer.visible },
      })
    }
  }

  const handleToggleLock = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId)
    if (layer) {
      dispatch({
        type: 'UPDATE_LAYER',
        layerId,
        updates: { locked: !layer.locked },
      })
    }
  }

  const handleMoveUp = (layerId: string) => {
    const layerIndex = sortedLayers.findIndex(l => l.id === layerId)
    if (layerIndex <= 0) return
    
    const layer = sortedLayers[layerIndex]
    const aboveLayer = sortedLayers[layerIndex - 1]
    
    dispatch({
      type: 'UPDATE_LAYER',
      layerId: layer.id,
      updates: { zIndex: aboveLayer.zIndex },
    })
    dispatch({
      type: 'UPDATE_LAYER',
      layerId: aboveLayer.id,
      updates: { zIndex: layer.zIndex },
    })
  }

  const handleMoveDown = (layerId: string) => {
    const layerIndex = sortedLayers.findIndex(l => l.id === layerId)
    if (layerIndex >= sortedLayers.length - 1) return
    
    const layer = sortedLayers[layerIndex]
    const belowLayer = sortedLayers[layerIndex + 1]
    
    dispatch({
      type: 'UPDATE_LAYER',
      layerId: layer.id,
      updates: { zIndex: belowLayer.zIndex },
    })
    dispatch({
      type: 'UPDATE_LAYER',
      layerId: belowLayer.id,
      updates: { zIndex: layer.zIndex },
    })
  }

  return (
    <div className="h-40 border-t border-border bg-sidebar">
      {/* Header */}
      <div className="h-8 border-b border-border/50 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary/80" />
          <span className="font-serif text-xs font-semibold text-primary tracking-wide">
            Layer Timeline
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {layers.length} layer{layers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Layer list */}
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="p-2 space-y-1">
          {!state.project ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Create a project to add layers
            </div>
          ) : sortedLayers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No layers yet. Upload a map or add assets to begin.
            </div>
          ) : (
            sortedLayers.map((layer, index) => (
              <LayerRow
                key={layer.id}
                layer={layer}
                isSelected={state.selectedLayerId === layer.id}
                onSelect={() => handleSelectLayer(layer.id)}
                onToggleVisibility={() => handleToggleVisibility(layer.id)}
                onToggleLock={() => handleToggleLock(layer.id)}
                onMoveUp={() => handleMoveUp(layer.id)}
                onMoveDown={() => handleMoveDown(layer.id)}
                canMoveUp={index > 0}
                canMoveDown={index < sortedLayers.length - 1}
              />
            ))
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  )
}

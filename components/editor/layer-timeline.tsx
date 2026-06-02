'use client'

import { useEditor } from '@/lib/editor-store'
import type { Layer, EffectLayer, EffectType } from '@/lib/types'
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
  Sparkles,
  Cloud,
  CloudRain,
  Snowflake,
  Flame,
  Zap,
  Waves,
  Wind,
  RefreshCw
} from 'lucide-react'

// Get icon for effect type
function getEffectIcon(effectType: EffectType) {
  switch (effectType) {
    case 'fog':
      return Cloud
    case 'rain':
      return CloudRain
    case 'snow':
      return Snowflake
    case 'torchlight':
    case 'campfire':
    case 'lavaShimmer':
      return Flame
    case 'runes':
    case 'portal':
      return Sparkles
    case 'waterRipple':
      return Waves
    case 'dustMotes':
      return Wind
    default:
      return Sparkles
  }
}

// Get effect type color
function getEffectColor(effectType: EffectType) {
  switch (effectType) {
    case 'fog':
    case 'snow':
      return 'text-slate-400 bg-slate-400/20'
    case 'rain':
    case 'waterRipple':
      return 'text-blue-400 bg-blue-400/20'
    case 'torchlight':
    case 'campfire':
    case 'lavaShimmer':
      return 'text-orange-400 bg-orange-400/20'
    case 'runes':
    case 'portal':
      return 'text-purple-400 bg-purple-400/20'
    case 'dustMotes':
      return 'text-amber-300 bg-amber-300/20'
    default:
      return 'text-primary bg-primary/20'
  }
}

interface LayerRowProps {
  layer: Layer
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
  const isEffect = layer.type === 'effect'
  const effectType = isEffect ? (layer as EffectLayer).effectType : null
  const EffectIcon = effectType ? getEffectIcon(effectType) : null
  const effectColorClass = effectType ? getEffectColor(effectType) : ''

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
        isEffect ? effectColorClass : (layer.type === 'map' ? "bg-emerald-500/20" : "bg-purple-energy/20")
      )}>
        {isEffect && EffectIcon ? (
          <EffectIcon className={cn("w-3 h-3", effectColorClass.split(' ')[0])} />
        ) : layer.type === 'map' ? (
          <Image className="w-3 h-3 text-emerald-500" />
        ) : (
          <Image className="w-3 h-3 text-purple-energy" />
        )}
      </div>
      
      {/* Layer name */}
      <span className={cn(
        "flex-1 text-sm truncate",
        isSelected ? "text-foreground" : "text-foreground/80"
      )}>
        {layer.name}
      </span>
      
      {/* Loop indicator for effects */}
      {isEffect && (
        <div className="flex items-center" title="Animated (Looping)">
          <RefreshCw className="w-3 h-3 text-arcane-blue/60 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      )}
      
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
  
  // Count effect layers
  const effectCount = layers.filter(l => l.type === 'effect').length
  const mapCount = layers.filter(l => l.type === 'map').length

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
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {effectCount > 0 && (
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              {effectCount} effect{effectCount !== 1 ? 's' : ''}
            </span>
          )}
          {mapCount > 0 && (
            <span className="flex items-center gap-1">
              <Image className="w-3 h-3 text-emerald-500" />
              {mapCount} map{mapCount !== 1 ? 's' : ''}
            </span>
          )}
          {layers.length === 0 && (
            <span>{layers.length} layer{layers.length !== 1 ? 's' : ''}</span>
          )}
        </div>
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
              No layers yet. Upload a map or add effects to begin.
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

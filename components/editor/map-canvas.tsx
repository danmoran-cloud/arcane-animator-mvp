'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useEditor } from '@/lib/editor-store'
import type { Layer, Position, ExpandedEffectLayer, MapLayer, AssetLayer } from '@/lib/types'
import { UnifiedEffectRenderer } from './base-effects'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid3X3, 
  Upload,
  Compass,
  Sparkles,
  Move
} from 'lucide-react'

// Floating particles component for the empty state
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="particle absolute w-1 h-1 rounded-full bg-primary/40"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: `${15 + (i * 11) % 70}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${6 + (i % 4)}s`,
          }}
        />
      ))}
    </div>
  )
}

// Empty state component
function EmptyCanvasState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <FloatingParticles />
      
      {/* Decorative compass rose */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full border-2 border-primary/20 flex items-center justify-center magical-pulse">
          <div className="w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center">
            <Compass className="w-12 h-12 text-primary/50" />
          </div>
        </div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-primary/30" />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-primary/30" />
        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-1 bg-primary/30" />
        <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-1 bg-primary/30" />
      </div>

      <h3 className="font-serif text-xl text-primary mb-2">
        Upload a map to begin weaving magic
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-md text-center">
        Start by uploading your battle map, then add animated effects to bring it to life
      </p>

      <Button 
        onClick={onUpload}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Upload className="w-4 h-4" />
        Upload Base Map
      </Button>
    </div>
  )
}

// Effect layer rendering component - updated for expanded effects
function EffectLayerRenderer({ 
  layer, 
  isSelected,
  onSelect,
  onDragStart,
}: { 
  layer: ExpandedEffectLayer
  isSelected: boolean
  onSelect: () => void
  onDragStart: (e: React.MouseEvent) => void
}) {
  if (!layer.visible) return null

  return (
    <div
      className={cn(
        "absolute cursor-move overflow-hidden rounded-lg",
        isSelected && "ring-2 ring-primary shadow-[0_0_20px_rgba(100,150,255,0.4)]"
      )}
      style={{
        left: layer.position.x,
        top: layer.position.y,
        width: layer.size.width,
        height: layer.size.height,
        transform: `rotate(${layer.rotation}deg)`,
        opacity: layer.opacity,
        zIndex: layer.zIndex,
        pointerEvents: layer.locked ? 'none' : 'auto',
        mixBlendMode: layer.blendMode as React.CSSProperties['mixBlendMode'] || 'normal',
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseDown={(e) => {
        if (!layer.locked) {
          e.stopPropagation()
          onSelect()
          onDragStart(e)
        }
      }}
    >
      {/* Effect content using the unified renderer */}
      <UnifiedEffectRenderer
        baseComponent={layer.baseComponent}
        settings={layer.settings}
        width={layer.size.width}
        height={layer.size.height}
      />

      {/* Selection handles */}
      {isSelected && !layer.locked && (
        <>
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full border-2 border-background cursor-nw-resize shadow-[0_0_8px_rgba(100,150,255,0.6)]" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full border-2 border-background cursor-ne-resize shadow-[0_0_8px_rgba(100,150,255,0.6)]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full border-2 border-background cursor-sw-resize shadow-[0_0_8px_rgba(100,150,255,0.6)]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full border-2 border-background cursor-se-resize shadow-[0_0_8px_rgba(100,150,255,0.6)]" />
        </>
      )}

      {/* Lock indicator */}
      {layer.locked && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded bg-background/80 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
        </div>
      )}
    </div>
  )
}

// Image layer rendering component (map or asset)
function ImageLayerRenderer({ 
  layer, 
  isSelected,
  onSelect,
  onDragStart,
}: { 
  layer: MapLayer | AssetLayer
  isSelected: boolean
  onSelect: () => void
  onDragStart: (e: React.MouseEvent) => void
}) {
  if (!layer.visible) return null

  return (
    <div
      className={cn(
        "absolute cursor-move",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      style={{
        left: layer.position.x,
        top: layer.position.y,
        width: layer.size.width,
        height: layer.size.height,
        transform: `rotate(${layer.rotation}deg)`,
        opacity: layer.opacity,
        zIndex: layer.zIndex,
        pointerEvents: layer.locked ? 'none' : 'auto',
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseDown={(e) => {
        if (!layer.locked) {
          e.stopPropagation()
          onSelect()
          onDragStart(e)
        }
      }}
    >
      {/* Layer content - image or placeholder */}
      {layer.src.startsWith('data:') || layer.src.startsWith('/') || layer.src.startsWith('http') ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={layer.src} 
          alt={layer.name}
          className="w-full h-full object-cover rounded"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full rounded bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary/50" />
        </div>
      )}

      {/* Selection handles */}
      {isSelected && !layer.locked && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full border-2 border-background cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full border-2 border-background cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background cursor-se-resize" />
        </>
      )}

      {/* Lock indicator */}
      {layer.locked && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded bg-background/80 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
        </div>
      )}
    </div>
  )
}

// Unified layer renderer
function CanvasLayer({ 
  layer, 
  isSelected,
  onSelect,
  onDragStart,
}: { 
  layer: Layer
  isSelected: boolean
  onSelect: () => void
  onDragStart: (e: React.MouseEvent) => void
}) {
  if (layer.type === 'effect') {
    return (
      <EffectLayerRenderer
        layer={layer}
        isSelected={isSelected}
        onSelect={onSelect}
        onDragStart={onDragStart}
      />
    )
  }
  
  return (
    <ImageLayerRenderer
      layer={layer}
      isSelected={isSelected}
      onSelect={onSelect}
      onDragStart={onDragStart}
    />
  )
}

// Grid overlay component
function GridOverlay({ gridSize, canvasSize }: { gridSize: number; canvasSize: { width: number; height: number } }) {
  return (
    <svg 
      className="absolute inset-0 pointer-events-none" 
      width={canvasSize.width} 
      height={canvasSize.height}
    >
      <defs>
        <pattern 
          id="grid" 
          width={gridSize} 
          height={gridSize} 
          patternUnits="userSpaceOnUse"
        >
          <path 
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5"
            className="text-primary/20"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  )
}

export function MapCanvas() {
  const { state, dispatch, addMapLayer } = useEditor()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [layerStartPos, setLayerStartPos] = useState<Position>({ x: 0, y: 0 })

  const handleZoomIn = () => {
    dispatch({ type: 'SET_ZOOM', zoom: state.zoom + 0.1 })
  }

  const handleZoomOut = () => {
    dispatch({ type: 'SET_ZOOM', zoom: state.zoom - 0.1 })
  }

  const handleFitToScreen = () => {
    dispatch({ type: 'SET_ZOOM', zoom: 1 })
    dispatch({ type: 'SET_PAN_OFFSET', offset: { x: 0, y: 0 } })
  }

  const handleToggleGrid = () => {
    dispatch({ type: 'TOGGLE_GRID' })
  }

  const handleGridSizeChange = (value: number[]) => {
    dispatch({ type: 'SET_GRID_SIZE', size: value[0] })
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      if (file.type.startsWith('image/')) {
        addMapLayer(src, file.name.replace(/\.[^/.]+$/, ''))
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle click or Alt+click to pan
      setIsPanning(true)
      setPanStart({ x: e.clientX - state.panOffset.x, y: e.clientY - state.panOffset.y })
    } else if (e.button === 0) {
      // Deselect on canvas click
      dispatch({ type: 'SELECT_LAYER', layerId: null })
    }
  }

  const handleLayerDragStart = (e: React.MouseEvent, layerId: string) => {
    const layer = state.project?.layers.find(l => l.id === layerId)
    if (!layer || layer.locked) return

    setDraggedLayerId(layerId)
    setDragStart({ x: e.clientX, y: e.clientY })
    setLayerStartPos({ ...layer.position })
    dispatch({ type: 'SET_DRAGGING', isDragging: true })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      dispatch({ 
        type: 'SET_PAN_OFFSET', 
        offset: { 
          x: e.clientX - panStart.x, 
          y: e.clientY - panStart.y 
        } 
      })
    } else if (draggedLayerId) {
      const deltaX = (e.clientX - dragStart.x) / state.zoom
      const deltaY = (e.clientY - dragStart.y) / state.zoom
      
      dispatch({
        type: 'UPDATE_LAYER',
        layerId: draggedLayerId,
        updates: {
          position: {
            x: layerStartPos.x + deltaX,
            y: layerStartPos.y + deltaY,
          }
        }
      })
    }
  }, [isPanning, panStart, draggedLayerId, dragStart, layerStartPos, state.zoom, dispatch])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    setDraggedLayerId(null)
    dispatch({ type: 'SET_DRAGGING', isDragging: false })
  }, [dispatch])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      dispatch({ type: 'SET_ZOOM', zoom: state.zoom + delta })
    }
  }

  const hasProject = !!state.project
  const hasLayers = (state.project?.layers.length || 0) > 0
  const canvasSize = state.project?.canvasSize || { width: 1920, height: 1080 }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Canvas toolbar */}
      <div className="h-10 border-b border-border bg-card/50 flex items-center px-3 gap-2">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={handleZoomOut}
            disabled={!hasProject}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(state.zoom * 100)}%
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={handleZoomIn}
            disabled={!hasProject}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={handleFitToScreen}
            disabled={!hasProject}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-4 w-px bg-border mx-2" />

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-7 w-7",
              state.project?.gridEnabled && "bg-muted text-primary"
            )}
            onClick={handleToggleGrid}
            disabled={!hasProject}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          
          {state.project?.gridEnabled && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Grid:</Label>
              <Slider
                value={[state.project?.gridSize || 50]}
                onValueChange={handleGridSizeChange}
                min={20}
                max={100}
                step={10}
                className="w-20"
              />
              <span className="text-xs text-muted-foreground w-8">
                {state.project?.gridSize}px
              </span>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Move className="w-3 h-3" />
          <span>Alt+Drag to pan</span>
        </div>
      </div>

      {/* Canvas area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative parchment-bg"
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? 'grabbing' : 'default' }}
      >
        {hasProject ? (
          hasLayers ? (
            <div
              ref={canvasRef}
              className="absolute"
              style={{
                transform: `translate(${state.panOffset.x}px, ${state.panOffset.y}px) scale(${state.zoom})`,
                transformOrigin: 'top left',
                width: canvasSize.width,
                height: canvasSize.height,
              }}
            >
              {/* Canvas background */}
              <div className="absolute inset-0 bg-muted/20 rounded-lg border border-border/50" />
              
              {/* Grid overlay */}
              {state.project?.gridEnabled && (
                <GridOverlay gridSize={state.project.gridSize} canvasSize={canvasSize} />
              )}

              {/* Layers */}
              {state.project?.layers
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((layer) => (
                  <CanvasLayer
                    key={layer.id}
                    layer={layer}
                    isSelected={state.selectedLayerId === layer.id}
                    onSelect={() => dispatch({ type: 'SELECT_LAYER', layerId: layer.id })}
                    onDragStart={(e) => handleLayerDragStart(e, layer.id)}
                  />
                ))}
            </div>
          ) : (
            <EmptyCanvasState onUpload={handleUploadClick} />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <FloatingParticles />
            <div className="relative mb-6">
              <Sparkles className="w-16 h-16 text-primary/30 magical-pulse" />
            </div>
            <h3 className="font-serif text-lg text-muted-foreground mb-2">
              Create or load a project to begin
            </h3>
            <p className="text-sm text-muted-foreground/70">
              Use the toolbar above to start a new project
            </p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

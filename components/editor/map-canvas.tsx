'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useEditor } from '@/lib/editor-store'
import type { Layer, Position, ExpandedEffectLayer, MapLayer, AssetLayer } from '@/lib/types'
import { PremiumEffectRenderer } from './premium-effects'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid3X3, 
  Hexagon,
  Upload,
  Compass,
  Sparkles,
  RotateCw,
  Minus,
  Plus
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
      
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full border-2 border-primary/20 flex items-center justify-center magical-pulse">
          <div className="w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center">
            <Compass className="w-12 h-12 text-primary/50" />
          </div>
        </div>
      </div>

      <h3 className="font-serif text-xl text-primary mb-2">
        Upload a map to begin
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-md text-center">
        Start by uploading your battle map, then add animated effects
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

// Transform handles component
function TransformHandles({ 
  layer,
  onResizeStart,
  onRotateStart 
}: { 
  layer: Layer
  onResizeStart: (e: React.MouseEvent, corner: string) => void
  onRotateStart: (e: React.MouseEvent) => void
}) {
  return (
    <>
      {/* Corner resize handles */}
      <div 
        className="absolute -top-2 -left-2 w-4 h-4 bg-accent rounded-sm border-2 border-background cursor-nwse-resize shadow-[0_0_12px_rgba(100,150,255,0.6)]"
        onMouseDown={(e) => onResizeStart(e, 'nw')}
      />
      <div 
        className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-sm border-2 border-background cursor-nesw-resize shadow-[0_0_12px_rgba(100,150,255,0.6)]"
        onMouseDown={(e) => onResizeStart(e, 'ne')}
      />
      <div 
        className="absolute -bottom-2 -left-2 w-4 h-4 bg-accent rounded-sm border-2 border-background cursor-nesw-resize shadow-[0_0_12px_rgba(100,150,255,0.6)]"
        onMouseDown={(e) => onResizeStart(e, 'sw')}
      />
      <div 
        className="absolute -bottom-2 -right-2 w-4 h-4 bg-accent rounded-sm border-2 border-background cursor-nwse-resize shadow-[0_0_12px_rgba(100,150,255,0.6)]"
        onMouseDown={(e) => onResizeStart(e, 'se')}
      />
      
      {/* Edge resize handles */}
      <div 
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-accent/80 rounded-sm border border-background cursor-ns-resize"
        onMouseDown={(e) => onResizeStart(e, 'n')}
      />
      <div 
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-accent/80 rounded-sm border border-background cursor-ns-resize"
        onMouseDown={(e) => onResizeStart(e, 's')}
      />
      <div 
        className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-6 bg-accent/80 rounded-sm border border-background cursor-ew-resize"
        onMouseDown={(e) => onResizeStart(e, 'w')}
      />
      <div 
        className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-6 bg-accent/80 rounded-sm border border-background cursor-ew-resize"
        onMouseDown={(e) => onResizeStart(e, 'e')}
      />
      
      {/* Rotation handle */}
      <div 
        className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab"
        onMouseDown={onRotateStart}
      >
        <div className="w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-[0_0_12px_rgba(100,150,255,0.6)]">
          <RotateCw className="w-3 h-3 text-primary-foreground" />
        </div>
        <div className="w-px h-4 bg-accent/50" />
      </div>
    </>
  )
}

// Effect layer rendering component
function EffectLayerRenderer({ 
  layer, 
  isSelected,
  onSelect,
  onDragStart,
  onResizeStart,
  onRotateStart,
}: { 
  layer: ExpandedEffectLayer
  isSelected: boolean
  onSelect: () => void
  onDragStart: (e: React.MouseEvent) => void
  onResizeStart: (e: React.MouseEvent, corner: string) => void
  onRotateStart: (e: React.MouseEvent) => void
}) {
  if (!layer.visible) return null

  return (
    <div
      className={cn(
        "absolute overflow-hidden rounded-lg transition-shadow cursor-move",
        isSelected && "ring-2 ring-accent shadow-[0_0_24px_rgba(100,150,255,0.5)]",
        layer.locked && "ring-1 ring-primary/30" // Show subtle indicator for linked layers
      )}
      style={{
        left: layer.position.x,
        top: layer.position.y,
        width: layer.size.width,
        height: layer.size.height,
        transform: `rotate(${layer.rotation}deg)`,
        opacity: layer.opacity,
        zIndex: layer.zIndex,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseDown={(e) => {
        if (e.button === 0) {
          e.stopPropagation()
          onSelect()
          onDragStart(e)
        }
      }}
    >
      <PremiumEffectRenderer
        effectId={layer.effectId}
        settings={layer.settings as Record<string, unknown>}
        width={layer.size.width}
        height={layer.size.height}
      />

      {isSelected && !layer.locked && (
        <TransformHandles 
          layer={layer}
          onResizeStart={onResizeStart}
          onRotateStart={onRotateStart}
        />
      )}
    </div>
  )
}

// Image layer rendering component
function ImageLayerRenderer({ 
  layer, 
  isSelected,
  onSelect,
  onDragStart,
  onResizeStart,
  onRotateStart,
}: { 
  layer: MapLayer | AssetLayer
  isSelected: boolean
  onSelect: () => void
  onDragStart: (e: React.MouseEvent) => void
  onResizeStart: (e: React.MouseEvent, corner: string) => void
  onRotateStart: (e: React.MouseEvent) => void
}) {
  if (!layer.visible) return null

  return (
    <div
      className={cn(
        "absolute cursor-move",
        isSelected && "ring-2 ring-accent shadow-[0_0_24px_rgba(100,150,255,0.5)]",
        layer.locked && "ring-1 ring-primary/30" // Show subtle indicator for linked layers
      )}
      style={{
        left: layer.position.x,
        top: layer.position.y,
        width: layer.size.width,
        height: layer.size.height,
        transform: `rotate(${layer.rotation}deg)`,
        opacity: layer.opacity,
        zIndex: layer.zIndex,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseDown={(e) => {
        if (e.button === 0) {
          e.stopPropagation()
          onSelect()
          onDragStart(e)
        }
      }}
    >
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

      {isSelected && !layer.locked && (
        <TransformHandles 
          layer={layer}
          onResizeStart={onResizeStart}
          onRotateStart={onRotateStart}
        />
      )}
    </div>
  )
}

// Grid overlay
function GridOverlay({ gridSize, gridType, canvasSize }: { gridSize: number; gridType: 'square' | 'hex'; canvasSize: { width: number; height: number } }) {
  if (gridType === 'hex') {
    // Hex grid calculations
    // For pointy-top hexagons:
    // width = sqrt(3) * size, height = 2 * size
    // horizontal spacing = width, vertical spacing = height * 3/4
    const hexSize = gridSize / 2
    const hexWidth = Math.sqrt(3) * hexSize
    const hexHeight = 2 * hexSize
    const vertSpacing = hexHeight * 0.75
    
    // Calculate how many hexes we need
    const cols = Math.ceil(canvasSize.width / hexWidth) + 2
    const rows = Math.ceil(canvasSize.height / vertSpacing) + 2
    
    // Generate hex path (pointy-top)
    const hexPath = (cx: number, cy: number) => {
      const points = []
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        const x = cx + hexSize * Math.cos(angle)
        const y = cy + hexSize * Math.sin(angle)
        points.push(`${x},${y}`)
      }
      return `M ${points.join(' L ')} Z`
    }
    
    const hexPaths: string[] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isOddRow = row % 2 === 1
        const cx = col * hexWidth + (isOddRow ? hexWidth / 2 : 0)
        const cy = row * vertSpacing
        hexPaths.push(hexPath(cx, cy))
      }
    }
    
    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 9999 }}
        width={canvasSize.width}
        height={canvasSize.height}
      >
        <g className="text-primary/40">
          {hexPaths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </g>
      </svg>
    )
  }
  
  // Square grid (default)
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      width={canvasSize.width}
      height={canvasSize.height}
    >
      <defs>
        <pattern
          id="grid-square"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary/40"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-square)" />
    </svg>
  )
}

export function MapCanvas() {
  const { state, dispatch, addMapLayer, selectLayer, updateLayer, moveLayer } = useEditor()
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isPanning, setIsPanning] = useState(false)
  const [isSpaceDown, setIsSpaceDown] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })
  
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null)
  const [lastDragPos, setLastDragPos] = useState<Position>({ x: 0, y: 0 })
  
  const [resizing, setResizing] = useState<{ layerId: string; corner: string } | null>(null)
  const [resizeStart, setResizeStart] = useState<Position>({ x: 0, y: 0 })
  const [layerStartPos, setLayerStartPos] = useState<Position>({ x: 0, y: 0 })
  const [layerStartSize, setLayerStartSize] = useState({ width: 0, height: 0 })
  
  const [rotating, setRotating] = useState<string | null>(null)
  const [rotateCenter, setRotateCenter] = useState<Position>({ x: 0, y: 0 })

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpaceDown) {
        setIsSpaceDown(true)
      }
      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (state.selectedLayerId && !e.target?.toString().includes('Input')) {
          dispatch({ type: 'REMOVE_LAYER', layerId: state.selectedLayerId })
        }
      }
      if (e.code === 'KeyD' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        if (state.selectedLayerId) {
          dispatch({ type: 'DUPLICATE_LAYER', layerId: state.selectedLayerId })
        }
      }
      if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        // Undo would go here
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [state.selectedLayerId, isSpaceDown, dispatch])

  // Keep the store's viewport size in sync with the canvas container so new
  // effect layers can be placed at the center of what the user is looking at.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        dispatch({ type: 'SET_VIEWPORT_SIZE', size: { width: rect.width, height: rect.height } })
      }
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [dispatch])

  // Mouse wheel zoom centered on cursor
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const container = containerRef.current
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.1, Math.min(3, state.zoom + delta))
    const zoomRatio = newZoom / state.zoom
    
    // Zoom centered on cursor position
    const newPanX = mouseX - (mouseX - state.panOffset.x) * zoomRatio
    const newPanY = mouseY - (mouseY - state.panOffset.y) * zoomRatio
    
    dispatch({ type: 'SET_ZOOM', zoom: newZoom })
    dispatch({ type: 'SET_PAN_OFFSET', offset: { x: newPanX, y: newPanY } })
  }, [state.zoom, state.panOffset, dispatch])

  // Canvas mouse down - pan with middle click or space+drag
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && isSpaceDown)) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - state.panOffset.x, y: e.clientY - state.panOffset.y })
    } else if (e.button === 0) {
      selectLayer(null)
    }
  }

  // Layer drag start
  const handleLayerDragStart = (e: React.MouseEvent, layerId: string) => {
    const layer = state.project?.layers.find(l => l.id === layerId)
    if (!layer) return

    setDraggedLayerId(layerId)
    setLastDragPos({ x: e.clientX, y: e.clientY })
    dispatch({ type: 'SET_DRAGGING', isDragging: true })
  }

  // Resize start
  const handleResizeStart = (e: React.MouseEvent, layerId: string, corner: string) => {
    e.stopPropagation()
    const layer = state.project?.layers.find(l => l.id === layerId)
    if (!layer) return
    
    setResizing({ layerId, corner })
    setResizeStart({ x: e.clientX, y: e.clientY })
    setLayerStartPos({ ...layer.position })
    setLayerStartSize({ ...layer.size })
    dispatch({ type: 'SET_RESIZING', isResizing: true })
  }

  // Rotate start
  const handleRotateStart = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation()
    const layer = state.project?.layers.find(l => l.id === layerId)
    if (!layer) return
    
    setRotating(layerId)
    setRotateCenter({
      x: layer.position.x + layer.size.width / 2,
      y: layer.position.y + layer.size.height / 2
    })
  }

  // Global mouse move
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
      const deltaX = (e.clientX - lastDragPos.x) / state.zoom
      const deltaY = (e.clientY - lastDragPos.y) / state.zoom
      
      // moveLayer handles linked layers automatically
      moveLayer(draggedLayerId, deltaX, deltaY)
      setLastDragPos({ x: e.clientX, y: e.clientY })
    } else if (resizing) {
      const deltaX = (e.clientX - resizeStart.x) / state.zoom
      const deltaY = (e.clientY - resizeStart.y) / state.zoom
      const { corner, layerId } = resizing
      
      let newWidth = layerStartSize.width
      let newHeight = layerStartSize.height
      let newX = layerStartPos.x
      let newY = layerStartPos.y
      
      // Handle proportional scaling with Shift
      const proportional = e.shiftKey
      const aspectRatio = layerStartSize.width / layerStartSize.height
      
      if (corner.includes('e')) newWidth = Math.max(50, layerStartSize.width + deltaX)
      if (corner.includes('w')) {
        newWidth = Math.max(50, layerStartSize.width - deltaX)
        newX = layerStartPos.x + deltaX
      }
      if (corner.includes('s')) newHeight = Math.max(50, layerStartSize.height + deltaY)
      if (corner.includes('n')) {
        newHeight = Math.max(50, layerStartSize.height - deltaY)
        newY = layerStartPos.y + deltaY
      }
      
      if (proportional && (corner === 'nw' || corner === 'ne' || corner === 'sw' || corner === 'se')) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio
        } else {
          newWidth = newHeight * aspectRatio
        }
      }
      
      updateLayer(layerId, {
        position: { x: newX, y: newY },
        size: { width: newWidth, height: newHeight }
      })
    } else if (rotating) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      
      const mouseX = (e.clientX - rect.left - state.panOffset.x) / state.zoom
      const mouseY = (e.clientY - rect.top - state.panOffset.y) / state.zoom
      
      const angle = Math.atan2(mouseY - rotateCenter.y, mouseX - rotateCenter.x)
      const degrees = (angle * 180 / Math.PI) + 90
      
      updateLayer(rotating, { rotation: (degrees + 360) % 360 })
    }
  }, [isPanning, panStart, draggedLayerId, lastDragPos, resizing, resizeStart, layerStartPos, layerStartSize, rotating, rotateCenter, state.zoom, state.panOffset, dispatch, updateLayer, moveLayer])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    setDraggedLayerId(null)
    setResizing(null)
    setRotating(null)
    dispatch({ type: 'SET_DRAGGING', isDragging: false })
    dispatch({ type: 'SET_RESIZING', isResizing: false })
  }, [dispatch])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const handleZoomIn = () => dispatch({ type: 'SET_ZOOM', zoom: Math.min(3, state.zoom + 0.1) })
  const handleZoomOut = () => dispatch({ type: 'SET_ZOOM', zoom: Math.max(0.1, state.zoom - 0.1) })
  const handleFitToScreen = () => {
    dispatch({ type: 'SET_ZOOM', zoom: 1 })
    dispatch({ type: 'SET_PAN_OFFSET', offset: { x: 0, y: 0 } })
  }
  const handleToggleGrid = () => dispatch({ type: 'TOGGLE_GRID' })

  const handleUploadClick = () => fileInputRef.current?.click()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      if (file.type.startsWith('image/')) {
        // Create an image to get its natural dimensions
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const imgWidth = img.naturalWidth
          const imgHeight = img.naturalHeight
          
          // Add the layer with actual image dimensions
          addMapLayer(src, file.name.replace(/\.[^/.]+$/, ''))
          
          // Get container dimensions and auto-fit
          const container = containerRef.current
          if (container) {
            const rect = container.getBoundingClientRect()
            const padding = 40 // padding around the image
            const availableWidth = rect.width - padding * 2
            const availableHeight = rect.height - padding * 2
            
            const scaleX = availableWidth / imgWidth
            const scaleY = availableHeight / imgHeight
            const fitZoom = Math.min(scaleX, scaleY, 1) // Don't zoom in past 100%
            
            // Center the image
            const panX = (rect.width - imgWidth * fitZoom) / 2
            const panY = (rect.height - imgHeight * fitZoom) / 2
            
            dispatch({ type: 'SET_ZOOM', zoom: fitZoom })
            dispatch({ type: 'SET_PAN_OFFSET', offset: { x: panX, y: panY } })
          }
        }
        img.src = src
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Double-click to focus layer
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (state.selectedLayerId) {
      const layer = state.project?.layers.find(l => l.id === state.selectedLayerId)
      if (layer) {
        const container = containerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        
        dispatch({ 
          type: 'SET_PAN_OFFSET', 
          offset: { 
            x: rect.width / 2 - (layer.position.x + layer.size.width / 2) * state.zoom,
            y: rect.height / 2 - (layer.position.y + layer.size.height / 2) * state.zoom
          } 
        })
      }
    }
  }

  const hasProject = !!state.project
  const hasLayers = (state.project?.layers.length || 0) > 0
  const canvasSize = state.project?.canvasSize || { width: 1920, height: 1080 }

  const getCursor = () => {
    if (isPanning || isSpaceDown) return 'grab'
    if (resizing) return 'grabbing'
    if (rotating) return 'grabbing'
    return 'default'
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="h-10 border-b border-border bg-card/50 flex items-center px-3 gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut} disabled={!hasProject}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(state.zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn} disabled={!hasProject}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFitToScreen} disabled={!hasProject}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-4 w-px bg-border mx-2" />

        {/* Grid Controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-7 w-7", state.project?.gridEnabled && state.project?.gridType === 'square' && "bg-muted text-primary")}
            onClick={() => {
              if (!state.project?.gridEnabled) {
                handleToggleGrid()
                dispatch({ type: 'SET_GRID_TYPE', gridType: 'square' })
              } else if (state.project?.gridType !== 'square') {
                dispatch({ type: 'SET_GRID_TYPE', gridType: 'square' })
              } else {
                handleToggleGrid()
              }
            }}
            disabled={!hasProject}
            title="Square Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-7 w-7", state.project?.gridEnabled && state.project?.gridType === 'hex' && "bg-muted text-primary")}
            onClick={() => {
              if (!state.project?.gridEnabled) {
                handleToggleGrid()
                dispatch({ type: 'SET_GRID_TYPE', gridType: 'hex' })
              } else if (state.project?.gridType !== 'hex') {
                dispatch({ type: 'SET_GRID_TYPE', gridType: 'hex' })
              } else {
                handleToggleGrid()
              }
            }}
            disabled={!hasProject}
            title="Hex Grid"
          >
            <Hexagon className="w-4 h-4" />
          </Button>
        </div>

        {/* Grid Size Controls */}
        {state.project?.gridEnabled && (
          <div className="flex items-center gap-1 ml-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => dispatch({ type: 'SET_GRID_SIZE', size: Math.max(20, (state.project?.gridSize || 50) - 10) })}
              disabled={!hasProject}
              title="Decrease grid size"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-[10px] text-muted-foreground w-8 text-center">
              {state.project?.gridSize || 50}px
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => dispatch({ type: 'SET_GRID_SIZE', size: Math.min(200, (state.project?.gridSize || 50) + 10) })}
              disabled={!hasProject}
              title="Increase grid size"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>Scroll to zoom</span>
          <span>Space+Drag to pan</span>
          <span>Shift+Drag for proportional</span>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative parchment-bg"
        onMouseDown={handleCanvasMouseDown}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        style={{ cursor: getCursor() }}
      >
        {hasProject ? (
          hasLayers ? (
            <div
              className="absolute"
              style={{
                transform: `translate(${state.panOffset.x}px, ${state.panOffset.y}px) scale(${state.zoom})`,
                transformOrigin: 'top left',
                width: canvasSize.width,
                height: canvasSize.height,
              }}
            >
              <div className="absolute inset-0 bg-muted/20 rounded-lg border border-border/50" />

              {state.project?.layers
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((layer) => (
                  layer.type === 'effect' ? (
                    <EffectLayerRenderer
                      key={layer.id}
                      layer={layer as ExpandedEffectLayer}
                      isSelected={state.selectedLayerId === layer.id}
                      onSelect={() => selectLayer(layer.id)}
                      onDragStart={(e) => handleLayerDragStart(e, layer.id)}
                      onResizeStart={(e, corner) => handleResizeStart(e, layer.id, corner)}
                      onRotateStart={(e) => handleRotateStart(e, layer.id)}
                    />
                  ) : (
                    <ImageLayerRenderer
                      key={layer.id}
                      layer={layer as MapLayer | AssetLayer}
                      isSelected={state.selectedLayerId === layer.id}
                      onSelect={() => selectLayer(layer.id)}
                      onDragStart={(e) => handleLayerDragStart(e, layer.id)}
                      onResizeStart={(e, corner) => handleResizeStart(e, layer.id, corner)}
                      onRotateStart={(e) => handleRotateStart(e, layer.id)}
                    />
                  )
                ))}
              
              {/* Grid overlay - rendered on top of all layers */}
              {state.project?.gridEnabled && (
                <GridOverlay 
                  gridSize={state.project.gridSize} 
                  gridType={state.project.gridType || 'square'} 
                  canvasSize={canvasSize} 
                />
              )}
            </div>
          ) : (
            <EmptyCanvasState onUpload={handleUploadClick} />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <FloatingParticles />
            <Sparkles className="w-16 h-16 text-primary/30 magical-pulse mb-6" />
            <h3 className="font-serif text-lg text-muted-foreground mb-2">Create or load a project</h3>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    </div>
  )
}

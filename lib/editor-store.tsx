'use client'

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type {
  Project,
  Layer,
  EditorState,
  Position,
  Size,
  ExpandedEffectLayer,
  GridLayer,
  EffectSettings,
  GridType,
  HistoryState
} from './types'
import type { EffectDefinition } from './effects-library'
import { createClient } from './supabase/client'
import {
  saveProject as saveProjectAction,
  listProjects as listProjectsAction,
  loadProject as loadProjectAction,
  type ProjectSummary,
} from '@/app/actions/projects'

type EditorAction =
  | { type: 'CREATE_PROJECT'; name: string }
  | { type: 'LOAD_PROJECT'; project: Project }
  | { type: 'REPLACE_PROJECT'; project: Project }
  | { type: 'UPDATE_PROJECT_NAME'; name: string }
  | { type: 'ADD_LAYER'; layer: Layer; canvasSize?: Size }
  | { type: 'FIT_CANVAS_TO_LAYER'; layerId: string }
  | { type: 'REMOVE_LAYER'; layerId: string }
  | { type: 'UPDATE_LAYER'; layerId: string; updates: Partial<Layer> }
  | { type: 'MOVE_LAYER'; layerId: string; deltaX: number; deltaY: number }
  | { type: 'SELECT_LAYER'; layerId: string | null }
  | { type: 'DUPLICATE_LAYER'; layerId: string }
  | { type: 'MOVE_LAYER_ORDER'; layerId: string; direction: 'forward' | 'backward' }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_PAN_OFFSET'; offset: Position }
  | { type: 'TOGGLE_GRID' }
  | { type: 'SET_GRID_TYPE'; gridType: GridType }
  | { type: 'SET_GRID_SIZE'; size: number }
  | { type: 'SET_DRAGGING'; isDragging: boolean }
  | { type: 'SET_RESIZING'; isResizing: boolean }
  | { type: 'SET_VIEWPORT_SIZE'; size: { width: number; height: number } }
  | { type: 'UNDO' }
  | { type: 'REDO' }

const initialState: EditorState = {
  project: null,
  selectedLayerId: null,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  isDragging: false,
  isResizing: false,
  viewportSize: { width: 1280, height: 720 },
  history: { past: [], future: [], lastKey: null },
}

function createNewProject(name: string): Project {
  return {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    layers: [],
    gridEnabled: false,
    gridType: 'square',
    gridSize: 50,
    canvasSize: { width: 1920, height: 1080 },
  }
}

// Longest edge (px) the canvas is allowed to take when adapting to a map. Keeps
// the coordinate space (grid SVG, effect buffers) bounded for huge uploads while
// preserving the map's exact aspect ratio. Export downscales from here anyway.
export const MAX_CANVAS_EDGE = 2560

// Scale a width/height down so its longest edge is at most maxEdge, preserving
// aspect ratio. Smaller-than-max images are returned at natural size (rounded).
export function fitToMaxEdge(width: number, height: number, maxEdge = MAX_CANVAS_EDGE): Size {
  const longest = Math.max(width, height)
  const scale = longest > maxEdge ? maxEdge / longest : 1
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

// Reassign contiguous zIndex values from a back-to-front ordering.
function reindexLayers(layers: Layer[]): Layer[] {
  return [...layers].sort((a, b) => a.zIndex - b.zIndex).map((l, i) => ({ ...l, zIndex: i }))
}

function makeGridLayer(gridType: GridType, gridSize: number, canvasSize: Size): GridLayer {
  return {
    id: uuidv4(),
    name: gridType === 'hex' ? 'Hex Grid' : 'Square Grid',
    type: 'grid',
    gridType,
    gridSize,
    position: { x: 0, y: 0 },
    size: { ...canvasSize },
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 0,
  }
}

// Insert a grid layer just above the base map layers (and below effects/assets),
// replacing any existing grid layer, then reindex.
function insertGridLayer(layers: Layer[], grid: GridLayer): Layer[] {
  const base = layers.filter(l => l.type !== 'grid').sort((a, b) => a.zIndex - b.zIndex)
  let insertAt = 0
  base.forEach((l, i) => { if (l.type === 'map') insertAt = i + 1 })
  const next = [...base.slice(0, insertAt), grid, ...base.slice(insertAt)]
  return next.map((l, i) => ({ ...l, zIndex: i }))
}

function removeGridLayer(layers: Layer[]): Layer[] {
  return reindexLayers(layers.filter(l => l.type !== 'grid'))
}

function baseReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'CREATE_PROJECT':
      return {
        ...state,
        project: createNewProject(action.name),
        selectedLayerId: null,
        zoom: 1,
        panOffset: { x: 0, y: 0 },
      }
    
    case 'LOAD_PROJECT':
      return {
        ...state,
        project: action.project,
        selectedLayerId: null,
        zoom: 1,
        panOffset: { x: 0, y: 0 },
      }
    
    case 'REPLACE_PROJECT':
      // Swap the project in place without resetting view state (zoom/pan/selection).
      return { ...state, project: action.project }

    case 'UPDATE_PROJECT_NAME':
      if (!state.project) return state
      return {
        ...state,
        project: {
          ...state.project,
          name: action.name,
          updatedAt: new Date().toISOString(),
        },
      }
    
    case 'ADD_LAYER':
      if (!state.project) return state
      return {
        ...state,
        project: {
          ...state.project,
          layers: [...state.project.layers, action.layer],
          // When adapting the canvas to a freshly-added base map, resize it and
          // any existing grid layer together so everything stays edge-to-edge.
          ...(action.canvasSize ? { canvasSize: action.canvasSize } : {}),
          ...(action.canvasSize
            ? {
                layers: [...state.project.layers, action.layer].map(l =>
                  l.type === 'grid' ? { ...l, size: { ...action.canvasSize! } } : l,
                ),
              }
            : {}),
          updatedAt: new Date().toISOString(),
        },
        selectedLayerId: action.layer.id,
      }

    case 'FIT_CANVAS_TO_LAYER': {
      if (!state.project) return state
      const target = state.project.layers.find(l => l.id === action.layerId)
      if (!target) return state
      // Shape the canvas to this layer's (capped) size, then drop the layer at
      // the origin filling the frame edge-to-edge. Any grid layer is resized to
      // match so it keeps covering the whole canvas.
      const size = fitToMaxEdge(target.size.width, target.size.height)
      return {
        ...state,
        project: {
          ...state.project,
          canvasSize: size,
          layers: state.project.layers.map((l): Layer => {
            if (l.id === action.layerId) {
              return { ...l, position: { x: 0, y: 0 }, size: { ...size }, rotation: 0 }
            }
            if (l.type === 'grid') return { ...l, size: { ...size } }
            return l
          }),
          updatedAt: new Date().toISOString(),
        },
      }
    }

    case 'REMOVE_LAYER':
      if (!state.project) return state
      return {
        ...state,
        project: {
          ...state.project,
          layers: state.project.layers.filter(l => l.id !== action.layerId),
          updatedAt: new Date().toISOString(),
        },
        selectedLayerId: state.selectedLayerId === action.layerId ? null : state.selectedLayerId,
      }
    
    case 'UPDATE_LAYER':
      if (!state.project) return state
      return {
        ...state,
        project: {
          ...state.project,
          layers: state.project.layers.map((l): Layer =>
            l.id === action.layerId ? ({ ...l, ...action.updates } as Layer) : l
          ),
          updatedAt: new Date().toISOString(),
        },
      }
    
    case 'MOVE_LAYER':
      if (!state.project) return state
      const movedLayer = state.project.layers.find(l => l.id === action.layerId)
      if (!movedLayer) return state
      
      // If the moved layer is locked, move ALL locked layers together
      // If not locked, just move this layer
      return {
        ...state,
        project: {
          ...state.project,
          layers: state.project.layers.map((l): Layer => {
            // If moving a locked layer, move all other locked layers too
            if (movedLayer.locked && l.locked) {
              return {
                ...l,
                position: {
                  x: l.position.x + action.deltaX,
                  y: l.position.y + action.deltaY,
                }
              }
            }
            // If moving an unlocked layer, only move that one
            if (l.id === action.layerId && !movedLayer.locked) {
              return {
                ...l,
                position: {
                  x: l.position.x + action.deltaX,
                  y: l.position.y + action.deltaY,
                }
              }
            }
            return l
          }),
          updatedAt: new Date().toISOString(),
        },
      }
    
    case 'SELECT_LAYER':
      return {
        ...state,
        selectedLayerId: action.layerId,
      }
    
    case 'DUPLICATE_LAYER':
      if (!state.project) return state
      const layerToDuplicate = state.project.layers.find(l => l.id === action.layerId)
      if (!layerToDuplicate) return state
      const duplicatedLayer: Layer = {
        ...layerToDuplicate,
        id: uuidv4(),
        name: layerToDuplicate.name,
        position: {
          x: layerToDuplicate.position.x + 20,
          y: layerToDuplicate.position.y + 20,
        },
        zIndex: state.project.layers.length,
      } as Layer
      return {
        ...state,
        project: {
          ...state.project,
          layers: [...state.project.layers, duplicatedLayer],
          updatedAt: new Date().toISOString(),
        },
        selectedLayerId: duplicatedLayer.id,
      }
    
    case 'MOVE_LAYER_ORDER': {
      if (!state.project) return state
      // Work on a stack ordered back-to-front (ascending zIndex).
      const sorted = [...state.project.layers].sort((a, b) => a.zIndex - b.zIndex)
      const idx = sorted.findIndex(l => l.id === action.layerId)
      if (idx === -1) return state
      // 'forward' moves toward the front (higher zIndex), 'backward' toward the back.
      const swapWith = action.direction === 'forward' ? idx + 1 : idx - 1
      if (swapWith < 0 || swapWith >= sorted.length) return state
      ;[sorted[idx], sorted[swapWith]] = [sorted[swapWith], sorted[idx]]
      // Reassign contiguous zIndex values so order stays consistent.
      const layers = sorted.map((l, i) => ({ ...l, zIndex: i }))
      return {
        ...state,
        project: {
          ...state.project,
          layers,
          updatedAt: new Date().toISOString(),
        },
      }
    }

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(3, action.zoom)),
      }
    
    case 'SET_PAN_OFFSET':
      return {
        ...state,
        panOffset: action.offset,
      }
    
    case 'SET_VIEWPORT_SIZE':
      return {
        ...state,
        viewportSize: action.size,
      }
    
    case 'TOGGLE_GRID': {
      if (!state.project) return state
      const existing = state.project.layers.find(l => l.type === 'grid')
      let layers: Layer[]
      let selectedLayerId = state.selectedLayerId
      if (existing) {
        layers = removeGridLayer(state.project.layers)
        if (selectedLayerId === existing.id) selectedLayerId = null
      } else {
        const grid = makeGridLayer(state.project.gridType || 'square', state.project.gridSize || 50, state.project.canvasSize)
        layers = insertGridLayer(state.project.layers, grid)
        selectedLayerId = grid.id
      }
      return {
        ...state,
        project: { ...state.project, layers, gridEnabled: !existing, updatedAt: new Date().toISOString() },
        selectedLayerId,
      }
    }

    case 'SET_GRID_TYPE': {
      if (!state.project) return state
      const existing = state.project.layers.find(l => l.type === 'grid') as GridLayer | undefined
      let layers: Layer[]
      let selectedLayerId = state.selectedLayerId
      if (existing && existing.gridType === action.gridType) {
        // Clicking the already-active grid type toggles the grid off.
        layers = removeGridLayer(state.project.layers)
        if (selectedLayerId === existing.id) selectedLayerId = null
      } else if (existing) {
        // Switch the existing grid layer's type in place.
        layers = state.project.layers.map(l =>
          l.type === 'grid'
            ? { ...l, gridType: action.gridType, name: action.gridType === 'hex' ? 'Hex Grid' : 'Square Grid' }
            : l,
        )
      } else {
        const grid = makeGridLayer(action.gridType, state.project.gridSize || 50, state.project.canvasSize)
        layers = insertGridLayer(state.project.layers, grid)
        selectedLayerId = grid.id
      }
      return {
        ...state,
        project: {
          ...state.project,
          layers,
          gridType: action.gridType,
          gridEnabled: layers.some(l => l.type === 'grid'),
          updatedAt: new Date().toISOString(),
        },
        selectedLayerId,
      }
    }

    case 'SET_GRID_SIZE':
      if (!state.project) return state
      return {
        ...state,
        project: {
          ...state.project,
          gridSize: action.size,
          layers: state.project.layers.map(l =>
            l.type === 'grid' ? { ...l, gridSize: action.size } : l,
          ),
          updatedAt: new Date().toISOString(),
        },
      }
    
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.isDragging }
    
    case 'SET_RESIZING':
      return { ...state, isResizing: action.isResizing }

    default:
      return state
  }
}

// ===== Undo / redo history wrapper =====
//
// We snapshot the (immutable) `project` before each undoable mutation. Continuous
// gestures — a drag fires many MOVE_LAYER actions, a slider many UPDATE_LAYERs —
// are coalesced into ONE undo step via a `lastKey`: consecutive actions sharing a
// key don't create a new snapshot. Gesture boundaries (SET_DRAGGING/SET_RESIZING,
// fired on mouse down/up) reset the key so a fresh gesture starts a new step.

const HISTORY_LIMIT = 60

// Mutations that change the project and should be undoable.
const UNDOABLE = new Set<EditorAction['type']>([
  'ADD_LAYER', 'REMOVE_LAYER', 'UPDATE_LAYER', 'MOVE_LAYER', 'DUPLICATE_LAYER',
  'MOVE_LAYER_ORDER', 'TOGGLE_GRID', 'SET_GRID_TYPE', 'SET_GRID_SIZE', 'FIT_CANVAS_TO_LAYER',
])

// Coalesce key for an action. Consecutive actions with the same non-null key fold
// into a single undo step; null means "always a discrete step".
function coalesceKeyFor(action: EditorAction): string | null {
  switch (action.type) {
    case 'MOVE_LAYER':
      return `m:${action.layerId}`
    case 'UPDATE_LAYER':
      return `u:${action.layerId}:${Object.keys(action.updates).sort().join(',')}`
    default:
      return null
  }
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  if (action.type === 'UNDO') {
    const { past, future } = state.history
    if (past.length === 0 || !state.project) return state
    const previous = past[past.length - 1]
    const selectedLayerId = previous.layers.some(l => l.id === state.selectedLayerId)
      ? state.selectedLayerId
      : null
    return {
      ...state,
      project: previous,
      selectedLayerId,
      history: {
        past: past.slice(0, -1),
        future: [state.project, ...future].slice(0, HISTORY_LIMIT),
        lastKey: null,
      },
    }
  }

  if (action.type === 'REDO') {
    const { past, future } = state.history
    if (future.length === 0 || !state.project) return state
    const next = future[0]
    const selectedLayerId = next.layers.some(l => l.id === state.selectedLayerId)
      ? state.selectedLayerId
      : null
    return {
      ...state,
      project: next,
      selectedLayerId,
      history: {
        past: [...past, state.project].slice(-HISTORY_LIMIT),
        future: future.slice(1),
        lastKey: null,
      },
    }
  }

  const next = baseReducer(state, action)

  // Switching projects clears the timeline — you can't undo across projects.
  if (action.type === 'CREATE_PROJECT' || action.type === 'LOAD_PROJECT') {
    return { ...next, history: { past: [], future: [], lastKey: null } }
  }

  // Gesture boundaries reset coalescing so the next drag/resize is its own step.
  if (action.type === 'SET_DRAGGING' || action.type === 'SET_RESIZING') {
    return { ...next, history: { ...state.history, lastKey: null } }
  }

  // Record history only for undoable mutations that actually changed the project.
  if (!UNDOABLE.has(action.type) || !state.project || next.project === state.project) {
    return next
  }

  const key = coalesceKeyFor(action)
  if (key !== null && key === state.history.lastKey) {
    // Same continuous gesture — fold into the existing step.
    return { ...next, history: { ...state.history, lastKey: key } }
  }
  return {
    ...next,
    history: {
      past: [...state.history.past, state.project].slice(-HISTORY_LIMIT),
      future: [],
      lastKey: key,
    },
  }
}

interface EditorContextType {
  state: EditorState
  dispatch: React.Dispatch<EditorAction>
  createProject: (name: string) => void
  saveProject: () => Promise<{ success: boolean; error?: string }>
  loadProject: (projectId: string) => Promise<boolean>
  getSavedProjects: () => Promise<ProjectSummary[]>
  addMapLayer: (src: string, name: string) => void
  addEffectLayer: (effect: EffectDefinition) => void
  selectLayer: (layerId: string | null) => void
  updateLayer: (layerId: string, updates: Partial<Layer>) => void
  moveLayer: (layerId: string, deltaX: number, deltaY: number) => void
  removeLayer: (layerId: string) => void
  duplicateLayer: (layerId: string) => void
  moveLayerOrder: (layerId: string, direction: 'forward' | 'backward') => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

const EditorContext = createContext<EditorContextType | null>(null)

// Auto-saved working draft of the current (possibly unsaved) project. This
// survives page reloads and the login redirect so in-progress work — created
// before the user signs in — is never lost.
const DRAFT_KEY = 'arcane-animator-draft'

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState)

  // Restore the working draft on first mount (e.g. after a login redirect or
  // an accidental refresh) so the user picks up exactly where they left off.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const project = JSON.parse(draft) as Project
        dispatch({ type: 'LOAD_PROJECT', project })
      } catch {
        localStorage.removeItem(DRAFT_KEY)
      }
    }
  }, [])

  // Persist the current project to the draft slot whenever it changes.
  useEffect(() => {
    if (typeof window === 'undefined' || !state.project) return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state.project))
    } catch {
      // localStorage quota can be exceeded by large base64 map images — fail
      // quietly so editing is never interrupted by an autosave error.
      console.warn('Could not auto-save draft (storage quota may be exceeded).')
    }
  }, [state.project])

  const createProject = (name: string) => {
    dispatch({ type: 'CREATE_PROJECT', name })
  }

  // Upload any base64/data-URL map or asset images to Supabase Storage and
  // return a project whose layer `src`s are public URLs. This keeps the saved
  // project small (data URLs can be multiple MB) and avoids the 1MB server
  // action body limit. Already-uploaded URLs are left untouched.
  const uploadMapImages = async (project: Project, userId: string): Promise<Project> => {
    const supabase = createClient()
    const layers = await Promise.all(
      project.layers.map(async (layer) => {
        const src = (layer as { src?: string }).src
        if ((layer.type === 'map' || layer.type === 'asset') && typeof src === 'string' && src.startsWith('data:')) {
          try {
            const blob = await (await fetch(src)).blob()
            const ext = (blob.type.split('/')[1] || 'png').replace('+xml', '')
            const path = `${userId}/${project.id}/${layer.id}.${ext}`
            const { error } = await supabase.storage
              .from('maps')
              .upload(path, blob, { upsert: true, contentType: blob.type })
            if (error) return layer
            const { data } = supabase.storage.from('maps').getPublicUrl(path)
            return { ...layer, src: data.publicUrl }
          } catch {
            return layer
          }
        }
        return layer
      })
    )
    return { ...project, layers }
  }

  const saveProject = async (): Promise<{ success: boolean; error?: string }> => {
    if (!state.project) return { success: false, error: 'No project to save.' }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Please sign in to save your project.' }

    // Replace embedded base64 images with uploaded URLs, then sync that back
    // into state so we don't re-upload on the next save.
    const project = await uploadMapImages(state.project, user.id)
    dispatch({ type: 'REPLACE_PROJECT', project })

    return saveProjectAction(project)
  }

  const loadProject = async (projectId: string): Promise<boolean> => {
    const project = await loadProjectAction(projectId)
    if (project) {
      dispatch({ type: 'LOAD_PROJECT', project })
      return true
    }
    return false
  }

  const getSavedProjects = async (): Promise<ProjectSummary[]> => {
    return listProjectsAction()
  }

  const addMapLayer = (src: string, name: string, width?: number, height?: number) => {
    // Create an image to get dimensions if not provided
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const imgWidth = width || img.naturalWidth || 800
      const imgHeight = height || img.naturalHeight || 600

      // The first base map defines the canvas: adapt the frame to the map's
      // (capped) dimensions, drop it at the origin, and pin it so it can't be
      // dragged by accident. Subsequent maps behave like plain overlays.
      const isFirstMap = !state.project?.layers.some(l => l.type === 'map')
      const size = isFirstMap ? fitToMaxEdge(imgWidth, imgHeight) : { width: imgWidth, height: imgHeight }

      const layer: Layer = {
        id: uuidv4(),
        name,
        type: 'map',
        src,
        position: { x: 0, y: 0 },
        size,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        pinned: isFirstMap,
        zIndex: state.project?.layers.length || 0,
      }
      dispatch({ type: 'ADD_LAYER', layer, canvasSize: isFirstMap ? size : undefined })
    }
    img.src = src
  }

  const addEffectLayer = (effect: EffectDefinition) => {
    const size = { width: 300, height: 300 }

    // Place the new layer at the CENTER of the current viewport, in image
    // coordinates, so it's immediately visible no matter how the user has
    // panned/zoomed. Screen -> image: image = (screen - panOffset) / zoom.
    const { zoom, panOffset, viewportSize } = state
    const viewCenterX = (viewportSize.width / 2 - panOffset.x) / zoom
    const viewCenterY = (viewportSize.height / 2 - panOffset.y) / zoom

    const layer: ExpandedEffectLayer = {
      id: uuidv4(),
      name: effect.name,
      type: 'effect',
      effectId: effect.id,
      category: effect.pack,
      settings: { ...effect.defaultSettings },
      position: {
        x: Math.round(viewCenterX - size.width / 2),
        y: Math.round(viewCenterY - size.height / 2),
      },
      size,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: state.project?.layers.length || 0,
      blendMode: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_LAYER', layer })
    dispatch({ type: 'SELECT_LAYER', layerId: layer.id })
  }

  const selectLayer = (layerId: string | null) => {
    dispatch({ type: 'SELECT_LAYER', layerId })
  }

  const updateLayer = (layerId: string, updates: Partial<Layer>) => {
    dispatch({ type: 'UPDATE_LAYER', layerId, updates })
  }

  const moveLayer = (layerId: string, deltaX: number, deltaY: number) => {
    dispatch({ type: 'MOVE_LAYER', layerId, deltaX, deltaY })
  }

  const removeLayer = (layerId: string) => {
    dispatch({ type: 'REMOVE_LAYER', layerId })
  }

  const duplicateLayer = (layerId: string) => {
    dispatch({ type: 'DUPLICATE_LAYER', layerId })
  }

  const moveLayerOrder = (layerId: string, direction: 'forward' | 'backward') => {
    dispatch({ type: 'MOVE_LAYER_ORDER', layerId, direction })
  }

  const undo = () => dispatch({ type: 'UNDO' })
  const redo = () => dispatch({ type: 'REDO' })

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
        createProject,
        saveProject,
        loadProject,
        getSavedProjects,
        addMapLayer,
        addEffectLayer,
        selectLayer,
        updateLayer,
        moveLayer,
        removeLayer,
        duplicateLayer,
        moveLayerOrder,
        undo,
        redo,
        canUndo: state.history.past.length > 0,
        canRedo: state.history.future.length > 0,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}

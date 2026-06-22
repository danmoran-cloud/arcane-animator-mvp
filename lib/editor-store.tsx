'use client'

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { 
  Project, 
  Layer, 
  EditorState, 
  Position,
  ExpandedEffectLayer,
  EffectSettings,
  GridType
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
  | { type: 'ADD_LAYER'; layer: Layer }
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

const initialState: EditorState = {
  project: null,
  selectedLayerId: null,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  isDragging: false,
  isResizing: false,
  viewportSize: { width: 1280, height: 720 },
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

function editorReducer(state: EditorState, action: EditorAction): EditorState {
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
          updatedAt: new Date().toISOString(),
        },
        selectedLayerId: action.layer.id,
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
          layers: state.project.layers.map(l =>
            l.id === action.layerId ? { ...l, ...action.updates } : l
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
          layers: state.project.layers.map(l => {
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
    
    case 'TOGGLE_GRID':
      if (!state.project) return state
      return {
        ...state,
        project: {
          ...state.project,
          gridEnabled: !state.project.gridEnabled,
          updatedAt: new Date().toISOString(),
        },
      }
    
    case 'SET_GRID_TYPE':
      if (!state.project) return state
      return {
        ...state,
        project: {
          ...state.project,
          gridType: action.gridType,
          updatedAt: new Date().toISOString(),
        },
      }
    
    case 'SET_GRID_SIZE':
      if (!state.project) return state
      return {
        ...state,
        project: {
          ...state.project,
          gridSize: action.size,
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
      
      const layer: Layer = {
        id: uuidv4(),
        name,
        type: 'map',
        src,
        position: { x: 0, y: 0 },
        size: { width: imgWidth, height: imgHeight },
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: state.project?.layers.length || 0,
      }
      dispatch({ type: 'ADD_LAYER', layer })
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

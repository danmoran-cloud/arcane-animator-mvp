'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { 
  Project, 
  Layer, 
  EditorState, 
  Position,
  ExpandedEffectLayer,
  EffectSettings
} from './types'
import type { EffectDefinition } from './effects-library'

type EditorAction =
  | { type: 'CREATE_PROJECT'; name: string }
  | { type: 'LOAD_PROJECT'; project: Project }
  | { type: 'UPDATE_PROJECT_NAME'; name: string }
  | { type: 'ADD_LAYER'; layer: Layer }
  | { type: 'REMOVE_LAYER'; layerId: string }
  | { type: 'UPDATE_LAYER'; layerId: string; updates: Partial<Layer> }
  | { type: 'MOVE_LAYER'; layerId: string; deltaX: number; deltaY: number }
  | { type: 'SELECT_LAYER'; layerId: string | null }
  | { type: 'DUPLICATE_LAYER'; layerId: string }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_PAN_OFFSET'; offset: Position }
  | { type: 'TOGGLE_GRID' }
  | { type: 'SET_GRID_SIZE'; size: number }
  | { type: 'SET_DRAGGING'; isDragging: boolean }
  | { type: 'SET_RESIZING'; isResizing: boolean }

const initialState: EditorState = {
  project: null,
  selectedLayerId: null,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  isDragging: false,
  isResizing: false,
}

function createNewProject(name: string): Project {
  return {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    layers: [],
    gridEnabled: false,
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
        name: `${layerToDuplicate.name} (Copy)`,
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
  saveProject: () => void
  loadProject: (projectId: string) => void
  getSavedProjects: () => { id: string; name: string; updatedAt: string }[]
  addMapLayer: (src: string, name: string) => void
  addEffectLayer: (effect: EffectDefinition) => void
  selectLayer: (layerId: string | null) => void
  updateLayer: (layerId: string, updates: Partial<Layer>) => void
  moveLayer: (layerId: string, deltaX: number, deltaY: number) => void
  removeLayer: (layerId: string) => void
  duplicateLayer: (layerId: string) => void
}

const EditorContext = createContext<EditorContextType | null>(null)

const STORAGE_KEY = 'arcane-animator-projects'

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState)

  const createProject = (name: string) => {
    dispatch({ type: 'CREATE_PROJECT', name })
  }

  const saveProject = () => {
    if (!state.project) return
    const savedProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    savedProjects[state.project.id] = state.project
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProjects))
  }

  const loadProject = (projectId: string) => {
    const savedProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const project = savedProjects[projectId]
    if (project) {
      dispatch({ type: 'LOAD_PROJECT', project })
    }
  }

  const getSavedProjects = () => {
    if (typeof window === 'undefined') return []
    const savedProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return Object.values(savedProjects).map((p: unknown) => {
      const project = p as Project
      return { id: project.id, name: project.name, updatedAt: project.updatedAt }
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  const addMapLayer = (src: string, name: string) => {
    const layer: Layer = {
      id: uuidv4(),
      name,
      type: 'map',
      src,
      position: { x: 0, y: 0 },
      size: { width: 800, height: 600 },
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: state.project?.layers.length || 0,
    }
    dispatch({ type: 'ADD_LAYER', layer })
  }

  const addEffectLayer = (effect: EffectDefinition) => {
    const layer: ExpandedEffectLayer = {
      id: uuidv4(),
      name: effect.name,
      type: 'effect',
      effectId: effect.id,
      category: effect.pack,
      settings: { ...effect.defaultSettings },
      position: { x: 100, y: 100 },
      size: { width: 300, height: 300 },
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: state.project?.layers.length || 0,
    }
    dispatch({ type: 'ADD_LAYER', layer })
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

'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { 
  Project, 
  Layer, 
  EditorState, 
  Position, 
  Asset, 
  EffectDefinition,
  EffectType,
  EffectSettings,
  EffectLayer,
  Size
} from './types'

// Effect definitions with default settings
export const effectDefinitions: EffectDefinition[] = [
  // Weather
  {
    id: 'fog',
    name: 'Rolling Fog',
    description: 'Semi-transparent drifting fog layer',
    effectType: 'fog',
    category: 'weather',
    defaultSettings: { speed: 0.4, density: 0.7, tint: '#a8b5c4' },
    defaultSize: { width: 600, height: 300 },
  },
  {
    id: 'rain',
    name: 'Rainfall',
    description: 'Animated diagonal rain streaks',
    effectType: 'rain',
    category: 'weather',
    defaultSettings: { speed: 0.6, intensity: 0.5, angle: 15 },
    defaultSize: { width: 400, height: 400 },
  },
  {
    id: 'snow',
    name: 'Snowfall',
    description: 'Slow drifting snow particles',
    effectType: 'snow',
    category: 'weather',
    defaultSettings: { speed: 0.3, flakeSize: 0.5, density: 0.6 },
    defaultSize: { width: 400, height: 400 },
  },
  // Fire
  {
    id: 'torchlight',
    name: 'Torchlight',
    description: 'Warm pulsing radial glow',
    effectType: 'torchlight',
    category: 'fire',
    defaultSettings: { flickerSpeed: 0.5, radius: 0.8, color: '#ff9933' },
    defaultSize: { width: 200, height: 200 },
  },
  {
    id: 'campfire',
    name: 'Campfire Glow',
    description: 'Flickering light with ember particles',
    effectType: 'campfire',
    category: 'fire',
    defaultSettings: { flickerSpeed: 0.6, emberCount: 12, radius: 0.7 },
    defaultSize: { width: 250, height: 250 },
  },
  {
    id: 'lavaShimmer',
    name: 'Lava Shimmer',
    description: 'Orange/red animated shimmer with heat waves',
    effectType: 'lavaShimmer',
    category: 'fire',
    defaultSettings: { shimmerSpeed: 0.4, glowIntensity: 0.7 },
    defaultSize: { width: 300, height: 200 },
  },
  // Water
  {
    id: 'waterRipple',
    name: 'Water Ripple',
    description: 'Subtle transparent ripple distortion',
    effectType: 'waterRipple',
    category: 'water',
    defaultSettings: { waveSpeed: 0.5, rippleScale: 0.6, tint: '#4a90d9' },
    defaultSize: { width: 300, height: 300 },
  },
  // Magic
  {
    id: 'runes',
    name: 'Magical Runes',
    description: 'Glowing rotating rune circle',
    effectType: 'runes',
    category: 'magic',
    defaultSettings: { rotationSpeed: 0.3, glowIntensity: 0.8, color: '#7c3aed' },
    defaultSize: { width: 200, height: 200 },
  },
  {
    id: 'portal',
    name: 'Portal',
    description: 'Circular swirling magical portal',
    effectType: 'portal',
    category: 'magic',
    defaultSettings: { swirlSpeed: 0.5, glowIntensity: 0.9, color: '#06b6d4' },
    defaultSize: { width: 200, height: 200 },
  },
  // Atmosphere
  {
    id: 'dustMotes',
    name: 'Dust Motes',
    description: 'Small floating atmospheric particles',
    effectType: 'dustMotes',
    category: 'atmosphere',
    defaultSettings: { speed: 0.2, density: 0.5 },
    defaultSize: { width: 400, height: 400 },
  },
]

// Mock assets for the asset library (legacy)
export const mockAssets: Asset[] = []

type EditorAction =
  | { type: 'CREATE_PROJECT'; name: string }
  | { type: 'LOAD_PROJECT'; project: Project }
  | { type: 'UPDATE_PROJECT_NAME'; name: string }
  | { type: 'ADD_LAYER'; layer: Layer }
  | { type: 'REMOVE_LAYER'; layerId: string }
  | { type: 'UPDATE_LAYER'; layerId: string; updates: Partial<Layer> }
  | { type: 'UPDATE_EFFECT_SETTINGS'; layerId: string; settings: Partial<EffectSettings> }
  | { type: 'SELECT_LAYER'; layerId: string | null }
  | { type: 'REORDER_LAYERS'; layers: Layer[] }
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
    
    case 'UPDATE_EFFECT_SETTINGS':
      if (!state.project) return state
      return {
        ...state,
        project: {
          ...state.project,
          layers: state.project.layers.map(l => {
            if (l.id === action.layerId && l.type === 'effect') {
              return {
                ...l,
                settings: { ...l.settings, ...action.settings },
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
    
    case 'REORDER_LAYERS':
      if (!state.project) return state
      return {
        ...state,
        project: {
          ...state.project,
          layers: action.layers,
          updatedAt: new Date().toISOString(),
        },
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
      return {
        ...state,
        isDragging: action.isDragging,
      }
    
    case 'SET_RESIZING':
      return {
        ...state,
        isResizing: action.isResizing,
      }
    
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
  addAssetLayer: (asset: Asset) => void
  addEffectLayer: (effect: EffectDefinition) => void
  updateEffectSettings: (layerId: string, settings: Partial<EffectSettings>) => void
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
    const savedProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return Object.values(savedProjects).map((p: unknown) => {
      const project = p as Project
      return {
        id: project.id,
        name: project.name,
        updatedAt: project.updatedAt,
      }
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

  const addAssetLayer = (asset: Asset) => {
    const layer: Layer = {
      id: uuidv4(),
      name: asset.name,
      type: 'asset',
      src: asset.src,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 200 },
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: state.project?.layers.length || 0,
    }
    dispatch({ type: 'ADD_LAYER', layer })
  }

  const addEffectLayer = (effect: EffectDefinition) => {
    const layer: EffectLayer = {
      id: uuidv4(),
      name: effect.name,
      type: 'effect',
      effectType: effect.effectType,
      settings: { ...effect.defaultSettings },
      position: { x: 100, y: 100 },
      size: { ...effect.defaultSize },
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: state.project?.layers.length || 0,
    }
    dispatch({ type: 'ADD_LAYER', layer })
  }

  const updateEffectSettings = (layerId: string, settings: Partial<EffectSettings>) => {
    dispatch({ type: 'UPDATE_EFFECT_SETTINGS', layerId, settings })
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
        addAssetLayer,
        addEffectLayer,
        updateEffectSettings,
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

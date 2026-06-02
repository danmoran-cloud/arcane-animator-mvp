export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Layer {
  id: string
  name: string
  type: 'map' | 'asset'
  src: string
  position: Position
  size: Size
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  zIndex: number
}

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  thumbnail: string
  src: string
}

export type AssetCategory = 'weather' | 'fire' | 'water' | 'magic' | 'user'

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  layers: Layer[]
  gridEnabled: boolean
  gridSize: number
  canvasSize: Size
}

export interface EditorState {
  project: Project | null
  selectedLayerId: string | null
  zoom: number
  panOffset: Position
  isDragging: boolean
  isResizing: boolean
}

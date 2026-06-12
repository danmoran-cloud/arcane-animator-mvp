// Curated Effects Library - Reorganized into Core, Atmospheric, and Terrain Packs

export type EffectPack = 'core' | 'atmospheric' | 'terrain' | 'fantasy' | 'portal' | 'scifi'

export type EffectId = 
  // Core Pack (7) - Localized light sources
  | 'torch' | 'torch-2' | 'campfire' | 'lantern' | 'candles' | 'brazier' | 'magical-light'
  // Atmospheric Pack (8) - Full-area weather/environment overlays
  | 'rain' | 'snow' | 'fog' | 'mist' | 'wind' | 'lightning-storm' | 'dust-storm' | 'blizzard'
  // Terrain Pack (6) - Ground/surface effects
  | 'water-ripples' | 'waterfall' | 'lava-flow' | 'swamp-bubbles' | 'ice-crystals' | 'smoke-vents'
  // Fantasy Pack (6)
  | 'arcane-circles' | 'portals' | 'floating-runes' | 'divine-light' | 'necrotic-corruption' | 'spirit-apparitions'
  // Portal Pack (2)
  | 'blue-portal' | 'fire-portal'
  // Sci-Fi Pack (4)
  | 'holograms' | 'energy-shields' | 'data-streams' | 'reactor-core'

export type RenderMode = 'localized' | 'atmospheric' | 'terrain'

export interface EffectSettings {
  speed: number        // 0-100
  intensity: number    // 0-100
  density: number      // 0-100
  color: string        // hex color
  secondaryColor?: string
  scale: number        // 0.1-3
  direction?: number   // 0-360 degrees
  flickerRate?: number // 0-100 for light effects
  glowIntensity?: number // 0-100
}

export interface EffectDefinition {
  id: EffectId
  name: string
  pack: EffectPack
  renderMode: RenderMode  // How the effect should be rendered
  icon: string
  defaultSettings: EffectSettings
  description: string
}

export const EFFECT_PACKS: Record<EffectPack, { name: string; icon: string; color: string; description: string }> = {
  core: { 
    name: 'Core', 
    icon: 'flame', 
    color: '#f59e0b',
    description: 'Light sources and illumination'
  },
  atmospheric: { 
    name: 'Atmospheric', 
    icon: 'cloud', 
    color: '#64748b',
    description: 'Weather and environmental overlays'
  },
  terrain: { 
    name: 'Terrain', 
    icon: 'mountain', 
    color: '#22c55e',
    description: 'Ground and surface effects'
  },
  fantasy: { 
    name: 'Fantasy', 
    icon: 'sparkles', 
    color: '#8b5cf6',
    description: 'Magical and mystical effects'
  },
  portal: { 
    name: 'Portal', 
    icon: 'circle-dot', 
    color: '#22d3ee',
    description: 'Animated arcane portal gateways'
  },
  scifi: { 
    name: 'Sci-Fi', 
    icon: 'cpu', 
    color: '#06b6d4',
    description: 'Futuristic technology effects'
  },
}

export const effectsLibrary: EffectDefinition[] = [
  // ===== CORE PACK - Light Sources =====
  {
    id: 'torch',
    name: 'Torch Light',
    pack: 'core',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Warm flickering light radius',
    defaultSettings: {
      speed: 50,
      intensity: 80,
      density: 30,
      color: '#ff9500',
      secondaryColor: '#ff4d00',
      flickerRate: 70,
      glowIntensity: 60,
      scale: 1,
    },
  },
  {
    id: 'torch-2',
    name: 'Torch Flame',
    pack: 'core',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Animated sprite flame effect',
    defaultSettings: {
      speed: 50,
      intensity: 80,
      density: 30,
      color: '#ff9500',
      secondaryColor: '#ff4d00',
      flickerRate: 70,
      glowIntensity: 60,
      scale: 1,
    },
  },
  {
    id: 'campfire',
    name: 'Campfire',
    pack: 'core',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Large warm glow with spark embers',
    defaultSettings: {
      speed: 45,
      intensity: 85,
      density: 50,
      color: '#ff6b00',
      secondaryColor: '#ffcc00',
      flickerRate: 60,
      glowIntensity: 70,
      scale: 1.2,
    },
  },
  {
    id: 'lantern',
    name: 'Lantern',
    pack: 'core',
    renderMode: 'localized',
    icon: 'lightbulb',
    description: 'Steady warm glow with subtle flicker',
    defaultSettings: {
      speed: 30,
      intensity: 70,
      density: 25,
      color: '#fbbf24',
      secondaryColor: '#f59e0b',
      flickerRate: 20,
      glowIntensity: 55,
      scale: 0.8,
    },
  },
  {
    id: 'candles',
    name: 'Candles',
    pack: 'core',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Small dancing flames with soft glow',
    defaultSettings: {
      speed: 40,
      intensity: 50,
      density: 20,
      color: '#fcd34d',
      secondaryColor: '#fbbf24',
      flickerRate: 80,
      glowIntensity: 40,
      scale: 0.5,
    },
  },
  {
    id: 'brazier',
    name: 'Brazier',
    pack: 'core',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Intense fire with large light radius',
    defaultSettings: {
      speed: 55,
      intensity: 95,
      density: 60,
      color: '#ef4444',
      secondaryColor: '#f97316',
      flickerRate: 50,
      glowIntensity: 85,
      scale: 1.5,
    },
  },
  {
    id: 'magical-light',
    name: 'Magical Light',
    pack: 'core',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Cool ethereal glow with sparkles',
    defaultSettings: {
      speed: 25,
      intensity: 75,
      density: 35,
      color: '#60a5fa',
      secondaryColor: '#c084fc',
      flickerRate: 30,
      glowIntensity: 70,
      scale: 1,
    },
  },

  // ===== ATMOSPHERIC PACK - Weather & Environment =====
  {
    id: 'rain',
    name: 'Rain',
    pack: 'atmospheric',
    renderMode: 'atmospheric',
    icon: 'cloud-rain',
    description: 'Falling rain with ground ripples',
    defaultSettings: {
      speed: 70,
      intensity: 60,
      density: 50,
      color: '#a8c8e8',
      direction: 180,
      scale: 1,
    },
  },
  {
    id: 'snow',
    name: 'Snowfall',
    pack: 'atmospheric',
    renderMode: 'atmospheric',
    icon: 'snowflake',
    description: 'Gentle drifting snowflakes',
    defaultSettings: {
      speed: 30,
      intensity: 50,
      density: 40,
      color: '#ffffff',
      scale: 1,
    },
  },
  {
    id: 'fog',
    name: 'Fog',
    pack: 'atmospheric',
    renderMode: 'atmospheric',
    icon: 'cloud',
    description: 'Thick rolling fog banks',
    defaultSettings: {
      speed: 15,
      intensity: 70,
      density: 80,
      color: '#d4d4d4',
      scale: 2,
    },
  },
  {
    id: 'mist',
    name: 'Mist',
    pack: 'atmospheric',
    renderMode: 'atmospheric',
    icon: 'cloud',
    description: 'Light ethereal haze',
    defaultSettings: {
      speed: 10,
      intensity: 40,
      density: 50,
      color: '#e5e7eb',
      scale: 1.5,
    },
  },
  {
    id: 'wind',
    name: 'Wind',
    pack: 'atmospheric',
    renderMode: 'atmospheric',
    icon: 'wind',
    description: 'Visible gusts with debris',
    defaultSettings: {
      speed: 60,
      intensity: 40,
      density: 25,
      color: '#e8e8e8',
      direction: 90,
      scale: 1,
    },
  },
  {
    id: 'lightning-storm',
    name: 'Lightning Storm',
    pack: 'atmospheric',
    renderMode: 'atmospheric',
    icon: 'zap',
    description: 'Dramatic sky flashes with rain',
    defaultSettings: {
      speed: 90,
      intensity: 100,
      density: 15,
      color: '#e8e8ff',
      secondaryColor: '#a8a8ff',
      flickerRate: 95,
      scale: 1,
    },
  },
  {
    id: 'dust-storm',
    name: 'Dust Storm',
    pack: 'atmospheric',
    renderMode: 'atmospheric',
    icon: 'wind',
    description: 'Swirling sand and dust particles',
    defaultSettings: {
      speed: 75,
      intensity: 65,
      density: 70,
      color: '#d4a574',
      secondaryColor: '#a8845c',
      direction: 45,
      scale: 1.2,
    },
  },
  {
    id: 'blizzard',
    name: 'Blizzard',
    pack: 'atmospheric',
    renderMode: 'atmospheric',
    icon: 'snowflake',
    description: 'Intense snow with howling wind',
    defaultSettings: {
      speed: 85,
      intensity: 80,
      density: 75,
      color: '#ffffff',
      secondaryColor: '#e0f2fe',
      direction: 60,
      scale: 1,
    },
  },

  // ===== TERRAIN PACK - Ground & Surface =====
  {
    id: 'water-ripples',
    name: 'Water Surface',
    pack: 'terrain',
    renderMode: 'terrain',
    icon: 'droplets',
    description: 'Gentle rippling water surface',
    defaultSettings: {
      speed: 40,
      intensity: 50,
      density: 30,
      color: '#4da6ff',
      secondaryColor: '#87ceeb',
      scale: 1,
    },
  },
  {
    id: 'waterfall',
    name: 'Waterfall',
    pack: 'terrain',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Cascading water with spray mist',
    defaultSettings: {
      speed: 80,
      intensity: 70,
      density: 60,
      color: '#87ceeb',
      secondaryColor: '#ffffff',
      scale: 1,
    },
  },
  {
    id: 'lava-flow',
    name: 'Lava Flow',
    pack: 'terrain',
    renderMode: 'terrain',
    icon: 'flame',
    description: 'Molten rock with glowing cracks',
    defaultSettings: {
      speed: 20,
      intensity: 90,
      density: 70,
      color: '#ff4500',
      secondaryColor: '#ff8c00',
      glowIntensity: 85,
      scale: 1,
    },
  },
  {
    id: 'swamp-bubbles',
    name: 'Swamp Bubbles',
    pack: 'terrain',
    renderMode: 'terrain',
    icon: 'droplets',
    description: 'Murky water with rising bubbles',
    defaultSettings: {
      speed: 25,
      intensity: 45,
      density: 35,
      color: '#4a5c4a',
      secondaryColor: '#6b8e6b',
      scale: 1,
    },
  },
  {
    id: 'ice-crystals',
    name: 'Ice Crystals',
    pack: 'terrain',
    renderMode: 'terrain',
    icon: 'gem',
    description: 'Frozen surface with shimmer',
    defaultSettings: {
      speed: 15,
      intensity: 60,
      density: 40,
      color: '#b3e0ff',
      secondaryColor: '#ffffff',
      glowIntensity: 40,
      scale: 1,
    },
  },
  {
    id: 'smoke-vents',
    name: 'Smoke Vents',
    pack: 'terrain',
    renderMode: 'terrain',
    icon: 'cloud',
    description: 'Rising smoke from ground cracks',
    defaultSettings: {
      speed: 30,
      intensity: 55,
      density: 45,
      color: '#4a4a4a',
      secondaryColor: '#6b6b6b',
      scale: 1,
    },
  },

  // ===== FANTASY PACK =====
  {
    id: 'arcane-circles',
    name: 'Arcane Circle',
    pack: 'fantasy',
    renderMode: 'localized',
    icon: 'circle',
    description: 'Rotating magical sigil',
    defaultSettings: {
      speed: 30,
      intensity: 70,
      density: 40,
      color: '#8b5cf6',
      secondaryColor: '#c084fc',
      glowIntensity: 80,
      scale: 1,
    },
  },
  {
    id: 'portals',
    name: 'Portal',
    pack: 'fantasy',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Swirling dimensional gateway',
    defaultSettings: {
      speed: 50,
      intensity: 90,
      density: 50,
      color: '#06b6d4',
      secondaryColor: '#8b5cf6',
      glowIntensity: 90,
      scale: 1,
    },
  },
  {
    id: 'floating-runes',
    name: 'Floating Runes',
    pack: 'fantasy',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Ancient glowing symbols',
    defaultSettings: {
      speed: 25,
      intensity: 60,
      density: 35,
      color: '#fbbf24',
      glowIntensity: 65,
      scale: 1,
    },
  },
  {
    id: 'divine-light',
    name: 'Divine Light',
    pack: 'fantasy',
    renderMode: 'localized',
    icon: 'sun',
    description: 'Heavenly rays from above',
    defaultSettings: {
      speed: 20,
      intensity: 80,
      density: 40,
      color: '#fef08a',
      secondaryColor: '#ffffff',
      glowIntensity: 95,
      scale: 1.2,
    },
  },
  {
    id: 'necrotic-corruption',
    name: 'Necrotic Corruption',
    pack: 'fantasy',
    renderMode: 'terrain',
    icon: 'skull',
    description: 'Dark spreading corruption',
    defaultSettings: {
      speed: 30,
      intensity: 70,
      density: 55,
      color: '#4a044e',
      secondaryColor: '#84cc16',
      glowIntensity: 50,
      scale: 1,
    },
  },
  {
    id: 'spirit-apparitions',
    name: 'Spirit Apparitions',
    pack: 'fantasy',
    renderMode: 'atmospheric',
    icon: 'ghost',
    description: 'Ghostly shapes drifting by',
    defaultSettings: {
      speed: 20,
      intensity: 50,
      density: 20,
      color: '#e0f2fe',
      glowIntensity: 60,
      scale: 1,
    },
  },
  {
    id: 'blue-portal',
    name: 'Blue Portal',
    pack: 'portal',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Expanding arcane blue ring portal',
    defaultSettings: {
      speed: 50,
      intensity: 90,
      density: 50,
      color: '#22d3ee',
      secondaryColor: '#a5f3fc',
      glowIntensity: 90,
      scale: 1,
    },
  },
  {
    id: 'fire-portal',
    name: 'Fire Portal',
    pack: 'portal',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Erupting fiery portal sprite animation',
    defaultSettings: {
      speed: 50,
      intensity: 90,
      density: 50,
      color: '#ff8c1a',
      secondaryColor: '#ffcc66',
      glowIntensity: 90,
      scale: 1,
    },
  },

  // ===== SCI-FI PACK =====
  {
    id: 'holograms',
    name: 'Hologram',
    pack: 'scifi',
    renderMode: 'localized',
    icon: 'monitor',
    description: 'Flickering digital projection',
    defaultSettings: {
      speed: 60,
      intensity: 70,
      density: 45,
      color: '#06b6d4',
      flickerRate: 40,
      glowIntensity: 75,
      scale: 1,
    },
  },
  {
    id: 'energy-shields',
    name: 'Energy Shield',
    pack: 'scifi',
    renderMode: 'localized',
    icon: 'shield',
    description: 'Hexagonal force field',
    defaultSettings: {
      speed: 55,
      intensity: 75,
      density: 50,
      color: '#3b82f6',
      secondaryColor: '#60a5fa',
      glowIntensity: 80,
      scale: 1,
    },
  },
  {
    id: 'data-streams',
    name: 'Data Stream',
    pack: 'scifi',
    renderMode: 'localized',
    icon: 'binary',
    description: 'Cascading digital code',
    defaultSettings: {
      speed: 70,
      intensity: 65,
      density: 60,
      color: '#22c55e',
      scale: 1,
    },
  },
  {
    id: 'reactor-core',
    name: 'Reactor Core',
    pack: 'scifi',
    renderMode: 'localized',
    icon: 'atom',
    description: 'Pulsing energy source',
    defaultSettings: {
      speed: 45,
      intensity: 90,
      density: 40,
      color: '#f97316',
      secondaryColor: '#facc15',
      glowIntensity: 95,
      scale: 1,
    },
  },
]

// Helper functions
export function getEffectsByPack(pack: EffectPack): EffectDefinition[] {
  return effectsLibrary.filter(e => e.pack === pack)
}

export function getEffectById(id: string): EffectDefinition | undefined {
  return effectsLibrary.find(e => e.id === id)
}

export function getEffectsByRenderMode(mode: RenderMode): EffectDefinition[] {
  return effectsLibrary.filter(e => e.renderMode === mode)
}

export function getAllEffects(): EffectDefinition[] {
  return effectsLibrary
}

// Backwards compatibility exports
export type EffectCategory = EffectPack
export type UnifiedEffectSettings = EffectSettings
export type BaseEffectComponent = EffectId
export type PerformanceLevel = 'low' | 'medium' | 'high'
export type GenreTag = 'fantasy' | 'scifi' | 'natural'
export type EffectTypeTag = 'weather' | 'light' | 'magic' | 'ambient'
export type ExpandedEffectDefinition = EffectDefinition
export const categoryMeta = EFFECT_PACKS

// Curated Effects Library - 24 Premium Effects
// Organized into Core Pack, Fantasy Pack, and Sci-Fi Pack

export type EffectPack = 'core' | 'fantasy' | 'scifi'

export type EffectId = 
  // Core Pack (10)
  | 'rain' | 'snow' | 'fog' | 'torch' | 'campfire' 
  | 'water-ripples' | 'waterfall' | 'lightning' | 'smoke' | 'wind'
  // Fantasy Pack (8)
  | 'arcane-circles' | 'portals' | 'magical-crystals' | 'floating-runes'
  | 'will-o-wisps' | 'divine-light' | 'necrotic-corruption' | 'spirit-apparitions'
  // Sci-Fi Pack (6)
  | 'holograms' | 'neon-signs' | 'energy-shields' | 'data-streams'
  | 'reactor-core' | 'drone-patrols'

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
  icon: string
  defaultSettings: EffectSettings
  description: string
}

export const EFFECT_PACKS: Record<EffectPack, { name: string; icon: string; color: string }> = {
  core: { name: 'Core Pack', icon: 'cloud', color: '#64748b' },
  fantasy: { name: 'Fantasy Pack', icon: 'sparkles', color: '#8b5cf6' },
  scifi: { name: 'Sci-Fi Pack', icon: 'cpu', color: '#06b6d4' },
}

export const effectsLibrary: EffectDefinition[] = [
  // ===== CORE PACK =====
  {
    id: 'rain',
    name: 'Rain',
    pack: 'core',
    icon: 'cloud-rain',
    description: 'Variable drops with splash effects',
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
    name: 'Snow',
    pack: 'core',
    icon: 'snowflake',
    description: 'Gentle snowfall with varying flakes',
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
    pack: 'core',
    icon: 'cloud',
    description: 'Layered movement with soft edges',
    defaultSettings: {
      speed: 20,
      intensity: 60,
      density: 70,
      color: '#d4d4d4',
      scale: 1.5,
    },
  },
  {
    id: 'torch',
    name: 'Torch',
    pack: 'core',
    icon: 'flame',
    description: 'Realistic flicker with warm glow',
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
    icon: 'flame',
    description: 'Crackling fire with rising sparks',
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
    id: 'water-ripples',
    name: 'Water Ripples',
    pack: 'core',
    icon: 'droplets',
    description: 'Concentric ripples expanding outward',
    defaultSettings: {
      speed: 40,
      intensity: 50,
      density: 30,
      color: '#4da6ff',
      scale: 1,
    },
  },
  {
    id: 'waterfall',
    name: 'Waterfall',
    pack: 'core',
    icon: 'waves',
    description: 'Cascading water with mist',
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
    id: 'lightning',
    name: 'Lightning',
    pack: 'core',
    icon: 'zap',
    description: 'Dramatic flashes with branching bolts',
    defaultSettings: {
      speed: 90,
      intensity: 100,
      density: 10,
      color: '#e8e8ff',
      secondaryColor: '#a8a8ff',
      flickerRate: 95,
      scale: 1,
    },
  },
  {
    id: 'smoke',
    name: 'Smoke',
    pack: 'core',
    icon: 'cloud',
    description: 'Billowing smoke rising and dispersing',
    defaultSettings: {
      speed: 25,
      intensity: 50,
      density: 60,
      color: '#4a4a4a',
      scale: 1,
    },
  },
  {
    id: 'wind',
    name: 'Wind',
    pack: 'core',
    icon: 'wind',
    description: 'Visible gusts with debris particles',
    defaultSettings: {
      speed: 60,
      intensity: 40,
      density: 20,
      color: '#e8e8e8',
      direction: 90,
      scale: 1,
    },
  },

  // ===== FANTASY PACK =====
  {
    id: 'arcane-circles',
    name: 'Arcane Circles',
    pack: 'fantasy',
    icon: 'circle',
    description: 'Rotating sigils with glowing runes',
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
    name: 'Portals',
    pack: 'fantasy',
    icon: 'circle-dot',
    description: 'Swirling energy with layered glow',
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
    id: 'magical-crystals',
    name: 'Magical Crystals',
    pack: 'fantasy',
    icon: 'gem',
    description: 'Pulsing crystals with inner light',
    defaultSettings: {
      speed: 40,
      intensity: 75,
      density: 30,
      color: '#22d3ee',
      secondaryColor: '#f0abfc',
      glowIntensity: 70,
      scale: 1,
    },
  },
  {
    id: 'floating-runes',
    name: 'Floating Runes',
    pack: 'fantasy',
    icon: 'sparkles',
    description: 'Ancient symbols with magical trails',
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
    id: 'will-o-wisps',
    name: 'Will-o-Wisps',
    pack: 'fantasy',
    icon: 'sparkle',
    description: 'Ethereal floating lights',
    defaultSettings: {
      speed: 35,
      intensity: 65,
      density: 25,
      color: '#34d399',
      secondaryColor: '#a78bfa',
      glowIntensity: 85,
      scale: 1,
    },
  },
  {
    id: 'divine-light',
    name: 'Divine Light',
    pack: 'fantasy',
    icon: 'sun',
    description: 'Heavenly rays with golden particles',
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
    icon: 'skull',
    description: 'Dark tendrils with sickly glow',
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
    icon: 'ghost',
    description: 'Translucent spirits fading in and out',
    defaultSettings: {
      speed: 20,
      intensity: 50,
      density: 20,
      color: '#e0f2fe',
      glowIntensity: 60,
      scale: 1,
    },
  },

  // ===== SCI-FI PACK =====
  {
    id: 'holograms',
    name: 'Holograms',
    pack: 'scifi',
    icon: 'monitor',
    description: 'Flickering projections with scanlines',
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
    id: 'neon-signs',
    name: 'Neon Signs',
    pack: 'scifi',
    icon: 'lightbulb',
    description: 'Buzzing neon with occasional flicker',
    defaultSettings: {
      speed: 50,
      intensity: 85,
      density: 30,
      color: '#f472b6',
      secondaryColor: '#06b6d4',
      flickerRate: 20,
      glowIntensity: 90,
      scale: 1,
    },
  },
  {
    id: 'energy-shields',
    name: 'Energy Shields',
    pack: 'scifi',
    icon: 'shield',
    description: 'Hexagonal force fields with ripples',
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
    name: 'Data Streams',
    pack: 'scifi',
    icon: 'binary',
    description: 'Cascading digital characters',
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
    icon: 'atom',
    description: 'Pulsing energy with orbiting particles',
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
  {
    id: 'drone-patrols',
    name: 'Drone Patrols',
    pack: 'scifi',
    icon: 'plane',
    description: 'Small drones with search lights',
    defaultSettings: {
      speed: 40,
      intensity: 55,
      density: 15,
      color: '#94a3b8',
      secondaryColor: '#fef08a',
      glowIntensity: 50,
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

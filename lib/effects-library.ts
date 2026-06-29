// Curated Effects Library - Reorganized into Core, Atmospheric, and Terrain Packs

export type EffectPack = 'core' | 'atmospheric' | 'terrain' | 'fantasy' | 'scifi' | 'launch' | 'caustics' | 'cemetery' | 'subterranean' | 'lightsource' | 'lightsource-revised' | 'new' | 'particles' | 'vector'

export type EffectId = 
  // Core Pack (7) - Localized light sources
  | 'torch' | 'torch-2' | 'campfire' | 'lantern' | 'candles' | 'brazier' | 'magical-light'
  // Atmospheric Pack - Full-area weather/environment overlays
  // (rain, snow, fog, mist, dust-storm, blizzard removed — superseded by the Particle pack)
  | 'wind' | 'lightning-storm'
  // Terrain Pack - Ground/surface effects
  // (swamp-bubbles, smoke-vents removed — superseded by particle-bubbles / particle-smoke)
  | 'water-ripples' | 'waterfall' | 'lava-flow' | 'ice-crystals'
  // Fantasy Pack (6)
  | 'arcane-circles' | 'portals' | 'floating-runes' | 'divine-light' | 'necrotic-corruption' | 'spirit-apparitions'
  // Portal gateways (now in the New pack). Magic-circle sprites retired — see the Vector pack.
  | 'blue-portal' | 'fire-portal'
  // Sci-Fi Pack (4)
  | 'holograms' | 'energy-shields' | 'data-streams' | 'reactor-core'
  // Launch Effects Pack (10) - sprite-sheet animations (rain/fog/fireflies/floating-dust/smoke-wisps → Particle pack)
  | 'launch-torch-light' | 'launch-lantern-glow' | 'launch-campfire' | 'launch-running-water' | 'launch-arcane-runes'
  | 'launch-portal' | 'launch-lightning' | 'launch-divine-light' | 'launch-necrotic-corruption' | 'launch-ghost-apparition'
  // Caustics Pack (15) - underwater light sprite-sheet animations
  | 'caustics-shallow-clear' | 'caustics-deep-blue' | 'caustics-tropical-shallow' | 'caustics-soft-sand' | 'caustics-rocky-bottom'
  | 'caustics-fast-moving' | 'caustics-slow-gentle' | 'caustics-blue-green' | 'caustics-sunlit-deep' | 'caustics-murky-water'
  | 'caustics-cave-water' | 'caustics-kelp-forest' | 'caustics-rippling-sand' | 'caustics-wavy-surface' | 'caustics-magic-glow'
  // Rain Effects Pack removed — superseded by particle-rain
  // Cemetery Effects Pack (13) - spooky sprite-sheet animations (graveyard-fog/ethereal-mist-swirl → Particle pack)
  | 'cemetery-will-o-wisps' | 'cemetery-soul-spirits' | 'cemetery-necrotic-aura' | 'cemetery-blood-petals'
  | 'cemetery-haunted-lantern' | 'cemetery-cracked-stone-rise' | 'cemetery-skeletal-remains' | 'cemetery-dark-ritual-circle' | 'cemetery-coffin-burst'
  | 'cemetery-moonbeam-trees' | 'cemetery-draining-life-vortex' | 'cemetery-candle-flame' | 'cemetery-bats-in-flight'
  // Subterranean Effects Pack (10) - cave sprite-sheet animations (cave-mist/crystal-sparkles/dustfall/steam-vent/cave-fireflies → Particle pack)
  | 'subterranean-cave-drips' | 'subterranean-stalactite-seep' | 'subterranean-underground-stream'
  | 'subterranean-crystal-pulse' | 'subterranean-bioluminescent-spores' | 'subterranean-glowing-mushroom-aura' | 'subterranean-bat-swarm'
  | 'subterranean-pebble-collapse' | 'subterranean-arcane-cave-energy' | 'subterranean-ambient'
  // Light Source Effects Pack (15) - illumination sprite-sheet animations
  | 'lightsource-wall-torch' | 'lightsource-ornate-lantern' | 'lightsource-iron-lantern' | 'lightsource-hanging-lantern' | 'lightsource-carriage-lantern'
  | 'lightsource-campfire' | 'lightsource-sparkler-burst' | 'lightsource-candle' | 'lightsource-glowing-orb' | 'lightsource-fire-brazier'
  | 'lightsource-rune-light-circle' | 'lightsource-pendant-light' | 'lightsource-radiant-starburst' | 'lightsource-soft-star-glow' | 'lightsource-sparkle-starburst'
  // Light Source Revised Effects Pack (15) - sprite sheets sliced from source grid
  | 'lsr-torch' | 'lsr-fire-glow' | 'lsr-fire-bowl' | 'lsr-carriage-lantern' | 'lsr-hanging-lantern'
  | 'lsr-candle' | 'lsr-glowing-orb' | 'lsr-campfire' | 'lsr-sparkles' | 'lsr-fire-brazier'
  | 'lsr-blue-flame' | 'lsr-green-flame' | 'lsr-starburst' | 'lsr-arcane-circle' | 'lsr-smoke'
  // NEW EFFECTS PACK — auto-generated, do not edit this line
  | 'new-fire-torch'
  // PARTICLE EFFECTS PACK (procedural, GPU-ready) — Phase 3
  | 'particle-rain' | 'particle-snow' | 'particle-embers' | 'particle-fog' | 'particle-fireflies'
  | 'particle-dust' | 'particle-smoke' | 'particle-bubbles' | 'particle-sparkles'
  | 'particle-rain-top' | 'particle-snow-top' | 'particle-leaves-top' | 'particle-embers-top'
  | 'particle-water-flow' | 'particle-caustics'
  // VECTOR EFFECTS PACK (procedural magic circles + portals) — Phase 4
  | 'vector-pentagram' | 'vector-hexagram' | 'vector-heptagram' | 'vector-arcane-circle' | 'vector-rune-circle'
  | 'vector-portal' | 'vector-fire-portal'
  | 'camp-fire'
  | 'lava-bubbles'
  | 'lava-burst'
  | 'lava-cracks'
  | 'lava-current'
  | 'lava-slow'
  | 'lava-whirlpool'
  | 'lava-splashes'
  | 'lava-vents'
  // NEW_EFFECT_IDS

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
  scifi: {
    name: 'Sci-Fi', 
    icon: 'cpu', 
    color: '#06b6d4',
    description: 'Futuristic technology effects'
  },
  launch: { 
    name: 'Launch Effects', 
    icon: 'rocket', 
    color: '#10b981',
    description: 'Premium animated sprite effects'
  },
  caustics: { 
    name: 'Water Effects', 
    icon: 'waves', 
    color: '#38bdf8',
    description: 'Underwater light caustics'
  },
  cemetery: {
    name: 'Cemetery Effects', 
    icon: 'skull', 
    color: '#22c55e',
    description: 'Spooky graveyard sprite effects'
  },
  subterranean: { 
    name: 'Subterranean Effects', 
    icon: 'gem', 
    color: '#22d3ee',
    description: 'Cave and underground sprite effects'
  },
  lightsource: { 
    name: 'Light Source Effects', 
    icon: 'lamp', 
    color: '#fbbf24',
    description: 'Torches, lanterns, and glowing light sprites'
  },
  'lightsource-revised': {
    name: 'Light Source Revised Effects',
    icon: 'lamp',
    color: '#f97316',
    description: 'Revised torches, lanterns, flames, and glowing light sprites'
  },
  new: {
    name: 'Sprite Effects',
    icon: 'plus',
    color: '#6366f1',
    description: 'Sprite-sheet portals and torch effects'
  },
  particles: {
    name: 'Particle Effects',
    icon: 'sparkles',
    color: '#38bdf8',
    description: 'Procedural GPU-ready particles with live controls'
  },
  vector: {
    name: 'Magic Circles & Portals',
    icon: 'circle-dot',
    color: '#c084fc',
    description: 'Procedural vector magic circles and portals — crisp, recolorable, looping'
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
  // rain / snow / fog / mist removed — superseded by the procedural Particle pack.
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
  // dust-storm / blizzard removed — superseded by particle-dust / particle-snow.

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
  // smoke-vents removed — superseded by particle-smoke.

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
    pack: 'new',
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
    pack: 'new',
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

  // ===== LAUNCH EFFECTS PACK - sprite-sheet animations (5x6, 30 frames) =====
  {
    id: 'launch-torch-light',
    name: 'Torch Light',
    pack: 'launch',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering torch flame',
    defaultSettings: { speed: 50, intensity: 90, density: 50, color: '#ffae42', secondaryColor: '#ff6a00', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'launch-lantern-glow',
    name: 'Lantern Glow',
    pack: 'launch',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Warm hanging lantern light',
    defaultSettings: { speed: 40, intensity: 80, density: 50, color: '#ffd166', secondaryColor: '#f59e0b', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'launch-campfire',
    name: 'Campfire',
    pack: 'launch',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Crackling campfire blaze',
    defaultSettings: { speed: 55, intensity: 95, density: 60, color: '#ff7a1a', secondaryColor: '#ffcc00', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'launch-running-water',
    name: 'Running Water',
    pack: 'launch',
    renderMode: 'localized',
    icon: 'droplets',
    description: 'Splashing flowing water',
    defaultSettings: { speed: 60, intensity: 80, density: 60, color: '#7dd3fc', secondaryColor: '#bae6fd', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'launch-arcane-runes',
    name: 'Arcane Runes',
    pack: 'launch',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Glowing magic rune circles',
    defaultSettings: { speed: 40, intensity: 85, density: 50, color: '#c084fc', secondaryColor: '#e9d5ff', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'launch-portal',
    name: 'Portal',
    pack: 'launch',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Swirling magic portal rings',
    defaultSettings: { speed: 50, intensity: 90, density: 50, color: '#a855f7', secondaryColor: '#d8b4fe', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'launch-lightning',
    name: 'Lightning',
    pack: 'launch',
    renderMode: 'localized',
    icon: 'zap',
    description: 'Crackling lightning bolts',
    defaultSettings: { speed: 80, intensity: 95, density: 50, color: '#bae6fd', secondaryColor: '#60a5fa', glowIntensity: 95, scale: 1 },
  },
  {
    id: 'launch-divine-light',
    name: 'Divine Light',
    pack: 'launch',
    renderMode: 'localized',
    icon: 'sun',
    description: 'Radiant beams of holy light',
    defaultSettings: { speed: 40, intensity: 90, density: 50, color: '#fde68a', secondaryColor: '#fef9c3', glowIntensity: 95, scale: 1 },
  },
  {
    id: 'launch-necrotic-corruption',
    name: 'Necrotic Corruption',
    pack: 'launch',
    renderMode: 'localized',
    icon: 'skull',
    description: 'Spreading necrotic energy',
    defaultSettings: { speed: 45, intensity: 85, density: 60, color: '#84cc16', secondaryColor: '#bef264', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'launch-ghost-apparition',
    name: 'Ghost Apparition',
    pack: 'launch',
    renderMode: 'localized',
    icon: 'ghost',
    description: 'Spectral ghostly figures',
    defaultSettings: { speed: 35, intensity: 70, density: 40, color: '#a5f3fc', secondaryColor: '#cffafe', glowIntensity: 80, scale: 1 },
  },

  // ===== CAUSTICS PACK - underwater light sprite sheets (5x5, 25 frames) =====
  {
    id: 'caustics-shallow-clear',
    name: 'Shallow Clear Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Crisp light ripples in shallow clear water',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#7dd3fc', secondaryColor: '#e0f2fe', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'caustics-deep-blue',
    name: 'Deep Blue Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Cool caustics in deep blue water',
    defaultSettings: { speed: 40, intensity: 75, density: 55, color: '#3b82f6', secondaryColor: '#93c5fd', glowIntensity: 65, scale: 1 },
  },
  {
    id: 'caustics-tropical-shallow',
    name: 'Tropical Shallow Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Bright turquoise tropical caustics',
    defaultSettings: { speed: 55, intensity: 85, density: 50, color: '#2dd4bf', secondaryColor: '#a7f3d0', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'caustics-soft-sand',
    name: 'Soft Sand Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Soft diffuse caustics over sand',
    defaultSettings: { speed: 45, intensity: 70, density: 50, color: '#bae6fd', secondaryColor: '#f0f9ff', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'caustics-rocky-bottom',
    name: 'Rocky Bottom Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Caustics scattered over rocky bottom',
    defaultSettings: { speed: 48, intensity: 78, density: 55, color: '#67e8f9', secondaryColor: '#cffafe', glowIntensity: 65, scale: 1 },
  },
  {
    id: 'caustics-fast-moving',
    name: 'Fast Moving Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Rapidly shifting light patterns',
    defaultSettings: { speed: 80, intensity: 88, density: 50, color: '#22d3ee', secondaryColor: '#ecfeff', glowIntensity: 75, scale: 1 },
  },
  {
    id: 'caustics-slow-gentle',
    name: 'Slow Gentle Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Slow, calming light ripples',
    defaultSettings: { speed: 25, intensity: 65, density: 45, color: '#5eead4', secondaryColor: '#ccfbf1', glowIntensity: 55, scale: 1 },
  },
  {
    id: 'caustics-blue-green',
    name: 'Blue Green Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Blended blue-green water caustics',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#14b8a6', secondaryColor: '#99f6e4', glowIntensity: 68, scale: 1 },
  },
  {
    id: 'caustics-sunlit-deep',
    name: 'Sunlit Deep Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Sun rays piercing deep water',
    defaultSettings: { speed: 42, intensity: 82, density: 55, color: '#60a5fa', secondaryColor: '#dbeafe', glowIntensity: 72, scale: 1 },
  },
  {
    id: 'caustics-murky-water',
    name: 'Murky Water Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Hazy caustics in murky green water',
    defaultSettings: { speed: 38, intensity: 60, density: 60, color: '#84cc16', secondaryColor: '#d9f99d', glowIntensity: 50, scale: 1 },
  },
  {
    id: 'caustics-cave-water',
    name: 'Cave Water Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Stark caustics in dark cave water',
    defaultSettings: { speed: 35, intensity: 85, density: 45, color: '#bfdbfe', secondaryColor: '#ffffff', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'caustics-kelp-forest',
    name: 'Kelp Forest Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Green-tinted caustics through kelp',
    defaultSettings: { speed: 40, intensity: 72, density: 55, color: '#4ade80', secondaryColor: '#bbf7d0', glowIntensity: 58, scale: 1 },
  },
  {
    id: 'caustics-rippling-sand',
    name: 'Rippling Sand Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Radiating caustics over rippled sand',
    defaultSettings: { speed: 52, intensity: 84, density: 50, color: '#a5f3fc', secondaryColor: '#ffffff', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'caustics-wavy-surface',
    name: 'Wavy Surface Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Caustics from a wavy water surface',
    defaultSettings: { speed: 58, intensity: 80, density: 52, color: '#38bdf8', secondaryColor: '#e0f2fe', glowIntensity: 68, scale: 1 },
  },
  {
    id: 'caustics-magic-glow',
    name: 'Magic Glow Caustics',
    pack: 'caustics',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Glowing magical caustic light',
    defaultSettings: { speed: 50, intensity: 90, density: 50, color: '#22d3ee', secondaryColor: '#cffafe', glowIntensity: 85, scale: 1 },
  },

  // ===== RAIN EFFECTS PACK - rain sprite sheets (8x3, 24 frames) =====

  // ===== CEMETERY EFFECTS PACK - spooky sprite sheets (5x6, 30 frames) =====
  {
    id: 'cemetery-will-o-wisps',
    name: "Ghostly Will-o'-Wisps",
    pack: 'cemetery',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering spirit fire orbs',
    defaultSettings: { speed: 45, intensity: 85, density: 40, color: '#2dd4bf', secondaryColor: '#99f6e4', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'cemetery-soul-spirits',
    name: 'Soul Spirits',
    pack: 'cemetery',
    renderMode: 'localized',
    icon: 'ghost',
    description: 'Drifting ghostly soul figures',
    defaultSettings: { speed: 35, intensity: 75, density: 40, color: '#5eead4', secondaryColor: '#ccfbf1', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'cemetery-necrotic-aura',
    name: 'Necrotic Aura',
    pack: 'cemetery',
    renderMode: 'localized',
    icon: 'skull',
    description: 'Swirling dark decaying energy',
    defaultSettings: { speed: 45, intensity: 85, density: 60, color: '#7e22ce', secondaryColor: '#a855f7', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'cemetery-blood-petals',
    name: 'Blood Petals',
    pack: 'cemetery',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Scattering crimson petals',
    defaultSettings: { speed: 40, intensity: 70, density: 50, color: '#dc2626', secondaryColor: '#ef4444', glowIntensity: 40, scale: 1 },
  },
  {
    id: 'cemetery-haunted-lantern',
    name: 'Haunted Lantern Light',
    pack: 'cemetery',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Eerie green lantern flame',
    defaultSettings: { speed: 40, intensity: 80, density: 40, color: '#4ade80', secondaryColor: '#bbf7d0', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'cemetery-cracked-stone-rise',
    name: 'Cracked Stone Rise',
    pack: 'cemetery',
    renderMode: 'terrain',
    icon: 'mountain',
    description: 'Tombstone rising from the ground',
    defaultSettings: { speed: 40, intensity: 70, density: 50, color: '#94a3b8', secondaryColor: '#cbd5e1', glowIntensity: 20, scale: 1 },
  },
  {
    id: 'cemetery-skeletal-remains',
    name: 'Skeletal Remains Shift',
    pack: 'cemetery',
    renderMode: 'terrain',
    icon: 'skull',
    description: 'Bones clattering and assembling',
    defaultSettings: { speed: 45, intensity: 70, density: 50, color: '#e7e5e4', secondaryColor: '#d6d3d1', glowIntensity: 20, scale: 1 },
  },
  {
    id: 'cemetery-dark-ritual-circle',
    name: 'Dark Ritual Circle',
    pack: 'cemetery',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Glowing red occult summoning circle',
    defaultSettings: { speed: 35, intensity: 90, density: 50, color: '#ef4444', secondaryColor: '#fca5a5', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'cemetery-coffin-burst',
    name: 'Coffin Burst',
    pack: 'cemetery',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Coffin bursting open with debris',
    defaultSettings: { speed: 55, intensity: 85, density: 55, color: '#a16207', secondaryColor: '#facc15', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'cemetery-moonbeam-trees',
    name: 'Moonbeam Through Trees',
    pack: 'cemetery',
    renderMode: 'localized',
    icon: 'sun',
    description: 'Pale volumetric moonlight rays',
    defaultSettings: { speed: 25, intensity: 70, density: 40, color: '#bfdbfe', secondaryColor: '#eff6ff', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'cemetery-draining-life-vortex',
    name: 'Draining Life Vortex',
    pack: 'cemetery',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Swirling green life-drain vortex',
    defaultSettings: { speed: 55, intensity: 90, density: 55, color: '#84cc16', secondaryColor: '#bef264', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'cemetery-candle-flame',
    name: 'Candle Flame Flicker',
    pack: 'cemetery',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering candle flames',
    defaultSettings: { speed: 45, intensity: 75, density: 40, color: '#fcd34d', secondaryColor: '#fbbf24', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'cemetery-bats-in-flight',
    name: 'Bats in Flight',
    pack: 'cemetery',
    renderMode: 'atmospheric',
    icon: 'ghost',
    description: 'Silhouetted bats flying past',
    defaultSettings: { speed: 60, intensity: 80, density: 50, color: '#1e293b', secondaryColor: '#475569', glowIntensity: 10, scale: 1 },
  },

  // ===== SUBTERRANEAN EFFECTS PACK - cave sprite sheets (5x6, 30 frames) =====
  {
    id: 'subterranean-cave-drips',
    name: 'Cave Drips',
    pack: 'subterranean',
    renderMode: 'localized',
    icon: 'droplets',
    description: 'Dripping water with ripple splashes',
    defaultSettings: { speed: 40, intensity: 75, density: 40, color: '#bae6fd', secondaryColor: '#e0f2fe', glowIntensity: 40, scale: 1 },
  },
  {
    id: 'subterranean-stalactite-seep',
    name: 'Stalactite Seep',
    pack: 'subterranean',
    renderMode: 'localized',
    icon: 'droplets',
    description: 'Water seeping down stalactites',
    defaultSettings: { speed: 30, intensity: 65, density: 40, color: '#a5f3fc', secondaryColor: '#cffafe', glowIntensity: 35, scale: 1 },
  },
  {
    id: 'subterranean-underground-stream',
    name: 'Underground Stream',
    pack: 'subterranean',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Flowing subterranean water',
    defaultSettings: { speed: 55, intensity: 75, density: 55, color: '#7dd3fc', secondaryColor: '#bae6fd', glowIntensity: 45, scale: 1 },
  },
  {
    id: 'subterranean-crystal-pulse',
    name: 'Crystal Pulse',
    pack: 'subterranean',
    renderMode: 'localized',
    icon: 'gem',
    description: 'Pulsing glowing crystal',
    defaultSettings: { speed: 40, intensity: 90, density: 45, color: '#c084fc', secondaryColor: '#e9d5ff', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'subterranean-bioluminescent-spores',
    name: 'Bioluminescent Spores',
    pack: 'subterranean',
    renderMode: 'atmospheric',
    icon: 'sparkle',
    description: 'Floating glowing spores',
    defaultSettings: { speed: 30, intensity: 75, density: 50, color: '#2dd4bf', secondaryColor: '#99f6e4', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'subterranean-glowing-mushroom-aura',
    name: 'Glowing Mushroom Aura',
    pack: 'subterranean',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Pulsing cave mushroom glow',
    defaultSettings: { speed: 35, intensity: 80, density: 45, color: '#22d3ee', secondaryColor: '#a5f3fc', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'subterranean-bat-swarm',
    name: 'Bat Swarm Silhouettes',
    pack: 'subterranean',
    renderMode: 'atmospheric',
    icon: 'ghost',
    description: 'Swarming bat silhouettes',
    defaultSettings: { speed: 65, intensity: 80, density: 55, color: '#1e293b', secondaryColor: '#475569', glowIntensity: 10, scale: 1 },
  },
  {
    id: 'subterranean-pebble-collapse',
    name: 'Pebble Collapse',
    pack: 'subterranean',
    renderMode: 'terrain',
    icon: 'mountain',
    description: 'Tumbling falling pebbles',
    defaultSettings: { speed: 55, intensity: 70, density: 50, color: '#a8a29e', secondaryColor: '#d6d3d1', glowIntensity: 15, scale: 1 },
  },
  {
    id: 'subterranean-arcane-cave-energy',
    name: 'Arcane Cave Energy',
    pack: 'subterranean',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Crackling arcane energy arcs',
    defaultSettings: { speed: 55, intensity: 90, density: 50, color: '#a855f7', secondaryColor: '#d8b4fe', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'subterranean-ambient',
    name: 'Subterranean Ambient',
    pack: 'subterranean',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Mixed ambient cave particles',
    defaultSettings: { speed: 30, intensity: 65, density: 55, color: '#93c5fd', secondaryColor: '#fde68a', glowIntensity: 60, scale: 1 },
  },

  // ===== MAGIC EFFECTS PACK - magic-circle sprite sheets (5x5, 25 frames) =====

  // ===== LIGHT SOURCE EFFECTS PACK - illumination sprite sheets (5x6, 30 frames) =====
  {
    id: 'lightsource-wall-torch',
    name: 'Wall Torch',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering wall-mounted torch',
    defaultSettings: { speed: 50, intensity: 85, density: 40, color: '#f59e0b', secondaryColor: '#fbbf24', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-ornate-lantern',
    name: 'Ornate Lantern',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Decorative glowing lantern',
    defaultSettings: { speed: 40, intensity: 80, density: 40, color: '#f59e0b', secondaryColor: '#fcd34d', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'lightsource-iron-lantern',
    name: 'Iron Lantern',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Simple iron-framed lantern',
    defaultSettings: { speed: 40, intensity: 75, density: 40, color: '#f59e0b', secondaryColor: '#fcd34d', glowIntensity: 75, scale: 1 },
  },
  {
    id: 'lightsource-hanging-lantern',
    name: 'Hanging Lantern',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Swaying suspended lantern',
    defaultSettings: { speed: 40, intensity: 80, density: 40, color: '#f59e0b', secondaryColor: '#fcd34d', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'lightsource-carriage-lantern',
    name: 'Carriage Lantern',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Tall bright carriage lantern',
    defaultSettings: { speed: 45, intensity: 85, density: 40, color: '#f59e0b', secondaryColor: '#fcd34d', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-campfire',
    name: 'Campfire',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Crackling log campfire',
    defaultSettings: { speed: 55, intensity: 88, density: 50, color: '#f97316', secondaryColor: '#fbbf24', glowIntensity: 88, scale: 1 },
  },
  {
    id: 'lightsource-sparkler-burst',
    name: 'Sparkler Burst',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Radiating spark burst',
    defaultSettings: { speed: 60, intensity: 85, density: 55, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-candle',
    name: 'Candle',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Single flickering candle',
    defaultSettings: { speed: 45, intensity: 70, density: 35, color: '#f59e0b', secondaryColor: '#fef08a', glowIntensity: 75, scale: 1 },
  },
  {
    id: 'lightsource-glowing-orb',
    name: 'Glowing Orb',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'sparkle',
    description: 'Pulsing orb of warm light',
    defaultSettings: { speed: 35, intensity: 85, density: 40, color: '#facc15', secondaryColor: '#fde68a', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'lightsource-fire-brazier',
    name: 'Fire Brazier',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flaming metal fire bowl',
    defaultSettings: { speed: 55, intensity: 88, density: 50, color: '#f97316', secondaryColor: '#fca5a5', glowIntensity: 88, scale: 1 },
  },
  {
    id: 'lightsource-rune-light-circle',
    name: 'Rune Light Circle',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Glowing runic light ring',
    defaultSettings: { speed: 40, intensity: 82, density: 40, color: '#fde047', secondaryColor: '#fef08a', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-pendant-light',
    name: 'Pendant Light',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Hanging swaying light orb',
    defaultSettings: { speed: 40, intensity: 82, density: 40, color: '#facc15', secondaryColor: '#fde68a', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-radiant-starburst',
    name: 'Radiant Starburst',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Bright twinkling star burst',
    defaultSettings: { speed: 45, intensity: 88, density: 45, color: '#fde047', secondaryColor: '#fffbeb', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'lightsource-soft-star-glow',
    name: 'Soft Star Glow',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'sparkle',
    description: 'Diffuse soft glowing star',
    defaultSettings: { speed: 35, intensity: 75, density: 40, color: '#fde68a', secondaryColor: '#fef9c3', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-sparkle-starburst',
    name: 'Sparkle Starburst',
    pack: 'lightsource',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Glittering sparkle star burst',
    defaultSettings: { speed: 50, intensity: 85, density: 50, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 88, scale: 1 },
  },
  // ----- Light Source Revised Effects Pack (15) -----
  {
    id: 'lsr-torch',
    name: 'Torch',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering wall torch flame',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#f97316', secondaryColor: '#fbbf24', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'lsr-fire-glow',
    name: 'Fire Glow',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Soft glowing fire light',
    defaultSettings: { speed: 45, intensity: 78, density: 50, color: '#fb923c', secondaryColor: '#fde68a', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lsr-fire-bowl',
    name: 'Fire Bowl',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Burning fire bowl',
    defaultSettings: { speed: 48, intensity: 82, density: 50, color: '#f97316', secondaryColor: '#fbbf24', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'lsr-carriage-lantern',
    name: 'Carriage Lantern',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Ornate carriage lantern light',
    defaultSettings: { speed: 35, intensity: 70, density: 40, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 78, scale: 1 },
  },
  {
    id: 'lsr-hanging-lantern',
    name: 'Hanging Lantern',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Glowing hanging lantern',
    defaultSettings: { speed: 35, intensity: 70, density: 40, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 78, scale: 1 },
  },
  {
    id: 'lsr-candle',
    name: 'Candle',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering candle flame',
    defaultSettings: { speed: 40, intensity: 65, density: 40, color: '#fde68a', secondaryColor: '#fef9c3', glowIntensity: 72, scale: 1 },
  },
  {
    id: 'lsr-glowing-orb',
    name: 'Glowing Orb',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Pulsing glowing orb of light',
    defaultSettings: { speed: 40, intensity: 80, density: 50, color: '#fbbf24', secondaryColor: '#fef3c7', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'lsr-campfire',
    name: 'Campfire',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Crackling campfire',
    defaultSettings: { speed: 50, intensity: 85, density: 55, color: '#f97316', secondaryColor: '#fbbf24', glowIntensity: 82, scale: 1 },
  },
  {
    id: 'lsr-sparkles',
    name: 'Sparkles',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Drifting ember sparkles',
    defaultSettings: { speed: 55, intensity: 75, density: 60, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'lsr-fire-brazier',
    name: 'Fire Brazier',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Blazing fire brazier',
    defaultSettings: { speed: 50, intensity: 85, density: 55, color: '#f97316', secondaryColor: '#fbbf24', glowIntensity: 82, scale: 1 },
  },
  {
    id: 'lsr-blue-flame',
    name: 'Blue Flame',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Ethereal blue flame',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#38bdf8', secondaryColor: '#bae6fd', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lsr-green-flame',
    name: 'Green Flame',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Eerie green flame',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#4ade80', secondaryColor: '#bbf7d0', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lsr-starburst',
    name: 'Starburst',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Radiant twinkling starburst',
    defaultSettings: { speed: 50, intensity: 88, density: 50, color: '#fde68a', secondaryColor: '#fef9c3', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'lsr-arcane-circle',
    name: 'Arcane Circle',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Rotating arcane rune circle',
    defaultSettings: { speed: 40, intensity: 80, density: 50, color: '#a855f7', secondaryColor: '#d8b4fe', glowIntensity: 88, scale: 1 },
  },
  {
    id: 'lsr-smoke',
    name: 'Smoke',
    pack: 'lightsource-revised',
    renderMode: 'localized',
    icon: 'cloud',
    description: 'Rising plume of smoke',
    defaultSettings: { speed: 35, intensity: 60, density: 50, color: '#9ca3af', secondaryColor: '#d1d5db', glowIntensity: 30, scale: 1 },
  },
  {
    id: 'new-fire-torch',
    name: 'Fire Torch',
    pack: 'new',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Fire Torch sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff6600', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'camp-fire',
    name: 'Camp Fire',
    pack: 'new',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Camp Fire sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff9500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-bubbles',
    name: 'Lava Bubbles',
    pack: 'new',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Bubbles sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-burst',
    name: 'Lava Burst',
    pack: 'new',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Burst sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-cracks',
    name: 'Lava Cracks',
    pack: 'new',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Cracks sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-current',
    name: 'Lava Current',
    pack: 'new',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Current sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-slow',
    name: 'Molten Flow',
    pack: 'new',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Slow molten lava flow sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-whirlpool',
    name: 'Lava Whirlpool',
    pack: 'new',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Whirlpool sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-splashes',
    name: 'Lava Splashes',
    pack: 'new',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Splashes sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-vents',
    name: 'Lava Vents',
    pack: 'new',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Vents sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  // NEW_EFFECT_DEFS

  // ===== PARTICLE EFFECTS PACK (procedural) =====
  {
    id: 'particle-rain',
    name: 'Rain (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'cloud-rain',
    description: 'Procedural rain — density, direction, speed and color are live',
    defaultSettings: { speed: 60, intensity: 70, density: 55, color: '#dbeafe', direction: 180, scale: 1 },
  },
  {
    id: 'particle-rain-top',
    name: 'Rain — Top-Down (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'cloud-rain',
    description: 'Aerial rain seen from above — drops land as expanding ripples',
    defaultSettings: { speed: 60, intensity: 75, density: 55, color: '#bfdbfe', scale: 1 },
  },
  {
    id: 'particle-snow-top',
    name: 'Snow — Top-Down (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'snowflake',
    description: 'Aerial snow seen from above — flakes drift across the map on the wind',
    defaultSettings: { speed: 30, intensity: 75, density: 50, color: '#ffffff', direction: 180, scale: 1 },
  },
  {
    id: 'particle-leaves-top',
    name: 'Leaves — Top-Down (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'leaf',
    description: 'Aerial autumn leaves blowing across the ground, tumbling as they go',
    defaultSettings: { speed: 40, intensity: 80, density: 45, color: '#c2410c', direction: 180, scale: 1 },
  },
  {
    id: 'particle-embers-top',
    name: 'Embers — Top-Down (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Aerial embers scattered on the wind — flickering sparks over the ground',
    defaultSettings: { speed: 45, intensity: 85, density: 50, color: '#ff7a1a', direction: 180, glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-snow',
    name: 'Snow (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'snowflake',
    description: 'Procedural snow — drifting flakes with live density, wind and speed',
    defaultSettings: { speed: 30, intensity: 75, density: 45, color: '#ffffff', direction: 180, scale: 1 },
  },
  {
    id: 'particle-embers',
    name: 'Embers (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Procedural rising sparks — glowing, flickering, additive',
    defaultSettings: { speed: 45, intensity: 85, density: 50, color: '#ff7a1a', secondaryColor: '#ffcc00', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-fog',
    name: 'Fog (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'cloud',
    description: 'Procedural drifting fog — soft volumetric blobs, live drift and density',
    defaultSettings: { speed: 20, intensity: 60, density: 50, color: '#cbd5e1', direction: 90, scale: 1 },
  },
  {
    id: 'particle-fireflies',
    name: 'Fireflies (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Procedural fireflies — wandering glow dots that pulse, additive',
    defaultSettings: { speed: 40, intensity: 85, density: 40, color: '#fde047', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-dust',
    name: 'Dust Motes (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'sparkle',
    description: 'Procedural floating dust — drifting, twinkling motes',
    defaultSettings: { speed: 30, intensity: 60, density: 50, color: '#fde68a', scale: 1 },
  },
  {
    id: 'particle-smoke',
    name: 'Smoke (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'cloud',
    description: 'Procedural rising smoke — soft plumes that grow and fade',
    defaultSettings: { speed: 30, intensity: 65, density: 50, color: '#9ca3af', scale: 1 },
  },
  {
    id: 'particle-bubbles',
    name: 'Bubbles (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'droplets',
    description: 'Procedural rising bubbles — wobbling rings with highlights',
    defaultSettings: { speed: 40, intensity: 75, density: 45, color: '#a5f3fc', scale: 1 },
  },
  {
    id: 'particle-sparkles',
    name: 'Sparkles (Particles)',
    pack: 'particles',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Procedural sparkles — twinkling additive points that flash',
    defaultSettings: { speed: 50, intensity: 85, density: 50, color: '#bfdbfe', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-water-flow',
    name: 'Flowing Water (Particles)',
    pack: 'particles',
    renderMode: 'terrain',
    icon: 'droplets',
    description: 'Procedural flowing water — highlight streaks riding a directional current, live direction/speed',
    defaultSettings: { speed: 50, intensity: 70, density: 55, color: '#bae6fd', secondaryColor: '#38bdf8', direction: 90, glowIntensity: 60, scale: 1 },
  },
  {
    id: 'particle-caustics',
    name: 'Caustics (Particles)',
    pack: 'particles',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Procedural underwater caustics — a rippling light web from a closed-form wave field',
    defaultSettings: { speed: 45, intensity: 80, density: 55, color: '#7dd3fc', secondaryColor: '#e0f2fe', glowIntensity: 70, scale: 1 },
  },

  // ===== VECTOR EFFECTS PACK (procedural magic circles + portals) =====
  {
    id: 'vector-pentagram',
    name: 'Pentagram Circle',
    pack: 'vector',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector 5-point magic circle — rotating rings, star and runes',
    defaultSettings: { speed: 35, intensity: 90, density: 50, color: '#c084fc', secondaryColor: '#e9d5ff', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'vector-hexagram',
    name: 'Hexagram Circle',
    pack: 'vector',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector 6-point magic circle — interlocking triangles and runes',
    defaultSettings: { speed: 30, intensity: 90, density: 50, color: '#22d3ee', secondaryColor: '#a5f3fc', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'vector-heptagram',
    name: 'Heptagram Circle',
    pack: 'vector',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector 7-point magic circle — rotating star, rings and runes',
    defaultSettings: { speed: 32, intensity: 90, density: 50, color: '#60a5fa', secondaryColor: '#bfdbfe', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'vector-arcane-circle',
    name: 'Arcane Circle',
    pack: 'vector',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector arcane circle — dense rune ring, ticks and concentric rings',
    defaultSettings: { speed: 28, intensity: 90, density: 50, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'vector-rune-circle',
    name: 'Rune Circle',
    pack: 'vector',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector rune circle — runes around an inner triad',
    defaultSettings: { speed: 30, intensity: 90, density: 50, color: '#4ade80', secondaryColor: '#bbf7d0', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'vector-portal',
    name: 'Arcane Portal',
    pack: 'vector',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector swirling portal — spiral arms, glowing rim and dark core',
    defaultSettings: { speed: 50, intensity: 90, density: 50, color: '#a855f7', secondaryColor: '#d8b4fe', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'vector-fire-portal',
    name: 'Fire Portal',
    pack: 'vector',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Vector fiery portal — flickering swirl with hot rim',
    defaultSettings: { speed: 60, intensity: 90, density: 50, color: '#ff7a1a', secondaryColor: '#ffd166', glowIntensity: 90, scale: 1 },
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

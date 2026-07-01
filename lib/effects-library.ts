// Curated Effects Library - organized by element/theme for intuitive browsing
// (fire, water, ice, earth, air, nature, necrotic, divine, magic, light sources)

export type EffectPack = 'light' | 'fire' | 'water' | 'ice' | 'earth' | 'air' | 'nature' | 'necrotic' | 'divine' | 'magic'

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
  | 'particle-flames' | 'particle-wisps' | 'particle-butterflies' | 'particle-godrays'
  // Particle presets (recolours / re-tunes of the base systems above)
  | 'particle-heavy-snow' | 'particle-blizzard' | 'particle-ash'
  | 'particle-dust-storm' | 'particle-golden-motes'
  | 'particle-frost-sparkle' | 'particle-holy-sparkles'
  | 'particle-necrotic-smoke' | 'particle-sulfur-smoke' | 'particle-red-smoke'
  | 'particle-hellfire-sparks' | 'particle-lava-bubbles'
  | 'particle-spectral-mist' | 'particle-sacred-mist'
  | 'particle-green-flames' | 'particle-purple-flames' | 'particle-holy-fire'
  | 'particle-souls' | 'particle-bees' | 'particle-dragonflies'
  // Bespoke new systems + top-down presets
  | 'particle-fire-geyser' | 'particle-burning-ash' | 'particle-feathers'
  | 'particle-skulls' | 'particle-divine-halo'
  | 'particle-rain-top-heavy' | 'particle-blizzard-top' | 'particle-embers-top-heavy'
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
  // VECTOR FX — Divine category (Phase: vector-fx)
  | 'vfx-divine-holy-halo' | 'vfx-divine-radiant-pulse' | 'vfx-divine-god-rays'
  | 'vfx-divine-blessing-circle' | 'vfx-divine-falling-golden-motes'
  | 'vfx-divine-sacred-beam' | 'vfx-divine-angelic-feather-drift'
  // VECTOR FX — Lava category
  | 'vfx-lava-flow-lines' | 'vfx-lava-magma-veins' | 'vfx-lava-expanding-cracks'
  | 'vfx-lava-heat-distortion-rings' | 'vfx-lava-pulse' | 'vfx-lava-ember-spiral'
  | 'vfx-lava-volcanic-warning-glow'
  // VECTOR FX — Water category
  | 'vfx-water-river-flow-lines' | 'vfx-water-whirlpool-spiral' | 'vfx-water-ripple-rings'
  | 'vfx-water-wave-lines' | 'vfx-water-rain-impact-rings' | 'vfx-water-waterfall-flow-streaks'
  | 'vfx-water-underwater-caustic-lines'
  // VECTOR FX — Wind category
  | 'vfx-wind-gust-lines' | 'vfx-wind-swirling-wind' | 'vfx-wind-tornado-spiral'
  | 'vfx-wind-directional-field' | 'vfx-wind-leaf-drift-path' | 'vfx-wind-smoke-curl-lines'
  | 'vfx-wind-blizzard-wind-streaks'
  // VECTOR FX — Magic category
  | 'vfx-magic-arcane-circle' | 'vfx-magic-rotating-rune-ring' | 'vfx-magic-mana-stream'
  | 'vfx-magic-portal-spiral' | 'vfx-magic-spell-targeting-circle' | 'vfx-magic-leyline-current'
  | 'vfx-magic-energy-beam'
  // VECTOR FX — Necrotic category
  | 'vfx-necrotic-shadow-tendrils' | 'vfx-necrotic-corruption-veins' | 'vfx-necrotic-soul-wisps'
  | 'vfx-necrotic-pulse' | 'vfx-necrotic-black-mist-curl' | 'vfx-necrotic-draining-life-spiral'
  | 'vfx-necrotic-cursed-rune-ring'
  // VECTOR FX — Dungeon category
  | 'vfx-dungeon-dust-motes-path' | 'vfx-dungeon-cracking-floor-lines' | 'vfx-dungeon-trap-warning-glyph'
  | 'vfx-dungeon-dripping-water-rings' | 'vfx-dungeon-spider-web-growth' | 'vfx-dungeon-falling-debris-lines'
  | 'vfx-dungeon-ancient-rune-glow'
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
  glowIntensity?: number // 0-100 (also "glow strength")
  // ===== Vector FX controls (all optional; renderers default any value they read) =====
  glowColor?: string     // glow/shadow color; falls back to `color`
  scaleX?: number        // 0.1-3 horizontal stretch (default 1)
  scaleY?: number        // 0.1-3 vertical stretch (default 1)
  thickness?: number     // 0-100 line/stroke weight
  branching?: number     // 0-100 branch amount for veins/tendrils/cracks
  ringCount?: number     // count of rings/ripples/circles
  turbulence?: number    // 0-100 organic noise/wobble
  pulseFrequency?: number // 0-100 pulse rate for glowing effects
  spread?: number        // 0-100 angular/area spread (rays, corruption, webs)
  loop?: boolean         // animation looping on/off (default true)
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
  light: {
    name: 'Light Sources',
    icon: 'lamp',
    color: '#fbbf24',
    description: 'Torches, lanterns, candles and braziers'
  },
  fire: {
    name: 'Fire & Lava',
    icon: 'flame',
    color: '#f97316',
    description: 'Flames, embers, molten lava and volcanic hazards'
  },
  water: {
    name: 'Water',
    icon: 'droplets',
    color: '#38bdf8',
    description: 'Rivers, rain, waterfalls, bubbles and underwater caustics'
  },
  ice: {
    name: 'Ice & Frost',
    icon: 'snowflake',
    color: '#93c5fd',
    description: 'Snow, blizzards, frost and frozen surfaces'
  },
  earth: {
    name: 'Earth & Stone',
    icon: 'mountain',
    color: '#a8a29e',
    description: 'Dust, rubble, cracking floors and collapsing stone'
  },
  air: {
    name: 'Air & Weather',
    icon: 'wind',
    color: '#94a3b8',
    description: 'Wind, storms, fog, smoke and lightning'
  },
  nature: {
    name: 'Nature',
    icon: 'leaf',
    color: '#4ade80',
    description: 'Fireflies, butterflies, bioluminescence and wildlife'
  },
  necrotic: {
    name: 'Necrotic & Undead',
    icon: 'skull',
    color: '#84cc16',
    description: 'Corruption, decay, spirits and graveyard horrors'
  },
  divine: {
    name: 'Divine & Holy',
    icon: 'sun',
    color: '#fde68a',
    description: 'Radiant holy light — halos, god rays and blessings'
  },
  magic: {
    name: 'Arcane & Magic',
    icon: 'sparkles',
    color: '#c084fc',
    description: 'Magic circles, portals, runes and arcane energy'
  },
}

export const effectsLibrary: EffectDefinition[] = [
  // ===== CORE PACK - Light Sources =====
  {
    id: 'torch',
    name: 'Torch Light',
    pack: 'light',
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
    pack: 'light',
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
    pack: 'light',
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
    pack: 'light',
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
    pack: 'light',
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
    pack: 'light',
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
    pack: 'magic',
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
    pack: 'air',
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
    pack: 'air',
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
    pack: 'water',
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
    pack: 'water',
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
    pack: 'fire',
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
    pack: 'ice',
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
    pack: 'magic',
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
    pack: 'magic',
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
    pack: 'magic',
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
    pack: 'divine',
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
    pack: 'necrotic',
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
    pack: 'necrotic',
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
    pack: 'magic',
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
    pack: 'magic',
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
    pack: 'magic',
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
    pack: 'magic',
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
    pack: 'magic',
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
    pack: 'magic',
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
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering torch flame',
    defaultSettings: { speed: 50, intensity: 90, density: 50, color: '#ffae42', secondaryColor: '#ff6a00', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'launch-lantern-glow',
    name: 'Lantern Glow',
    pack: 'light',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Warm hanging lantern light',
    defaultSettings: { speed: 40, intensity: 80, density: 50, color: '#ffd166', secondaryColor: '#f59e0b', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'launch-campfire',
    name: 'Campfire',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Crackling campfire blaze',
    defaultSettings: { speed: 55, intensity: 95, density: 60, color: '#ff7a1a', secondaryColor: '#ffcc00', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'launch-running-water',
    name: 'Running Water',
    pack: 'water',
    renderMode: 'localized',
    icon: 'droplets',
    description: 'Splashing flowing water',
    defaultSettings: { speed: 60, intensity: 80, density: 60, color: '#7dd3fc', secondaryColor: '#bae6fd', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'launch-arcane-runes',
    name: 'Arcane Runes',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Glowing magic rune circles',
    defaultSettings: { speed: 40, intensity: 85, density: 50, color: '#c084fc', secondaryColor: '#e9d5ff', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'launch-portal',
    name: 'Portal',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Swirling magic portal rings',
    defaultSettings: { speed: 50, intensity: 90, density: 50, color: '#a855f7', secondaryColor: '#d8b4fe', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'launch-lightning',
    name: 'Lightning',
    pack: 'air',
    renderMode: 'localized',
    icon: 'zap',
    description: 'Crackling lightning bolts',
    defaultSettings: { speed: 80, intensity: 95, density: 50, color: '#bae6fd', secondaryColor: '#60a5fa', glowIntensity: 95, scale: 1 },
  },
  {
    id: 'launch-divine-light',
    name: 'Divine Light',
    pack: 'divine',
    renderMode: 'localized',
    icon: 'sun',
    description: 'Radiant beams of holy light',
    defaultSettings: { speed: 40, intensity: 90, density: 50, color: '#fde68a', secondaryColor: '#fef9c3', glowIntensity: 95, scale: 1 },
  },
  {
    id: 'launch-necrotic-corruption',
    name: 'Necrotic Corruption',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'skull',
    description: 'Spreading necrotic energy',
    defaultSettings: { speed: 45, intensity: 85, density: 60, color: '#84cc16', secondaryColor: '#bef264', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'launch-ghost-apparition',
    name: 'Ghost Apparition',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'ghost',
    description: 'Spectral ghostly figures',
    defaultSettings: { speed: 35, intensity: 70, density: 40, color: '#a5f3fc', secondaryColor: '#cffafe', glowIntensity: 80, scale: 1 },
  },

  // ===== CAUSTICS PACK - underwater light sprite sheets (5x5, 25 frames) =====
  {
    id: 'caustics-shallow-clear',
    name: 'Shallow Clear Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Crisp light ripples in shallow clear water',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#7dd3fc', secondaryColor: '#e0f2fe', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'caustics-deep-blue',
    name: 'Deep Blue Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Cool caustics in deep blue water',
    defaultSettings: { speed: 40, intensity: 75, density: 55, color: '#3b82f6', secondaryColor: '#93c5fd', glowIntensity: 65, scale: 1 },
  },
  {
    id: 'caustics-tropical-shallow',
    name: 'Tropical Shallow Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Bright turquoise tropical caustics',
    defaultSettings: { speed: 55, intensity: 85, density: 50, color: '#2dd4bf', secondaryColor: '#a7f3d0', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'caustics-soft-sand',
    name: 'Soft Sand Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Soft diffuse caustics over sand',
    defaultSettings: { speed: 45, intensity: 70, density: 50, color: '#bae6fd', secondaryColor: '#f0f9ff', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'caustics-rocky-bottom',
    name: 'Rocky Bottom Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Caustics scattered over rocky bottom',
    defaultSettings: { speed: 48, intensity: 78, density: 55, color: '#67e8f9', secondaryColor: '#cffafe', glowIntensity: 65, scale: 1 },
  },
  {
    id: 'caustics-fast-moving',
    name: 'Fast Moving Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Rapidly shifting light patterns',
    defaultSettings: { speed: 80, intensity: 88, density: 50, color: '#22d3ee', secondaryColor: '#ecfeff', glowIntensity: 75, scale: 1 },
  },
  {
    id: 'caustics-slow-gentle',
    name: 'Slow Gentle Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Slow, calming light ripples',
    defaultSettings: { speed: 25, intensity: 65, density: 45, color: '#5eead4', secondaryColor: '#ccfbf1', glowIntensity: 55, scale: 1 },
  },
  {
    id: 'caustics-blue-green',
    name: 'Blue Green Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Blended blue-green water caustics',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#14b8a6', secondaryColor: '#99f6e4', glowIntensity: 68, scale: 1 },
  },
  {
    id: 'caustics-sunlit-deep',
    name: 'Sunlit Deep Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Sun rays piercing deep water',
    defaultSettings: { speed: 42, intensity: 82, density: 55, color: '#60a5fa', secondaryColor: '#dbeafe', glowIntensity: 72, scale: 1 },
  },
  {
    id: 'caustics-murky-water',
    name: 'Murky Water Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Hazy caustics in murky green water',
    defaultSettings: { speed: 38, intensity: 60, density: 60, color: '#84cc16', secondaryColor: '#d9f99d', glowIntensity: 50, scale: 1 },
  },
  {
    id: 'caustics-cave-water',
    name: 'Cave Water Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Stark caustics in dark cave water',
    defaultSettings: { speed: 35, intensity: 85, density: 45, color: '#bfdbfe', secondaryColor: '#ffffff', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'caustics-kelp-forest',
    name: 'Kelp Forest Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Green-tinted caustics through kelp',
    defaultSettings: { speed: 40, intensity: 72, density: 55, color: '#4ade80', secondaryColor: '#bbf7d0', glowIntensity: 58, scale: 1 },
  },
  {
    id: 'caustics-rippling-sand',
    name: 'Rippling Sand Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Radiating caustics over rippled sand',
    defaultSettings: { speed: 52, intensity: 84, density: 50, color: '#a5f3fc', secondaryColor: '#ffffff', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'caustics-wavy-surface',
    name: 'Wavy Surface Caustics',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Caustics from a wavy water surface',
    defaultSettings: { speed: 58, intensity: 80, density: 52, color: '#38bdf8', secondaryColor: '#e0f2fe', glowIntensity: 68, scale: 1 },
  },
  {
    id: 'caustics-magic-glow',
    name: 'Magic Glow Caustics',
    pack: 'water',
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
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering spirit fire orbs',
    defaultSettings: { speed: 45, intensity: 85, density: 40, color: '#2dd4bf', secondaryColor: '#99f6e4', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'cemetery-soul-spirits',
    name: 'Soul Spirits',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'ghost',
    description: 'Drifting ghostly soul figures',
    defaultSettings: { speed: 35, intensity: 75, density: 40, color: '#5eead4', secondaryColor: '#ccfbf1', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'cemetery-necrotic-aura',
    name: 'Necrotic Aura',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'skull',
    description: 'Swirling dark decaying energy',
    defaultSettings: { speed: 45, intensity: 85, density: 60, color: '#7e22ce', secondaryColor: '#a855f7', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'cemetery-blood-petals',
    name: 'Blood Petals',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Scattering crimson petals',
    defaultSettings: { speed: 40, intensity: 70, density: 50, color: '#dc2626', secondaryColor: '#ef4444', glowIntensity: 40, scale: 1 },
  },
  {
    id: 'cemetery-haunted-lantern',
    name: 'Haunted Lantern Light',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Eerie green lantern flame',
    defaultSettings: { speed: 40, intensity: 80, density: 40, color: '#4ade80', secondaryColor: '#bbf7d0', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'cemetery-cracked-stone-rise',
    name: 'Cracked Stone Rise',
    pack: 'earth',
    renderMode: 'terrain',
    icon: 'mountain',
    description: 'Tombstone rising from the ground',
    defaultSettings: { speed: 40, intensity: 70, density: 50, color: '#94a3b8', secondaryColor: '#cbd5e1', glowIntensity: 20, scale: 1 },
  },
  {
    id: 'cemetery-skeletal-remains',
    name: 'Skeletal Remains Shift',
    pack: 'necrotic',
    renderMode: 'terrain',
    icon: 'skull',
    description: 'Bones clattering and assembling',
    defaultSettings: { speed: 45, intensity: 70, density: 50, color: '#e7e5e4', secondaryColor: '#d6d3d1', glowIntensity: 20, scale: 1 },
  },
  {
    id: 'cemetery-dark-ritual-circle',
    name: 'Dark Ritual Circle',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Glowing red occult summoning circle',
    defaultSettings: { speed: 35, intensity: 90, density: 50, color: '#ef4444', secondaryColor: '#fca5a5', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'cemetery-coffin-burst',
    name: 'Coffin Burst',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Coffin bursting open with debris',
    defaultSettings: { speed: 55, intensity: 85, density: 55, color: '#a16207', secondaryColor: '#facc15', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'cemetery-moonbeam-trees',
    name: 'Moonbeam Through Trees',
    pack: 'divine',
    renderMode: 'localized',
    icon: 'sun',
    description: 'Pale volumetric moonlight rays',
    defaultSettings: { speed: 25, intensity: 70, density: 40, color: '#bfdbfe', secondaryColor: '#eff6ff', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'cemetery-draining-life-vortex',
    name: 'Draining Life Vortex',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Swirling green life-drain vortex',
    defaultSettings: { speed: 55, intensity: 90, density: 55, color: '#84cc16', secondaryColor: '#bef264', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'cemetery-candle-flame',
    name: 'Candle Flame Flicker',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering candle flames',
    defaultSettings: { speed: 45, intensity: 75, density: 40, color: '#fcd34d', secondaryColor: '#fbbf24', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'cemetery-bats-in-flight',
    name: 'Bats in Flight',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'ghost',
    description: 'Silhouetted bats flying past',
    defaultSettings: { speed: 60, intensity: 80, density: 50, color: '#1e293b', secondaryColor: '#475569', glowIntensity: 10, scale: 1 },
  },

  // ===== SUBTERRANEAN EFFECTS PACK - cave sprite sheets (5x6, 30 frames) =====
  {
    id: 'subterranean-cave-drips',
    name: 'Cave Drips',
    pack: 'water',
    renderMode: 'localized',
    icon: 'droplets',
    description: 'Dripping water with ripple splashes',
    defaultSettings: { speed: 40, intensity: 75, density: 40, color: '#bae6fd', secondaryColor: '#e0f2fe', glowIntensity: 40, scale: 1 },
  },
  {
    id: 'subterranean-stalactite-seep',
    name: 'Stalactite Seep',
    pack: 'water',
    renderMode: 'localized',
    icon: 'droplets',
    description: 'Water seeping down stalactites',
    defaultSettings: { speed: 30, intensity: 65, density: 40, color: '#a5f3fc', secondaryColor: '#cffafe', glowIntensity: 35, scale: 1 },
  },
  {
    id: 'subterranean-underground-stream',
    name: 'Underground Stream',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Flowing subterranean water',
    defaultSettings: { speed: 55, intensity: 75, density: 55, color: '#7dd3fc', secondaryColor: '#bae6fd', glowIntensity: 45, scale: 1 },
  },
  {
    id: 'subterranean-crystal-pulse',
    name: 'Crystal Pulse',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'gem',
    description: 'Pulsing glowing crystal',
    defaultSettings: { speed: 40, intensity: 90, density: 45, color: '#c084fc', secondaryColor: '#e9d5ff', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'subterranean-bioluminescent-spores',
    name: 'Bioluminescent Spores',
    pack: 'nature',
    renderMode: 'atmospheric',
    icon: 'sparkle',
    description: 'Floating glowing spores',
    defaultSettings: { speed: 30, intensity: 75, density: 50, color: '#2dd4bf', secondaryColor: '#99f6e4', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'subterranean-glowing-mushroom-aura',
    name: 'Glowing Mushroom Aura',
    pack: 'nature',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Pulsing cave mushroom glow',
    defaultSettings: { speed: 35, intensity: 80, density: 45, color: '#22d3ee', secondaryColor: '#a5f3fc', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'subterranean-bat-swarm',
    name: 'Bat Swarm Silhouettes',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'ghost',
    description: 'Swarming bat silhouettes',
    defaultSettings: { speed: 65, intensity: 80, density: 55, color: '#1e293b', secondaryColor: '#475569', glowIntensity: 10, scale: 1 },
  },
  {
    id: 'subterranean-pebble-collapse',
    name: 'Pebble Collapse',
    pack: 'earth',
    renderMode: 'terrain',
    icon: 'mountain',
    description: 'Tumbling falling pebbles',
    defaultSettings: { speed: 55, intensity: 70, density: 50, color: '#a8a29e', secondaryColor: '#d6d3d1', glowIntensity: 15, scale: 1 },
  },
  {
    id: 'subterranean-arcane-cave-energy',
    name: 'Arcane Cave Energy',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Crackling arcane energy arcs',
    defaultSettings: { speed: 55, intensity: 90, density: 50, color: '#a855f7', secondaryColor: '#d8b4fe', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'subterranean-ambient',
    name: 'Subterranean Ambient',
    pack: 'earth',
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
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering wall-mounted torch',
    defaultSettings: { speed: 50, intensity: 85, density: 40, color: '#f59e0b', secondaryColor: '#fbbf24', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-ornate-lantern',
    name: 'Ornate Lantern',
    pack: 'light',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Decorative glowing lantern',
    defaultSettings: { speed: 40, intensity: 80, density: 40, color: '#f59e0b', secondaryColor: '#fcd34d', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'lightsource-iron-lantern',
    name: 'Iron Lantern',
    pack: 'light',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Simple iron-framed lantern',
    defaultSettings: { speed: 40, intensity: 75, density: 40, color: '#f59e0b', secondaryColor: '#fcd34d', glowIntensity: 75, scale: 1 },
  },
  {
    id: 'lightsource-hanging-lantern',
    name: 'Hanging Lantern',
    pack: 'light',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Swaying suspended lantern',
    defaultSettings: { speed: 40, intensity: 80, density: 40, color: '#f59e0b', secondaryColor: '#fcd34d', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'lightsource-carriage-lantern',
    name: 'Carriage Lantern',
    pack: 'light',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Tall bright carriage lantern',
    defaultSettings: { speed: 45, intensity: 85, density: 40, color: '#f59e0b', secondaryColor: '#fcd34d', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-campfire',
    name: 'Campfire',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Crackling log campfire',
    defaultSettings: { speed: 55, intensity: 88, density: 50, color: '#f97316', secondaryColor: '#fbbf24', glowIntensity: 88, scale: 1 },
  },
  {
    id: 'lightsource-sparkler-burst',
    name: 'Sparkler Burst',
    pack: 'light',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Radiating spark burst',
    defaultSettings: { speed: 60, intensity: 85, density: 55, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-candle',
    name: 'Candle',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Single flickering candle',
    defaultSettings: { speed: 45, intensity: 70, density: 35, color: '#f59e0b', secondaryColor: '#fef08a', glowIntensity: 75, scale: 1 },
  },
  {
    id: 'lightsource-glowing-orb',
    name: 'Glowing Orb',
    pack: 'light',
    renderMode: 'localized',
    icon: 'sparkle',
    description: 'Pulsing orb of warm light',
    defaultSettings: { speed: 35, intensity: 85, density: 40, color: '#facc15', secondaryColor: '#fde68a', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'lightsource-fire-brazier',
    name: 'Fire Brazier',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flaming metal fire bowl',
    defaultSettings: { speed: 55, intensity: 88, density: 50, color: '#f97316', secondaryColor: '#fca5a5', glowIntensity: 88, scale: 1 },
  },
  {
    id: 'lightsource-rune-light-circle',
    name: 'Rune Light Circle',
    pack: 'light',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Glowing runic light ring',
    defaultSettings: { speed: 40, intensity: 82, density: 40, color: '#fde047', secondaryColor: '#fef08a', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-pendant-light',
    name: 'Pendant Light',
    pack: 'light',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Hanging swaying light orb',
    defaultSettings: { speed: 40, intensity: 82, density: 40, color: '#facc15', secondaryColor: '#fde68a', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-radiant-starburst',
    name: 'Radiant Starburst',
    pack: 'light',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Bright twinkling star burst',
    defaultSettings: { speed: 45, intensity: 88, density: 45, color: '#fde047', secondaryColor: '#fffbeb', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'lightsource-soft-star-glow',
    name: 'Soft Star Glow',
    pack: 'light',
    renderMode: 'localized',
    icon: 'sparkle',
    description: 'Diffuse soft glowing star',
    defaultSettings: { speed: 35, intensity: 75, density: 40, color: '#fde68a', secondaryColor: '#fef9c3', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lightsource-sparkle-starburst',
    name: 'Sparkle Starburst',
    pack: 'light',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Glittering sparkle star burst',
    defaultSettings: { speed: 50, intensity: 85, density: 50, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 88, scale: 1 },
  },
  // ----- Light Source Revised Effects Pack (15) -----
  {
    id: 'lsr-torch',
    name: 'Torch',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering wall torch flame',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#f97316', secondaryColor: '#fbbf24', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'lsr-fire-glow',
    name: 'Fire Glow',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Soft glowing fire light',
    defaultSettings: { speed: 45, intensity: 78, density: 50, color: '#fb923c', secondaryColor: '#fde68a', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lsr-fire-bowl',
    name: 'Fire Bowl',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Burning fire bowl',
    defaultSettings: { speed: 48, intensity: 82, density: 50, color: '#f97316', secondaryColor: '#fbbf24', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'lsr-carriage-lantern',
    name: 'Carriage Lantern',
    pack: 'light',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Ornate carriage lantern light',
    defaultSettings: { speed: 35, intensity: 70, density: 40, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 78, scale: 1 },
  },
  {
    id: 'lsr-hanging-lantern',
    name: 'Hanging Lantern',
    pack: 'light',
    renderMode: 'localized',
    icon: 'lamp',
    description: 'Glowing hanging lantern',
    defaultSettings: { speed: 35, intensity: 70, density: 40, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 78, scale: 1 },
  },
  {
    id: 'lsr-candle',
    name: 'Candle',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Flickering candle flame',
    defaultSettings: { speed: 40, intensity: 65, density: 40, color: '#fde68a', secondaryColor: '#fef9c3', glowIntensity: 72, scale: 1 },
  },
  {
    id: 'lsr-glowing-orb',
    name: 'Glowing Orb',
    pack: 'light',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Pulsing glowing orb of light',
    defaultSettings: { speed: 40, intensity: 80, density: 50, color: '#fbbf24', secondaryColor: '#fef3c7', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'lsr-campfire',
    name: 'Campfire',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Crackling campfire',
    defaultSettings: { speed: 50, intensity: 85, density: 55, color: '#f97316', secondaryColor: '#fbbf24', glowIntensity: 82, scale: 1 },
  },
  {
    id: 'lsr-sparkles',
    name: 'Sparkles',
    pack: 'light',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Drifting ember sparkles',
    defaultSettings: { speed: 55, intensity: 75, density: 60, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'lsr-fire-brazier',
    name: 'Fire Brazier',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Blazing fire brazier',
    defaultSettings: { speed: 50, intensity: 85, density: 55, color: '#f97316', secondaryColor: '#fbbf24', glowIntensity: 82, scale: 1 },
  },
  {
    id: 'lsr-blue-flame',
    name: 'Blue Flame',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Ethereal blue flame',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#38bdf8', secondaryColor: '#bae6fd', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lsr-green-flame',
    name: 'Green Flame',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Eerie green flame',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#4ade80', secondaryColor: '#bbf7d0', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'lsr-starburst',
    name: 'Starburst',
    pack: 'light',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Radiant twinkling starburst',
    defaultSettings: { speed: 50, intensity: 88, density: 50, color: '#fde68a', secondaryColor: '#fef9c3', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'lsr-arcane-circle',
    name: 'Arcane Circle',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Rotating arcane rune circle',
    defaultSettings: { speed: 40, intensity: 80, density: 50, color: '#a855f7', secondaryColor: '#d8b4fe', glowIntensity: 88, scale: 1 },
  },
  {
    id: 'lsr-smoke',
    name: 'Smoke',
    pack: 'air',
    renderMode: 'localized',
    icon: 'cloud',
    description: 'Rising plume of smoke',
    defaultSettings: { speed: 35, intensity: 60, density: 50, color: '#9ca3af', secondaryColor: '#d1d5db', glowIntensity: 30, scale: 1 },
  },
  {
    id: 'new-fire-torch',
    name: 'Fire Torch',
    pack: 'light',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'Fire Torch sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff6600', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'camp-fire',
    name: 'Camp Fire',
    pack: 'light',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Camp Fire sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff9500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-bubbles',
    name: 'Lava Bubbles',
    pack: 'fire',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Bubbles sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-burst',
    name: 'Lava Burst',
    pack: 'fire',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Burst sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-cracks',
    name: 'Lava Cracks',
    pack: 'fire',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Cracks sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-current',
    name: 'Lava Current',
    pack: 'fire',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Current sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-slow',
    name: 'Molten Flow',
    pack: 'fire',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Slow molten lava flow sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-whirlpool',
    name: 'Lava Whirlpool',
    pack: 'fire',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Whirlpool sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-splashes',
    name: 'Lava Splashes',
    pack: 'fire',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Lava Splashes sprite animation',
    defaultSettings: { speed: 50, intensity: 80, density: 50, color: '#ff5500', glowIntensity: 60, scale: 1 },
  },
  {
    id: 'lava-vents',
    name: 'Lava Vents',
    pack: 'fire',
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
    pack: 'water',
    renderMode: 'atmospheric',
    icon: 'cloud-rain',
    description: 'Procedural rain — density, direction, speed and color are live',
    defaultSettings: { speed: 60, intensity: 70, density: 55, color: '#dbeafe', direction: 180, scale: 1 },
  },
  {
    id: 'particle-rain-top',
    name: 'Rain — Top-Down (Particles)',
    pack: 'water',
    renderMode: 'atmospheric',
    icon: 'cloud-rain',
    description: 'Aerial rain seen from above — drops land as expanding ripples',
    defaultSettings: { speed: 60, intensity: 75, density: 55, color: '#bfdbfe', scale: 1 },
  },
  {
    id: 'particle-snow-top',
    name: 'Snow — Top-Down (Particles)',
    pack: 'ice',
    renderMode: 'atmospheric',
    icon: 'snowflake',
    description: 'Aerial snow seen from above — flakes drift across the map on the wind',
    defaultSettings: { speed: 30, intensity: 75, density: 50, color: '#ffffff', direction: 180, scale: 1 },
  },
  {
    id: 'particle-leaves-top',
    name: 'Leaves — Top-Down (Particles)',
    pack: 'nature',
    renderMode: 'atmospheric',
    icon: 'leaf',
    description: 'Aerial autumn leaves blowing across the ground, tumbling as they go',
    defaultSettings: { speed: 40, intensity: 80, density: 45, color: '#c2410c', direction: 180, scale: 1 },
  },
  {
    id: 'particle-embers-top',
    name: 'Embers — Top-Down (Particles)',
    pack: 'fire',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Aerial embers scattered on the wind — flickering sparks over the ground',
    defaultSettings: { speed: 45, intensity: 85, density: 50, color: '#ff7a1a', direction: 180, glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-snow',
    name: 'Snow (Particles)',
    pack: 'ice',
    renderMode: 'atmospheric',
    icon: 'snowflake',
    description: 'Procedural snow — drifting flakes with live density, wind and speed',
    defaultSettings: { speed: 30, intensity: 75, density: 45, color: '#ffffff', direction: 180, scale: 1 },
  },
  {
    id: 'particle-embers',
    name: 'Embers (Particles)',
    pack: 'fire',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Procedural rising sparks — glowing, flickering, additive',
    defaultSettings: { speed: 45, intensity: 85, density: 50, color: '#ff7a1a', secondaryColor: '#ffcc00', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-fog',
    name: 'Fog (Particles)',
    pack: 'air',
    renderMode: 'atmospheric',
    icon: 'cloud',
    description: 'Procedural drifting fog — soft volumetric blobs, live drift and density',
    defaultSettings: { speed: 20, intensity: 60, density: 50, color: '#cbd5e1', direction: 90, scale: 1 },
  },
  {
    id: 'particle-fireflies',
    name: 'Fireflies (Particles)',
    pack: 'nature',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Procedural fireflies — wandering glow dots that pulse, additive',
    defaultSettings: { speed: 40, intensity: 85, density: 40, color: '#fde047', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-dust',
    name: 'Dust Motes (Particles)',
    pack: 'earth',
    renderMode: 'atmospheric',
    icon: 'sparkle',
    description: 'Procedural floating dust — drifting, twinkling motes',
    defaultSettings: { speed: 30, intensity: 60, density: 50, color: '#fde68a', scale: 1 },
  },
  {
    id: 'particle-smoke',
    name: 'Smoke (Particles)',
    pack: 'air',
    renderMode: 'atmospheric',
    icon: 'cloud',
    description: 'Procedural rising smoke — soft plumes that grow and fade',
    defaultSettings: { speed: 30, intensity: 65, density: 50, color: '#9ca3af', scale: 1 },
  },
  {
    id: 'particle-bubbles',
    name: 'Bubbles (Particles)',
    pack: 'water',
    renderMode: 'atmospheric',
    icon: 'droplets',
    description: 'Procedural rising bubbles — wobbling rings with highlights',
    defaultSettings: { speed: 40, intensity: 75, density: 45, color: '#a5f3fc', scale: 1 },
  },
  {
    id: 'particle-sparkles',
    name: 'Sparkles (Particles)',
    pack: 'magic',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Procedural sparkles — twinkling additive points that flash',
    defaultSettings: { speed: 50, intensity: 85, density: 50, color: '#bfdbfe', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-water-flow',
    name: 'Flowing Water (Particles)',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'droplets',
    description: 'Procedural flowing water — highlight streaks riding a directional current, live direction/speed',
    defaultSettings: { speed: 50, intensity: 70, density: 55, color: '#bae6fd', secondaryColor: '#38bdf8', direction: 90, glowIntensity: 60, scale: 1 },
  },
  {
    id: 'particle-caustics',
    name: 'Caustics (Particles)',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Procedural underwater caustics — a rippling light web from a closed-form wave field',
    defaultSettings: { speed: 45, intensity: 80, density: 55, color: '#7dd3fc', secondaryColor: '#e0f2fe', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'particle-flames',
    name: 'Flames (Particles)',
    pack: 'fire',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Procedural fire — flickering tongues with a hot core; recolour for green/purple/holy/hellfire',
    defaultSettings: { speed: 55, intensity: 85, density: 50, color: '#ffd24a', secondaryColor: '#ff6a00', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'particle-wisps',
    name: 'Wisps (Particles)',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Ghostly drifting wisps with comet trails — additive; recolour for souls / spectral wisps',
    defaultSettings: { speed: 35, intensity: 70, density: 45, color: '#a7f3d0', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'particle-butterflies',
    name: 'Butterflies (Particles)',
    pack: 'nature',
    renderMode: 'atmospheric',
    icon: 'sparkle',
    description: 'Winged creatures wandering and flapping — base for bees / dragonflies presets',
    defaultSettings: { speed: 50, intensity: 90, density: 45, color: '#fb923c', scale: 1 },
  },
  {
    id: 'particle-godrays',
    name: 'Light Beams / God Rays (Particles)',
    pack: 'divine',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Soft volumetric light shafts at an angle — sun rays / radiant beams; recolour for holy gold',
    defaultSettings: { speed: 35, intensity: 70, density: 45, color: '#fde9a8', direction: 215, glowIntensity: 70, scale: 1 },
  },

  // ===== Particle presets (recolours / re-tunes of the base systems) =====
  {
    id: 'particle-heavy-snow',
    name: 'Heavy Snow (Particles)',
    pack: 'ice',
    renderMode: 'atmospheric',
    icon: 'snowflake',
    description: 'Dense snowfall — heavy flakes drifting down',
    defaultSettings: { speed: 35, intensity: 82, density: 82, color: '#ffffff', direction: 180, scale: 1 },
  },
  {
    id: 'particle-blizzard',
    name: 'Blizzard (Particles)',
    pack: 'ice',
    renderMode: 'atmospheric',
    icon: 'snowflake',
    description: 'Driving blizzard — dense snow blown hard sideways',
    defaultSettings: { speed: 82, intensity: 85, density: 92, color: '#ffffff', direction: 230, scale: 1 },
  },
  {
    id: 'particle-ash',
    name: 'Ash (Particles)',
    pack: 'fire',
    renderMode: 'atmospheric',
    icon: 'snowflake',
    description: 'Grey ash flecks drifting down slowly',
    defaultSettings: { speed: 24, intensity: 60, density: 58, color: '#9ca3af', direction: 188, scale: 1 },
  },
  {
    id: 'particle-dust-storm',
    name: 'Dust Storm (Particles)',
    pack: 'air',
    renderMode: 'atmospheric',
    icon: 'sparkle',
    description: 'Driving dust / sandstorm — dense tan motes blown across the scene',
    defaultSettings: { speed: 76, intensity: 70, density: 86, color: '#d6b370', scale: 1 },
  },
  {
    id: 'particle-golden-motes',
    name: 'Golden Motes (Particles)',
    pack: 'divine',
    renderMode: 'atmospheric',
    icon: 'sparkle',
    description: 'Slow drifting golden flecks — treasure / divine ambience',
    defaultSettings: { speed: 20, intensity: 65, density: 55, color: '#fcd34d', scale: 1 },
  },
  {
    id: 'particle-frost-sparkle',
    name: 'Frost Sparkle (Particles)',
    pack: 'ice',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Icy twinkling sparkles — frost / ice crystals',
    defaultSettings: { speed: 55, intensity: 85, density: 55, color: '#cffafe', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-holy-sparkles',
    name: 'Holy Sparkles (Particles)',
    pack: 'divine',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Warm golden twinkles — blessing / holy ambience',
    defaultSettings: { speed: 45, intensity: 85, density: 50, color: '#fef9c3', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-necrotic-smoke',
    name: 'Necrotic Smoke (Particles)',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'cloud',
    description: 'Sickly green rising smoke',
    defaultSettings: { speed: 30, intensity: 65, density: 55, color: '#84cc16', scale: 1 },
  },
  {
    id: 'particle-sulfur-smoke',
    name: 'Sulfur Smoke (Particles)',
    pack: 'fire',
    renderMode: 'atmospheric',
    icon: 'cloud',
    description: 'Acrid yellow sulfur smoke rising',
    defaultSettings: { speed: 30, intensity: 65, density: 55, color: '#ca8a04', scale: 1 },
  },
  {
    id: 'particle-red-smoke',
    name: 'Red Smoke (Particles)',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'cloud',
    description: 'Ominous red smoke rising',
    defaultSettings: { speed: 30, intensity: 65, density: 55, color: '#dc2626', scale: 1 },
  },
  {
    id: 'particle-hellfire-sparks',
    name: 'Hellfire Sparks (Particles)',
    pack: 'fire',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Fierce red-orange rising sparks — hellfire / demon embers',
    defaultSettings: { speed: 58, intensity: 88, density: 60, color: '#ef4444', secondaryColor: '#f59e0b', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-lava-bubbles',
    name: 'Lava Bubbles (Particles)',
    pack: 'fire',
    renderMode: 'atmospheric',
    icon: 'droplets',
    description: 'Glowing molten bubbles rising and popping',
    defaultSettings: { speed: 35, intensity: 80, density: 50, color: '#fb923c', scale: 1 },
  },
  {
    id: 'particle-spectral-mist',
    name: 'Spectral Mist (Particles)',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'cloud',
    description: 'Pale green ghostly mist drifting low',
    defaultSettings: { speed: 18, intensity: 60, density: 55, color: '#a7f3d0', direction: 90, scale: 1 },
  },
  {
    id: 'particle-sacred-mist',
    name: 'Sacred Mist (Particles)',
    pack: 'divine',
    renderMode: 'atmospheric',
    icon: 'cloud',
    description: 'Soft golden-white sacred mist drifting low',
    defaultSettings: { speed: 16, intensity: 60, density: 50, color: '#fef9c3', direction: 90, scale: 1 },
  },
  {
    id: 'particle-green-flames',
    name: 'Green Flames (Particles)',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Eerie green fire — flickering tongues with a bright core',
    defaultSettings: { speed: 55, intensity: 85, density: 50, color: '#bbf7d0', secondaryColor: '#16a34a', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'particle-purple-flames',
    name: 'Purple Flames (Particles)',
    pack: 'magic',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Arcane purple fire — flickering tongues with a bright core',
    defaultSettings: { speed: 55, intensity: 85, density: 50, color: '#f5d0fe', secondaryColor: '#9333ea', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'particle-holy-fire',
    name: 'Holy Fire (Particles)',
    pack: 'divine',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Radiant white-gold holy fire',
    defaultSettings: { speed: 50, intensity: 85, density: 50, color: '#fffbeb', secondaryColor: '#f59e0b', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-souls',
    name: 'Souls (Particles)',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Pale blue spirit lights wandering with comet trails',
    defaultSettings: { speed: 28, intensity: 70, density: 40, color: '#dbeafe', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'particle-bees',
    name: 'Bees (Particles)',
    pack: 'nature',
    renderMode: 'atmospheric',
    icon: 'sparkle',
    description: 'Small fast-darting winged insects',
    defaultSettings: { speed: 65, intensity: 90, density: 50, color: '#fbbf24', scale: 1 },
  },
  {
    id: 'particle-dragonflies',
    name: 'Dragonflies (Particles)',
    pack: 'nature',
    renderMode: 'atmospheric',
    icon: 'sparkle',
    description: 'Iridescent long-winged dragonflies hovering and darting',
    defaultSettings: { speed: 55, intensity: 90, density: 40, color: '#67e8f9', scale: 1 },
  },

  // ===== Bespoke new systems + top-down presets =====
  {
    id: 'particle-fire-geyser',
    name: 'Fire Geysers (Particles)',
    pack: 'fire',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Periodic fire eruptions — columns that shoot up with a crown of sparks, then subside',
    defaultSettings: { speed: 55, intensity: 85, density: 45, color: '#ffd24a', secondaryColor: '#ff6a00', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'particle-burning-ash',
    name: 'Burning Ash (Particles)',
    pack: 'fire',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Glowing embers raining down, flickering and cooling as they fall',
    defaultSettings: { speed: 40, intensity: 80, density: 55, color: '#ff7a1a', direction: 185, glowIntensity: 85, scale: 1 },
  },
  {
    id: 'particle-feathers',
    name: 'Angel Feathers (Particles)',
    pack: 'divine',
    renderMode: 'atmospheric',
    icon: 'sparkle',
    description: 'Soft feathers drifting down, swaying and tumbling edge-on',
    defaultSettings: { speed: 35, intensity: 75, density: 40, color: '#f8fafc', direction: 185, scale: 1 },
  },
  {
    id: 'particle-skulls',
    name: 'Floating Skulls (Particles)',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'skull',
    description: 'Bobbing bone skulls drifting with a spooky aura — recolour the aura',
    defaultSettings: { speed: 35, intensity: 80, density: 35, color: '#bbf7d0', glowIntensity: 70, scale: 1 },
  },
  {
    id: 'particle-divine-halo',
    name: 'Divine Halo (Particles)',
    pack: 'divine',
    renderMode: 'localized',
    icon: 'sparkles',
    description: 'A glowing tilted ring of light hovering and pulsing with a sweeping highlight',
    defaultSettings: { speed: 35, intensity: 85, density: 50, color: '#fde9a8', glowIntensity: 85, scale: 1 },
  },
  {
    id: 'particle-rain-top-heavy',
    name: 'Heavy Rain — Top-Down (Particles)',
    pack: 'water',
    renderMode: 'atmospheric',
    icon: 'cloud-rain',
    description: 'Dense aerial downpour seen from above — heavy drops with impact ripples',
    defaultSettings: { speed: 82, intensity: 88, density: 88, color: '#bfdbfe', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'particle-blizzard-top',
    name: 'Blizzard — Top-Down (Particles)',
    pack: 'ice',
    renderMode: 'atmospheric',
    icon: 'snowflake',
    description: 'Dense overhead snowfall driving down toward the map',
    defaultSettings: { speed: 80, intensity: 88, density: 92, color: '#ffffff', scale: 1 },
  },
  {
    id: 'particle-embers-top-heavy',
    name: 'Heavy Embers — Top-Down (Particles)',
    pack: 'fire',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Thick aerial ember storm rising toward the camera',
    defaultSettings: { speed: 60, intensity: 90, density: 85, color: '#ff7a1a', glowIntensity: 90, scale: 1 },
  },

  // ===== VECTOR EFFECTS PACK (procedural magic circles + portals) =====
  {
    id: 'vector-pentagram',
    name: 'Pentagram Circle',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector 5-point magic circle — rotating rings, star and runes',
    defaultSettings: { speed: 35, intensity: 90, density: 50, color: '#c084fc', secondaryColor: '#e9d5ff', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'vector-hexagram',
    name: 'Hexagram Circle',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector 6-point magic circle — interlocking triangles and runes',
    defaultSettings: { speed: 30, intensity: 90, density: 50, color: '#22d3ee', secondaryColor: '#a5f3fc', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'vector-heptagram',
    name: 'Heptagram Circle',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector 7-point magic circle — rotating star, rings and runes',
    defaultSettings: { speed: 32, intensity: 90, density: 50, color: '#60a5fa', secondaryColor: '#bfdbfe', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'vector-arcane-circle',
    name: 'Arcane Circle',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector arcane circle — dense rune ring, ticks and concentric rings',
    defaultSettings: { speed: 28, intensity: 90, density: 50, color: '#fbbf24', secondaryColor: '#fde68a', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'vector-rune-circle',
    name: 'Rune Circle',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector rune circle — runes around an inner triad',
    defaultSettings: { speed: 30, intensity: 90, density: 50, color: '#4ade80', secondaryColor: '#bbf7d0', glowIntensity: 80, scale: 1 },
  },
  {
    id: 'vector-portal',
    name: 'Arcane Portal',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Vector swirling portal — spiral arms, glowing rim and dark core',
    defaultSettings: { speed: 50, intensity: 90, density: 50, color: '#a855f7', secondaryColor: '#d8b4fe', glowIntensity: 90, scale: 1 },
  },
  {
    id: 'vector-fire-portal',
    name: 'Fire Portal',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Vector fiery portal — flickering swirl with hot rim',
    defaultSettings: { speed: 60, intensity: 90, density: 50, color: '#ff7a1a', secondaryColor: '#ffd166', glowIntensity: 90, scale: 1 },
  },

  // ===== VECTOR FX — DIVINE (golden/white radiant glow) =====
  {
    id: 'vfx-divine-holy-halo',
    name: 'Holy Halo',
    pack: 'divine',
    renderMode: 'localized',
    icon: 'sun',
    description: 'A glowing tilted halo ring with a soft inner radiance',
    defaultSettings: { speed: 25, intensity: 85, density: 50, color: '#fde68a', secondaryColor: '#ffffff', glowColor: '#fff7d6', glowIntensity: 85, thickness: 30, ringCount: 2, scale: 1 },
  },
  {
    id: 'vfx-divine-radiant-pulse',
    name: 'Radiant Pulse',
    pack: 'divine',
    renderMode: 'localized',
    icon: 'sun',
    description: 'Concentric rings of light pulsing outward',
    defaultSettings: { speed: 45, intensity: 85, density: 50, color: '#fde68a', secondaryColor: '#ffffff', glowColor: '#fff7d6', glowIntensity: 80, thickness: 24, ringCount: 4, pulseFrequency: 45, scale: 1 },
  },
  {
    id: 'vfx-divine-god-rays',
    name: 'God Rays',
    pack: 'divine',
    renderMode: 'atmospheric',
    icon: 'sun',
    description: 'A fan of radiant light shafts beaming from a point',
    defaultSettings: { speed: 25, intensity: 75, density: 50, color: '#fde9a8', secondaryColor: '#ffffff', glowColor: '#fff7d6', glowIntensity: 70, thickness: 40, direction: 160, spread: 60, scale: 1 },
  },
  {
    id: 'vfx-divine-blessing-circle',
    name: 'Blessing Circle',
    pack: 'divine',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'A radiant rune circle of protection and blessing',
    defaultSettings: { speed: 30, intensity: 90, density: 50, color: '#fde68a', secondaryColor: '#fff7d6', glowColor: '#fff7d6', glowIntensity: 80, thickness: 20, ringCount: 16, scale: 1 },
  },
  {
    id: 'vfx-divine-falling-golden-motes',
    name: 'Falling Golden Motes',
    pack: 'divine',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Soft golden flecks of light drifting gently down',
    defaultSettings: { speed: 35, intensity: 80, density: 55, color: '#fcd34d', secondaryColor: '#fff7d6', glowColor: '#fde68a', glowIntensity: 80, direction: 180, scale: 1 },
  },
  {
    id: 'vfx-divine-sacred-beam',
    name: 'Sacred Beam',
    pack: 'divine',
    renderMode: 'atmospheric',
    icon: 'sun',
    description: 'A wide column of holy light with a glowing core',
    defaultSettings: { speed: 30, intensity: 80, density: 50, color: '#fff7d6', secondaryColor: '#fde68a', glowColor: '#fff7d6', glowIntensity: 85, thickness: 55, direction: 90, pulseFrequency: 30, scale: 1 },
  },
  {
    id: 'vfx-divine-angelic-feather-drift',
    name: 'Angelic Feather Drift',
    pack: 'divine',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'Luminous feathers drifting and tumbling downward',
    defaultSettings: { speed: 30, intensity: 80, density: 45, color: '#ffffff', secondaryColor: '#fde68a', glowColor: '#fff7d6', glowIntensity: 75, direction: 185, turbulence: 40, scale: 1 },
  },

  // ===== VECTOR FX — LAVA (orange/red magma glow) =====
  {
    id: 'vfx-lava-flow-lines',
    name: 'Lava Flow Lines',
    pack: 'fire',
    renderMode: 'terrain',
    icon: 'flame',
    description: 'Glowing molten streaks flowing downhill along a direction',
    defaultSettings: { speed: 45, intensity: 85, density: 55, color: '#ffae42', secondaryColor: '#b91c1c', glowColor: '#ff5a1a', glowIntensity: 70, thickness: 35, direction: 180, turbulence: 40, scale: 1 },
  },
  {
    id: 'vfx-lava-magma-veins',
    name: 'Magma Veins',
    pack: 'fire',
    renderMode: 'terrain',
    icon: 'flame',
    description: 'A branching network of glowing molten cracks, breathing with heat',
    defaultSettings: { speed: 30, intensity: 85, density: 50, color: '#ff7a1a', secondaryColor: '#dc2626', glowColor: '#ff3a1a', glowIntensity: 80, thickness: 45, branching: 55, spread: 50, scale: 1 },
  },
  {
    id: 'vfx-lava-expanding-cracks',
    name: 'Expanding Lava Cracks',
    pack: 'fire',
    renderMode: 'terrain',
    icon: 'flame',
    description: 'Jagged cracks that grow outward, flare with heat, then loop',
    defaultSettings: { speed: 35, intensity: 85, density: 55, color: '#ff4500', secondaryColor: '#dc2626', glowColor: '#ff5a1a', glowIntensity: 80, thickness: 45, branching: 50, spread: 60, scale: 1 },
  },
  {
    id: 'vfx-lava-heat-distortion-rings',
    name: 'Heat Distortion Rings',
    pack: 'fire',
    renderMode: 'atmospheric',
    icon: 'flame',
    description: 'Wavy concentric rings shimmering with rising heat',
    defaultSettings: { speed: 40, intensity: 60, density: 50, color: '#ffae42', secondaryColor: '#ff7a1a', glowColor: '#ffae42', glowIntensity: 60, thickness: 25, ringCount: 4, turbulence: 60, scale: 1 },
  },
  {
    id: 'vfx-lava-pulse',
    name: 'Lava Pulse',
    pack: 'fire',
    renderMode: 'localized',
    icon: 'flame',
    description: 'A molten core pulsing with expanding shockwave rings',
    defaultSettings: { speed: 45, intensity: 85, density: 50, color: '#ff5a1a', secondaryColor: '#ffae42', glowColor: '#ff7a1a', glowIntensity: 85, thickness: 30, ringCount: 4, pulseFrequency: 45, scale: 1 },
  },
  {
    id: 'vfx-lava-ember-spiral',
    name: 'Ember Spiral',
    pack: 'fire',
    renderMode: 'localized',
    icon: 'flame',
    description: 'Spiraling arms carrying embers outward, additive glow',
    defaultSettings: { speed: 40, intensity: 85, density: 50, color: '#ff7a1a', secondaryColor: '#ffd166', glowColor: '#ff5a1a', glowIntensity: 80, thickness: 30, scale: 1 },
  },
  {
    id: 'vfx-lava-volcanic-warning-glow',
    name: 'Volcanic Warning Glow',
    pack: 'fire',
    renderMode: 'localized',
    icon: 'flame',
    description: 'A pulsing hazard glow ringed by a bold warning outline',
    defaultSettings: { speed: 35, intensity: 80, density: 50, color: '#ff3a1a', secondaryColor: '#ffae42', glowColor: '#ff5a1a', glowIntensity: 80, thickness: 40, pulseFrequency: 50, scale: 1 },
  },

  // ===== VECTOR FX — WATER (blue/cyan flow) =====
  {
    id: 'vfx-water-river-flow-lines',
    name: 'River Flow Lines',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'droplets',
    description: 'Cool highlight streaks flowing along a current',
    defaultSettings: { speed: 45, intensity: 70, density: 55, color: '#bae6fd', secondaryColor: '#38bdf8', glowColor: '#7dd3fc', glowIntensity: 50, thickness: 30, direction: 90, turbulence: 40, scale: 1 },
  },
  {
    id: 'vfx-water-whirlpool-spiral',
    name: 'Whirlpool Spiral',
    pack: 'water',
    renderMode: 'localized',
    icon: 'droplets',
    description: 'Swirling arms drawn inward toward a dark drain',
    defaultSettings: { speed: 45, intensity: 80, density: 50, color: '#7dd3fc', secondaryColor: '#38bdf8', glowColor: '#bae6fd', glowIntensity: 50, thickness: 30, scale: 1 },
  },
  {
    id: 'vfx-water-ripple-rings',
    name: 'Ripple Rings',
    pack: 'water',
    renderMode: 'localized',
    icon: 'droplets',
    description: 'Concentric ripples expanding outward across the surface',
    defaultSettings: { speed: 40, intensity: 70, density: 50, color: '#bae6fd', secondaryColor: '#7dd3fc', glowColor: '#7dd3fc', glowIntensity: 45, thickness: 25, ringCount: 4, scale: 1 },
  },
  {
    id: 'vfx-water-wave-lines',
    name: 'Wave Lines',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'Stacked sinusoidal swells scrolling across the surface',
    defaultSettings: { speed: 40, intensity: 70, density: 50, color: '#bae6fd', secondaryColor: '#38bdf8', glowColor: '#7dd3fc', glowIntensity: 40, thickness: 30, turbulence: 50, scale: 1 },
  },
  {
    id: 'vfx-water-rain-impact-rings',
    name: 'Rain Impact Rings',
    pack: 'water',
    renderMode: 'atmospheric',
    icon: 'droplets',
    description: 'Scattered ripple rings popping where raindrops land',
    defaultSettings: { speed: 55, intensity: 70, density: 55, color: '#bae6fd', secondaryColor: '#7dd3fc', glowColor: '#7dd3fc', glowIntensity: 40, thickness: 25, scale: 1 },
  },
  {
    id: 'vfx-water-waterfall-flow-streaks',
    name: 'Waterfall Flow Streaks',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'droplets',
    description: 'Fast vertical foam streaks cascading downward',
    defaultSettings: { speed: 65, intensity: 75, density: 60, color: '#e0f2fe', secondaryColor: '#7dd3fc', glowColor: '#bae6fd', glowIntensity: 45, thickness: 30, direction: 180, turbulence: 25, scale: 1 },
  },
  {
    id: 'vfx-water-underwater-caustic-lines',
    name: 'Underwater Caustic Lines',
    pack: 'water',
    renderMode: 'terrain',
    icon: 'waves',
    description: 'A rippling web of underwater light filaments',
    defaultSettings: { speed: 45, intensity: 75, density: 50, color: '#7dd3fc', secondaryColor: '#e0f2fe', glowColor: '#bae6fd', glowIntensity: 60, thickness: 25, turbulence: 50, scale: 1 },
  },

  // ===== VECTOR FX — WIND (pale blue/white streaks) =====
  {
    id: 'vfx-wind-gust-lines',
    name: 'Gust Lines',
    pack: 'air',
    renderMode: 'atmospheric',
    icon: 'wind',
    description: 'Long pale streaks blowing across in a direction',
    defaultSettings: { speed: 55, intensity: 65, density: 45, color: '#e0f2fe', secondaryColor: '#bae6fd', glowColor: '#bae6fd', glowIntensity: 40, thickness: 25, direction: 90, turbulence: 30, scale: 1 },
  },
  {
    id: 'vfx-wind-swirling-wind',
    name: 'Swirling Wind',
    pack: 'air',
    renderMode: 'localized',
    icon: 'wind',
    description: 'Open curling spiral arms — a slow vortex of air',
    defaultSettings: { speed: 45, intensity: 65, density: 40, color: '#e0f2fe', secondaryColor: '#bae6fd', glowColor: '#bae6fd', glowIntensity: 40, thickness: 25, scale: 1 },
  },
  {
    id: 'vfx-wind-tornado-spiral',
    name: 'Tornado Spiral',
    pack: 'air',
    renderMode: 'localized',
    icon: 'wind',
    description: 'A rotating funnel of stacked rings and spiraling strands',
    defaultSettings: { speed: 55, intensity: 70, density: 45, color: '#cbd5e1', secondaryColor: '#94a3b8', glowColor: '#e0f2fe', glowIntensity: 35, thickness: 25, turbulence: 40, scale: 1 },
  },
  {
    id: 'vfx-wind-directional-field',
    name: 'Directional Wind Field',
    pack: 'air',
    renderMode: 'atmospheric',
    icon: 'wind',
    description: 'Dense uniform streamlines flowing one direction',
    defaultSettings: { speed: 50, intensity: 60, density: 55, color: '#e0f2fe', secondaryColor: '#bae6fd', glowColor: '#bae6fd', glowIntensity: 35, thickness: 20, direction: 90, turbulence: 15, scale: 1 },
  },
  {
    id: 'vfx-wind-leaf-drift-path',
    name: 'Leaf Drift Path',
    pack: 'air',
    renderMode: 'atmospheric',
    icon: 'wind',
    description: 'Leaves carried on the wind, tumbling along a direction',
    defaultSettings: { speed: 40, intensity: 80, density: 40, color: '#a3b18a', secondaryColor: '#c2410c', glowColor: '#84cc16', glowIntensity: 20, direction: 135, turbulence: 50, scale: 1 },
  },
  {
    id: 'vfx-wind-smoke-curl-lines',
    name: 'Smoke Curl Lines',
    pack: 'air',
    renderMode: 'atmospheric',
    icon: 'wind',
    description: 'Soft curling wisps meandering upward',
    defaultSettings: { speed: 35, intensity: 55, density: 45, color: '#cbd5e1', secondaryColor: '#94a3b8', glowColor: '#cbd5e1', glowIntensity: 30, thickness: 35, direction: 0, turbulence: 70, scale: 1 },
  },
  {
    id: 'vfx-wind-blizzard-wind-streaks',
    name: 'Blizzard Wind Streaks',
    pack: 'air',
    renderMode: 'atmospheric',
    icon: 'wind',
    description: 'Fast, dense pale streaks driving across the scene',
    defaultSettings: { speed: 70, intensity: 70, density: 60, color: '#ffffff', secondaryColor: '#e0f2fe', glowColor: '#e0f2fe', glowIntensity: 35, thickness: 18, direction: 110, turbulence: 25, scale: 1 },
  },

  // ===== VECTOR FX — MAGIC (purple/blue arcane energy) =====
  {
    id: 'vfx-magic-arcane-circle',
    name: 'Arcane Circle',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'A full magic circle: rings, ticks and counter-rotating runes',
    defaultSettings: { speed: 35, intensity: 90, density: 50, color: '#c084fc', secondaryColor: '#a855f7', glowColor: '#d8b4fe', glowIntensity: 80, thickness: 30, ringCount: 16, scale: 1 },
  },
  {
    id: 'vfx-magic-rotating-rune-ring',
    name: 'Rotating Rune Ring',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'A single ring of runes spinning slowly',
    defaultSettings: { speed: 40, intensity: 90, density: 50, color: '#c084fc', secondaryColor: '#a855f7', glowColor: '#d8b4fe', glowIntensity: 80, thickness: 30, ringCount: 14, scale: 1 },
  },
  {
    id: 'vfx-magic-mana-stream',
    name: 'Mana Stream',
    pack: 'magic',
    renderMode: 'terrain',
    icon: 'sparkles',
    description: 'Arcane energy flowing along a direction, additive glow',
    defaultSettings: { speed: 50, intensity: 80, density: 55, color: '#c084fc', secondaryColor: '#60a5fa', glowColor: '#d8b4fe', glowIntensity: 70, thickness: 30, direction: 90, turbulence: 45, scale: 1 },
  },
  {
    id: 'vfx-magic-portal-spiral',
    name: 'Portal Spiral',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'Energetic spiral arms with a glowing rim and dark core',
    defaultSettings: { speed: 50, intensity: 90, density: 50, color: '#c084fc', secondaryColor: '#d8b4fe', glowColor: '#d8b4fe', glowIntensity: 85, thickness: 30, scale: 1 },
  },
  {
    id: 'vfx-magic-spell-targeting-circle',
    name: 'Spell Targeting Circle',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'A rotating targeting reticle locking on a point',
    defaultSettings: { speed: 45, intensity: 85, density: 50, color: '#60a5fa', secondaryColor: '#c084fc', glowColor: '#93c5fd', glowIntensity: 70, thickness: 30, scale: 1 },
  },
  {
    id: 'vfx-magic-leyline-current',
    name: 'Leyline Current',
    pack: 'magic',
    renderMode: 'terrain',
    icon: 'sparkles',
    description: 'A branching network of glowing ley lines pulsing with energy',
    defaultSettings: { speed: 30, intensity: 85, density: 50, color: '#a855f7', secondaryColor: '#60a5fa', glowColor: '#d8b4fe', glowIntensity: 75, thickness: 35, branching: 50, spread: 45, scale: 1 },
  },
  {
    id: 'vfx-magic-energy-beam',
    name: 'Energy Beam',
    pack: 'magic',
    renderMode: 'atmospheric',
    icon: 'sparkles',
    description: 'A bright directional energy beam with a pulsing core',
    defaultSettings: { speed: 40, intensity: 90, density: 50, color: '#d8b4fe', secondaryColor: '#a855f7', glowColor: '#c084fc', glowIntensity: 85, thickness: 35, direction: 90, pulseFrequency: 40, scale: 1 },
  },

  // ===== VECTOR FX — NECROTIC (black/green/purple corruption) =====
  {
    id: 'vfx-necrotic-shadow-tendrils',
    name: 'Shadow Tendrils',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'skull',
    description: 'Writhing dark tendrils grasping outward',
    defaultSettings: { speed: 35, intensity: 80, density: 50, color: '#7c3aed', secondaryColor: '#4c1d95', glowColor: '#6d28d9', glowIntensity: 60, thickness: 35, turbulence: 60, scale: 1 },
  },
  {
    id: 'vfx-necrotic-corruption-veins',
    name: 'Corruption Veins',
    pack: 'necrotic',
    renderMode: 'terrain',
    icon: 'skull',
    description: 'Spreading sickly veins breathing with decay',
    defaultSettings: { speed: 25, intensity: 80, density: 50, color: '#84cc16', secondaryColor: '#4d7c0f', glowColor: '#a3e635', glowIntensity: 70, thickness: 40, branching: 60, spread: 55, scale: 1 },
  },
  {
    id: 'vfx-necrotic-soul-wisps',
    name: 'Soul Wisps',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'skull',
    description: 'Pale spirit lights rising and fading',
    defaultSettings: { speed: 30, intensity: 75, density: 45, color: '#bbf7d0', secondaryColor: '#86efac', glowColor: '#bbf7d0', glowIntensity: 80, direction: 0, turbulence: 50, scale: 1 },
  },
  {
    id: 'vfx-necrotic-pulse',
    name: 'Necrotic Pulse',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'skull',
    description: 'Sickly shockwave rings expanding outward',
    defaultSettings: { speed: 40, intensity: 80, density: 50, color: '#84cc16', secondaryColor: '#a3e635', glowColor: '#84cc16', glowIntensity: 75, thickness: 30, ringCount: 4, pulseFrequency: 45, scale: 1 },
  },
  {
    id: 'vfx-necrotic-black-mist-curl',
    name: 'Black Mist Curl',
    pack: 'necrotic',
    renderMode: 'atmospheric',
    icon: 'skull',
    description: 'Murky curls of decay drifting upward',
    defaultSettings: { speed: 30, intensity: 60, density: 45, color: '#3f3f46', secondaryColor: '#365314', glowColor: '#3f3f46', glowIntensity: 10, thickness: 40, direction: 0, turbulence: 70, scale: 1 },
  },
  {
    id: 'vfx-necrotic-draining-life-spiral',
    name: 'Draining Life Spiral',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'skull',
    description: 'A vortex pulling life energy inward',
    defaultSettings: { speed: 45, intensity: 80, density: 50, color: '#a3e635', secondaryColor: '#65a30d', glowColor: '#bbf7d0', glowIntensity: 70, thickness: 28, scale: 1 },
  },
  {
    id: 'vfx-necrotic-cursed-rune-ring',
    name: 'Cursed Rune Ring',
    pack: 'necrotic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'A baleful rune circle of curse-light',
    defaultSettings: { speed: 30, intensity: 85, density: 50, color: '#a3e635', secondaryColor: '#7c3aed', glowColor: '#84cc16', glowIntensity: 75, thickness: 28, ringCount: 14, scale: 1 },
  },

  // ===== VECTOR FX — DUNGEON (gray/white dust and cracks) =====
  {
    id: 'vfx-dungeon-dust-motes-path',
    name: 'Dust Motes Path',
    pack: 'earth',
    renderMode: 'atmospheric',
    icon: 'sparkle',
    description: 'Fine dust drifting slowly through stale air',
    defaultSettings: { speed: 25, intensity: 55, density: 50, color: '#cbd5e1', secondaryColor: '#94a3b8', glowColor: '#e2e8f0', glowIntensity: 30, direction: 135, turbulence: 40, scale: 1 },
  },
  {
    id: 'vfx-dungeon-cracking-floor-lines',
    name: 'Cracking Floor Lines',
    pack: 'earth',
    renderMode: 'terrain',
    icon: 'gem',
    description: 'Jagged stone cracks spreading across the floor',
    defaultSettings: { speed: 30, intensity: 70, density: 55, color: '#94a3b8', secondaryColor: '#64748b', glowColor: '#cbd5e1', glowIntensity: 15, thickness: 40, branching: 55, spread: 60, scale: 1 },
  },
  {
    id: 'vfx-dungeon-trap-warning-glyph',
    name: 'Trap Warning Glyph',
    pack: 'earth',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'A pulsing warning reticle marking a hidden trap',
    defaultSettings: { speed: 45, intensity: 85, density: 50, color: '#f87171', secondaryColor: '#fbbf24', glowColor: '#f87171', glowIntensity: 70, thickness: 30, scale: 1 },
  },
  {
    id: 'vfx-dungeon-dripping-water-rings',
    name: 'Dripping Water Rings',
    pack: 'water',
    renderMode: 'atmospheric',
    icon: 'droplets',
    description: 'Slow sparse ripples where water drips from above',
    defaultSettings: { speed: 30, intensity: 65, density: 35, color: '#bae6fd', secondaryColor: '#7dd3fc', glowColor: '#bae6fd', glowIntensity: 35, thickness: 25, scale: 1 },
  },
  {
    id: 'vfx-dungeon-spider-web-growth',
    name: 'Spider Web Growth',
    pack: 'earth',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'An orb web spinning out across a corner',
    defaultSettings: { speed: 35, intensity: 65, density: 50, color: '#e2e8f0', secondaryColor: '#cbd5e1', glowColor: '#f8fafc', glowIntensity: 20, thickness: 25, turbulence: 30, scale: 1 },
  },
  {
    id: 'vfx-dungeon-falling-debris-lines',
    name: 'Falling Debris Lines',
    pack: 'earth',
    renderMode: 'atmospheric',
    icon: 'gem',
    description: 'Bits of rubble and grit streaking down',
    defaultSettings: { speed: 55, intensity: 65, density: 50, color: '#a8a29e', secondaryColor: '#78716c', glowColor: '#d6d3d1', glowIntensity: 10, direction: 180, turbulence: 30, scale: 1 },
  },
  {
    id: 'vfx-dungeon-ancient-rune-glow',
    name: 'Ancient Rune Glow',
    pack: 'magic',
    renderMode: 'localized',
    icon: 'circle-dot',
    description: 'A faint, slowly pulsing rune ring carved in stone',
    defaultSettings: { speed: 20, intensity: 75, density: 50, color: '#fbbf24', secondaryColor: '#f59e0b', glowColor: '#fcd34d', glowIntensity: 70, thickness: 25, ringCount: 12, pulseFrequency: 25, scale: 1 },
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

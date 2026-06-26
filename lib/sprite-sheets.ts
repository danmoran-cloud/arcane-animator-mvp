// Shared sprite-sheet geometry — single source of truth for both the editor
// preview (components/editor/premium-effects.tsx) and the export renderer
// (components/editor/export-modal.tsx).
//
// These sheets are AI-generated and do NOT share a uniform grid: column and
// row counts vary per sheet (and the cell pitch is often fractional on a
// 1024px sheet). The grids below were measured per sheet. Using the wrong
// grid makes the animation pan/slide across the cell instead of playing in
// place — keep these in sync with the actual PNGs.

export interface SpriteSheet {
  url: string
  cols: number
  rows: number
  frames: number
  /** Compositing mode for the sprite layer. Default 'normal'. */
  blend?: 'normal' | 'screen'
  /** Ambient color glow drawn behind the sprite. Default true. */
  glow?: boolean
  /** Radial color tint wash over the layer (e.g. underwater caustics). Default false. */
  tint?: boolean
  /** Frame rate at speed=100; actual fps scales with the speed setting. Default 16. */
  fps?: number
}

export const SPRITE_SHEETS: Record<string, SpriteSheet> = {
  // ===== Magic Effects (1024x1024, transparent alpha) =====

  // ===== Light Source Effects (1024x1024, transparent alpha) =====
  'lightsource-wall-torch': { url: '/effects/light-source/wall-torch.png', cols: 5, rows: 4, frames: 20 },
  'lightsource-ornate-lantern': { url: '/effects/light-source/ornate-lantern.png', cols: 5, rows: 4, frames: 20 },
  'lightsource-iron-lantern': { url: '/effects/light-source/iron-lantern.png', cols: 5, rows: 4, frames: 20 },
  'lightsource-hanging-lantern': { url: '/effects/light-source/hanging-lantern.png', cols: 5, rows: 4, frames: 20 },
  'lightsource-carriage-lantern': { url: '/effects/light-source/carriage-lantern.png', cols: 5, rows: 4, frames: 20 },
  'lightsource-campfire': { url: '/effects/light-source/campfire.png', cols: 5, rows: 5, frames: 25 },
  'lightsource-candle': { url: '/effects/light-source/candle.png', cols: 5, rows: 4, frames: 20 },
  'lightsource-fire-brazier': { url: '/effects/light-source/fire-brazier.png', cols: 5, rows: 4, frames: 20 },
  'lightsource-rune-light-circle': { url: '/effects/light-source/rune-light-circle.png', cols: 4, rows: 4, frames: 16 },
  'lightsource-pendant-light': { url: '/effects/light-source/pendant-light.png', cols: 5, rows: 4, frames: 20 },
  // glowing-orb, sparkler-burst, radiant-starburst, soft-star-glow, sparkle-starburst
  // are now procedural particle systems (see lib/effects/particle-renderer.ts).

  // ===== Light Source Revised Effects (640x768, 128px cells = uniform 5x6) =====
  'lsr-torch': { url: '/effects/light-source-revised/torch.png', cols: 5, rows: 6, frames: 30 },
  'lsr-fire-glow': { url: '/effects/light-source-revised/fire-glow.png', cols: 5, rows: 6, frames: 30 },
  'lsr-fire-bowl': { url: '/effects/light-source-revised/fire-bowl.png', cols: 5, rows: 6, frames: 30 },
  'lsr-carriage-lantern': { url: '/effects/light-source-revised/carriage-lantern.png', cols: 5, rows: 6, frames: 30 },
  'lsr-hanging-lantern': { url: '/effects/light-source-revised/hanging-lantern.png', cols: 5, rows: 6, frames: 30 },
  'lsr-candle': { url: '/effects/light-source-revised/candle.png', cols: 5, rows: 6, frames: 30 },
  'lsr-glowing-orb': { url: '/effects/light-source-revised/glowing-orb.png', cols: 5, rows: 6, frames: 30 },
  'lsr-campfire': { url: '/effects/light-source-revised/campfire.png', cols: 5, rows: 6, frames: 30 },
  'lsr-sparkles': { url: '/effects/light-source-revised/sparkles.png', cols: 5, rows: 6, frames: 30 },
  'lsr-fire-brazier': { url: '/effects/light-source-revised/fire-brazier.png', cols: 5, rows: 6, frames: 30 },
  'lsr-blue-flame': { url: '/effects/light-source-revised/blue-flame.png', cols: 5, rows: 6, frames: 30 },
  'lsr-green-flame': { url: '/effects/light-source-revised/green-flame.png', cols: 5, rows: 6, frames: 30 },
  'lsr-starburst': { url: '/effects/light-source-revised/starburst.png', cols: 5, rows: 6, frames: 30 },
  'lsr-arcane-circle': { url: '/effects/light-source-revised/arcane-circle.png', cols: 5, rows: 6, frames: 30 },
  'lsr-smoke': { url: '/effects/light-source-revised/smoke.png', cols: 5, rows: 6, frames: 30 },

  // ===== Subterranean Effects (1024x1024, transparent alpha) =====
  'subterranean-cave-drips': { url: '/effects/subterranean/cave-drips.png', cols: 4, rows: 6, frames: 24 },
  'subterranean-stalactite-seep': { url: '/effects/subterranean/stalactite-seep.png', cols: 6, rows: 4, frames: 24 },
  'subterranean-underground-stream': { url: '/effects/subterranean/underground-stream.png', cols: 4, rows: 6, frames: 24 },
  'subterranean-crystal-pulse': { url: '/effects/subterranean/crystal-pulse.png', cols: 5, rows: 4, frames: 20 },
  'subterranean-bioluminescent-spores': { url: '/effects/subterranean/bioluminescent-spores.png', cols: 5, rows: 4, frames: 20 },
  'subterranean-glowing-mushroom-aura': { url: '/effects/subterranean/glowing-mushroom-aura.png', cols: 5, rows: 5, frames: 25 },
  'subterranean-bat-swarm': { url: '/effects/subterranean/bat-swarm-silhouettes.png', cols: 5, rows: 6, frames: 30 },
  'subterranean-pebble-collapse': { url: '/effects/subterranean/pebble-collapse.png', cols: 4, rows: 5, frames: 20 },
  'subterranean-arcane-cave-energy': { url: '/effects/subterranean/arcane-cave-energy.png', cols: 5, rows: 5, frames: 25 },
  'subterranean-ambient': { url: '/effects/subterranean/subterranean-ambient.png', cols: 4, rows: 4, frames: 16 },

  // ===== Cemetery Effects (1024x1024, transparent alpha) =====
  'cemetery-will-o-wisps': { url: '/effects/cemetery/ghostly-will-o-wisps.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-soul-spirits': { url: '/effects/cemetery/soul-spirits.png', cols: 5, rows: 4, frames: 20 },
  'cemetery-necrotic-aura': { url: '/effects/cemetery/necrotic-aura.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-blood-petals': { url: '/effects/cemetery/blood-petals.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-haunted-lantern': { url: '/effects/cemetery/haunted-lantern-light.png', cols: 4, rows: 5, frames: 20 },
  'cemetery-cracked-stone-rise': { url: '/effects/cemetery/cracked-stone-rise.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-skeletal-remains': { url: '/effects/cemetery/skeletal-remains-shift.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-dark-ritual-circle': { url: '/effects/cemetery/dark-ritual-circle.png', cols: 4, rows: 5, frames: 20 },
  'cemetery-coffin-burst': { url: '/effects/cemetery/coffin-burst.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-moonbeam-trees': { url: '/effects/cemetery/moonbeam-through-trees.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-draining-life-vortex': { url: '/effects/cemetery/draining-life-vortex.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-candle-flame': { url: '/effects/cemetery/candle-flame-flicker.png', cols: 5, rows: 4, frames: 20 },
  'cemetery-bats-in-flight': { url: '/effects/cemetery/bats-in-flight.png', cols: 5, rows: 6, frames: 30 },

  // ===== Launch Effects (5x6=30, glow + sprite) =====
  'launch-torch-light': { url: '/effects/launch/torch-light.png', cols: 5, rows: 6, frames: 30 },
  'launch-lantern-glow': { url: '/effects/launch/lantern-glow.png', cols: 5, rows: 6, frames: 30 },
  'launch-campfire': { url: '/effects/launch/campfire-blaze.png', cols: 5, rows: 6, frames: 30 },
  'launch-running-water': { url: '/effects/launch/running-water.png', cols: 5, rows: 6, frames: 30 },
  'launch-arcane-runes': { url: '/effects/launch/arcane-runes.png', cols: 5, rows: 6, frames: 30 },
  'launch-portal': { url: '/effects/launch/portal-vortex.png', cols: 5, rows: 6, frames: 30 },
  'launch-lightning': { url: '/effects/launch/lightning-strike.png', cols: 5, rows: 6, frames: 30 },
  'launch-divine-light': { url: '/effects/launch/divine-light.png', cols: 5, rows: 6, frames: 30 },
  'launch-necrotic-corruption': { url: '/effects/launch/necrotic-corruption.png', cols: 5, rows: 6, frames: 30 },
  'launch-ghost-apparition': { url: '/effects/launch/ghost-apparition.png', cols: 5, rows: 6, frames: 30 },

  // ===== Rain Effects (8x3=24, plain sprite, no glow, faster cadence) =====

  // ===== Caustics (5x5=25, screen-blended light + tint wash, no color glow) =====
  'caustics-shallow-clear': { url: '/effects/caustics/shallow-clear.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-deep-blue': { url: '/effects/caustics/deep-blue.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-tropical-shallow': { url: '/effects/caustics/tropical-shallow.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-soft-sand': { url: '/effects/caustics/soft-sand.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-rocky-bottom': { url: '/effects/caustics/rocky-bottom.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-fast-moving': { url: '/effects/caustics/fast-moving.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-slow-gentle': { url: '/effects/caustics/slow-gentle.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-blue-green': { url: '/effects/caustics/blue-green.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-sunlit-deep': { url: '/effects/caustics/sunlit-deep.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-murky-water': { url: '/effects/caustics/murky-water.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-cave-water': { url: '/effects/caustics/cave-water.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-kelp-forest': { url: '/effects/caustics/kelp-forest.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-rippling-sand': { url: '/effects/caustics/rippling-sand.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-wavy-surface': { url: '/effects/caustics/wavy-surface.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },
  'caustics-magic-glow': { url: '/effects/caustics/magic-glow.png', cols: 5, rows: 5, frames: 25, glow: false, tint: true, blend: 'screen', fps: 12 },

  // ===== New Effects (10x6=60, script-managed by scripts/add-effect.mjs) =====
  // NEW_SHEETS_START
  'new-fire-torch': { url: '/effects/new/new-fire-torch.png', cols: 10, rows: 6, frames: 60, glow: false, fps: 20, blend: 'screen' },
  // NEW_SHEETS_END

  // ===== Blob-hosted single effects (Core torch flame + portal gateways) =====
  'torch-2': { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fire1_64-kpuvZ5egbmbnm855kp1iCwuhNz9LAZ.png', cols: 10, rows: 6, frames: 60, blend: 'screen', fps: 24 },
  'blue-portal': { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Effect95-NLQsM059PmMoiyKgtrIJzfzdTZPNaP.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
  'fire-portal': { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Explosion21-a4r8cvpEimrFAY0R7JQtNKmhl57tll.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
}

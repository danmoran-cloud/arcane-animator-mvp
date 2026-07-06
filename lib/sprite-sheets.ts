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
  'lightsource-pendant-light': { url: '/effects/light-source/pendant-light.png', cols: 5, rows: 4, frames: 20 },
  // glowing-orb, sparkler-burst, radiant-starburst, soft-star-glow, sparkle-starburst
  // are now procedural particle systems (see lib/effects/particle-renderer.ts).

  // ===== Light Source Revised Effects (640x768, 128px cells = uniform 5x6) =====
  'lsr-smoke': { url: '/effects/light-source-revised/smoke.png', cols: 5, rows: 6, frames: 30 },

  // ===== Subterranean Effects (1024x1024, transparent alpha) =====
  'subterranean-underground-stream': { url: '/effects/subterranean/underground-stream.png', cols: 4, rows: 6, frames: 24 },
  'subterranean-bioluminescent-spores': { url: '/effects/subterranean/bioluminescent-spores.png', cols: 5, rows: 4, frames: 20 },
  'subterranean-glowing-mushroom-aura': { url: '/effects/subterranean/glowing-mushroom-aura.png', cols: 5, rows: 5, frames: 25 },
  'subterranean-bat-swarm': { url: '/effects/subterranean/bat-swarm-silhouettes.png', cols: 5, rows: 6, frames: 30 },
  'subterranean-arcane-cave-energy': { url: '/effects/subterranean/arcane-cave-energy.png', cols: 5, rows: 5, frames: 25 },
  'subterranean-ambient': { url: '/effects/subterranean/subterranean-ambient.png', cols: 4, rows: 4, frames: 16 },

  // ===== Cemetery Effects (1024x1024, transparent alpha) =====
  'cemetery-will-o-wisps': { url: '/effects/cemetery/ghostly-will-o-wisps.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-soul-spirits': { url: '/effects/cemetery/soul-spirits.png', cols: 5, rows: 4, frames: 20 },
  'cemetery-necrotic-aura': { url: '/effects/cemetery/necrotic-aura.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-blood-petals': { url: '/effects/cemetery/blood-petals.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-moonbeam-trees': { url: '/effects/cemetery/moonbeam-through-trees.png', cols: 5, rows: 5, frames: 25 },
  'cemetery-draining-life-vortex': { url: '/effects/cemetery/draining-life-vortex.png', cols: 5, rows: 5, frames: 25 },

  // ===== Launch Effects (5x6=30, glow + sprite) =====
  'launch-torch-light': { url: '/effects/launch/torch-light.png', cols: 5, rows: 6, frames: 30 },
  'launch-lantern-glow': { url: '/effects/launch/lantern-glow.png', cols: 5, rows: 6, frames: 30 },
  'launch-campfire': { url: '/effects/launch/campfire-blaze.png', cols: 5, rows: 6, frames: 30 },
  'launch-running-water': { url: '/effects/launch/running-water.png', cols: 5, rows: 6, frames: 30 },
  'launch-portal': { url: '/effects/launch/portal-vortex.png', cols: 5, rows: 6, frames: 30 },
  'launch-lightning': { url: '/effects/launch/lightning-strike.png', cols: 5, rows: 6, frames: 30 },
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
  // NEW_SHEETS_END

  // ===== Blob-hosted single effects (Core torch flame + portal gateways) =====
  'torch-2': { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fire1_64-kpuvZ5egbmbnm855kp1iCwuhNz9LAZ.png', cols: 10, rows: 6, frames: 60, blend: 'screen', fps: 24 },
  'blue-portal': { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Effect95-NLQsM059PmMoiyKgtrIJzfzdTZPNaP.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
  'fire-portal': { url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Explosion21-a4r8cvpEimrFAY0R7JQtNKmhl57tll.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
  'camp-fire': { url: '/effects/new/camp-fire.png', cols: 10, rows: 6, frames: 60 },
  'lava-bubbles': { url: '/effects/new/lava-flow-bubbles.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
  'lava-burst': { url: '/effects/new/lava-flow-burst.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
  'lava-cracks': { url: '/effects/new/lava-flow-crack-patterns.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
  'lava-current': { url: '/effects/new/lava-flow-current.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
  'lava-slow': { url: '/effects/new/lava-flow-slow.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
  'lava-whirlpool': { url: '/effects/new/lava-flow-whirlpool.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
  'lava-splashes': { url: '/effects/new/lava-splashes.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
  'lava-vents': { url: '/effects/new/lava-vents.png', cols: 4, rows: 4, frames: 16, blend: 'screen' },
  'lantern-iron': { url: '/effects/new/lantern-iron.png', cols: 5, rows: 6, frames: 30 },
  'lantern-slim': { url: '/effects/new/lantern-slim.png', cols: 5, rows: 6, frames: 30 },
  'lantern-brass': { url: '/effects/new/lantern-brass.png', cols: 5, rows: 6, frames: 30 },
  'lantern-hanging': { url: '/effects/new/lantern-hanging.png', cols: 7, rows: 6, frames: 42 },
  'campfire-glow': { url: '/effects/new/campfire-glow.png', cols: 5, rows: 6, frames: 30 },
  'bonfire-burst': { url: '/effects/new/bonfire-burst.png', cols: 5, rows: 6, frames: 30 },
  'candle-flame': { url: '/effects/new/candle-flame.png', cols: 5, rows: 6, frames: 30 },
  'orb-glow': { url: '/effects/new/orb-glow.png', cols: 5, rows: 6, frames: 30 },
  'brazier-fire': { url: '/effects/new/brazier-fire.png', cols: 7, rows: 6, frames: 42 },
  'magic-circle-glow': { url: '/effects/new/magic-circle-glow.png', cols: 5, rows: 6, frames: 30 },
  'sparkle-twinkle': { url: '/effects/new/sparkle-twinkle.png', cols: 5, rows: 6, frames: 30 },
  'starburst-flare': { url: '/effects/new/starburst-flare.png', cols: 5, rows: 6, frames: 30 },
  'starburst-flare-bright': { url: '/effects/new/starburst-flare-bright.png', cols: 5, rows: 6, frames: 30 },
  'sparkle-burst-radiant': { url: '/effects/new/sparkle-burst-radiant.png', cols: 7, rows: 6, frames: 42 },
}

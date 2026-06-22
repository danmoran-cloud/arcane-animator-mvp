'use client'

import { useMemo, useState, useEffect } from 'react'
import { getEffectById, type EffectSettings } from '@/lib/effects-library'

// Drives sprite sheet animation via setInterval instead of CSS keyframes.
// CSS background-position keyframes with steps(1) cause visual jumping in some
// browsers due to interpolation artifacts. JS-driven frame advance is reliable.
function useSpriteFrame(totalFrames: number, fps: number): number {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % totalFrames)
    }, 1000 / Math.max(fps, 1))
    return () => clearInterval(interval)
  }, [totalFrames, fps])
  return frame
}

function spritePosition(frame: number, columns: number, rows: number) {
  const col = frame % columns
  const row = Math.floor(frame / columns)
  const posX = columns > 1 ? (col / (columns - 1)) * 100 : 0
  const posY = rows > 1 ? (row / (rows - 1)) * 100 : 0
  return `${posX.toFixed(3)}% ${posY.toFixed(3)}%`
}

interface PremiumEffectRendererProps {
  effectId: string
  settings?: Partial<EffectSettings>
  width: number
  height: number
}

// Rain effect - TOP DOWN: ripples/splashes on ground surface
function RainEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const ripples = useMemo(() => {
    const count = Math.floor((settings.density / 100) * 40) + 15
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.8 + Math.random() * 0.4,
      size: 8 + Math.random() * 12,
    }))
  }, [settings.density])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes rain-ripple {
          0% { transform: scale(0); opacity: 0.7; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full border"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
            width: ripple.size,
            height: ripple.size,
            marginLeft: -ripple.size / 2,
            marginTop: -ripple.size / 2,
            borderColor: settings.color,
            animation: `rain-ripple ${ripple.duration * (100 / settings.speed)}s ease-out infinite`,
            animationDelay: `${ripple.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Snow effect - TOP DOWN: accumulating flakes on ground
function SnowEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const flakes = useMemo(() => {
    const count = Math.floor((settings.density / 100) * 50) + 20
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      size: 3 + Math.random() * 5,
      duration: 2 + Math.random() * 2,
    }))
  }, [settings.density])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes snow-settle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1); }
        }
      `}</style>
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full"
          style={{
            left: `${flake.x}%`,
            top: `${flake.y}%`,
            width: flake.size,
            height: flake.size,
            backgroundColor: settings.color,
            animation: `snow-settle ${flake.duration * (100 / settings.speed)}s ease-in-out infinite`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Fog effect - TOP DOWN: swirling fog patches from above
function FogEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const patches = useMemo(() => [
    { x: 20, y: 30, size: 60, speed: 1, opacity: 0.4 },
    { x: 60, y: 50, size: 80, speed: 0.7, opacity: 0.3 },
    { x: 40, y: 70, size: 70, speed: 1.2, opacity: 0.35 },
  ], [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes fog-drift-topdown {
          0%, 100% { transform: translate(-5%, -5%) scale(1); }
          33% { transform: translate(5%, 3%) scale(1.1); }
          66% { transform: translate(-3%, 5%) scale(0.95); }
        }
      `}</style>
      {patches.map((patch, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${patch.x}%`,
            top: `${patch.y}%`,
            width: `${patch.size}%`,
            height: `${patch.size}%`,
            background: `radial-gradient(circle, ${settings.color} 0%, transparent 70%)`,
            opacity: patch.opacity * (settings.intensity / 100),
            animation: `fog-drift-topdown ${15 / patch.speed * (100 / settings.speed)}s ease-in-out infinite`,
            animationDelay: `${i * 3}s`,
            filter: 'blur(20px)',
          }}
        />
      ))}
    </div>
  )
}

// Torch effect - TOP DOWN: radial light halo on ground
function TorchEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes torch-light-flicker {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          20% { opacity: 0.9; transform: scale(1.03); }
          40% { opacity: 0.65; transform: scale(0.98); }
          60% { opacity: 0.85; transform: scale(1.02); }
          80% { opacity: 0.75; transform: scale(0.99); }
        }
      `}</style>
      
      {/* Outer ambient glow */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle, ${settings.color}30 0%, transparent 70%)`,
          animation: `torch-light-flicker ${0.5 * (100 / (settings.flickerRate || 70))}s ease-in-out infinite`,
        }}
      />
      
      {/* Main light radius */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '70%',
          height: '70%',
          background: `radial-gradient(circle, ${settings.color}60 0%, ${settings.color}30 40%, transparent 70%)`,
          animation: `torch-light-flicker ${0.3 * (100 / (settings.flickerRate || 70))}s ease-in-out infinite`,
        }}
      />
      
      {/* Bright center (torch position) */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '15%',
          height: '15%',
          background: `radial-gradient(circle, ${settings.secondaryColor || '#ffcc00'}, ${settings.color})`,
          boxShadow: `0 0 ${settings.glowIntensity ? settings.glowIntensity / 3 : 20}px ${settings.color}`,
          animation: `torch-light-flicker ${0.2 * (100 / (settings.flickerRate || 70))}s ease-in-out infinite alternate`,
        }}
      />
    </div>
  )
}

// Torch 2 effect - Animated sprite sheet flame
// Sprite: 60 frames, 64x64 each, 10 columns x 6 rows
function Torch2Effect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const spriteUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fire1_64-kpuvZ5egbmbnm855kp1iCwuhNz9LAZ.png'
  const columns = 10
  const rows = 6
  const totalFrames = 60
  const fps = (settings.speed || 50) / 100 * 24
  const glowDuration = (100 / (settings.speed || 50)) * 2
  const frame = useSpriteFrame(totalFrames, fps)
  const bgSize = `${columns * 100}% ${rows * 100}%`

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes torch2-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>

      {/* Ambient glow beneath */}
      <div
        className="absolute rounded-full"
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle, ${settings.color}40 0%, transparent 70%)`,
          animation: `torch2-glow ${glowDuration / 2}s ease-in-out infinite`,
        }}
      />

      {/* Animated flame sprite */}
      <div
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: bgSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: spritePosition(frame, columns, rows),
          mixBlendMode: 'screen',
          imageRendering: 'pixelated',
        }}
      />
      
      {/* Additional glow around flame */}
      <div
        className="absolute rounded-full"
        style={{
          width: '50%',
          height: '50%',
          background: `radial-gradient(circle, ${settings.color}50 0%, transparent 70%)`,
          animation: `torch2-glow ${glowDuration / 3}s ease-in-out infinite`,
        }}
      />
    </div>
  )
}

// Blue Portal effect - Animated sprite sheet expanding blue ring portal
// Sprite: 16 frames, 128x128 each, 4 columns x 4 rows (512x512 sheet)
function BluePortalEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const spriteUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Effect95-NLQsM059PmMoiyKgtrIJzfzdTZPNaP.png'
  const columns = 4
  const rows = 4
  const totalFrames = 16
  const fps = (settings.speed || 50) / 100 * 16
  const glowDuration = (100 / (settings.speed || 50)) * 2
  const frame = useSpriteFrame(totalFrames, fps)
  const bgSize = `${columns * 100}% ${rows * 100}%`

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes blueportal-glow {
          0%, 100% { opacity: 0.5; transform: scale(0.95); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }
      `}</style>

      {/* Ambient glow beneath */}
      <div
        className="absolute rounded-full"
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle, ${settings.color}45 0%, transparent 70%)`,
          animation: `blueportal-glow ${glowDuration / 2}s ease-in-out infinite`,
        }}
      />

      {/* Animated portal sprite */}
      <div
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: bgSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: spritePosition(frame, columns, rows),
          mixBlendMode: 'screen',
        }}
      />

      {/* Inner core glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: '45%',
          height: '45%',
          background: `radial-gradient(circle, ${settings.secondaryColor || '#a5f3fc'}55 0%, transparent 70%)`,
          animation: `blueportal-glow ${glowDuration / 3}s ease-in-out infinite`,
        }}
      />
    </div>
  )
}

// Fire Portal effect - Animated sprite sheet erupting fiery portal
// Sprite: 16 frames, 128x128 each, 4 columns x 4 rows (512x512 sheet)
function FirePortalEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const spriteUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Explosion21-a4r8cvpEimrFAY0R7JQtNKmhl57tll.png'
  const columns = 4
  const rows = 4
  const totalFrames = 16
  const fps = (settings.speed || 50) / 100 * 16
  const glowDuration = (100 / (settings.speed || 50)) * 2
  const frame = useSpriteFrame(totalFrames, fps)
  const bgSize = `${columns * 100}% ${rows * 100}%`

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes fireportal-glow {
          0%, 100% { opacity: 0.5; transform: scale(0.95); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }
      `}</style>

      {/* Ambient glow beneath */}
      <div
        className="absolute rounded-full"
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle, ${settings.color}45 0%, transparent 70%)`,
          animation: `fireportal-glow ${glowDuration / 2}s ease-in-out infinite`,
        }}
      />

      {/* Animated portal sprite */}
      <div
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: bgSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: spritePosition(frame, columns, rows),
          mixBlendMode: 'screen',
        }}
      />

      {/* Inner core glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: '45%',
          height: '45%',
          background: `radial-gradient(circle, ${settings.secondaryColor || '#ffcc66'}55 0%, transparent 70%)`,
          animation: `fireportal-glow ${glowDuration / 3}s ease-in-out infinite`,
        }}
      />
    </div>
  )
}

// ===== MAGIC EFFECTS PACK =====
// Generic sprite-sheet renderer for the Magic Effects pack (magic circles).
// Each sheet is 5 columns x 5 rows = 25 frames, with baked-in alpha transparency.
const MAGIC_SPRITES: Record<string, string> = {
  'magic-golden-arcane': '/effects/magic/golden-arcane-circle.png',
  'magic-cyan-heptagram': '/effects/magic/cyan-heptagram.png',
  'magic-purple-hexagram': '/effects/magic/purple-hexagram.png',
  'magic-verdant-summoning': '/effects/magic/verdant-summoning-circle.png',
  'magic-infernal-flame': '/effects/magic/infernal-flame-circle.png',
  'magic-radiant-ward': '/effects/magic/radiant-ward-circle.png',
  'magic-magenta-hex': '/effects/magic/magenta-hex-circle.png',
  'magic-golden-rune': '/effects/magic/golden-rune-circle.png',
  'magic-azure-conjuration': '/effects/magic/azure-conjuration-circle.png',
  'magic-violet-enchantment': '/effects/magic/violet-enchantment-circle.png',
  'magic-emerald-nature': '/effects/magic/emerald-nature-circle.png',
  'magic-spiral-vortex': '/effects/magic/spiral-vortex-circle.png',
  'magic-crimson-pentagram': '/effects/magic/crimson-pentagram.png',
  'magic-amber-alchemy': '/effects/magic/amber-alchemy-circle.png',
  'magic-frost-sigil': '/effects/magic/frost-sigil-circle.png',
}

const MAGIC_COLUMNS = 5
const MAGIC_ROWS = 5
const MAGIC_FRAMES = 25

function MagicSpriteEffect({ effectId, settings }: { effectId: string; settings: EffectSettings }) {
  const spriteUrl = MAGIC_SPRITES[effectId]
  const columns = MAGIC_COLUMNS
  const rows = MAGIC_ROWS
  const totalFrames = MAGIC_FRAMES
  const fps = (settings.speed || 45) / 100 * 16
  const glowDuration = (100 / (settings.speed || 45)) * 1.5
  const frame = useSpriteFrame(totalFrames, fps)
  const keyId = effectId.replace(/[^a-z0-9]/gi, '')
  const bgSize = `${columns * 100}% ${rows * 100}%`

  if (!spriteUrl) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes magic-glow-${keyId} {
          0%, 100% { opacity: 0.45; transform: scale(0.96); }
          50% { opacity: 0.75; transform: scale(1.05); }
        }
      `}</style>

      {/* Ambient glow tied to the effect color */}
      <div
        className="absolute rounded-full"
        style={{
          width: '90%',
          height: '90%',
          background: `radial-gradient(circle, ${settings.color}33 0%, transparent 70%)`,
          animation: `magic-glow-${keyId} ${Math.max(glowDuration, 1)}s ease-in-out infinite`,
          opacity: (settings.glowIntensity ?? 60) / 100,
        }}
      />

      {/* Animated sprite */}
      <div
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: bgSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: spritePosition(frame, columns, rows),
          opacity: Math.max(0.35, (settings.intensity ?? 80) / 100),
        }}
      />
    </div>
  )
}

// ===== LIGHT SOURCE EFFECTS PACK =====
// Generic sprite-sheet renderer for the Light Source Effects pack.
// Each sheet is 5 columns x 6 rows = 30 frames, with baked-in alpha transparency.
const LIGHTSOURCE_SPRITES: Record<string, string> = {
  'lightsource-wall-torch': '/effects/light-source/wall-torch.png',
  'lightsource-ornate-lantern': '/effects/light-source/ornate-lantern.png',
  'lightsource-iron-lantern': '/effects/light-source/iron-lantern.png',
  'lightsource-hanging-lantern': '/effects/light-source/hanging-lantern.png',
  'lightsource-carriage-lantern': '/effects/light-source/carriage-lantern.png',
  'lightsource-campfire': '/effects/light-source/campfire.png',
  'lightsource-sparkler-burst': '/effects/light-source/sparkler-burst.png',
  'lightsource-candle': '/effects/light-source/candle.png',
  'lightsource-glowing-orb': '/effects/light-source/glowing-orb.png',
  'lightsource-fire-brazier': '/effects/light-source/fire-brazier.png',
  'lightsource-rune-light-circle': '/effects/light-source/rune-light-circle.png',
  'lightsource-pendant-light': '/effects/light-source/pendant-light.png',
  'lightsource-radiant-starburst': '/effects/light-source/radiant-starburst.png',
  'lightsource-soft-star-glow': '/effects/light-source/soft-star-glow.png',
  'lightsource-sparkle-starburst': '/effects/light-source/sparkle-starburst.png',
}

const LIGHTSOURCE_COLUMNS = 5
const LIGHTSOURCE_ROWS = 6
const LIGHTSOURCE_FRAMES = 30

function LightSourceSpriteEffect({ effectId, settings }: { effectId: string; settings: EffectSettings }) {
  const spriteUrl = LIGHTSOURCE_SPRITES[effectId]
  const columns = LIGHTSOURCE_COLUMNS
  const rows = LIGHTSOURCE_ROWS
  const totalFrames = LIGHTSOURCE_FRAMES
  const fps = (settings.speed || 45) / 100 * 16
  const glowDuration = (100 / (settings.speed || 45)) * 1.5
  const frame = useSpriteFrame(totalFrames, fps)
  const keyId = effectId.replace(/[^a-z0-9]/gi, '')
  const bgSize = `${columns * 100}% ${rows * 100}%`

  if (!spriteUrl) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes lightsource-glow-${keyId} {
          0%, 100% { opacity: 0.45; transform: scale(0.96); }
          50% { opacity: 0.8; transform: scale(1.06); }
        }
      `}</style>

      {/* Ambient glow tied to the effect color */}
      <div
        className="absolute rounded-full"
        style={{
          width: '90%',
          height: '90%',
          background: `radial-gradient(circle, ${settings.color}40 0%, transparent 70%)`,
          animation: `lightsource-glow-${keyId} ${Math.max(glowDuration, 1)}s ease-in-out infinite`,
          opacity: (settings.glowIntensity ?? 80) / 100,
        }}
      />

      {/* Animated sprite */}
      <div
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: bgSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: spritePosition(frame, columns, rows),
          opacity: Math.max(0.35, (settings.intensity ?? 80) / 100),
        }}
      />
    </div>
  )
}

// ===== SUBTERRANEAN EFFECTS PACK =====
// Generic sprite-sheet renderer for the Subterranean Effects pack.
// Each sheet is 5 columns x 6 rows = 30 frames, with baked-in alpha transparency.
const SUBTERRANEAN_SPRITES: Record<string, string> = {
  'subterranean-cave-drips': '/effects/subterranean/cave-drips.png',
  'subterranean-stalactite-seep': '/effects/subterranean/stalactite-seep.png',
  'subterranean-underground-stream': '/effects/subterranean/underground-stream.png',
  'subterranean-cave-mist': '/effects/subterranean/cave-mist.png',
  'subterranean-crystal-sparkles': '/effects/subterranean/crystal-sparkles.png',
  'subterranean-crystal-pulse': '/effects/subterranean/crystal-pulse.png',
  'subterranean-bioluminescent-spores': '/effects/subterranean/bioluminescent-spores.png',
  'subterranean-glowing-mushroom-aura': '/effects/subterranean/glowing-mushroom-aura.png',
  'subterranean-bat-swarm': '/effects/subterranean/bat-swarm-silhouettes.png',
  'subterranean-dustfall': '/effects/subterranean/dustfall.png',
  'subterranean-pebble-collapse': '/effects/subterranean/pebble-collapse.png',
  'subterranean-steam-vent': '/effects/subterranean/steam-vent.png',
  'subterranean-cave-fireflies': '/effects/subterranean/cave-fireflies.png',
  'subterranean-arcane-cave-energy': '/effects/subterranean/arcane-cave-energy.png',
  'subterranean-ambient': '/effects/subterranean/subterranean-ambient.png',
}

const SUBTERRANEAN_COLUMNS = 5
const SUBTERRANEAN_ROWS = 6
const SUBTERRANEAN_FRAMES = 30

function SubterraneanSpriteEffect({ effectId, settings }: { effectId: string; settings: EffectSettings }) {
  const spriteUrl = SUBTERRANEAN_SPRITES[effectId]
  const columns = SUBTERRANEAN_COLUMNS
  const rows = SUBTERRANEAN_ROWS
  const totalFrames = SUBTERRANEAN_FRAMES
  const fps = (settings.speed || 45) / 100 * 16
  const glowDuration = (100 / (settings.speed || 45)) * 1.5
  const frame = useSpriteFrame(totalFrames, fps)
  const keyId = effectId.replace(/[^a-z0-9]/gi, '')
  const bgSize = `${columns * 100}% ${rows * 100}%`

  if (!spriteUrl) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes subterranean-glow-${keyId} {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 0.7; transform: scale(1.06); }
        }
      `}</style>

      {/* Ambient glow tied to the effect color */}
      <div
        className="absolute rounded-full"
        style={{
          width: '90%',
          height: '90%',
          background: `radial-gradient(circle, ${settings.color}33 0%, transparent 70%)`,
          animation: `subterranean-glow-${keyId} ${Math.max(glowDuration, 1)}s ease-in-out infinite`,
          opacity: (settings.glowIntensity ?? 60) / 100,
        }}
      />

      {/* Animated sprite */}
      <div
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: bgSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: spritePosition(frame, columns, rows),
          opacity: Math.max(0.35, (settings.intensity ?? 80) / 100),
        }}
      />
    </div>
  )
}

// ===== CEMETERY EFFECTS PACK =====
// Generic sprite-sheet renderer for the Cemetery Effects pack.
// Each sheet is 5 columns x 6 rows = 30 frames, with baked-in alpha transparency.
const CEMETERY_SPRITES: Record<string, string> = {
  'cemetery-graveyard-fog': '/effects/cemetery/graveyard-fog.png',
  'cemetery-will-o-wisps': '/effects/cemetery/ghostly-will-o-wisps.png',
  'cemetery-soul-spirits': '/effects/cemetery/soul-spirits.png',
  'cemetery-necrotic-aura': '/effects/cemetery/necrotic-aura.png',
  'cemetery-blood-petals': '/effects/cemetery/blood-petals.png',
  'cemetery-haunted-lantern': '/effects/cemetery/haunted-lantern-light.png',
  'cemetery-cracked-stone-rise': '/effects/cemetery/cracked-stone-rise.png',
  'cemetery-skeletal-remains': '/effects/cemetery/skeletal-remains-shift.png',
  'cemetery-dark-ritual-circle': '/effects/cemetery/dark-ritual-circle.png',
  'cemetery-coffin-burst': '/effects/cemetery/coffin-burst.png',
  'cemetery-ethereal-mist-swirl': '/effects/cemetery/ethereal-mist-swirl.png',
  'cemetery-moonbeam-trees': '/effects/cemetery/moonbeam-through-trees.png',
  'cemetery-draining-life-vortex': '/effects/cemetery/draining-life-vortex.png',
  'cemetery-candle-flame': '/effects/cemetery/candle-flame-flicker.png',
  'cemetery-bats-in-flight': '/effects/cemetery/bats-in-flight.png',
}

const CEMETERY_COLUMNS = 5
const CEMETERY_ROWS = 6
const CEMETERY_FRAMES = 30

function CemeterySpriteEffect({ effectId, settings }: { effectId: string; settings: EffectSettings }) {
  const spriteUrl = CEMETERY_SPRITES[effectId]
  const columns = CEMETERY_COLUMNS
  const rows = CEMETERY_ROWS
  const totalFrames = CEMETERY_FRAMES
  const fps = (settings.speed || 45) / 100 * 16
  const glowDuration = (100 / (settings.speed || 45)) * 1.5
  const frame = useSpriteFrame(totalFrames, fps)
  const keyId = effectId.replace(/[^a-z0-9]/gi, '')
  const bgSize = `${columns * 100}% ${rows * 100}%`

  if (!spriteUrl) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes cemetery-glow-${keyId} {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 0.7; transform: scale(1.06); }
        }
      `}</style>

      {/* Ambient glow tied to the effect color */}
      <div
        className="absolute rounded-full"
        style={{
          width: '90%',
          height: '90%',
          background: `radial-gradient(circle, ${settings.color}33 0%, transparent 70%)`,
          animation: `cemetery-glow-${keyId} ${Math.max(glowDuration, 1)}s ease-in-out infinite`,
          opacity: (settings.glowIntensity ?? 60) / 100,
        }}
      />

      {/* Animated sprite */}
      <div
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: bgSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: spritePosition(frame, columns, rows),
          opacity: Math.max(0.35, (settings.intensity ?? 80) / 100),
        }}
      />
    </div>
  )
}

// ===== RAIN EFFECTS PACK =====
// Generic sprite-sheet renderer for the Rain Effects pack.
// Each sheet is 8 columns x 3 rows = 24 frames, with baked-in alpha transparency.
const RAIN_SPRITES: Record<string, string> = {
  'rain-light-drizzle': '/effects/rain/light-drizzle.png',
  'rain-steady': '/effects/rain/steady-rain.png',
  'rain-heavy': '/effects/rain/heavy-rain.png',
  'rain-torrential': '/effects/rain/torrential-rain.png',
  'rain-wind-blown': '/effects/rain/wind-blown-rain.png',
  'rain-fine-mist': '/effects/rain/fine-mist-rain.png',
  'rain-sheet': '/effects/rain/rain-sheet.png',
  'rain-intermittent': '/effects/rain/intermittent-rain.png',
  'rain-splatter-spray': '/effects/rain/splatter-spray.png',
  'rain-ground-mist': '/effects/rain/ground-mist-rain.png',
  'rain-micro-drizzle': '/effects/rain/micro-drizzle.png',
  'rain-sideways': '/effects/rain/sideways-rain.png',
  'rain-fog-mix': '/effects/rain/rain-fog-mix.png',
  'rain-droplet-impacts': '/effects/rain/droplet-impacts.png',
  'rain-dynamic-storm': '/effects/rain/dynamic-storm-rain.png',
}

const RAIN_COLUMNS = 8
const RAIN_ROWS = 3
const RAIN_FRAMES = 24

function RainSpriteEffect({ effectId, settings }: { effectId: string; settings: EffectSettings }) {
  const spriteUrl = RAIN_SPRITES[effectId]
  const columns = RAIN_COLUMNS
  const rows = RAIN_ROWS
  const totalFrames = RAIN_FRAMES
  const fps = (settings.speed || 55) / 100 * 20
  const frame = useSpriteFrame(totalFrames, fps)
  const bgSize = `${columns * 100}% ${rows * 100}%`

  if (!spriteUrl) return null

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated rain sprite */}
      <div
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: bgSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: spritePosition(frame, columns, rows),
          opacity: Math.max(0.35, (settings.intensity ?? 75) / 100),
        }}
      />
    </div>
  )
}

// ===== LAUNCH EFFECTS PACK =====
// Generic sprite-sheet renderer for the Launch Effects pack.
// Each sheet is 5 columns x 6 rows = 30 frames, with baked-in alpha transparency.
const LAUNCH_SPRITES: Record<string, string> = {
  'launch-torch-light': '/effects/launch/torch-light.png',
  'launch-lantern-glow': '/effects/launch/lantern-glow.png',
  'launch-campfire': '/effects/launch/campfire-blaze.png',
  'launch-smoke-wisps': '/effects/launch/smoke-wisps.png',
  'launch-running-water': '/effects/launch/running-water.png',
  'launch-rain': '/effects/launch/rain-shower.png',
  'launch-fog': '/effects/launch/rolling-fog.png',
  'launch-floating-dust': '/effects/launch/floating-dust.png',
  'launch-fireflies': '/effects/launch/fireflies.png',
  'launch-arcane-runes': '/effects/launch/arcane-runes.png',
  'launch-portal': '/effects/launch/portal-vortex.png',
  'launch-lightning': '/effects/launch/lightning-strike.png',
  'launch-divine-light': '/effects/launch/divine-light.png',
  'launch-necrotic-corruption': '/effects/launch/necrotic-corruption.png',
  'launch-ghost-apparition': '/effects/launch/ghost-apparition.png',
}

const LAUNCH_COLUMNS = 5
const LAUNCH_ROWS = 6
const LAUNCH_FRAMES = 30

function LaunchSpriteEffect({ effectId, settings }: { effectId: string; settings: EffectSettings }) {
  const spriteUrl = LAUNCH_SPRITES[effectId]
  const columns = LAUNCH_COLUMNS
  const rows = LAUNCH_ROWS
  const totalFrames = LAUNCH_FRAMES
  const fps = (settings.speed || 50) / 100 * 16
  const glowDuration = (100 / (settings.speed || 50)) * 1.5
  const frame = useSpriteFrame(totalFrames, fps)
  const keyId = effectId.replace(/[^a-z0-9]/gi, '')
  const bgSize = `${columns * 100}% ${rows * 100}%`

  if (!spriteUrl) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes launch-glow-${keyId} {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 0.7; transform: scale(1.06); }
        }
      `}</style>

      {/* Ambient glow tied to the effect color */}
      <div
        className="absolute rounded-full"
        style={{
          width: '90%',
          height: '90%',
          background: `radial-gradient(circle, ${settings.color}33 0%, transparent 70%)`,
          animation: `launch-glow-${keyId} ${Math.max(glowDuration, 1)}s ease-in-out infinite`,
          opacity: (settings.glowIntensity ?? 60) / 100,
        }}
      />

      {/* Animated sprite */}
      <div
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: bgSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: spritePosition(frame, columns, rows),
          opacity: Math.max(0.35, (settings.intensity ?? 90) / 100),
        }}
      />
    </div>
  )
}

// ===== CAUSTICS PACK =====
// Generic sprite-sheet renderer for underwater caustics.
// Each sheet is 5 columns x 5 rows = 25 frames, luminance-keyed (alpha baked in).
const CAUSTICS_SPRITES: Record<string, string> = {
  'caustics-shallow-clear': '/effects/caustics/shallow-clear.png',
  'caustics-deep-blue': '/effects/caustics/deep-blue.png',
  'caustics-tropical-shallow': '/effects/caustics/tropical-shallow.png',
  'caustics-soft-sand': '/effects/caustics/soft-sand.png',
  'caustics-rocky-bottom': '/effects/caustics/rocky-bottom.png',
  'caustics-fast-moving': '/effects/caustics/fast-moving.png',
  'caustics-slow-gentle': '/effects/caustics/slow-gentle.png',
  'caustics-blue-green': '/effects/caustics/blue-green.png',
  'caustics-sunlit-deep': '/effects/caustics/sunlit-deep.png',
  'caustics-murky-water': '/effects/caustics/murky-water.png',
  'caustics-cave-water': '/effects/caustics/cave-water.png',
  'caustics-kelp-forest': '/effects/caustics/kelp-forest.png',
  'caustics-rippling-sand': '/effects/caustics/rippling-sand.png',
  'caustics-wavy-surface': '/effects/caustics/wavy-surface.png',
  'caustics-magic-glow': '/effects/caustics/magic-glow.png',
}

const CAUSTICS_COLUMNS = 5
const CAUSTICS_ROWS = 5
const CAUSTICS_FRAMES = 25

function CausticsSpriteEffect({ effectId, settings }: { effectId: string; settings: EffectSettings }) {
  const spriteUrl = CAUSTICS_SPRITES[effectId]
  const columns = CAUSTICS_COLUMNS
  const rows = CAUSTICS_ROWS
  const totalFrames = CAUSTICS_FRAMES
  const fps = (settings.speed || 50) / 100 * 12
  const frame = useSpriteFrame(totalFrames, fps)
  const bgSize = `${columns * 100}% ${rows * 100}%`

  if (!spriteUrl) return null

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Optional tint wash tied to the effect color */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${settings.color}22 0%, transparent 75%)`,
          opacity: (settings.glowIntensity ?? 60) / 100,
        }}
      />

      {/* Animated caustics sprite */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: bgSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: spritePosition(frame, columns, rows),
          opacity: Math.max(0.3, (settings.intensity ?? 80) / 100),
          mixBlendMode: 'screen',
        }}
      />
    </div>
  )
}

// Campfire effect - TOP DOWN: larger radial glow with flickering light radius
function CampfireEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes campfire-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          25% { opacity: 0.8; transform: scale(1.05); }
          50% { opacity: 0.55; transform: scale(0.97); }
          75% { opacity: 0.75; transform: scale(1.03); }
        }
        @keyframes ember-float {
          0% { transform: translate(0, 0); opacity: 0.8; }
          50% { transform: translate(var(--drift-x), var(--drift-y)); opacity: 0.4; }
          100% { transform: translate(0, 0); opacity: 0.8; }
        }
      `}</style>
      
      {/* Outer ambient light */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle, ${settings.color}25 0%, transparent 60%)`,
          animation: 'campfire-glow 2s ease-in-out infinite',
        }}
      />
      
      {/* Main light radius */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '80%',
          height: '80%',
          background: `radial-gradient(circle, ${settings.color}50 0%, ${settings.color}20 50%, transparent 70%)`,
          animation: 'campfire-glow 1.5s ease-in-out infinite',
          animationDelay: '0.2s',
        }}
      />
      
      {/* Fire center */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '25%',
          height: '25%',
          background: `radial-gradient(circle, ${settings.secondaryColor || '#ffcc00'}, ${settings.color})`,
          boxShadow: `0 0 30px ${settings.color}`,
          animation: 'campfire-glow 0.8s ease-in-out infinite',
        }}
      />
      
      {/* Floating embers/sparks */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3,
            height: 3,
            backgroundColor: settings.secondaryColor || '#ffcc00',
            left: `${40 + Math.cos(i * Math.PI / 3) * 15}%`,
            top: `${40 + Math.sin(i * Math.PI / 3) * 15}%`,
            '--drift-x': `${(Math.random() - 0.5) * 20}px`,
            '--drift-y': `${(Math.random() - 0.5) * 20}px`,
            animation: `ember-float ${2 + Math.random()}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            boxShadow: `0 0 4px ${settings.secondaryColor || '#ffcc00'}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// Water ripples effect - TOP DOWN: concentric circles (already correct)
function WaterRipplesEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const rippleSources = useMemo(() => 
    Array.from({ length: Math.floor(settings.density / 25) + 3 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      delay: i * 1.3,
      size: 24 + Math.random() * 28,
    })),
  [settings.density])

  const tint = settings.color || '#3b82f6'
  const speedFactor = 100 / (settings.speed || 50)

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes water-ripple-expand {
          0% { transform: scale(0.2); opacity: 0.7; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes water-surface-shift {
          0% { background-position: 0% 0%, 0% 0%; }
          50% { background-position: 100% 50%, -50% 100%; }
          100% { background-position: 0% 0%, 0% 0%; }
        }
        @keyframes water-sheen {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Water surface base fill */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${tint}66 0%, ${tint}99 100%)`,
        }}
      />

      {/* Animated caustic/wave texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse at 30% 40%, ${settings.secondaryColor || '#ffffff'}33 0%, transparent 45%), radial-gradient(ellipse at 70% 60%, ${tint}55 0%, transparent 50%)`,
          backgroundSize: '120% 120%, 140% 140%',
          mixBlendMode: 'screen',
          animation: `water-surface-shift ${8 * speedFactor}s ease-in-out infinite`,
        }}
      />

      {/* Surface sheen sweep */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(115deg, transparent 35%, ${settings.secondaryColor || '#ffffff'}40 50%, transparent 65%)`,
          animation: `water-sheen ${5 * speedFactor}s ease-in-out infinite`,
        }}
      />

      {/* Expanding ripple rings */}
      {rippleSources.map((source) => (
        <div key={source.id}>
          {[0, 1].map((ring) => (
            <div
              key={ring}
              className="absolute rounded-full border-2"
              style={{
                left: `${source.x}%`,
                top: `${source.y}%`,
                width: source.size,
                height: source.size * 0.7,
                marginLeft: -source.size / 2,
                marginTop: -(source.size * 0.7) / 2,
                borderColor: `${settings.secondaryColor || '#ffffff'}aa`,
                animation: `water-ripple-expand ${4 * speedFactor}s ease-out infinite`,
                animationDelay: `${source.delay + ring * 1.2}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Waterfall effect - TOP DOWN: water stream with spray
function WaterfallEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const tint = settings.color || '#3b82f6'
  const foam = settings.secondaryColor || '#ffffff'
  const speedFactor = 100 / (settings.speed || 50)

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes water-flow-topdown {
          0% { background-position: 0 0; }
          100% { background-position: 0 200px; }
        }
        @keyframes spray-pulse {
          0%, 100% { opacity: 0.35; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.65; transform: translateX(-50%) scale(1.15); }
        }
      `}</style>

      {/* Water flow band - fills most of the layer width */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 h-full overflow-hidden"
        style={{ width: '70%' }}
      >
        {/* Base water color */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${tint}cc 0%, ${tint}aa 60%, ${foam}88 100%)`,
          }}
        />
        {/* Flowing streaks */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(180deg, ${foam}55 0px, transparent 8px, transparent 22px, ${foam}33 30px)`,
            backgroundSize: '100% 60px',
            animation: `water-flow-topdown ${0.6 * speedFactor}s linear infinite`,
          }}
        />
        {/* Highlight streaks */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(180deg, ${foam}80 0px, transparent 4px, transparent 40px)`,
            backgroundSize: '100% 90px',
            opacity: 0.6,
            animation: `water-flow-topdown ${0.9 * speedFactor}s linear infinite`,
          }}
        />
      </div>

      {/* Spray/foam at bottom */}
      <div
        className="absolute bottom-0 left-1/2 rounded-full"
        style={{
          width: '80%',
          height: '30%',
          background: `radial-gradient(ellipse at center bottom, ${foam}66, transparent 70%)`,
          animation: `spray-pulse ${1.5 * speedFactor}s ease-in-out infinite`,
          filter: 'blur(8px)',
        }}
      />
    </div>
  )
}

// Lightning effect - TOP DOWN: ground illumination flash
function LightningEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes lightning-ground-flash {
          0%, 85%, 100% { opacity: 0; }
          87%, 89% { opacity: 0.5; }
          90% { opacity: 0; }
          92%, 95% { opacity: 0.8; }
        }
        @keyframes strike-point {
          0%, 85%, 100% { opacity: 0; transform: scale(0.5); }
          92%, 95% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      
      {/* Ground illumination */}
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${settings.color}80, ${settings.color}20, transparent 70%)`,
          animation: `lightning-ground-flash ${4 * (100 / settings.speed)}s ease-out infinite`,
        }}
      />
      
      {/* Strike impact point */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: '10%',
          height: '10%',
          backgroundColor: '#fff',
          boxShadow: `0 0 20px ${settings.color}, 0 0 40px ${settings.color}`,
          animation: `strike-point ${4 * (100 / settings.speed)}s ease-out infinite`,
        }}
      />
    </div>
  )
}

// Smoke effect - TOP DOWN: expanding circular plumes
function SmokeEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const puffs = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      delay: i * 0.8,
      size: 60 + Math.random() * 40,
    })),
  [])

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes smoke-expand-topdown {
          0% { transform: scale(0.2); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
      {puffs.map((puff) => (
        <div
          key={puff.id}
          className="absolute rounded-full"
          style={{
            width: puff.size,
            height: puff.size,
            background: `radial-gradient(circle, ${settings.color}, transparent 70%)`,
            animation: `smoke-expand-topdown ${4 * (100 / settings.speed)}s ease-out infinite`,
            animationDelay: `${puff.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Wind effect - TOP DOWN: streaks across surface
function WindEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const particles = useMemo(() => 
    Array.from({ length: Math.floor(settings.density / 5) + 15 }, (_, i) => ({
      id: i,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      length: 20 + Math.random() * 40,
      speed: 0.7 + Math.random() * 0.6,
    })),
  [settings.density])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes wind-streak {
          0% { transform: translateX(-50px); opacity: 0; }
          20% { opacity: 0.5; }
          80% { opacity: 0.5; }
          100% { transform: translateX(${width + 50}px); opacity: 0; }
        }
      `}</style>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: -50,
            top: `${particle.y}%`,
            width: particle.length,
            height: 2,
            backgroundColor: settings.color,
            animation: `wind-streak ${2 / particle.speed * (100 / settings.speed)}s linear infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Arcane circles effect - TOP DOWN: magical sigil on ground
function ArcaneCirclesEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes rotate-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rotate-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes rune-pulse {
          0%, 100% { opacity: 0.6; text-shadow: 0 0 5px currentColor; }
          50% { opacity: 1; text-shadow: 0 0 15px currentColor; }
        }
      `}</style>
      
      {/* Glow base */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '90%',
          height: '90%',
          background: `radial-gradient(circle, ${settings.color}30, transparent 70%)`,
        }}
      />
      
      {/* Outer ring */}
      <div 
        className="absolute border-2 rounded-full"
        style={{
          width: '90%',
          height: '90%',
          borderColor: settings.color,
          boxShadow: `0 0 ${settings.glowIntensity ? settings.glowIntensity / 5 : 15}px ${settings.color}`,
          animation: `rotate-cw ${12 * (100 / settings.speed)}s linear infinite`,
        }}
      />
      
      {/* Middle ring */}
      <div 
        className="absolute border rounded-full"
        style={{
          width: '70%',
          height: '70%',
          borderColor: settings.secondaryColor || settings.color,
          animation: `rotate-ccw ${8 * (100 / settings.speed)}s linear infinite`,
        }}
      />
      
      {/* Inner ring */}
      <div 
        className="absolute border rounded-full"
        style={{
          width: '45%',
          height: '45%',
          borderColor: settings.color,
          animation: `rotate-cw ${6 * (100 / settings.speed)}s linear infinite`,
        }}
      />
      
      {/* Runes around the circle */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45) * (Math.PI / 180)
        const radius = 38
        return (
          <div
            key={i}
            className="absolute text-sm font-bold"
            style={{
              left: `${50 + Math.cos(angle) * radius}%`,
              top: `${50 + Math.sin(angle) * radius}%`,
              transform: 'translate(-50%, -50%)',
              color: settings.color,
              animation: 'rune-pulse 2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          >
            ᚱ
          </div>
        )
      })}
    </div>
  )
}

// Portals effect - TOP DOWN: swirling vortex from above
function PortalsEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes portal-swirl {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes portal-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
      
      {/* Swirling energy */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '90%',
          height: '90%',
          background: `conic-gradient(from 0deg, ${settings.color}, ${settings.secondaryColor || '#8b5cf6'}, ${settings.color})`,
          animation: `portal-swirl ${3 * (100 / settings.speed)}s linear infinite`,
          filter: 'blur(5px)',
        }}
      />
      
      {/* Inner glow rings */}
      {[0.7, 0.5, 0.3].map((scale, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${scale * 90}%`,
            height: `${scale * 90}%`,
            background: `radial-gradient(circle, ${settings.color}${Math.floor((1 - i * 0.2) * 60)}, transparent 60%)`,
            animation: `portal-pulse ${2 + i * 0.5}s ease-in-out infinite`,
          }}
        />
      ))}
      
      {/* Dark center void */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '20%',
          height: '20%',
          backgroundColor: '#0a0a0f',
          boxShadow: `0 0 20px ${settings.color}`,
        }}
      />
    </div>
  )
}

// Generic placeholder for other effects
function GenericEffect({ settings, effectId }: { settings: EffectSettings; effectId: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div 
        className="w-3/4 h-3/4 rounded-full"
        style={{
          background: `radial-gradient(circle, ${settings.color}60, transparent)`,
          boxShadow: `0 0 30px ${settings.color}40`,
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// Lantern effect - steady warm glow
function LanternEffect({ settings }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes lantern-glow {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.02); }
        }
      `}</style>
      <div
        className="absolute rounded-full"
        style={{
          width: '90%',
          height: '90%',
          background: `radial-gradient(circle, ${settings.color} 0%, ${settings.color}40 40%, transparent 70%)`,
          animation: `lantern-glow ${3 * (100 / settings.speed)}s ease-in-out infinite`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '15%',
          height: '15%',
          background: settings.color,
          boxShadow: `0 0 15px ${settings.color}`,
        }}
      />
    </div>
  )
}

// Mist effect - lighter than fog
function MistEffect({ settings }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes mist-drift {
          0%, 100% { transform: translate(-5%, -5%) scale(1); opacity: 0.25; }
          50% { transform: translate(5%, 5%) scale(1.1); opacity: 0.4; }
        }
      `}</style>
      <div 
        className="absolute rounded-full"
        style={{
          width: '150%',
          height: '150%',
          left: '-25%',
          top: '-25%',
          background: `radial-gradient(ellipse, ${settings.color}50 0%, transparent 60%)`,
          animation: `mist-drift ${8 * (100 / settings.speed)}s ease-in-out infinite`,
        }}
      />
    </div>
  )
}

// Lightning Storm - dramatic flashes covering area
function LightningStormEffect({ settings }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes storm-flash {
          0%, 85%, 100% { opacity: 0; }
          87%, 89% { opacity: 0.5; }
          90% { opacity: 0; }
          92%, 94% { opacity: 0.8; }
        }
        @keyframes storm-ripple {
          0% { transform: scale(0); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
      {/* Area flash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, ${settings.color}, transparent)`,
          animation: `storm-flash ${4 * (100 / settings.speed)}s ease-in-out infinite`,
        }}
      />
      {/* Rain ripples */}
      {Array.from({ length: 15 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 90}%`,
            width: 10,
            height: 10,
            borderColor: '#60a5fa40',
            animation: `storm-ripple 1s ease-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  )
}

// Dust Storm - swirling particles
function DustStormEffect({ settings }: { settings: EffectSettings; width: number; height: number }) {
  const particles = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 2,
      duration: 0.8 + Math.random() * 0.5,
    })), [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes dust-blow {
          0% { transform: translateX(-10%); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateX(110%); opacity: 0; }
        }
        @keyframes dust-haze {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.35; }
        }
      `}</style>
      {/* Haze overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${settings.direction || 45}deg, transparent, ${settings.color}30, transparent)`,
          animation: `dust-haze ${3}s ease-in-out infinite`,
        }}
      />
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: '-5%',
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: settings.color,
            animation: `dust-blow ${p.duration * (100 / settings.speed)}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Blizzard - intense snow with wind
function BlizzardEffect({ settings }: { settings: EffectSettings; width: number; height: number }) {
  const flakes = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 1,
      duration: 0.5 + Math.random() * 0.3,
    })), [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes blizzard-blow {
          0% { transform: translate(-10%, 0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translate(110%, 10%); opacity: 0; }
        }
        @keyframes blizzard-whiteout {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
      `}</style>
      {/* Whiteout overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${settings.direction || 60}deg, transparent, ${settings.color}40, transparent)`,
          animation: `blizzard-whiteout 2s ease-in-out infinite`,
        }}
      />
      {flakes.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full"
          style={{
            left: '-5%',
            top: `${f.y}%`,
            width: f.size,
            height: f.size,
            background: settings.color,
            animation: `blizzard-blow ${f.duration * (100 / settings.speed)}s linear infinite`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Lava Flow - molten rock with glowing cracks
function LavaFlowEffect({ settings }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes lava-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes lava-crack {
          0%, 100% { opacity: 0.6; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.3); }
        }
      `}</style>
      {/* Base glow */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `radial-gradient(circle, ${settings.color} 0%, ${settings.secondaryColor || '#ff8c00'}60 50%, transparent 80%)`,
          animation: `lava-glow ${2 * (100 / settings.speed)}s ease-in-out infinite`,
        }}
      />
      {/* Glowing cracks */}
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${15 + (i % 3) * 30}%`,
            top: `${20 + Math.floor(i / 3) * 40}%`,
            width: 3,
            height: 15,
            background: settings.secondaryColor || '#ff8c00',
            transform: `rotate(${i * 30}deg)`,
            boxShadow: `0 0 10px ${settings.color}`,
            animation: `lava-crack ${1.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

// Swamp Bubbles - murky rising bubbles
function SwampBubblesEffect({ settings }: { settings: EffectSettings; width: number; height: number }) {
  const bubbles = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      size: 6 + Math.random() * 10,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 1,
    })), [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes bubble-rise {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
      {/* Murky base */}
      <div
        className="absolute inset-2 rounded-lg"
        style={{
          background: `${settings.color}30`,
        }}
      />
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full border"
          style={{
            left: `${b.x}%`,
            bottom: '20%',
            width: b.size,
            height: b.size,
            borderColor: settings.secondaryColor || '#6b8e6b',
            animation: `bubble-rise ${b.duration * (100 / settings.speed)}s ease-out infinite`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Ice Crystals - frozen shimmer
function IceCrystalsEffect({ settings }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes ice-shimmer {
          0%, 100% { opacity: 0.4; filter: brightness(1); }
          50% { opacity: 0.7; filter: brightness(1.2); }
        }
      `}</style>
      {/* Frozen surface */}
      <div
        className="absolute inset-2 rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${settings.color}30, ${settings.secondaryColor || '#ffffff'}50, ${settings.color}30)`,
        }}
      />
      {/* Crystal points */}
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${15 + (i % 4) * 22}%`,
            top: `${20 + Math.floor(i / 4) * 45}%`,
            width: 8,
            height: 8,
            background: settings.secondaryColor || '#ffffff',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            boxShadow: `0 0 8px ${settings.color}`,
            animation: `ice-shimmer ${2}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

// Smoke Vents - rising from ground cracks
function SmokeVentsEffect({ settings }: { settings: EffectSettings; width: number; height: number }) {
  const vents = useMemo(() => [
    { x: 25, delay: 0 },
    { x: 50, delay: 0.5 },
    { x: 75, delay: 1 },
  ], [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes vent-smoke {
          0% { transform: scale(0.5) translateY(0); opacity: 0.5; }
          100% { transform: scale(2) translateY(-30px); opacity: 0; }
        }
      `}</style>
      {vents.map((v, i) => (
        <div key={i} className="absolute" style={{ left: `${v.x}%`, bottom: '30%' }}>
          {[0, 0.3, 0.6].map((d, j) => (
            <div
              key={j}
              className="absolute rounded-full"
              style={{
                width: 20,
                height: 20,
                marginLeft: -10,
                background: `radial-gradient(circle, ${settings.color}, transparent)`,
                animation: `vent-smoke ${2 * (100 / settings.speed)}s ease-out infinite`,
                animationDelay: `${v.delay + d}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ===== NEW EFFECTS PACK =====
// Auto-managed by scripts/add-effect.mjs — do not edit these markers.
type NewSpriteSpec = { url: string; cols: number; rows: number; frames: number; blend: 'screen' | 'normal' }
// NEW_SPRITES_START
const NEW_SPRITES: Record<string, NewSpriteSpec> = {
  'new-fire-torch': { url: '/effects/new/new-fire-torch.png', cols: 10, rows: 6, frames: 60, blend: 'screen' },
  'new-smoke': { url: '/effects/new/new-smoke.png', cols: 10, rows: 6, frames: 60, blend: 'normal' },
  // NEW_SPRITES_END
}

function NewSpriteEffect({ effectId, settings }: { effectId: string; settings: EffectSettings }) {
  const spec = NEW_SPRITES[effectId]
  const fps = (settings.speed || 50) / 100 * 20
  const frame = useSpriteFrame(spec?.frames ?? 1, fps)
  if (!spec) return null
  const bgSize = `${spec.cols * 100}% ${spec.rows * 100}%`
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${spec.url})`,
          backgroundSize: bgSize,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: spritePosition(frame, spec.cols, spec.rows),
          opacity: Math.max(0.35, (settings.intensity ?? 80) / 100),
          mixBlendMode: spec.blend,
        }}
      />
    </div>
  )
}

// Main renderer component
export function PremiumEffectRenderer({ effectId, settings, width, height }: PremiumEffectRendererProps) {
  const effectDef = getEffectById(effectId)
  const mergedSettings: EffectSettings = {
    ...effectDef?.defaultSettings,
    ...settings,
  } as EffectSettings

  // Magic Effects pack: generic sprite-sheet renderer for magic-circle effects
  if (effectId.startsWith('magic-')) {
    return <MagicSpriteEffect effectId={effectId} settings={mergedSettings} />
  }

  // Light Source Effects pack: generic sprite-sheet renderer driven by effectId
  if (effectId.startsWith('lightsource-')) {
    return <LightSourceSpriteEffect effectId={effectId} settings={mergedSettings} />
  }

  // Subterranean Effects pack: generic sprite-sheet renderer driven by effectId
  if (effectId.startsWith('subterranean-')) {
    return <SubterraneanSpriteEffect effectId={effectId} settings={mergedSettings} />
  }

  // Cemetery Effects pack: generic sprite-sheet renderer driven by effectId
  if (effectId.startsWith('cemetery-')) {
    return <CemeterySpriteEffect effectId={effectId} settings={mergedSettings} />
  }

  // Rain Effects pack: generic sprite-sheet renderer driven by effectId
  if (effectId.startsWith('rain-')) {
    return <RainSpriteEffect effectId={effectId} settings={mergedSettings} />
  }

  // Launch Effects pack: generic sprite-sheet renderer driven by effectId
  if (effectId.startsWith('launch-')) {
    return <LaunchSpriteEffect effectId={effectId} settings={mergedSettings} />
  }

  // Caustics pack: generic sprite-sheet renderer driven by effectId
  if (effectId.startsWith('caustics-')) {
    return <CausticsSpriteEffect effectId={effectId} settings={mergedSettings} />
  }

  const effectComponents: Record<string, React.FC<{ settings: EffectSettings; width: number; height: number }>> = {
    // Core Pack
    'torch': TorchEffect,
    'torch-2': Torch2Effect,
    'campfire': CampfireEffect,
    'lantern': LanternEffect,
    'candles': TorchEffect, // Similar to torch
    'brazier': CampfireEffect, // Similar to campfire
    'magical-light': TorchEffect,
    // Atmospheric Pack
    'rain': RainEffect,
    'snow': SnowEffect,
    'fog': FogEffect,
    'mist': MistEffect,
    'wind': WindEffect,
    'lightning-storm': LightningStormEffect,
    'dust-storm': DustStormEffect,
    'blizzard': BlizzardEffect,
    // Terrain Pack
    'water-ripples': WaterRipplesEffect,
    'waterfall': WaterfallEffect,
    'lava-flow': LavaFlowEffect,
    'swamp-bubbles': SwampBubblesEffect,
    'ice-crystals': IceCrystalsEffect,
    'smoke-vents': SmokeVentsEffect,
    // Fantasy Pack
    'arcane-circles': ArcaneCirclesEffect,
    'portals': PortalsEffect,
    'floating-runes': ArcaneCirclesEffect,
    'divine-light': TorchEffect,
    'necrotic-corruption': SmokeEffect,
    'spirit-apparitions': FogEffect,
    'blue-portal': BluePortalEffect,
    'fire-portal': FirePortalEffect,
    // Sci-Fi Pack
    'holograms': PortalsEffect,
    'energy-shields': ArcaneCirclesEffect,
    'data-streams': RainEffect,
    'reactor-core': CampfireEffect,
  }

  const EffectComponent = effectComponents[effectId]
  
  if (EffectComponent) {
    return <EffectComponent settings={mergedSettings} width={width} height={height} />
  }

  if (NEW_SPRITES[effectId]) {
    return <NewSpriteEffect effectId={effectId} settings={mergedSettings} />
  }

  return <GenericEffect settings={mergedSettings} effectId={effectId} />
}

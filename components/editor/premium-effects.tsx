'use client'

import { useMemo } from 'react'
import { getEffectById, type EffectSettings } from '@/lib/effects-library'
import { getRenderer } from '@/lib/effects'
import { EffectCanvas } from './effect-canvas'

interface PremiumEffectRendererProps {
  effectId: string
  settings?: Partial<EffectSettings>
  width: number
  height: number
  exclusions?: import('@/lib/types').ExclusionZone[]
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

// Main renderer component
export function PremiumEffectRenderer({ effectId, settings, width, height, exclusions }: PremiumEffectRendererProps) {
  const effectDef = getEffectById(effectId)
  const mergedSettings: EffectSettings = {
    ...effectDef?.defaultSettings,
    ...settings,
  } as EffectSettings

  // Every atlas-driven sprite pack (Magic, Light Source, Light Source Revised,
  // Subterranean, Cemetery, Launch, Rain, Caustics, New) has a registry renderer
  // and draws on a shared canvas — the same render path the exporter uses. New
  // backends (particle, vector) route here automatically as they register.
  if (getRenderer(effectId)) {
    return <EffectCanvas effectId={effectId} settings={mergedSettings} width={width} height={height} exclusions={exclusions} />
  }

  const effectComponents: Record<string, React.FC<{ settings: EffectSettings; width: number; height: number }>> = {
    // Core Pack (torch-2 now renders via the registry — see SPRITE_SHEETS)
    'torch': TorchEffect,
    'campfire': CampfireEffect,
    'lantern': LanternEffect,
    'candles': TorchEffect, // Similar to torch
    'brazier': CampfireEffect, // Similar to campfire
    'magical-light': TorchEffect,
    // Atmospheric Pack (rain/snow/fog/mist/dust-storm/blizzard moved to the Particle pack)
    'wind': WindEffect,
    'lightning-storm': LightningStormEffect,
    // Terrain Pack (swamp-bubbles/smoke-vents moved to the Particle pack)
    'water-ripples': WaterRipplesEffect,
    'waterfall': WaterfallEffect,
    'lava-flow': LavaFlowEffect,
    'ice-crystals': IceCrystalsEffect,
    // Fantasy Pack
    'arcane-circles': ArcaneCirclesEffect,
    'portals': PortalsEffect,
    'floating-runes': ArcaneCirclesEffect,
    'divine-light': TorchEffect,
    'necrotic-corruption': SmokeEffect,
    'spirit-apparitions': FogEffect,
    // blue-portal / fire-portal now render via the registry — see SPRITE_SHEETS
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

  return <GenericEffect settings={mergedSettings} effectId={effectId} />
}

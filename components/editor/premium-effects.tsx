'use client'

import { useMemo, useRef, useEffect } from 'react'
import { getEffectById, type EffectId, type EffectSettings } from '@/lib/effects-library'

interface PremiumEffectRendererProps {
  effectId: string
  settings?: Partial<EffectSettings>
  width: number
  height: number
}

// Rain effect with variable drop lengths and splash
function RainEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const drops = useMemo(() => {
    const count = Math.floor((settings.density / 100) * 80) + 20
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.4 + Math.random() * 0.3,
      length: 15 + Math.random() * 25,
      opacity: 0.3 + Math.random() * 0.5,
    }))
  }, [settings.density])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes rain-fall {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(${height + 20}px); opacity: 0; }
        }
      `}</style>
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-px rounded-full"
          style={{
            left: `${drop.x}%`,
            top: -20,
            height: drop.length,
            background: `linear-gradient(to bottom, transparent, ${settings.color})`,
            opacity: drop.opacity,
            animation: `rain-fall ${drop.duration * (100 / settings.speed)}s linear infinite`,
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Snow effect with varying flake sizes
function SnowEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const flakes = useMemo(() => {
    const count = Math.floor((settings.density / 100) * 60) + 15
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      size: 2 + Math.random() * 4,
      wobble: Math.random() * 30 - 15,
    }))
  }, [settings.density])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes snow-fall {
          0% { transform: translateY(-10px) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          50% { transform: translateY(${height / 2}px) translateX(var(--wobble)); }
          90% { opacity: 0.8; }
          100% { transform: translateY(${height + 10}px) translateX(0); opacity: 0; }
        }
      `}</style>
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full"
          style={{
            left: `${flake.x}%`,
            top: -10,
            width: flake.size,
            height: flake.size,
            backgroundColor: settings.color,
            '--wobble': `${flake.wobble}px`,
            animation: `snow-fall ${flake.duration * (100 / settings.speed)}s ease-in-out infinite`,
            animationDelay: `${flake.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// Fog effect with layered movement
function FogEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const layers = useMemo(() => [
    { opacity: 0.3, speed: 1, y: '20%', scale: 1.2 },
    { opacity: 0.2, speed: 1.5, y: '50%', scale: 1 },
    { opacity: 0.25, speed: 0.8, y: '70%', scale: 1.3 },
  ], [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes fog-drift {
          0%, 100% { transform: translateX(-5%) scaleX(var(--scale)); }
          50% { transform: translateX(5%) scaleX(var(--scale)); }
        }
      `}</style>
      {layers.map((layer, i) => (
        <div
          key={i}
          className="absolute inset-x-0 h-1/2"
          style={{
            top: layer.y,
            opacity: layer.opacity * (settings.intensity / 100),
            background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${settings.color}90, transparent)`,
            '--scale': layer.scale,
            animation: `fog-drift ${20 / layer.speed * (100 / settings.speed)}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// Torch/flame effect with realistic flicker
function TorchEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
      <style>{`
        @keyframes torch-flicker {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
          25% { transform: scaleY(1.1) scaleX(0.95); opacity: 1; }
          50% { transform: scaleY(0.95) scaleX(1.05); opacity: 0.85; }
          75% { transform: scaleY(1.05) scaleX(0.98); opacity: 0.95; }
        }
        @keyframes ember-rise {
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(-40px) translateX(var(--drift)); opacity: 0; }
        }
      `}</style>
      
      {/* Glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 60% at 50% 70%, ${settings.color}40, transparent 70%)`,
          filter: `blur(${settings.glowIntensity ? settings.glowIntensity / 5 : 10}px)`,
        }}
      />
      
      {/* Main flame */}
      <div 
        className="relative w-1/3 h-2/3 origin-bottom"
        style={{
          background: `linear-gradient(to top, ${settings.secondaryColor || '#ff4d00'}, ${settings.color}, transparent)`,
          borderRadius: '50% 50% 40% 40%',
          animation: `torch-flicker ${0.3 * (100 / (settings.flickerRate || 70))}s ease-in-out infinite`,
          filter: 'blur(2px)',
        }}
      />
      
      {/* Embers */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            bottom: '30%',
            left: `${40 + Math.random() * 20}%`,
            width: 2 + Math.random() * 2,
            height: 2 + Math.random() * 2,
            backgroundColor: settings.secondaryColor || '#ffcc00',
            '--drift': `${(Math.random() - 0.5) * 20}px`,
            animation: `ember-rise ${1 + Math.random()}s ease-out infinite`,
            animationDelay: `${i * 0.3}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// Campfire effect
function CampfireEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
      <style>{`
        @keyframes fire-dance {
          0%, 100% { transform: scaleY(1) scaleX(1) rotate(-2deg); }
          33% { transform: scaleY(1.15) scaleX(0.9) rotate(1deg); }
          66% { transform: scaleY(0.9) scaleX(1.1) rotate(-1deg); }
        }
        @keyframes spark-rise {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
          100% { transform: translateY(-60px) translateX(var(--drift)) scale(0); opacity: 0; }
        }
      `}</style>
      
      {/* Glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 80%, ${settings.color}50, transparent 60%)`,
          filter: 'blur(15px)',
        }}
      />
      
      {/* Fire layers */}
      {[0.8, 0.6, 0.4].map((scale, i) => (
        <div
          key={i}
          className="absolute origin-bottom"
          style={{
            bottom: '10%',
            width: `${30 * scale}%`,
            height: `${60 * scale}%`,
            background: i === 0 
              ? `linear-gradient(to top, ${settings.secondaryColor || '#ffcc00'}, ${settings.color}, transparent)`
              : `linear-gradient(to top, ${settings.color}, transparent)`,
            borderRadius: '50% 50% 40% 40%',
            animation: `fire-dance ${0.4 + i * 0.1}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            filter: `blur(${i + 1}px)`,
            opacity: 1 - i * 0.2,
          }}
        />
      ))}
      
      {/* Sparks */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            bottom: '35%',
            left: `${35 + Math.random() * 30}%`,
            width: 2,
            height: 2,
            backgroundColor: settings.secondaryColor || '#ffcc00',
            '--drift': `${(Math.random() - 0.5) * 40}px`,
            animation: `spark-rise ${1.5 + Math.random()}s ease-out infinite`,
            animationDelay: `${i * 0.2}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// Water ripples effect
function WaterRipplesEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const ripples = useMemo(() => 
    Array.from({ length: Math.floor(settings.density / 20) + 2 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      delay: i * 1.5,
      duration: 3,
    })),
  [settings.density])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes ripple-expand {
          0% { transform: scale(0); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full border-2"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
            width: 40,
            height: 40,
            marginLeft: -20,
            marginTop: -20,
            borderColor: settings.color,
            animation: `ripple-expand ${ripple.duration * (100 / settings.speed)}s ease-out infinite`,
            animationDelay: `${ripple.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Waterfall effect
function WaterfallEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes water-fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes mist-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-10px) scale(1.1); opacity: 0.6; }
        }
      `}</style>
      
      {/* Water streams */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0"
          style={{
            left: `${10 + i * 10}%`,
            width: 3 + Math.random() * 4,
            height: '100%',
            background: `linear-gradient(to bottom, ${settings.color}, ${settings.secondaryColor || '#fff'})`,
            opacity: 0.6 + Math.random() * 0.3,
            animation: `water-fall ${0.5 + Math.random() * 0.3}s linear infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      
      {/* Mist at bottom */}
      <div 
        className="absolute bottom-0 inset-x-0 h-1/4"
        style={{
          background: `radial-gradient(ellipse 100% 100% at 50% 100%, ${settings.secondaryColor || '#fff'}60, transparent)`,
          animation: 'mist-float 2s ease-in-out infinite',
          filter: 'blur(8px)',
        }}
      />
    </div>
  )
}

// Lightning effect
function LightningEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes lightning-flash {
          0%, 89%, 100% { opacity: 0; }
          90%, 95% { opacity: 1; }
        }
        @keyframes bg-flash {
          0%, 89%, 100% { opacity: 0; }
          90%, 92% { opacity: 0.3; }
        }
      `}</style>
      
      {/* Background flash */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: settings.color,
          animation: `bg-flash ${3 * (100 / settings.speed)}s ease-out infinite`,
        }}
      />
      
      {/* Lightning bolt SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ animation: `lightning-flash ${3 * (100 / settings.speed)}s ease-out infinite` }}>
        <path
          d="M50% 0 L45% 40% L55% 42% L40% 100%"
          stroke={settings.color}
          strokeWidth="3"
          fill="none"
          style={{ filter: `drop-shadow(0 0 10px ${settings.color})` }}
        />
      </svg>
    </div>
  )
}

// Smoke effect
function SmokeEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const puffs = useMemo(() => 
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40,
      delay: i * 0.5,
      size: 40 + Math.random() * 40,
    })),
  [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes smoke-rise {
          0% { transform: translateY(100%) scale(0.5); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-20%) scale(1.5); opacity: 0; }
        }
      `}</style>
      {puffs.map((puff) => (
        <div
          key={puff.id}
          className="absolute rounded-full"
          style={{
            left: `${puff.x}%`,
            bottom: 0,
            width: puff.size,
            height: puff.size,
            backgroundColor: settings.color,
            filter: 'blur(15px)',
            animation: `smoke-rise ${4 * (100 / settings.speed)}s ease-out infinite`,
            animationDelay: `${puff.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Wind effect
function WindEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  const particles = useMemo(() => 
    Array.from({ length: Math.floor(settings.density / 5) + 10 }, (_, i) => ({
      id: i,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      size: 1 + Math.random() * 3,
      speed: 0.8 + Math.random() * 0.4,
    })),
  [settings.density])

  const angle = settings.direction || 90

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes wind-blow {
          0% { transform: translateX(-20px) rotate(${angle}deg); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateX(${width + 20}px) rotate(${angle}deg); opacity: 0; }
        }
      `}</style>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: -20,
            top: `${particle.y}%`,
            width: particle.size * 10,
            height: particle.size,
            backgroundColor: settings.color,
            opacity: 0.5,
            animation: `wind-blow ${2 / particle.speed * (100 / settings.speed)}s linear infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Arcane circles effect
function ArcaneCirclesEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes rotate-circle {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; filter: blur(2px); }
          50% { opacity: 1; filter: blur(4px); }
        }
      `}</style>
      
      {/* Glow */}
      <div 
        className="absolute"
        style={{
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${settings.color}40, transparent 70%)`,
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}
      />
      
      {/* Outer circle */}
      <div 
        className="absolute border-2 rounded-full"
        style={{
          width: '90%',
          height: '90%',
          borderColor: settings.color,
          animation: `rotate-circle ${10 * (100 / settings.speed)}s linear infinite`,
          boxShadow: `0 0 ${settings.glowIntensity ? settings.glowIntensity / 5 : 15}px ${settings.color}`,
        }}
      />
      
      {/* Inner circle */}
      <div 
        className="absolute border rounded-full"
        style={{
          width: '60%',
          height: '60%',
          borderColor: settings.secondaryColor || settings.color,
          animation: `rotate-circle ${8 * (100 / settings.speed)}s linear infinite reverse`,
          boxShadow: `0 0 10px ${settings.secondaryColor || settings.color}`,
        }}
      />
      
      {/* Runes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-xs font-bold"
          style={{
            color: settings.color,
            transform: `rotate(${i * 45}deg) translateY(-${Math.min(width, height) * 0.35}px)`,
            textShadow: `0 0 8px ${settings.color}`,
          }}
        >
          ᚱ
        </div>
      ))}
    </div>
  )
}

// Portals effect
function PortalsEffect({ settings, width, height }: { settings: EffectSettings; width: number; height: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes portal-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes portal-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
      
      {/* Energy layers */}
      {[0.9, 0.7, 0.5, 0.3].map((scale, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
            background: i === 0 
              ? `conic-gradient(${settings.color}, ${settings.secondaryColor || '#8b5cf6'}, ${settings.color})`
              : `radial-gradient(circle, transparent 40%, ${settings.color}${Math.floor((1 - i * 0.2) * 99).toString(16)} 60%, transparent 70%)`,
            animation: i === 0 
              ? `portal-spin ${5 * (100 / settings.speed)}s linear infinite`
              : `portal-pulse ${2 + i * 0.5}s ease-in-out infinite`,
            filter: `blur(${i * 3}px)`,
            opacity: 1 - i * 0.2,
          }}
        />
      ))}
      
      {/* Center glow */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '20%',
          height: '20%',
          backgroundColor: settings.color,
          filter: 'blur(10px)',
          boxShadow: `0 0 ${settings.glowIntensity || 60}px ${settings.color}`,
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
        className="w-1/2 h-1/2 rounded-lg animate-pulse"
        style={{
          background: `radial-gradient(circle, ${settings.color}60, transparent)`,
          boxShadow: `0 0 30px ${settings.color}40`,
        }}
      />
    </div>
  )
}

// Main renderer component
export function PremiumEffectRenderer({ effectId, settings, width, height }: PremiumEffectRendererProps) {
  const effectDef = getEffectById(effectId)
  if (!effectDef) return null

  const mergedSettings: EffectSettings = {
    ...effectDef.defaultSettings,
    ...settings,
  }

  const props = { settings: mergedSettings, width, height }

  switch (effectId) {
    case 'rain': return <RainEffect {...props} />
    case 'snow': return <SnowEffect {...props} />
    case 'fog': return <FogEffect {...props} />
    case 'torch': return <TorchEffect {...props} />
    case 'campfire': return <CampfireEffect {...props} />
    case 'water-ripples': return <WaterRipplesEffect {...props} />
    case 'waterfall': return <WaterfallEffect {...props} />
    case 'lightning': return <LightningEffect {...props} />
    case 'smoke': return <SmokeEffect {...props} />
    case 'wind': return <WindEffect {...props} />
    case 'arcane-circles': return <ArcaneCirclesEffect {...props} />
    case 'portals': return <PortalsEffect {...props} />
    default: return <GenericEffect settings={mergedSettings} effectId={effectId} />
  }
}

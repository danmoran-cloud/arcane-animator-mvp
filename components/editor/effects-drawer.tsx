'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronDown, ChevronRight, Plus, Cloud, Sparkles, Cpu, Flame, Mountain
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  EFFECT_PACKS, 
  getEffectsByPack,
  type EffectPack, 
  type EffectDefinition,
  type EffectId
} from '@/lib/effects-library'

// Simple icon map for pack headers
const packIconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'flame': Flame,
  'cloud': Cloud,
  'mountain': Mountain,
  'sparkles': Sparkles,
  'cpu': Cpu,
}

// TOP-DOWN Mini effect preview components

// Rain: shows ripples/splashes on ground from above
function MiniRain() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-blue-400/40"
          style={{
            left: `${15 + (i % 3) * 30}%`,
            top: `${20 + Math.floor(i / 3) * 40}%`,
            width: '6px',
            height: '6px',
            animation: 'miniRipple 1s ease-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

// Snow: accumulating dots viewed from above
function MiniSnow() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-white/70"
          style={{
            left: `${10 + (i % 4) * 22}%`,
            top: `${15 + Math.floor(i / 4) * 45}%`,
            animation: 'miniSnowAppear 2s ease-in-out infinite',
            animationDelay: `${i * 0.25}s`,
          }}
        />
      ))}
    </div>
  )
}

// Fog: swirling patches from above
function MiniFog() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(2)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full"
          style={{
            width: '80%',
            height: '80%',
            left: `${i * 30}%`,
            top: `${i * 20}%`,
            background: 'radial-gradient(circle, #d4d4d4 0%, transparent 70%)',
            opacity: 0.5,
            animation: 'miniFogDrift 3s ease-in-out infinite',
            animationDelay: `${i * 1}s`,
          }}
        />
      ))}
    </div>
  )
}

// Torch: radial light halo from above (like a spotlight on the ground)
function MiniTorch() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Outer glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: '90%',
          height: '90%',
          background: 'radial-gradient(circle, #ff9500 0%, #ff6b0040 40%, transparent 70%)',
          animation: 'miniLightFlicker 0.3s ease-in-out infinite',
        }}
      />
      {/* Inner bright core */}
      <div
        className="absolute rounded-full"
        style={{
          width: '20%',
          height: '20%',
          background: '#ffcc00',
          boxShadow: '0 0 6px #ff9500',
          animation: 'miniLightFlicker 0.2s ease-in-out infinite alternate',
        }}
      />
    </div>
  )
}

// Campfire: larger radial glow with flickering light radius
function MiniCampfire() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Outer ambient glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, #ff4d0030 0%, transparent 70%)',
          animation: 'miniFireGlow 0.5s ease-in-out infinite',
        }}
      />
      {/* Main light radius */}
      <div
        className="absolute rounded-full"
        style={{
          width: '70%',
          height: '70%',
          background: 'radial-gradient(circle, #ff9500 0%, #ff4d0060 50%, transparent 80%)',
          animation: 'miniLightFlicker 0.3s ease-in-out infinite',
        }}
      />
      {/* Fire center */}
      <div
        className="absolute rounded-full"
        style={{
          width: '25%',
          height: '25%',
          background: 'radial-gradient(circle, #ffcc00, #ff6b00)',
          boxShadow: '0 0 4px #ff9500',
          animation: 'miniLightFlicker 0.15s ease-in-out infinite alternate',
        }}
      />
    </div>
  )
}

// Water ripples: concentric circles from above (already correct)
function MiniWaterRipples() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-blue-400/50"
          style={{
            width: `${8 + i * 8}px`,
            height: `${8 + i * 8}px`,
            animation: 'miniRipple 1.5s ease-out infinite',
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  )
}

// Waterfall: flowing water band with spray from above
function MiniWaterfall() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Water flow band */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 w-2 h-full"
        style={{
          background: 'linear-gradient(180deg, #4da6ff, #87ceeb, #4da6ff)',
          backgroundSize: '100% 20px',
          animation: 'miniWaterfallFlow 0.3s linear infinite',
        }}
      />
      {/* Spray/mist at bottom */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, #87ceeb60, transparent)',
          animation: 'miniMistPulse 1s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// Lightning: ground illumination flash from above
function MiniLightning() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Ground flash illumination */}
      <div
        className="absolute inset-0 rounded"
        style={{
          background: 'radial-gradient(circle, #e8e8ff, #a0a0ff40, transparent)',
          animation: 'miniLightningFlash 2s ease-in-out infinite',
        }}
      />
      {/* Strike point */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white"
        style={{
          boxShadow: '0 0 8px #fff, 0 0 16px #a0a0ff',
          animation: 'miniBoltFlash 2s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// Smoke: expanding circular plumes from above
function MiniSmoke() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: '10px',
            height: '10px',
            background: 'radial-gradient(circle, #6b7280 0%, transparent 70%)',
            animation: 'miniSmokeExpand 2s ease-out infinite',
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
    </div>
  )
}

// Wind: streaks/particles moving across surface
function MiniWind() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gray-400/40"
          style={{
            width: '8px',
            height: '2px',
            left: '-20%',
            top: `${20 + i * 20}%`,
            animation: 'miniWindBlow 0.8s linear infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}

// Arcane Circle: magical sigil on ground (already top-down)
function MiniArcaneCircle() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Outer ring */}
      <div
        className="absolute w-7 h-7 rounded-full border border-purple-400/70"
        style={{
          boxShadow: '0 0 6px #8b5cf6',
          animation: 'miniRotate 3s linear infinite',
        }}
      />
      {/* Inner ring */}
      <div
        className="absolute w-4 h-4 rounded-full border border-purple-300/50"
        style={{
          animation: 'miniRotate 2s linear infinite reverse',
        }}
      />
      {/* Center glow */}
      <div
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: 'radial-gradient(circle, #a855f7, transparent)',
          animation: 'miniPortalPulse 1.5s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// Portal: swirling vortex from above
function MiniPortal() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Swirl effect */}
      <div
        className="absolute w-6 h-6 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #06b6d4, #8b5cf6, #06b6d4)',
          animation: 'miniRotate 1.5s linear infinite',
        }}
      />
      {/* Dark center (the hole) */}
      <div
        className="absolute w-2 h-2 rounded-full bg-slate-900"
        style={{
          boxShadow: '0 0 4px #8b5cf6',
        }}
      />
    </div>
  )
}

// Blue Portal: expanding cyan ring
function MiniBluePortal() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="absolute w-5 h-5 rounded-full border-2"
        style={{
          borderColor: '#22d3ee',
          boxShadow: '0 0 6px #22d3ee, inset 0 0 4px #a5f3fc',
          animation: 'miniPortalPulse 1.4s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// Crystal: glowing point with light halo from above
function MiniCrystal() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Light halo */}
      <div
        className="absolute w-6 h-6 rounded-full"
        style={{
          background: 'radial-gradient(circle, #22d3ee40, transparent 70%)',
          animation: 'miniCrystalGlow 1.5s ease-in-out infinite',
        }}
      />
      {/* Crystal shape from above (hexagonal) */}
      <div
        className="absolute w-3 h-3"
        style={{
          background: 'linear-gradient(135deg, #22d3ee, #f0abfc)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          boxShadow: '0 0 6px #22d3ee',
        }}
      />
    </div>
  )
}

// Floating Runes: symbols scattered on ground/floating above
function MiniFloatingRunes() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute text-[7px] text-amber-400"
          style={{
            left: `${15 + (i % 2) * 50}%`,
            top: `${20 + Math.floor(i / 2) * 45}%`,
            animation: 'miniRuneGlow 2s ease-in-out infinite',
            animationDelay: `${i * 0.4}s`,
            textShadow: '0 0 4px #fbbf24',
          }}
        >
          {['᚛', '᚜', 'ᚱ', 'ᚢ'][i]}
        </div>
      ))}
    </div>
  )
}

// Will-o-Wisps: glowing orbs drifting across surface
function MiniWillOWisps() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: `radial-gradient(circle, ${i % 2 === 0 ? '#34d399' : '#a78bfa'}, transparent)`,
            left: `${20 + i * 25}%`,
            top: `${30 + (i % 2) * 25}%`,
            animation: 'miniWispDrift 2s ease-in-out infinite',
            animationDelay: `${i * 0.5}s`,
            boxShadow: `0 0 6px ${i % 2 === 0 ? '#34d399' : '#a78bfa'}`,
          }}
        />
      ))}
    </div>
  )
}

// Divine Light: rays hitting ground in circular pattern
function MiniDivineLight() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Light pool on ground */}
      <div
        className="absolute w-7 h-7 rounded-full"
        style={{
          background: 'radial-gradient(circle, #fef08a60 0%, #fef08a20 50%, transparent 70%)',
          animation: 'miniDivineRays 2s ease-in-out infinite',
        }}
      />
      {/* Ray points around edge */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-yellow-200/60"
          style={{
            transform: `rotate(${i * 60}deg) translateY(-10px)`,
            animation: 'miniRayShimmer 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}

// Necrotic: spreading corruption on ground
function MiniNecrotic() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Corruption spread */}
      <div
        className="absolute w-6 h-6 rounded-full"
        style={{
          background: 'radial-gradient(circle, #4a044e 0%, #4a044e60 40%, transparent 70%)',
          animation: 'miniNecroticPulse 1.5s ease-in-out infinite',
        }}
      />
      {/* Dark tendrils */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-3 rounded-full"
          style={{
            background: '#4a044e80',
            transform: `rotate(${i * 90 + 45}deg) translateY(-8px)`,
            animation: 'miniTendrilPulse 2s ease-in-out infinite',
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  )
}

// Spirits: translucent shapes drifting across ground
function MiniSpirits() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: 'radial-gradient(circle, #e0f2fe60, transparent 70%)',
            left: `${25 + i * 35}%`,
            top: `${30 + i * 20}%`,
            animation: 'miniSpiritDrift 3s ease-in-out infinite',
            animationDelay: `${i * 1}s`,
          }}
        />
      ))}
    </div>
  )
}

// Hologram: projected display on surface
function MiniHologram() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Projection area */}
      <div
        className="absolute w-6 h-6 border border-cyan-400/60"
        style={{
          animation: 'miniHoloFlicker 0.3s ease-in-out infinite',
          boxShadow: '0 0 4px #06b6d4, inset 0 0 8px #06b6d410',
        }}
      />
      {/* Scan line */}
      <div
        className="absolute w-6 h-px bg-cyan-400/40"
        style={{
          animation: 'miniHoloScan 1s linear infinite',
        }}
      />
    </div>
  )
}

// Neon Sign: glow on ground below
function MiniNeonSign() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Glow pool on ground */}
      <div
        className="absolute w-7 h-7 rounded-full"
        style={{
          background: 'radial-gradient(circle, #f472b640 0%, #06b6d420 50%, transparent 70%)',
          animation: 'miniNeonBuzz 0.1s ease-in-out infinite alternate',
        }}
      />
      {/* Light source */}
      <div
        className="absolute w-3 h-1.5 rounded-sm"
        style={{
          background: '#f472b6',
          boxShadow: '0 0 6px #f472b6',
        }}
      />
    </div>
  )
}

// Energy Shield: dome viewed from above (circular)
function MiniEnergyShield() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Shield dome edge */}
      <div
        className="absolute w-7 h-7 rounded-full border-2 border-blue-400/60"
        style={{
          boxShadow: '0 0 6px #3b82f6, inset 0 0 10px #3b82f620',
          animation: 'miniShieldPulse 1s ease-in-out infinite',
        }}
      />
      {/* Hex pattern hint */}
      <div
        className="absolute w-4 h-4 rounded-full border border-blue-300/30"
      />
    </div>
  )
}

// Data Streams: falling onto surface pattern
function MiniDataStream() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Impact points on ground */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: '#22c55e',
            left: `${15 + (i % 2) * 55}%`,
            top: `${20 + Math.floor(i / 2) * 45}%`,
            boxShadow: '0 0 4px #22c55e',
            animation: 'miniDataPulse 0.5s ease-in-out infinite',
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  )
}

// Reactor Core: pulsing glow from above
function MiniReactorCore() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Radiation rings */}
      <div
        className="absolute w-7 h-7 rounded-full"
        style={{
          background: 'radial-gradient(circle, #facc1540 0%, #f9731530 50%, transparent 70%)',
          animation: 'miniReactorPulse 0.5s ease-in-out infinite',
        }}
      />
      {/* Core */}
      <div
        className="absolute w-3 h-3 rounded-full"
        style={{
          background: 'radial-gradient(circle, #facc15, #f97316)',
          boxShadow: '0 0 8px #f97316',
        }}
      />
    </div>
  )
}

// Drone Patrols: shadows/shapes moving across
function MiniDronePatrol() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Drone shadow on ground */}
      <div
        className="absolute w-3 h-2 rounded-sm"
        style={{
          background: 'radial-gradient(ellipse, #00000040, transparent)',
          top: '40%',
          animation: 'miniDroneFly 2s ease-in-out infinite',
        }}
      />
      {/* Search light cone */}
      <div
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: 'radial-gradient(circle, #ffffff30, transparent)',
          top: '45%',
          animation: 'miniDroneFly 2s ease-in-out infinite',
          animationDelay: '0.05s',
        }}
      />
    </div>
  )
}

// ===== NEW EFFECTS FOR REORGANIZED PACKS =====

// Lantern: steady warm glow
function MiniLantern() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="absolute rounded-full"
        style={{
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b40 50%, transparent 70%)',
          animation: 'miniLightFlicker 0.5s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: '#fcd34d',
          boxShadow: '0 0 4px #fbbf24',
        }}
      />
    </div>
  )
}

// Candles: small multiple flames
function MiniCandles() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden gap-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: '15%',
            height: '15%',
            left: `${25 + i * 25}%`,
            top: '40%',
            background: 'radial-gradient(circle, #fcd34d, #fbbf24)',
            boxShadow: '0 0 6px #fbbf24',
            animation: 'miniLightFlicker 0.2s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}

// Brazier: intense large fire glow
function MiniBrazier() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="absolute rounded-full"
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, #ef4444 0%, #f9731650 40%, transparent 70%)',
          animation: 'miniFireGlow 0.3s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-3 h-3 rounded-full"
        style={{
          background: 'radial-gradient(circle, #fbbf24, #ef4444)',
          boxShadow: '0 0 8px #f97316',
          animation: 'miniLightFlicker 0.15s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// Magical Light: cool ethereal glow
function MiniMagicalLight() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="absolute rounded-full"
        style={{
          width: '85%',
          height: '85%',
          background: 'radial-gradient(circle, #60a5fa40 0%, #c084fc30 50%, transparent 70%)',
          animation: 'miniPortalPulse 2s ease-in-out infinite',
        }}
      />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-300"
          style={{
            left: `${30 + i * 20}%`,
            top: `${30 + (i % 2) * 30}%`,
            animation: 'miniWispDrift 2s ease-in-out infinite',
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  )
}

// Mist: lighter than fog
function MiniMist() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute rounded-full"
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, #e5e7eb40 0%, transparent 60%)',
          animation: 'miniFogDrift 4s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// Lightning Storm: dramatic flashes with rain
function MiniLightningStorm() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 rounded"
        style={{
          background: 'radial-gradient(circle, #e8e8ff, #a0a0ff40, transparent)',
          animation: 'miniLightningFlash 2s ease-in-out infinite',
        }}
      />
      {/* Rain ripples */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-blue-400/30"
          style={{
            left: `${20 + i * 30}%`,
            top: `${30 + (i % 2) * 30}%`,
            width: '4px',
            height: '4px',
            animation: 'miniRipple 1s ease-out infinite',
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  )
}

// Dust Storm: swirling sand
function MiniDustStorm() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: '3px',
            height: '3px',
            background: '#d4a574',
            left: '-10%',
            top: `${15 + i * 15}%`,
            animation: 'miniWindBlow 0.6s linear infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, #d4a57420, transparent)',
          animation: 'miniFogDrift 2s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// Blizzard: intense snow with wind
function MiniBlizzard() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/80"
          style={{
            left: '-10%',
            top: `${10 + i * 12}%`,
            animation: 'miniWindBlow 0.4s linear infinite',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(60deg, transparent, #ffffff20, transparent)',
          animation: 'miniFogDrift 1.5s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// Lava Flow: molten rock
function MiniLavaFlow() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="absolute rounded-full"
        style={{
          width: '90%',
          height: '90%',
          background: 'radial-gradient(circle, #ff4500 0%, #ff8c0060 50%, transparent 70%)',
          animation: 'miniFireGlow 1s ease-in-out infinite',
        }}
      />
      {/* Glowing cracks */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-orange-400"
          style={{
            width: '2px',
            height: '8px',
            left: `${25 + i * 25}%`,
            top: '35%',
            transform: `rotate(${i * 45}deg)`,
            boxShadow: '0 0 4px #ff4500',
            animation: 'miniLightFlicker 0.5s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

// Swamp Bubbles: murky rising bubbles
function MiniSwampBubbles() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-1 rounded"
        style={{
          background: '#4a5c4a40',
        }}
      />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-green-700/50"
          style={{
            width: '4px',
            height: '4px',
            left: `${25 + i * 25}%`,
            bottom: '20%',
            animation: 'miniSmokeExpand 2s ease-out infinite',
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  )
}

// Ice Crystals: frozen shimmer
function MiniIceCrystals() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-1 rounded"
        style={{
          background: 'linear-gradient(135deg, #b3e0ff20, #ffffff40, #b3e0ff20)',
        }}
      />
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: '3px',
            height: '3px',
            left: `${20 + (i % 2) * 50}%`,
            top: `${25 + Math.floor(i / 2) * 40}%`,
            background: '#ffffff',
            boxShadow: '0 0 4px #b3e0ff',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            animation: 'miniCrystalGlow 2s ease-in-out infinite',
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  )
}

// Smoke Vents: rising from ground
function MiniSmokeVents() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${30 + i * 30}%`,
            bottom: '20%',
          }}
        >
          {[...Array(2)].map((_, j) => (
            <div
              key={j}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: 'radial-gradient(circle, #4a4a4a60, transparent)',
                animation: 'miniSmokeExpand 1.5s ease-out infinite',
                animationDelay: `${i * 0.3 + j * 0.5}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Mini Torch 2: sprite-based flame preview
function MiniTorch2() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="absolute rounded-full"
        style={{
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, #ff950040 0%, transparent 70%)',
          animation: 'miniFireGlow 0.5s ease-in-out infinite',
        }}
      />
      <div
        className="w-4 h-5"
        style={{
          backgroundImage: 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fire1_64-kpuvZ5egbmbnm855kp1iCwuhNz9LAZ.png)',
          backgroundSize: '640px 384px',
          backgroundPosition: '0 0',
          animation: 'miniTorch2Sprite 1s steps(60) infinite',
          mixBlendMode: 'screen',
        }}
      />
      <style>{`
        @keyframes miniTorch2Sprite {
          to { background-position: -640px 0; }
        }
      `}</style>
    </div>
  )
}

// Map effect IDs to their preview components
const effectPreviews: Partial<Record<EffectId, React.FC>> = {
  // Core Pack
  'torch': MiniTorch,
  'torch-2': MiniTorch2,
  'campfire': MiniCampfire,
  'lantern': MiniLantern,
  'candles': MiniCandles,
  'brazier': MiniBrazier,
  'magical-light': MiniMagicalLight,
  // Atmospheric Pack
  'rain': MiniRain,
  'snow': MiniSnow,
  'fog': MiniFog,
  'mist': MiniMist,
  'wind': MiniWind,
  'lightning-storm': MiniLightningStorm,
  'dust-storm': MiniDustStorm,
  'blizzard': MiniBlizzard,
  // Terrain Pack
  'water-ripples': MiniWaterRipples,
  'waterfall': MiniWaterfall,
  'lava-flow': MiniLavaFlow,
  'swamp-bubbles': MiniSwampBubbles,
  'ice-crystals': MiniIceCrystals,
  'smoke-vents': MiniSmokeVents,
  // Fantasy Pack
  'arcane-circles': MiniArcaneCircle,
  'portals': MiniPortal,
  'floating-runes': MiniFloatingRunes,
  'divine-light': MiniDivineLight,
  'necrotic-corruption': MiniNecrotic,
  'spirit-apparitions': MiniSpirits,
  'blue-portal': MiniBluePortal,
  // Sci-Fi Pack
  'holograms': MiniHologram,
  'energy-shields': MiniEnergyShield,
  'data-streams': MiniDataStream,
  'reactor-core': MiniReactorCore,
}

interface EffectsDrawerProps {
  onAddEffect: (effect: EffectDefinition) => void
}

function EffectCard({ effect, onAdd }: { effect: EffectDefinition; onAdd: () => void }) {
  const packColor = EFFECT_PACKS[effect.pack].color
  const PreviewComponent = effectPreviews[effect.id]
  
  return (
    <button
      onClick={onAdd}
      className={cn(
        "group relative w-full flex items-center gap-2 p-2 rounded-md",
        "bg-card/50 hover:bg-card border border-border/50 hover:border-primary/50",
        "transition-all duration-200 text-left"
      )}
    >
      {/* Animated preview */}
      <div 
        className="relative w-8 h-8 rounded flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: `${packColor}15` }}
      >
        {PreviewComponent && <PreviewComponent />}
      </div>
      
      {/* Effect name */}
      <span className="flex-1 text-xs font-medium text-foreground truncate">
        {effect.name}
      </span>
      
      {/* Add button on hover */}
      <Plus className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

function PackSection({ 
  pack, 
  isExpanded, 
  onToggle, 
  onAddEffect 
}: { 
  pack: EffectPack
  isExpanded: boolean
  onToggle: () => void
  onAddEffect: (effect: EffectDefinition) => void
}) {
  const packInfo = EFFECT_PACKS[pack]
  const effects = useMemo(() => getEffectsByPack(pack), [pack])
  const IconComponent = packIconMap[packInfo.icon] || Sparkles
  
  return (
    <div className="border-b border-border/30 last:border-b-0">
      {/* Pack header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5",
          "hover:bg-muted/50 transition-colors"
        )}
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        )}
        <IconComponent 
          className="w-4 h-4" 
          style={{ color: packInfo.color }}
        />
        <span className="flex-1 text-sm font-serif font-semibold text-foreground text-left">
          {packInfo.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {effects.length}
        </span>
      </button>
      
      {/* Effects grid */}
      {isExpanded && (
        <div className="px-2 pb-2 space-y-1">
          {effects.map((effect) => (
            <EffectCard
              key={effect.id}
              effect={effect}
              onAdd={() => onAddEffect(effect)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function EffectsDrawer({ onAddEffect }: EffectsDrawerProps) {
  const [expandedPacks, setExpandedPacks] = useState<Record<EffectPack, boolean>>({
    core: false,
    atmospheric: false,
    terrain: false,
    fantasy: false,
    scifi: false,
  })
  
  const togglePack = (pack: EffectPack) => {
    setExpandedPacks(prev => ({ ...prev, [pack]: !prev[pack] }))
  }
  
  return (
    <aside className="w-60 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <h2 className="font-serif text-sm font-semibold text-sidebar-foreground tracking-wide">
          Effects
        </h2>
      </div>
      
      {/* Effects list */}
      <ScrollArea className="flex-1 [&>[data-radix-scroll-area-viewport]]:!overflow-y-scroll">
        <div className="py-1">
          {(['core', 'atmospheric', 'terrain', 'fantasy', 'scifi'] as EffectPack[]).map((pack) => (
            <PackSection
              key={pack}
              pack={pack}
              isExpanded={expandedPacks[pack]}
              onToggle={() => togglePack(pack)}
              onAddEffect={onAddEffect}
            />
          ))}
        </div>
      </ScrollArea>
      
      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Click an effect to add it to your map
        </p>
      </div>
    </aside>
  )
}

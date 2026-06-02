'use client'

import { memo, useMemo } from 'react'
import type {
  EffectType,
  FogSettings,
  RainSettings,
  SnowSettings,
  TorchlightSettings,
  CampfireSettings,
  RunesSettings,
  PortalSettings,
  WaterRippleSettings,
  LavaShimmerSettings,
  DustMotesSettings,
  EffectSettings,
} from '@/lib/types'

// Effect renderer props
interface EffectRendererProps {
  effectType: EffectType
  settings: EffectSettings
  width: number
  height: number
}

// Individual effect components

// Rolling Fog Effect
const FogEffect = memo(function FogEffect({ 
  settings, 
  width, 
  height 
}: { 
  settings: FogSettings
  width: number
  height: number 
}) {
  const { speed, density, tint } = settings
  const animationDuration = `${20 / (speed + 0.1)}s`
  
  const clouds = useMemo(() => {
    const count = Math.floor(density * 8) + 3
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (i * 25) % 100,
      y: 20 + (i * 17) % 60,
      size: 80 + (i * 23) % 100,
      delay: i * 2,
      opacity: 0.3 + (i % 3) * 0.15,
    }))
  }, [density])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg width={width} height={height} className="absolute inset-0">
        <defs>
          <filter id="fog-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
          </filter>
        </defs>
        {clouds.map((cloud) => (
          <ellipse
            key={cloud.id}
            cx={`${cloud.x}%`}
            cy={`${cloud.y}%`}
            rx={cloud.size}
            ry={cloud.size * 0.4}
            fill={tint}
            opacity={cloud.opacity * density}
            filter="url(#fog-blur)"
            style={{
              animation: `fogDrift ${animationDuration} ease-in-out infinite`,
              animationDelay: `${cloud.delay}s`,
            }}
          />
        ))}
      </svg>
      <style jsx>{`
        @keyframes fogDrift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(30px) translateY(-10px); }
        }
      `}</style>
    </div>
  )
})

// Rainfall Effect
const RainEffect = memo(function RainEffect({ 
  settings, 
  width, 
  height 
}: { 
  settings: RainSettings
  width: number
  height: number 
}) {
  const { speed, intensity, angle } = settings
  const dropCount = Math.floor(intensity * 100) + 20
  const animationDuration = `${1 / (speed + 0.1)}s`
  
  const drops = useMemo(() => {
    return Array.from({ length: dropCount }, (_, i) => ({
      id: i,
      x: (i * 7) % 100,
      delay: (i * 0.05) % 1,
      length: 15 + (i % 10) * 2,
    }))
  }, [dropCount])

  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      style={{ transform: `rotate(${angle}deg)` }}
    >
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-px bg-gradient-to-b from-transparent via-blue-300/60 to-blue-400/80"
          style={{
            left: `${drop.x}%`,
            top: '-20px',
            height: `${drop.length}px`,
            animation: `rainFall ${animationDuration} linear infinite`,
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes rainFall {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(${height + 40}px); opacity: 0; }
        }
      `}</style>
    </div>
  )
})

// Snowfall Effect
const SnowEffect = memo(function SnowEffect({ 
  settings, 
  width, 
  height 
}: { 
  settings: SnowSettings
  width: number
  height: number 
}) {
  const { speed, flakeSize, density } = settings
  const flakeCount = Math.floor(density * 50) + 15
  const baseAnimationDuration = 8 / (speed + 0.1)
  
  const flakes = useMemo(() => {
    return Array.from({ length: flakeCount }, (_, i) => ({
      id: i,
      x: (i * 13) % 100,
      size: 2 + flakeSize * 4 + (i % 3) * 2,
      delay: (i * 0.3) % baseAnimationDuration,
      duration: baseAnimationDuration + (i % 4) * 2,
      drift: (i % 2 === 0 ? 1 : -1) * (20 + (i % 5) * 10),
    }))
  }, [flakeCount, flakeSize, baseAnimationDuration])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white/80"
          style={{
            left: `${flake.x}%`,
            top: '-10px',
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            boxShadow: '0 0 4px rgba(255,255,255,0.5)',
            animation: `snowFall${flake.id % 3} ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes snowFall0 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(${height + 20}px) translateX(30px); opacity: 0; }
        }
        @keyframes snowFall1 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(${height + 20}px) translateX(-20px); opacity: 0; }
        }
        @keyframes snowFall2 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(${height + 20}px) translateX(15px); opacity: 0; }
        }
      `}</style>
    </div>
  )
})

// Torchlight Effect
const TorchlightEffect = memo(function TorchlightEffect({ 
  settings, 
  width, 
  height 
}: { 
  settings: TorchlightSettings
  width: number
  height: number 
}) {
  const { flickerSpeed, radius, color } = settings
  const animationDuration = `${0.3 / (flickerSpeed + 0.1)}s`
  const glowRadius = Math.min(width, height) * radius * 0.4

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="rounded-full"
        style={{
          width: glowRadius * 2,
          height: glowRadius * 2,
          background: `radial-gradient(circle, ${color}40 0%, ${color}20 40%, transparent 70%)`,
          boxShadow: `0 0 ${glowRadius * 0.5}px ${color}60, 0 0 ${glowRadius}px ${color}30`,
          animation: `torchFlicker ${animationDuration} ease-in-out infinite`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: glowRadius,
          height: glowRadius,
          background: `radial-gradient(circle, ${color}60 0%, transparent 60%)`,
          animation: `torchFlicker ${animationDuration} ease-in-out infinite 0.05s`,
        }}
      />
      <style jsx>{`
        @keyframes torchFlicker {
          0%, 100% { transform: scale(1); opacity: 1; }
          25% { transform: scale(1.05); opacity: 0.9; }
          50% { transform: scale(0.95); opacity: 1; }
          75% { transform: scale(1.02); opacity: 0.95; }
        }
      `}</style>
    </div>
  )
})

// Campfire Effect
const CampfireEffect = memo(function CampfireEffect({ 
  settings, 
  width, 
  height 
}: { 
  settings: CampfireSettings
  width: number
  height: number 
}) {
  const { flickerSpeed, emberCount, radius } = settings
  const animationDuration = `${0.4 / (flickerSpeed + 0.1)}s`
  const glowRadius = Math.min(width, height) * radius * 0.35
  
  const embers = useMemo(() => {
    return Array.from({ length: Math.floor(emberCount) }, (_, i) => ({
      id: i,
      x: 50 + (Math.sin(i * 2.5) * 15),
      size: 2 + (i % 3),
      delay: i * 0.3,
      duration: 2 + (i % 3),
    }))
  }, [emberCount])

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Main glow */}
      <div
        className="rounded-full"
        style={{
          width: glowRadius * 2.5,
          height: glowRadius * 2.5,
          background: `radial-gradient(circle, #ff660040 0%, #ff440020 40%, transparent 70%)`,
          boxShadow: `0 0 ${glowRadius}px #ff660050, 0 0 ${glowRadius * 1.5}px #ff440030`,
          animation: `campfireGlow ${animationDuration} ease-in-out infinite`,
        }}
      />
      
      {/* Inner flame */}
      <div
        className="absolute rounded-full"
        style={{
          width: glowRadius * 1.2,
          height: glowRadius * 1.5,
          background: `radial-gradient(ellipse at 50% 70%, #ffaa00 0%, #ff6600 40%, transparent 70%)`,
          animation: `flameFlicker ${animationDuration} ease-in-out infinite`,
        }}
      />
      
      {/* Embers */}
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute rounded-full bg-orange-400"
          style={{
            left: `${ember.x}%`,
            bottom: '40%',
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            boxShadow: '0 0 4px #ff6600',
            animation: `emberRise ${ember.duration}s ease-out infinite`,
            animationDelay: `${ember.delay}s`,
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes campfireGlow {
          0%, 100% { transform: scale(1); opacity: 1; }
          30% { transform: scale(1.08); opacity: 0.9; }
          60% { transform: scale(0.95); opacity: 1; }
        }
        @keyframes flameFlicker {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          25% { transform: scaleX(0.95) scaleY(1.05); }
          50% { transform: scaleX(1.05) scaleY(0.95); }
          75% { transform: scaleX(0.98) scaleY(1.02); }
        }
        @keyframes emberRise {
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(-60px) translateX(${Math.random() > 0.5 ? '' : '-'}20px); opacity: 0; }
        }
      `}</style>
    </div>
  )
})

// Magical Runes Effect
const RunesEffect = memo(function RunesEffect({ 
  settings, 
  width, 
  height 
}: { 
  settings: RunesSettings
  width: number
  height: number 
}) {
  const { rotationSpeed, glowIntensity, color } = settings
  const animationDuration = `${10 / (rotationSpeed + 0.1)}s`
  const size = Math.min(width, height) * 0.8
  
  const runes = ['M', 'N', 'X', 'K', 'Z', 'Y', 'T', 'V']
  
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Outer ring */}
      <div
        className="absolute rounded-full border-2"
        style={{
          width: size,
          height: size,
          borderColor: `${color}80`,
          boxShadow: `0 0 ${20 * glowIntensity}px ${color}60, inset 0 0 ${15 * glowIntensity}px ${color}30`,
          animation: `runeRotate ${animationDuration} linear infinite`,
        }}
      >
        {runes.map((rune, i) => (
          <span
            key={i}
            className="absolute font-serif text-lg"
            style={{
              color: color,
              textShadow: `0 0 ${10 * glowIntensity}px ${color}`,
              left: '50%',
              top: '50%',
              transform: `rotate(${i * 45}deg) translateY(-${size / 2 - 15}px) rotate(-${i * 45}deg)`,
              marginLeft: '-8px',
              marginTop: '-12px',
            }}
          >
            {rune}
          </span>
        ))}
      </div>
      
      {/* Inner ring */}
      <div
        className="absolute rounded-full border"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          borderColor: `${color}60`,
          boxShadow: `0 0 ${15 * glowIntensity}px ${color}40`,
          animation: `runeRotate ${animationDuration} linear infinite reverse`,
        }}
      />
      
      {/* Center glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.2,
          height: size * 0.2,
          background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`,
          animation: `runePulse 2s ease-in-out infinite`,
        }}
      />
      
      <style jsx>{`
        @keyframes runeRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes runePulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  )
})

// Portal Effect
const PortalEffect = memo(function PortalEffect({ 
  settings, 
  width, 
  height 
}: { 
  settings: PortalSettings
  width: number
  height: number 
}) {
  const { swirlSpeed, glowIntensity, color } = settings
  const animationDuration = `${4 / (swirlSpeed + 0.1)}s`
  const size = Math.min(width, height) * 0.9

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Outer swirl rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: size * (1 - i * 0.2),
            height: size * (1 - i * 0.2),
            borderColor: `${color}${60 - i * 15}`,
            boxShadow: `0 0 ${(20 - i * 5) * glowIntensity}px ${color}${50 - i * 10}`,
            animation: `portalSwirl ${animationDuration} linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      
      {/* Inner void */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          background: `radial-gradient(circle, #000 0%, ${color}40 70%, transparent 100%)`,
          boxShadow: `inset 0 0 ${30 * glowIntensity}px ${color}60`,
          animation: `portalPulse 2s ease-in-out infinite`,
        }}
      />
      
      {/* Sparkle particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 4px ${color}`,
            animation: `portalSparkle ${animationDuration} linear infinite`,
            animationDelay: `${i * 0.5}s`,
            transformOrigin: `${size * 0.35}px 0`,
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes portalSwirl {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes portalPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes portalSparkle {
          0% { transform: rotate(0deg) translateX(${size * 0.35}px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: rotate(360deg) translateX(${size * 0.35}px); opacity: 0; }
        }
      `}</style>
    </div>
  )
})

// Water Ripple Effect
const WaterRippleEffect = memo(function WaterRippleEffect({ 
  settings, 
  width, 
  height 
}: { 
  settings: WaterRippleSettings
  width: number
  height: number 
}) {
  const { waveSpeed, rippleScale, tint } = settings
  const animationDuration = `${4 / (waveSpeed + 0.1)}s`
  const maxSize = Math.min(width, height)
  
  const ripples = useMemo(() => {
    const count = Math.floor(rippleScale * 4) + 2
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: i * 1.5,
      maxSize: maxSize * (0.5 + rippleScale * 0.5),
    }))
  }, [rippleScale, maxSize])

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full border-2"
          style={{
            borderColor: `${tint}50`,
            animation: `waterRipple ${animationDuration} ease-out infinite`,
            animationDelay: `${ripple.delay}s`,
          }}
        />
      ))}
      
      {/* Surface shimmer */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(45deg, transparent 40%, ${tint}10 50%, transparent 60%)`,
          animation: `shimmer ${animationDuration} linear infinite`,
        }}
      />
      
      <style jsx>{`
        @keyframes waterRipple {
          0% { width: 10px; height: 10px; opacity: 0.8; }
          100% { width: ${maxSize}px; height: ${maxSize}px; opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
})

// Lava Shimmer Effect
const LavaShimmerEffect = memo(function LavaShimmerEffect({ 
  settings, 
  width, 
  height 
}: { 
  settings: LavaShimmerSettings
  width: number
  height: number 
}) {
  const { shimmerSpeed, glowIntensity } = settings
  const animationDuration = `${3 / (shimmerSpeed + 0.1)}s`
  
  const blobs = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 10 + (i * 20),
      y: 20 + (i * 15) % 60,
      size: 40 + (i * 13) % 40,
      delay: i * 0.5,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base lava gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, #ff4400${Math.floor(glowIntensity * 40).toString(16).padStart(2, '0')} 0%, #ff6600${Math.floor(glowIntensity * 30).toString(16).padStart(2, '0')} 50%, #cc330020 100%)`,
        }}
      />
      
      {/* Animated blobs */}
      <svg width={width} height={height} className="absolute inset-0">
        <defs>
          <filter id="lava-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
        </defs>
        {blobs.map((blob) => (
          <ellipse
            key={blob.id}
            cx={`${blob.x}%`}
            cy={`${blob.y}%`}
            rx={blob.size}
            ry={blob.size * 0.6}
            fill={`rgba(255, ${100 + blob.id * 20}, 0, ${0.3 * glowIntensity})`}
            filter="url(#lava-glow)"
            style={{
              animation: `lavaBubble ${animationDuration} ease-in-out infinite`,
              animationDelay: `${blob.delay}s`,
            }}
          />
        ))}
      </svg>
      
      {/* Heat wave overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(0deg, transparent 0px, rgba(255,100,0,0.05) 2px, transparent 4px)`,
          animation: `heatWave ${animationDuration} linear infinite`,
        }}
      />
      
      <style jsx>{`
        @keyframes lavaBubble {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes heatWave {
          0% { transform: translateY(0); }
          100% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
})

// Dust Motes Effect
const DustMotesEffect = memo(function DustMotesEffect({ 
  settings, 
  width, 
  height 
}: { 
  settings: DustMotesSettings
  width: number
  height: number 
}) {
  const { speed, density } = settings
  const moteCount = Math.floor(density * 40) + 10
  const baseAnimationDuration = 15 / (speed + 0.1)
  
  const motes = useMemo(() => {
    return Array.from({ length: moteCount }, (_, i) => ({
      id: i,
      x: (i * 17) % 100,
      y: (i * 23) % 100,
      size: 1 + (i % 3),
      delay: (i * 0.5) % baseAnimationDuration,
      duration: baseAnimationDuration + (i % 5) * 2,
      path: i % 3,
    }))
  }, [moteCount, baseAnimationDuration])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {motes.map((mote) => (
        <div
          key={mote.id}
          className="absolute rounded-full bg-amber-100/60"
          style={{
            left: `${mote.x}%`,
            top: `${mote.y}%`,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            boxShadow: '0 0 3px rgba(255,235,200,0.5)',
            animation: `dustFloat${mote.path} ${mote.duration}s ease-in-out infinite`,
            animationDelay: `${mote.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes dustFloat0 {
          0%, 100% { transform: translate(0, 0); opacity: 0.4; }
          25% { transform: translate(20px, -15px); opacity: 0.8; }
          50% { transform: translate(35px, 5px); opacity: 0.6; }
          75% { transform: translate(15px, 20px); opacity: 0.9; }
        }
        @keyframes dustFloat1 {
          0%, 100% { transform: translate(0, 0); opacity: 0.5; }
          25% { transform: translate(-15px, 20px); opacity: 0.7; }
          50% { transform: translate(-30px, -10px); opacity: 0.9; }
          75% { transform: translate(-10px, -25px); opacity: 0.6; }
        }
        @keyframes dustFloat2 {
          0%, 100% { transform: translate(0, 0); opacity: 0.6; }
          33% { transform: translate(25px, 25px); opacity: 0.8; }
          66% { transform: translate(-20px, 15px); opacity: 0.5; }
        }
      `}</style>
    </div>
  )
})

// Main Effect Renderer component
export const EffectRenderer = memo(function EffectRenderer({
  effectType,
  settings,
  width,
  height,
}: EffectRendererProps) {
  switch (effectType) {
    case 'fog':
      return <FogEffect settings={settings as FogSettings} width={width} height={height} />
    case 'rain':
      return <RainEffect settings={settings as RainSettings} width={width} height={height} />
    case 'snow':
      return <SnowEffect settings={settings as SnowSettings} width={width} height={height} />
    case 'torchlight':
      return <TorchlightEffect settings={settings as TorchlightSettings} width={width} height={height} />
    case 'campfire':
      return <CampfireEffect settings={settings as CampfireSettings} width={width} height={height} />
    case 'runes':
      return <RunesEffect settings={settings as RunesSettings} width={width} height={height} />
    case 'portal':
      return <PortalEffect settings={settings as PortalSettings} width={width} height={height} />
    case 'waterRipple':
      return <WaterRippleEffect settings={settings as WaterRippleSettings} width={width} height={height} />
    case 'lavaShimmer':
      return <LavaShimmerEffect settings={settings as LavaShimmerSettings} width={width} height={height} />
    case 'dustMotes':
      return <DustMotesEffect settings={settings as DustMotesSettings} width={width} height={height} />
    default:
      return null
  }
})

// Mini preview for effect cards (smaller, simplified version)
export const EffectPreview = memo(function EffectPreview({
  effectType,
  settings,
}: {
  effectType: EffectType
  settings: EffectSettings
}) {
  return (
    <div className="w-full h-full relative overflow-hidden rounded">
      <EffectRenderer
        effectType={effectType}
        settings={settings}
        width={80}
        height={80}
      />
    </div>
  )
})

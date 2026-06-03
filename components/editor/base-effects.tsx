'use client'

import { memo, useMemo, useRef, useEffect, useState } from 'react'
import type { UnifiedEffectSettings, BaseEffectComponent } from '@/lib/effects-library'

interface BaseEffectProps {
  settings: Partial<UnifiedEffectSettings>
  width: number
  height: number
  isPreview?: boolean
}

// Default settings
const defaultSettings: UnifiedEffectSettings = {
  speed: 0.5,
  intensity: 0.5,
  density: 0.5,
  opacity: 1,
  glow: 0.5,
  colorA: '#ffffff',
  colorB: '#888888',
  angle: 0,
  turbulence: 0.5,
  scale: 1,
  pulseRate: 0.5,
  flicker: 0.5,
}

function mergeSettings(partial: Partial<UnifiedEffectSettings>): UnifiedEffectSettings {
  return { ...defaultSettings, ...partial }
}

// ============= PARTICLE FIELD EFFECT =============
export const ParticleFieldEffect = memo(function ParticleFieldEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, density, colorA, colorB, angle, glow, turbulence, scale } = settings
  
  const particleCount = isPreview ? Math.floor(density * 20) + 5 : Math.floor(density * 60) + 15
  const animationDuration = `${Math.max(1, 8 / (speed + 0.1))}s`
  
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: (i * 17) % 100,
      y: (i * 23) % 100,
      size: 2 + scale * 4 + (i % 4) * 2,
      delay: (i * 0.2) % parseFloat(animationDuration),
      duration: parseFloat(animationDuration) + (i % 4),
      color: i % 3 === 0 ? colorB : colorA,
      drift: turbulence * (i % 2 === 0 ? 1 : -1) * (15 + (i % 5) * 5),
    }))
  }, [particleCount, colorA, colorB, scale, turbulence, animationDuration])

  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      style={{ transform: `rotate(${angle}deg)` }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: glow > 0 ? `0 0 ${glow * 8}px ${p.color}` : 'none',
            animation: `particleFall-${p.id % 4} ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0.8,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes particleFall-0 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(${height + 30}px) translateX(${turbulence * 20}px); opacity: 0; }
        }
        @keyframes particleFall-1 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(${height + 30}px) translateX(${-turbulence * 15}px); opacity: 0; }
        }
        @keyframes particleFall-2 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(${height + 30}px) translateX(${turbulence * 10}px); opacity: 0; }
        }
        @keyframes particleFall-3 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(${height + 30}px) translateX(${-turbulence * 25}px); opacity: 0; }
        }
      `}</style>
    </div>
  )
})

// ============= GLOW PULSE EFFECT =============
export const GlowPulseEffect = memo(function GlowPulseEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { pulseRate, glow, colorA, colorB, flicker, intensity } = settings
  
  const pulseDuration = `${Math.max(0.5, 3 / (pulseRate + 0.1))}s`
  const flickerDuration = `${Math.max(0.1, 0.3 / (flicker + 0.1))}s`
  const glowRadius = Math.min(width, height) * 0.4 * intensity

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Outer glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: glowRadius * 2.5,
          height: glowRadius * 2.5,
          background: `radial-gradient(circle, ${colorA}40 0%, ${colorA}20 40%, transparent 70%)`,
          boxShadow: `0 0 ${glowRadius * glow}px ${colorA}60`,
          animation: `glowPulse ${pulseDuration} ease-in-out infinite`,
        }}
      />
      
      {/* Inner glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: glowRadius * 1.5,
          height: glowRadius * 1.5,
          background: `radial-gradient(circle, ${colorB || colorA}60 0%, transparent 60%)`,
          animation: flicker > 0.3 
            ? `glowFlicker ${flickerDuration} ease-in-out infinite`
            : `glowPulse ${pulseDuration} ease-in-out infinite 0.1s`,
        }}
      />
      
      {/* Core */}
      <div
        className="absolute rounded-full"
        style={{
          width: glowRadius * 0.5,
          height: glowRadius * 0.5,
          background: `radial-gradient(circle, ${colorA}90 0%, ${colorA}40 60%, transparent 100%)`,
        }}
      />
      
      <style jsx>{`
        @keyframes glowPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        @keyframes glowFlicker {
          0%, 100% { transform: scale(1); opacity: 1; }
          20% { transform: scale(1.05); opacity: 0.9; }
          40% { transform: scale(0.95); opacity: 1; }
          60% { transform: scale(1.02); opacity: 0.95; }
          80% { transform: scale(0.98); opacity: 1; }
        }
      `}</style>
    </div>
  )
})

// ============= WAVE FLOW EFFECT =============
export const WaveFlowEffect = memo(function WaveFlowEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, colorA, colorB, angle, turbulence, glow, intensity } = settings
  
  const waveDuration = `${Math.max(2, 8 / (speed + 0.1))}s`
  const waveCount = isPreview ? 3 : 5

  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      style={{ transform: `rotate(${angle}deg)` }}
    >
      {Array.from({ length: waveCount }, (_, i) => (
        <div
          key={i}
          className="absolute w-full"
          style={{
            height: `${30 + turbulence * 20}%`,
            top: `${i * 20}%`,
            background: `linear-gradient(90deg, transparent 0%, ${colorA}${Math.floor((0.3 - i * 0.05) * 255).toString(16).padStart(2, '0')} 25%, ${colorB || colorA}${Math.floor((0.4 - i * 0.05) * 255).toString(16).padStart(2, '0')} 50%, ${colorA}${Math.floor((0.3 - i * 0.05) * 255).toString(16).padStart(2, '0')} 75%, transparent 100%)`,
            animation: `waveFlow ${waveDuration} ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            filter: glow > 0.3 ? `drop-shadow(0 0 ${glow * 5}px ${colorA})` : 'none',
          }}
        />
      ))}
      
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${90 + angle}deg, transparent 40%, ${colorA}10 50%, transparent 60%)`,
          animation: `shimmerFlow ${waveDuration} linear infinite`,
        }}
      />
      
      <style jsx>{`
        @keyframes waveFlow {
          0%, 100% { transform: translateX(-20px) scaleY(1); }
          50% { transform: translateX(20px) scaleY(${1 + turbulence * 0.2}); }
        }
        @keyframes shimmerFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
})

// ============= SMOKE FOG EFFECT =============
export const SmokeFogEffect = memo(function SmokeFogEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, density, colorA, colorB, turbulence } = settings
  
  const animationDuration = `${Math.max(10, 25 / (speed + 0.1))}s`
  const cloudCount = isPreview ? 4 : Math.floor(density * 8) + 4
  
  const clouds = useMemo(() => {
    return Array.from({ length: cloudCount }, (_, i) => ({
      id: i,
      x: (i * 25) % 100,
      y: 15 + (i * 17) % 70,
      size: 60 + (i * 23) % 100,
      delay: i * 2,
      opacity: 0.2 + (i % 3) * 0.1,
      color: i % 2 === 0 ? colorA : (colorB || colorA),
    }))
  }, [cloudCount, colorA, colorB])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg width={width} height={height} className="absolute inset-0">
        <defs>
          <filter id={`fog-blur-${isPreview ? 'preview' : 'main'}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={isPreview ? 10 : 20} />
          </filter>
        </defs>
        {clouds.map((cloud) => (
          <ellipse
            key={cloud.id}
            cx={`${cloud.x}%`}
            cy={`${cloud.y}%`}
            rx={cloud.size}
            ry={cloud.size * 0.4}
            fill={cloud.color}
            opacity={cloud.opacity * density}
            filter={`url(#fog-blur-${isPreview ? 'preview' : 'main'})`}
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
          25% { transform: translateX(${20 + turbulence * 20}px) translateY(${-5 - turbulence * 10}px); }
          50% { transform: translateX(${10 + turbulence * 15}px) translateY(${5 + turbulence * 5}px); }
          75% { transform: translateX(${-15 - turbulence * 15}px) translateY(${-3 - turbulence * 5}px); }
        }
      `}</style>
    </div>
  )
})

// ============= LIGHTNING EFFECT =============
export const LightningEffect = memo(function LightningEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { flicker, colorA, colorB, intensity } = settings
  
  const [flash, setFlash] = useState(false)
  const flashInterval = Math.max(1000, 5000 / (flicker + 0.1))
  
  useEffect(() => {
    if (isPreview) return
    const interval = setInterval(() => {
      setFlash(true)
      setTimeout(() => setFlash(false), 150)
      setTimeout(() => {
        setFlash(true)
        setTimeout(() => setFlash(false), 100)
      }, 200)
    }, flashInterval + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [flashInterval, isPreview])

  // Generate lightning bolt path
  const generateBoltPath = useMemo(() => {
    const points: string[] = []
    let x = width * 0.5
    let y = 0
    points.push(`M ${x} ${y}`)
    
    while (y < height) {
      const segmentLength = 20 + Math.random() * 40
      const drift = (Math.random() - 0.5) * 60
      x += drift
      y += segmentLength
      x = Math.max(width * 0.2, Math.min(width * 0.8, x))
      points.push(`L ${x} ${Math.min(y, height)}`)
      
      // Occasional branch
      if (Math.random() > 0.7 && y < height * 0.7) {
        const branchX = x + (Math.random() - 0.5) * 80
        const branchY = y + 30 + Math.random() * 50
        points.push(`M ${x} ${y} L ${branchX} ${branchY} M ${x} ${y}`)
      }
    }
    return points.join(' ')
  }, [width, height])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Flash overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-75"
        style={{
          backgroundColor: colorA,
          opacity: flash ? 0.3 * intensity : 0,
        }}
      />
      
      {/* Lightning bolt */}
      <svg 
        width={width} 
        height={height} 
        className="absolute inset-0 transition-opacity duration-75"
        style={{ opacity: flash ? 1 : (isPreview ? 0.5 : 0) }}
      >
        <defs>
          <filter id="lightning-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={generateBoltPath}
          fill="none"
          stroke={colorB || colorA}
          strokeWidth="3"
          filter="url(#lightning-glow)"
          style={{
            filter: `drop-shadow(0 0 10px ${colorA}) drop-shadow(0 0 20px ${colorA})`,
          }}
        />
        <path
          d={generateBoltPath}
          fill="none"
          stroke={colorA}
          strokeWidth="1"
        />
      </svg>
    </div>
  )
})

// ============= BEAM SWEEP EFFECT =============
export const BeamSweepEffect = memo(function BeamSweepEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, angle, colorA, intensity, glow } = settings
  
  const sweepDuration = `${Math.max(2, 8 / (speed + 0.1))}s`
  const beamLength = Math.max(width, height) * 1.5

  return (
    <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
      <div
        className="absolute origin-bottom"
        style={{
          width: `${20 + intensity * 30}px`,
          height: beamLength,
          bottom: '50%',
          background: `linear-gradient(to top, ${colorA}${Math.floor(intensity * 200).toString(16).padStart(2, '0')} 0%, ${colorA}40 30%, transparent 100%)`,
          filter: glow > 0 ? `blur(${glow * 3}px)` : 'none',
          animation: `beamSweep ${sweepDuration} ease-in-out infinite`,
          transformOrigin: 'bottom center',
        }}
      />
      <style jsx>{`
        @keyframes beamSweep {
          0%, 100% { transform: rotate(${-45 + angle}deg); }
          50% { transform: rotate(${45 + angle}deg); }
        }
      `}</style>
    </div>
  )
})

// ============= GLITCH EFFECT =============
export const GlitchEffect = memo(function GlitchEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { flicker, colorA, colorB, intensity, opacity } = settings
  
  const glitchDuration = `${Math.max(0.1, 0.5 / (flicker + 0.1))}s`

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ opacity }}>
      {/* Scan lines */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, ${colorA}10 2px, ${colorA}10 4px)`,
          animation: `scanLines ${glitchDuration} linear infinite`,
        }}
      />
      
      {/* Color separation */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, ${colorA}20 0%, transparent 20%, transparent 80%, ${colorB || colorA}20 100%)`,
          animation: `colorShift ${glitchDuration} steps(3) infinite`,
        }}
      />
      
      {/* Glitch bars */}
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: 0,
            right: 0,
            height: `${5 + intensity * 10}px`,
            top: `${20 + i * 30}%`,
            background: colorA,
            opacity: 0.3 * intensity,
            animation: `glitchBar ${glitchDuration} steps(2) infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes scanLines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes colorShift {
          0%, 100% { transform: translateX(0); }
          33% { transform: translateX(-3px); }
          66% { transform: translateX(3px); }
        }
        @keyframes glitchBar {
          0%, 100% { transform: translateX(0) scaleX(0); }
          50% { transform: translateX(${(Math.random() - 0.5) * 20}px) scaleX(1); }
        }
      `}</style>
    </div>
  )
})

// ============= SWARM MOVEMENT EFFECT =============
export const SwarmMovementEffect = memo(function SwarmMovementEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, density, colorA, colorB, glow, scale } = settings
  
  const entityCount = isPreview ? Math.floor(density * 8) + 3 : Math.floor(density * 20) + 8
  const moveDuration = `${Math.max(3, 12 / (speed + 0.1))}s`
  
  const entities = useMemo(() => {
    return Array.from({ length: entityCount }, (_, i) => ({
      id: i,
      startX: (i * 17) % 100,
      startY: (i * 23) % 100,
      size: 4 + scale * 8 + (i % 4) * 2,
      delay: (i * 0.5) % parseFloat(moveDuration),
      color: i % 3 === 0 ? (colorB || colorA) : colorA,
      path: i % 4,
    }))
  }, [entityCount, colorA, colorB, scale, moveDuration])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {entities.map((entity) => (
        <div
          key={entity.id}
          className="absolute rounded-full"
          style={{
            left: `${entity.startX}%`,
            top: `${entity.startY}%`,
            width: `${entity.size}px`,
            height: `${entity.size}px`,
            backgroundColor: entity.color,
            boxShadow: glow > 0 ? `0 0 ${glow * 6}px ${entity.color}` : 'none',
            animation: `swarmMove${entity.path} ${moveDuration} ease-in-out infinite`,
            animationDelay: `${entity.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes swarmMove0 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -20px); }
          50% { transform: translate(50px, 10px); }
          75% { transform: translate(20px, 30px); }
        }
        @keyframes swarmMove1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-25px, 15px); }
          50% { transform: translate(-40px, -20px); }
          75% { transform: translate(-15px, -35px); }
        }
        @keyframes swarmMove2 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, 25px); }
          50% { transform: translate(-20px, 40px); }
          75% { transform: translate(-30px, 15px); }
        }
        @keyframes swarmMove3 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-35px, -25px); }
          50% { transform: translate(15px, -45px); }
          75% { transform: translate(40px, -20px); }
        }
      `}</style>
    </div>
  )
})

// ============= SHADOW CREEP EFFECT =============
export const ShadowCreepEffect = memo(function ShadowCreepEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, colorA, opacity, glow, turbulence } = settings
  
  const creepDuration = `${Math.max(5, 15 / (speed + 0.1))}s`
  const tendrilCount = isPreview ? 3 : 5
  
  const tendrils = useMemo(() => {
    return Array.from({ length: tendrilCount }, (_, i) => ({
      id: i,
      x: 10 + (i * 20),
      delay: i * 1.5,
      size: 50 + (i * 15) % 50,
    }))
  }, [tendrilCount])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg width={width} height={height} className="absolute inset-0">
        <defs>
          <filter id={`shadow-blur-${isPreview ? 'preview' : 'main'}`}>
            <feGaussianBlur stdDeviation={isPreview ? 8 : 15} />
          </filter>
        </defs>
        {tendrils.map((tendril) => (
          <ellipse
            key={tendril.id}
            cx={`${tendril.x}%`}
            cy="80%"
            rx={tendril.size}
            ry={tendril.size * 2}
            fill={colorA}
            opacity={opacity * 0.6}
            filter={`url(#shadow-blur-${isPreview ? 'preview' : 'main'})`}
            style={{
              animation: `shadowCreep ${creepDuration} ease-in-out infinite`,
              animationDelay: `${tendril.delay}s`,
              transformOrigin: 'center bottom',
            }}
          />
        ))}
      </svg>
      
      {/* Ambient darkness */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${colorA}${Math.floor(opacity * 150).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          animation: `shadowPulse ${creepDuration} ease-in-out infinite`,
        }}
      />
      
      <style jsx>{`
        @keyframes shadowCreep {
          0%, 100% { transform: scaleY(1) translateY(0); }
          50% { transform: scaleY(${1.2 + turbulence * 0.3}) translateY(-${20 + turbulence * 30}px); }
        }
        @keyframes shadowPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
})

// ============= MECHANICAL MOTION EFFECT =============
export const MechanicalMotionEffect = memo(function MechanicalMotionEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, colorA, colorB, angle } = settings
  
  const rotateDuration = `${Math.max(2, 8 / (speed + 0.1))}s`
  const gearSize = Math.min(width, height) * 0.4
  const teethCount = 12

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Main gear */}
      <svg 
        width={gearSize * 2} 
        height={gearSize * 2} 
        viewBox="0 0 100 100"
        style={{
          animation: `gearRotate ${rotateDuration} linear infinite`,
        }}
      >
        <circle cx="50" cy="50" r="35" fill={colorA} />
        <circle cx="50" cy="50" r="15" fill={colorB || '#1a1a1a'} />
        {Array.from({ length: teethCount }, (_, i) => {
          const angleRad = (i / teethCount) * Math.PI * 2
          const x1 = 50 + Math.cos(angleRad) * 35
          const y1 = 50 + Math.sin(angleRad) * 35
          const x2 = 50 + Math.cos(angleRad) * 45
          const y2 = 50 + Math.sin(angleRad) * 45
          return (
            <rect
              key={i}
              x={x1 - 4}
              y={y1 - 4}
              width="8"
              height="15"
              fill={colorA}
              transform={`rotate(${(i / teethCount) * 360} ${x1} ${y1})`}
            />
          )
        })}
      </svg>
      
      {/* Secondary gear */}
      <svg 
        width={gearSize} 
        height={gearSize} 
        viewBox="0 0 100 100"
        className="absolute"
        style={{
          right: '15%',
          top: '15%',
          animation: `gearRotate ${rotateDuration} linear infinite reverse`,
        }}
      >
        <circle cx="50" cy="50" r="30" fill={colorB || colorA} />
        <circle cx="50" cy="50" r="10" fill={colorA || '#1a1a1a'} />
        {Array.from({ length: 8 }, (_, i) => {
          const angleRad = (i / 8) * Math.PI * 2
          return (
            <rect
              key={i}
              x={50 + Math.cos(angleRad) * 30 - 3}
              y={50 + Math.sin(angleRad) * 30 - 3}
              width="6"
              height="12"
              fill={colorB || colorA}
              transform={`rotate(${(i / 8) * 360} ${50 + Math.cos(angleRad) * 30} ${50 + Math.sin(angleRad) * 30})`}
            />
          )
        })}
      </svg>
      
      <style jsx>{`
        @keyframes gearRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
})

// ============= SET PIECE SHAKE EFFECT =============
export const SetPieceShakeEffect = memo(function SetPieceShakeEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, intensity, turbulence } = settings
  
  const shakeDuration = `${Math.max(0.05, 0.2 / (speed + 0.1))}s`
  const shakeAmount = intensity * 10

  return (
    <div 
      className="absolute inset-0"
      style={{
        animation: `earthquakeShake ${shakeDuration} ease-in-out infinite`,
      }}
    >
      {/* Debris particles */}
      {Array.from({ length: isPreview ? 5 : 15 }, (_, i) => (
        <div
          key={i}
          className="absolute bg-stone-600"
          style={{
            left: `${(i * 17) % 100}%`,
            top: '-10px',
            width: `${3 + (i % 4) * 2}px`,
            height: `${3 + (i % 4) * 2}px`,
            animation: `debrisFall ${1 + (i % 3)}s linear infinite`,
            animationDelay: `${(i * 0.2) % 2}s`,
          }}
        />
      ))}
      
      {/* Crack lines */}
      <svg width={width} height={height} className="absolute inset-0 opacity-30">
        <path
          d={`M ${width * 0.3} ${height} L ${width * 0.35} ${height * 0.7} L ${width * 0.32} ${height * 0.5} L ${width * 0.4} ${height * 0.3}`}
          fill="none"
          stroke="#4a4a4a"
          strokeWidth="2"
        />
        <path
          d={`M ${width * 0.7} ${height} L ${width * 0.65} ${height * 0.6} L ${width * 0.72} ${height * 0.4}`}
          fill="none"
          stroke="#4a4a4a"
          strokeWidth="2"
        />
      </svg>
      
      <style jsx>{`
        @keyframes earthquakeShake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(${-shakeAmount}px, ${shakeAmount * 0.5}px) rotate(${-turbulence}deg); }
          20% { transform: translate(${shakeAmount}px, ${-shakeAmount * 0.3}px) rotate(${turbulence * 0.5}deg); }
          30% { transform: translate(${-shakeAmount * 0.5}px, ${shakeAmount * 0.7}px) rotate(${-turbulence * 0.3}deg); }
          40% { transform: translate(${shakeAmount * 0.7}px, ${-shakeAmount * 0.5}px) rotate(${turbulence * 0.7}deg); }
          50% { transform: translate(${-shakeAmount * 0.3}px, ${shakeAmount * 0.3}px) rotate(0deg); }
          60% { transform: translate(${shakeAmount * 0.5}px, ${-shakeAmount * 0.7}px) rotate(${-turbulence * 0.5}deg); }
          70% { transform: translate(${-shakeAmount * 0.7}px, ${shakeAmount * 0.5}px) rotate(${turbulence * 0.3}deg); }
          80% { transform: translate(${shakeAmount * 0.3}px, ${-shakeAmount * 0.3}px) rotate(${-turbulence * 0.7}deg); }
          90% { transform: translate(${-shakeAmount * 0.5}px, ${shakeAmount}px) rotate(${turbulence}deg); }
        }
        @keyframes debrisFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(${height + 20}px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
})

// ============= FLAME FLICKER EFFECT =============
export const FlameFlickerEffect = memo(function FlameFlickerEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, intensity, colorA, colorB, glow, flicker, density } = settings
  
  const flickerDuration = `${Math.max(0.2, 0.6 / (flicker + 0.1))}s`
  const glowRadius = Math.min(width, height) * 0.3 * intensity
  const emberCount = isPreview ? 5 : Math.floor(density * 15) + 5
  
  const embers = useMemo(() => {
    return Array.from({ length: emberCount }, (_, i) => ({
      id: i,
      x: 40 + (i * 7) % 20,
      size: 2 + (i % 3),
      delay: i * 0.3,
      duration: 1.5 + (i % 4) * 0.5,
    }))
  }, [emberCount])

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Outer glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: glowRadius * 3,
          height: glowRadius * 3,
          background: `radial-gradient(circle, ${colorA}40 0%, ${colorA}20 40%, transparent 70%)`,
          boxShadow: glow > 0 ? `0 0 ${glowRadius * glow}px ${colorA}60` : 'none',
          animation: `flameGlow ${flickerDuration} ease-in-out infinite`,
        }}
      />
      
      {/* Main flame */}
      <div
        className="absolute"
        style={{
          width: glowRadius * 1.2,
          height: glowRadius * 2,
          background: `radial-gradient(ellipse at 50% 80%, ${colorB || '#ffcc00'} 0%, ${colorA} 40%, transparent 70%)`,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          animation: `flameFlicker ${flickerDuration} ease-in-out infinite`,
        }}
      />
      
      {/* Inner flame */}
      <div
        className="absolute"
        style={{
          width: glowRadius * 0.6,
          height: glowRadius * 1.2,
          background: `radial-gradient(ellipse at 50% 70%, ${colorB || '#ffff88'} 0%, ${colorA} 60%, transparent 100%)`,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          animation: `flameFlicker ${flickerDuration} ease-in-out infinite 0.05s`,
        }}
      />
      
      {/* Embers */}
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute rounded-full"
          style={{
            left: `${ember.x}%`,
            bottom: '40%',
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            backgroundColor: colorB || colorA,
            boxShadow: `0 0 4px ${colorA}`,
            animation: `emberRise ${ember.duration}s ease-out infinite`,
            animationDelay: `${ember.delay}s`,
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes flameGlow {
          0%, 100% { transform: scale(1); opacity: 1; }
          25% { transform: scale(1.05); opacity: 0.9; }
          50% { transform: scale(0.95); opacity: 1; }
          75% { transform: scale(1.03); opacity: 0.95; }
        }
        @keyframes flameFlicker {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          20% { transform: scaleX(0.95) scaleY(1.05); }
          40% { transform: scaleX(1.05) scaleY(0.95); }
          60% { transform: scaleX(0.97) scaleY(1.03); }
          80% { transform: scaleX(1.02) scaleY(0.98); }
        }
        @keyframes emberRise {
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(-80px) translateX(${(Math.random() - 0.5) * 40}px); opacity: 0; }
        }
      `}</style>
    </div>
  )
})

// ============= RIPPLE WAVE EFFECT =============
export const RippleWaveEffect = memo(function RippleWaveEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, colorA, scale, density } = settings
  
  const rippleDuration = `${Math.max(2, 6 / (speed + 0.1))}s`
  const maxSize = Math.min(width, height)
  const rippleCount = isPreview ? 3 : Math.floor(density * 5) + 3
  
  const ripples = useMemo(() => {
    return Array.from({ length: rippleCount }, (_, i) => ({
      id: i,
      delay: i * 1.2,
      maxSize: maxSize * (0.6 + scale * 0.4),
    }))
  }, [rippleCount, maxSize, scale])

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full border-2"
          style={{
            borderColor: `${colorA}60`,
            animation: `rippleExpand ${rippleDuration} ease-out infinite`,
            animationDelay: `${ripple.delay}s`,
          }}
        />
      ))}
      
      {/* Surface shimmer */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(45deg, transparent 40%, ${colorA}15 50%, transparent 60%)`,
          animation: `rippleShimmer ${rippleDuration} linear infinite`,
        }}
      />
      
      <style jsx>{`
        @keyframes rippleExpand {
          0% { width: 10px; height: 10px; opacity: 0.8; }
          100% { width: ${maxSize}px; height: ${maxSize}px; opacity: 0; }
        }
        @keyframes rippleShimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
      `}</style>
    </div>
  )
})

// ============= ROTATING RUNES EFFECT =============
export const RotatingRunesEffect = memo(function RotatingRunesEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, glow, pulseRate, colorA, colorB } = settings
  
  const rotateDuration = `${Math.max(5, 15 / (speed + 0.1))}s`
  const pulseDuration = `${Math.max(1, 3 / (pulseRate + 0.1))}s`
  const size = Math.min(width, height) * 0.9
  
  const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ']

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Outer ring */}
      <div
        className="absolute rounded-full border-2"
        style={{
          width: size,
          height: size,
          borderColor: `${colorA}80`,
          boxShadow: `0 0 ${20 * glow}px ${colorA}60, inset 0 0 ${15 * glow}px ${colorA}30`,
          animation: `runeRotate ${rotateDuration} linear infinite`,
        }}
      >
        {runes.map((rune, i) => (
          <span
            key={i}
            className="absolute font-serif text-lg"
            style={{
              color: colorA,
              textShadow: `0 0 ${10 * glow}px ${colorA}`,
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
      
      {/* Middle ring */}
      <div
        className="absolute rounded-full border"
        style={{
          width: size * 0.65,
          height: size * 0.65,
          borderColor: `${colorB || colorA}60`,
          boxShadow: `0 0 ${12 * glow}px ${colorB || colorA}40`,
          animation: `runeRotate ${rotateDuration} linear infinite reverse`,
        }}
      />
      
      {/* Inner ring */}
      <div
        className="absolute rounded-full border"
        style={{
          width: size * 0.35,
          height: size * 0.35,
          borderColor: `${colorA}50`,
          animation: `runeRotate ${rotateDuration} linear infinite`,
          animationDuration: `${parseFloat(rotateDuration) * 0.7}s`,
        }}
      />
      
      {/* Center glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.15,
          height: size * 0.15,
          background: `radial-gradient(circle, ${colorA}70 0%, transparent 70%)`,
          animation: `runePulse ${pulseDuration} ease-in-out infinite`,
        }}
      />
      
      <style jsx>{`
        @keyframes runeRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes runePulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  )
})

// ============= PORTAL EFFECT =============
export const PortalEffect = memo(function PortalEffect({
  settings: partialSettings,
  width,
  height,
  isPreview = false,
}: BaseEffectProps) {
  const settings = mergeSettings(partialSettings)
  const { speed, glow, turbulence, colorA, colorB } = settings
  
  const swirlDuration = `${Math.max(2, 6 / (speed + 0.1))}s`
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
            borderColor: `${colorA}${60 - i * 15}`,
            boxShadow: `0 0 ${(20 - i * 5) * glow}px ${colorA}${50 - i * 10}`,
            animation: `portalSwirl ${swirlDuration} linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      
      {/* Inner void with turbulence */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.35,
          height: size * 0.35,
          background: `radial-gradient(circle, #000 0%, ${colorB || colorA}50 60%, transparent 100%)`,
          boxShadow: `inset 0 0 ${30 * glow}px ${colorA}70`,
          animation: `portalPulse 2s ease-in-out infinite`,
        }}
      />
      
      {/* Energy tendrils */}
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={`tendril-${i}`}
          className="absolute"
          style={{
            width: '3px',
            height: size * 0.35,
            background: `linear-gradient(to top, ${colorA}80, transparent)`,
            transformOrigin: 'bottom center',
            animation: `portalTendril ${swirlDuration} linear infinite`,
            animationDelay: `${i * (parseFloat(swirlDuration) / 6)}s`,
          }}
        />
      ))}
      
      {/* Sparkle particles */}
      {Array.from({ length: isPreview ? 4 : 8 }, (_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: colorB || colorA,
            boxShadow: `0 0 4px ${colorA}`,
            animation: `portalSparkle ${swirlDuration} linear infinite`,
            animationDelay: `${i * 0.5}s`,
            transformOrigin: `${size * 0.4}px 0`,
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
          50% { transform: scale(${1 + turbulence * 0.15}); }
        }
        @keyframes portalTendril {
          0% { transform: rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: rotate(360deg); opacity: 0; }
        }
        @keyframes portalSparkle {
          0% { transform: rotate(0deg) translateX(${size * 0.4}px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: rotate(360deg) translateX(${size * 0.4}px); opacity: 0; }
        }
      `}</style>
    </div>
  )
})

// ============= UNIFIED EFFECT RENDERER =============
interface UnifiedEffectRendererProps {
  baseComponent: BaseEffectComponent
  settings: Partial<UnifiedEffectSettings>
  width: number
  height: number
  isPreview?: boolean
}

export const UnifiedEffectRenderer = memo(function UnifiedEffectRenderer({
  baseComponent,
  settings,
  width,
  height,
  isPreview = false,
}: UnifiedEffectRendererProps) {
  const props = { settings, width, height, isPreview }
  
  switch (baseComponent) {
    case 'ParticleField':
      return <ParticleFieldEffect {...props} />
    case 'GlowPulse':
      return <GlowPulseEffect {...props} />
    case 'WaveFlow':
      return <WaveFlowEffect {...props} />
    case 'SmokeFog':
      return <SmokeFogEffect {...props} />
    case 'Lightning':
      return <LightningEffect {...props} />
    case 'BeamSweep':
      return <BeamSweepEffect {...props} />
    case 'Glitch':
      return <GlitchEffect {...props} />
    case 'SwarmMovement':
      return <SwarmMovementEffect {...props} />
    case 'ShadowCreep':
      return <ShadowCreepEffect {...props} />
    case 'MechanicalMotion':
      return <MechanicalMotionEffect {...props} />
    case 'SetPieceShake':
      return <SetPieceShakeEffect {...props} />
    case 'FlameFlicker':
      return <FlameFlickerEffect {...props} />
    case 'RippleWave':
      return <RippleWaveEffect {...props} />
    case 'RotatingRunes':
      return <RotatingRunesEffect {...props} />
    case 'Portal':
      return <PortalEffect {...props} />
    default:
      return <div className="w-full h-full bg-gray-800/50" />
  }
})

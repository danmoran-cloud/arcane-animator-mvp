'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronDown, ChevronRight, Plus, Cloud, Sparkles, Cpu
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
  'cloud': Cloud,
  'sparkles': Sparkles,
  'cpu': Cpu,
}

// Mini effect preview components
function MiniRain() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-px bg-blue-400/60"
          style={{
            left: `${10 + i * 12}%`,
            top: '-20%',
            height: '30%',
            animation: `miniRainFall 0.6s linear infinite`,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  )
}

function MiniSnow() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/80"
          style={{
            left: `${15 + i * 15}%`,
            top: '-10%',
            animation: `miniSnowFall 1.2s linear infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

function MiniFog() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: 'linear-gradient(90deg, transparent, #d4d4d4, transparent)',
          animation: 'miniFogDrift 2s ease-in-out infinite',
        }}
      />
    </div>
  )
}

function MiniTorch() {
  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
      <div
        className="w-2 h-3 rounded-t-full"
        style={{
          background: 'linear-gradient(to top, #ff4d00, #ff9500, #ffcc00)',
          animation: 'miniFlicker 0.15s ease-in-out infinite alternate',
          boxShadow: '0 0 8px #ff6b00',
        }}
      />
    </div>
  )
}

function MiniCampfire() {
  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
      <div className="relative">
        <div
          className="w-3 h-4 rounded-t-full"
          style={{
            background: 'linear-gradient(to top, #ff4d00, #ff9500, #ffcc00)',
            animation: 'miniFlicker 0.2s ease-in-out infinite alternate',
            boxShadow: '0 0 10px #ff6b00',
          }}
        />
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-yellow-400"
            style={{
              bottom: '100%',
              left: `${i * 8}px`,
              animation: `miniSparkRise 0.8s ease-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

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

function MiniWaterfall() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute left-1/2 -translate-x-1/2 w-3 h-full"
        style={{
          background: 'linear-gradient(to bottom, #87ceeb, #4da6ff)',
          animation: 'miniWaterfallFlow 0.3s linear infinite',
        }}
      />
    </div>
  )
}

function MiniLightning() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-white/0"
        style={{
          animation: 'miniLightningFlash 2s ease-in-out infinite',
        }}
      />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 32 32">
        <path
          d="M16 2 L12 14 L18 14 L14 30 L20 16 L14 16 Z"
          fill="#e8e8ff"
          style={{
            opacity: 0,
            animation: 'miniBoltFlash 2s ease-in-out infinite',
          }}
        />
      </svg>
    </div>
  )
}

function MiniSmoke() {
  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-gray-500/50"
          style={{
            bottom: '10%',
            left: `${40 + i * 10}%`,
            animation: 'miniSmokeRise 1.5s ease-out infinite',
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  )
}

function MiniWind() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute h-px bg-gray-300/60"
          style={{
            width: '40%',
            left: '-20%',
            top: `${25 + i * 25}%`,
            animation: 'miniWindBlow 0.8s linear infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

function MiniArcaneCircle() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="w-6 h-6 rounded-full border border-purple-400"
        style={{
          boxShadow: '0 0 6px #8b5cf6, inset 0 0 4px #8b5cf6',
          animation: 'miniRotate 3s linear infinite',
        }}
      />
    </div>
  )
}

function MiniPortal() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="w-5 h-5 rounded-full"
        style={{
          background: 'radial-gradient(circle, #06b6d4, #8b5cf6, transparent)',
          animation: 'miniPortalPulse 1s ease-in-out infinite',
          boxShadow: '0 0 8px #8b5cf6',
        }}
      />
    </div>
  )
}

function MiniCrystal() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="w-2 h-4"
        style={{
          background: 'linear-gradient(135deg, #22d3ee, #f0abfc)',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          animation: 'miniCrystalGlow 1.5s ease-in-out infinite',
          boxShadow: '0 0 6px #22d3ee',
        }}
      />
    </div>
  )
}

function MiniFloatingRunes() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute text-[8px] text-amber-400"
          style={{
            left: `${20 + i * 25}%`,
            top: '50%',
            animation: 'miniRuneFloat 2s ease-in-out infinite',
            animationDelay: `${i * 0.3}s`,
            textShadow: '0 0 4px #fbbf24',
          }}
        >
          {['᚛', '᚜', '᚝'][i]}
        </div>
      ))}
    </div>
  )
}

function MiniWillOWisps() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: i % 2 === 0 ? '#34d399' : '#a78bfa',
            left: `${20 + i * 25}%`,
            top: '40%',
            animation: 'miniWispFloat 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.4}s`,
            boxShadow: `0 0 6px ${i % 2 === 0 ? '#34d399' : '#a78bfa'}`,
          }}
        />
      ))}
    </div>
  )
}

function MiniDivineLight() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #fef08a40, transparent)',
          animation: 'miniDivineRays 2s ease-in-out infinite',
        }}
      />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute w-px h-full bg-yellow-200/40"
          style={{
            left: `${25 + i * 25}%`,
            animation: 'miniRayShimmer 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

function MiniNecrotic() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, #4a044e60, transparent)',
          animation: 'miniNecroticPulse 1.5s ease-in-out infinite',
        }}
      />
    </div>
  )
}

function MiniSpirits() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-3 rounded-full bg-sky-100/40"
          style={{
            left: `${30 + i * 30}%`,
            top: '30%',
            animation: 'miniSpiritFade 2s ease-in-out infinite',
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  )
}

function MiniHologram() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-2 border border-cyan-400/60"
        style={{
          animation: 'miniHoloFlicker 0.3s ease-in-out infinite',
          boxShadow: '0 0 4px #06b6d4',
        }}
      />
    </div>
  )
}

function MiniNeonSign() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="w-4 h-2 rounded-sm"
        style={{
          background: '#f472b6',
          boxShadow: '0 0 8px #f472b6, 0 0 12px #06b6d4',
          animation: 'miniNeonBuzz 0.1s ease-in-out infinite alternate',
        }}
      />
    </div>
  )
}

function MiniEnergyShield() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="w-6 h-6 rounded-full border-2 border-blue-400/60"
        style={{
          boxShadow: '0 0 6px #3b82f6',
          animation: 'miniShieldPulse 1s ease-in-out infinite',
        }}
      />
    </div>
  )
}

function MiniDataStream() {
  return (
    <div className="absolute inset-0 overflow-hidden font-mono text-[6px] text-green-500/80">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${20 + i * 25}%`,
            top: '-10%',
            animation: 'miniDataFall 1s linear infinite',
            animationDelay: `${i * 0.3}s`,
          }}
        >
          10
        </div>
      ))}
    </div>
  )
}

function MiniReactorCore() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="w-3 h-3 rounded-full"
        style={{
          background: 'radial-gradient(circle, #facc15, #f97316)',
          boxShadow: '0 0 8px #f97316',
          animation: 'miniReactorPulse 0.5s ease-in-out infinite',
        }}
      />
    </div>
  )
}

function MiniDronePatrol() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute w-2 h-1 bg-slate-400 rounded-sm"
        style={{
          top: '40%',
          animation: 'miniDroneFly 2s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// Map effect IDs to their preview components
const effectPreviews: Record<EffectId, React.FC> = {
  'rain': MiniRain,
  'snow': MiniSnow,
  'fog': MiniFog,
  'torch': MiniTorch,
  'campfire': MiniCampfire,
  'water-ripples': MiniWaterRipples,
  'waterfall': MiniWaterfall,
  'lightning': MiniLightning,
  'smoke': MiniSmoke,
  'wind': MiniWind,
  'arcane-circles': MiniArcaneCircle,
  'portals': MiniPortal,
  'magical-crystals': MiniCrystal,
  'floating-runes': MiniFloatingRunes,
  'will-o-wisps': MiniWillOWisps,
  'divine-light': MiniDivineLight,
  'necrotic-corruption': MiniNecrotic,
  'spirit-apparitions': MiniSpirits,
  'holograms': MiniHologram,
  'neon-signs': MiniNeonSign,
  'energy-shields': MiniEnergyShield,
  'data-streams': MiniDataStream,
  'reactor-core': MiniReactorCore,
  'drone-patrols': MiniDronePatrol,
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
    core: true,
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
      <ScrollArea className="flex-1">
        <div className="py-1">
          {(['core', 'fantasy', 'scifi'] as EffectPack[]).map((pack) => (
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

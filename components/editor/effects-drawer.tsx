'use client'

import { useState, useMemo } from 'react'
import {
  ChevronDown, ChevronRight, Plus, Cloud, Sparkles, Flame, Mountain, CircleDot, Waves, CloudRain, Skull, Gem, Droplets, CloudFog, Sparkle, Lamp, Sun, Wind, Snowflake, Leaf
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EFFECT_PACKS,
  getEffectsByPack,
  type EffectPack,
  type EffectDefinition
} from '@/lib/effects-library'

// Simple icon map for pack headers
const packIconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'flame': Flame,
  'cloud': Cloud,
  'mountain': Mountain,
  'sparkles': Sparkles,
  'circle-dot': CircleDot,
  'waves': Waves,
  'cloud-rain': CloudRain,
  'skull': Skull,
  'gem': Gem,
  'droplets': Droplets,
  'cloud-fog': CloudFog,
  'sparkle': Sparkle,
  'lamp': Lamp,
  'sun': Sun,
  'wind': Wind,
  'snowflake': Snowflake,
  'leaf': Leaf,
}

interface EffectsDrawerProps {
  onAddEffect: (effect: EffectDefinition) => void
}

function EffectCard({ effect, onAdd }: { effect: EffectDefinition; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className={cn(
        "group relative w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
        "bg-card/50 hover:bg-card border border-border/50 hover:border-primary/50",
        "transition-all duration-200 text-left"
      )}
    >
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
    'light-sprites': false,
    'light-procedural': false,
    'fire-sprites': false,

    'fire-procedural': false,
    'water-sprites': false,

    'water-procedural': false,
    ice: false,
    earth: false,
    air: false,
    nature: false,
    'necrotic-sprites': false,
    'necrotic-procedural': false,
    divine: false,
    'magic-sprites': false,
    'magic-procedural': false,
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
      <div className="flex-1 overflow-y-auto">
        <div className="py-1">
          {(['light-sprites', 'light-procedural', 'fire-sprites', 'fire-procedural', 'water-sprites', 'water-procedural', 'ice', 'earth', 'air', 'nature', 'divine', 'magic-sprites', 'magic-procedural', 'necrotic-sprites', 'necrotic-procedural'] as EffectPack[]).map((pack) => (
            <PackSection
              key={pack}
              pack={pack}
              isExpanded={expandedPacks[pack]}
              onToggle={() => togglePack(pack)}
              onAddEffect={onAddEffect}
            />
          ))}
        </div>
      </div>
      
      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Click an effect to add it to your map
        </p>
      </div>
    </aside>
  )
}

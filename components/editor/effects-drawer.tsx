'use client'

import { useState, useMemo } from 'react'
import { 
  Cloud, Snowflake, Flame, Droplets, Waves, Zap, Wind,
  Sparkles, CircleDot, Gem, Sun, Skull, Ghost,
  Monitor, Lightbulb, Shield, Binary, Atom, Plane,
  ChevronDown, ChevronRight, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  effectsLibrary, 
  EFFECT_PACKS, 
  getEffectsByPack,
  type EffectPack, 
  type EffectDefinition 
} from '@/lib/effects-library'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'cloud-rain': Cloud,
  'cloud': Cloud,
  'snowflake': Snowflake,
  'flame': Flame,
  'droplets': Droplets,
  'waves': Waves,
  'zap': Zap,
  'wind': Wind,
  'circle': CircleDot,
  'circle-dot': CircleDot,
  'gem': Gem,
  'sparkles': Sparkles,
  'sparkle': Sparkles,
  'sun': Sun,
  'skull': Skull,
  'ghost': Ghost,
  'monitor': Monitor,
  'lightbulb': Lightbulb,
  'shield': Shield,
  'binary': Binary,
  'atom': Atom,
  'plane': Plane,
  'cpu': Monitor,
}

interface EffectsDrawerProps {
  onAddEffect: (effect: EffectDefinition) => void
}

function EffectCard({ effect, onAdd }: { effect: EffectDefinition; onAdd: () => void }) {
  const IconComponent = iconMap[effect.icon] || Sparkles
  const packColor = EFFECT_PACKS[effect.pack].color
  
  return (
    <button
      onClick={onAdd}
      className={cn(
        "group relative w-full flex items-center gap-2 p-2 rounded-md",
        "bg-card/50 hover:bg-card border border-border/50 hover:border-primary/50",
        "transition-all duration-200 text-left"
      )}
    >
      {/* Animated preview background */}
      <div 
        className="relative w-8 h-8 rounded flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: `${packColor}20` }}
      >
        <div 
          className="absolute inset-0 opacity-30 animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${packColor}40 0%, transparent 70%)` 
          }}
        />
        <IconComponent 
          className="w-4 h-4 relative z-10" 
          style={{ color: packColor }}
        />
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
  const IconComponent = iconMap[packInfo.icon] || Sparkles
  
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

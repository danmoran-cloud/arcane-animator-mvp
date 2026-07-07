'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  ChevronDown, ChevronRight, Plus, Heart, Cloud, Sparkles, Flame, Mountain, CircleDot, Waves, CloudRain, Skull, Gem, Droplets, CloudFog, Sparkle, Lamp, Sun, Wind, Snowflake, Leaf
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PremiumEffectRenderer } from './premium-effects'
import {
  EFFECT_PACKS,
  getEffectsByPack,
  getEffectById,
  type EffectPack,
  type EffectDefinition
} from '@/lib/effects-library'

// Favorited effect ids, persisted across sessions.
const FAVORITES_KEY = 'arcane-animator-favorites'

// A drawer section is either a real effect pack or the synthetic Favorites group.
type DrawerSection = EffectPack | 'favorites'

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

function EffectCard({
  effect,
  onAdd,
  isFavorite,
  onToggleFavorite,
  onHover,
}: {
  effect: EffectDefinition
  onAdd: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
  onHover: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onAdd}
      onMouseEnter={onHover}
      onFocus={onHover}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAdd() } }}
      className={cn(
        "group relative w-full flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
        "bg-card/50 hover:bg-card border border-border/50 hover:border-primary/50",
        "transition-all duration-200 text-left"
      )}
    >
      {/* Favorite toggle — always visible when favorited, else appears on hover */}
      <button
        type="button"
        aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
        className={cn(
          "shrink-0 rounded p-0.5 transition-opacity",
          isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <Heart className={cn("w-3.5 h-3.5", isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} />
      </button>

      {/* Effect name */}
      <span className="flex-1 text-xs font-medium text-foreground truncate">
        {effect.name}
      </span>

      {/* Add button on hover */}
      <Plus className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

// Live animated preview, pinned to the vertical center of the viewport just to
// the right of the drawer, so it stays put as you scan down the effect list.
function EffectPreviewPanel({ effect }: { effect: EffectDefinition }) {
  return (
    <div className="fixed left-[248px] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="rounded-md border border-border bg-popover p-2 shadow-xl">
        <div className="w-56 h-36 rounded-md overflow-hidden bg-background/90 border border-border/60">
          <PremiumEffectRenderer
            effectId={effect.id}
            settings={effect.defaultSettings}
            width={224}
            height={144}
          />
        </div>
        <div className="mt-2 max-w-56">
          <p className="text-xs font-medium text-foreground">{effect.name}</p>
          <p className="text-[10px] text-muted-foreground leading-snug">{effect.description}</p>
        </div>
      </div>
    </div>
  )
}

// Shared section chrome so the Favorites group and the real packs look identical.
function DrawerSectionShell({
  icon,
  title,
  count,
  isExpanded,
  onToggle,
  children,
}: {
  icon: React.ReactNode
  title: string
  count: number
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-border/30 last:border-b-0">
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
        {icon}
        <span className="flex-1 text-sm font-serif font-semibold text-foreground text-left">
          {title}
        </span>
        <span className="text-xs text-muted-foreground">{count}</span>
      </button>
      {isExpanded && <div className="px-2 pb-2 space-y-1">{children}</div>}
    </div>
  )
}

function PackSection({
  pack,
  isExpanded,
  onToggle,
  onAddEffect,
  favorites,
  onToggleFavorite,
  onHoverEffect,
}: {
  pack: EffectPack
  isExpanded: boolean
  onToggle: () => void
  onAddEffect: (effect: EffectDefinition) => void
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onHoverEffect: (effect: EffectDefinition) => void
}) {
  const packInfo = EFFECT_PACKS[pack]
  const effects = useMemo(() => getEffectsByPack(pack), [pack])
  const IconComponent = packIconMap[packInfo.icon] || Sparkles

  return (
    <DrawerSectionShell
      icon={<IconComponent className="w-4 h-4" style={{ color: packInfo.color }} />}
      title={packInfo.name}
      count={effects.length}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {effects.map((effect) => (
        <EffectCard
          key={effect.id}
          effect={effect}
          onAdd={() => onAddEffect(effect)}
          isFavorite={favorites.has(effect.id)}
          onToggleFavorite={() => onToggleFavorite(effect.id)}
          onHover={() => onHoverEffect(effect)}
        />
      ))}
    </DrawerSectionShell>
  )
}

// Synthetic pack listing every favorited effect. Pinned to the top of the drawer.
function FavoritesSection({
  effects,
  isExpanded,
  onToggle,
  onAddEffect,
  favorites,
  onToggleFavorite,
  onHoverEffect,
}: {
  effects: EffectDefinition[]
  isExpanded: boolean
  onToggle: () => void
  onAddEffect: (effect: EffectDefinition) => void
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onHoverEffect: (effect: EffectDefinition) => void
}) {
  return (
    <DrawerSectionShell
      icon={<Heart className="w-4 h-4 fill-rose-500 text-rose-500" />}
      title="Favorites"
      count={effects.length}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {effects.length === 0 ? (
        <p className="px-2 py-3 text-[10px] text-muted-foreground text-center leading-snug">
          Click the <Heart className="inline w-3 h-3 align-text-bottom" /> beside any effect to add it here.
        </p>
      ) : (
        effects.map((effect) => (
          <EffectCard
            key={effect.id}
            effect={effect}
            onAdd={() => onAddEffect(effect)}
            isFavorite={favorites.has(effect.id)}
            onToggleFavorite={() => onToggleFavorite(effect.id)}
            onHover={() => onHoverEffect(effect)}
          />
        ))
      )}
    </DrawerSectionShell>
  )
}

export function EffectsDrawer({ onAddEffect }: EffectsDrawerProps) {
  // Accordion: at most one section open at a time, so the list never gets long.
  const [expandedSection, setExpandedSection] = useState<DrawerSection | null>(null)

  const toggleSection = (section: DrawerSection) => {
    setExpandedSection(prev => (prev === section ? null : section))
  }

  // Favorites, loaded from localStorage after mount (avoids SSR hydration mismatch).
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY)
      if (saved) setFavorites(new Set(JSON.parse(saved) as string[]))
    } catch {
      // ignore corrupt/unavailable storage
    }
  }, [])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]))
      } catch {
        // ignore
      }
      return next
    })
  }

  // Resolve favorited ids to effect definitions, in the order they were favorited.
  const favoriteEffects = useMemo(
    () => [...favorites].map(getEffectById).filter((e): e is EffectDefinition => !!e),
    [favorites],
  )

  // The effect whose live preview is currently shown. Cleared when the pointer
  // leaves the whole list so the preview persists while scanning between rows.
  const [hoveredEffect, setHoveredEffect] = useState<EffectDefinition | null>(null)

  return (
    <aside className="w-60 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <h2 className="font-serif text-sm font-semibold text-sidebar-foreground tracking-wide">
          Effects
        </h2>
      </div>

      {/* Effects list */}
      <div className="flex-1 overflow-y-auto" onMouseLeave={() => setHoveredEffect(null)}>
        <div className="py-1">
          {/* Favorites pinned to the top */}
          <FavoritesSection
            effects={favoriteEffects}
            isExpanded={expandedSection === 'favorites'}
            onToggle={() => toggleSection('favorites')}
            onAddEffect={onAddEffect}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onHoverEffect={setHoveredEffect}
          />

          {(['light-sprites', 'light-procedural', 'fire-sprites', 'fire-procedural', 'water-sprites', 'water-procedural', 'ice', 'earth', 'air', 'nature', 'divine', 'magic-sprites', 'magic-procedural', 'necrotic-sprites', 'necrotic-procedural'] as EffectPack[]).map((pack) => (
            <PackSection
              key={pack}
              pack={pack}
              isExpanded={expandedSection === pack}
              onToggle={() => toggleSection(pack)}
              onAddEffect={onAddEffect}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onHoverEffect={setHoveredEffect}
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

      {/* Vertically-centered live preview (rendered once, outside the scroll area) */}
      {hoveredEffect && <EffectPreviewPanel effect={hoveredEffect} />}
    </aside>
  )
}

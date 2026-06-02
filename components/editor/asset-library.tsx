'use client'

import { useState, useRef } from 'react'
import { useEditor, effectDefinitions } from '@/lib/editor-store'
import type { EffectCategory, EffectDefinition } from '@/lib/types'
import { EffectPreview } from './effect-renderer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Cloud, 
  Flame, 
  Droplets, 
  Sparkles, 
  Upload,
  ChevronDown,
  Wind,
  Sun,
  Wand2
} from 'lucide-react'

const categories: { id: EffectCategory; label: string; icon: React.ElementType }[] = [
  { id: 'weather', label: 'Weather', icon: Cloud },
  { id: 'fire', label: 'Fire', icon: Flame },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'magic', label: 'Magic', icon: Sparkles },
  { id: 'atmosphere', label: 'Atmosphere', icon: Wind },
  { id: 'light', label: 'Light', icon: Sun },
]

function EffectCard({ effect, onClick }: { effect: EffectDefinition; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-square rounded-lg border border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50 transition-all overflow-hidden"
    >
      {/* Animated effect preview */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
        <EffectPreview 
          effectType={effect.effectType} 
          settings={effect.defaultSettings} 
        />
      </div>
      
      {/* Category badge */}
      <div className="absolute top-1 right-1">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary/80 capitalize">
          {effect.category}
        </span>
      </div>
      
      {/* Effect info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent p-2 pt-6">
        <span className="text-xs font-medium text-foreground block truncate">
          {effect.name}
        </span>
        <span className="text-[10px] text-muted-foreground line-clamp-1">
          {effect.description}
        </span>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-arcane-blue/10 to-transparent" />
      </div>
    </button>
  )
}

function CategorySection({ 
  category, 
  effects,
  isOpen,
  onToggle,
  onEffectClick 
}: { 
  category: { id: EffectCategory; label: string; icon: React.ElementType }
  effects: EffectDefinition[]
  isOpen: boolean
  onToggle: () => void
  onEffectClick: (effect: EffectDefinition) => void
}) {
  const Icon = category.icon
  
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors"
      >
        <Icon className="w-4 h-4 text-primary/80" />
        <span className="text-sm font-medium flex-1 text-left">{category.label}</span>
        <span className="text-xs text-muted-foreground mr-2">{effects.length}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <div className="px-2 pb-3">
          {effects.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {effects.map((effect) => (
                <EffectCard 
                  key={effect.id} 
                  effect={effect} 
                  onClick={() => onEffectClick(effect)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No effects in this category
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function AssetLibrary() {
  const { state, addEffectLayer, addMapLayer } = useEditor()
  const [openCategories, setOpenCategories] = useState<Set<EffectCategory>>(
    new Set(['weather', 'fire', 'magic'])
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleCategory = (categoryId: EffectCategory) => {
    setOpenCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleEffectClick = (effect: EffectDefinition) => {
    if (!state.project) return
    addEffectLayer(effect)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !state.project) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      if (file.type.startsWith('image/')) {
        // For user uploads, add as map layer
        addMapLayer(src, file.name.replace(/\.[^/.]+$/, ''))
      }
    }
    reader.readAsDataURL(file)
    
    // Reset input
    e.target.value = ''
  }

  const getEffectsByCategory = (categoryId: EffectCategory) => {
    return effectDefinitions.filter(e => e.category === categoryId)
  }

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h2 className="font-serif text-sm font-semibold text-primary tracking-wide flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          Arcane Effects Library
        </h2>
      </div>

      {/* Upload button */}
      <div className="p-2 border-b border-border/50">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2 border-primary/30 hover:border-primary hover:bg-primary/10"
          onClick={handleUploadClick}
          disabled={!state.project}
        >
          <Upload className="w-4 h-4" />
          Upload Base Map
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Effect categories */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              effects={getEffectsByCategory(category.id)}
              isOpen={openCategories.has(category.id)}
              onToggle={() => toggleCategory(category.id)}
              onEffectClick={handleEffectClick}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <div className="p-3 border-t border-border/50 text-xs text-muted-foreground text-center">
        Click an effect to add to canvas
      </div>
    </div>
  )
}

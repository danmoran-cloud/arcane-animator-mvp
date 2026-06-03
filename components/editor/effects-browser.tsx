'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { 
  Search, 
  Star, 
  Clock, 
  Grid3X3, 
  List, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Sparkles,
  CloudRain,
  Droplets,
  Flame,
  Sun,
  Leaf,
  Building2,
  Skull,
  Rocket,
  Cpu,
  Cog,
  Radiation,
  Mountain,
  Zap,
  Filter,
  X
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  effectsLibrary, 
  categoryMeta, 
  searchEffects,
  type ExpandedEffectDefinition,
  type EffectCategory,
  type GenreTag,
  type EffectTypeTag,
  type PerformanceLevel
} from '@/lib/effects-library'
import { UnifiedEffectRenderer } from './base-effects'

// Icon mapping for categories
const categoryIcons: Record<string, React.ReactNode> = {
  'weather-atmosphere': <CloudRain className="w-4 h-4" />,
  'water-effects': <Droplets className="w-4 h-4" />,
  'fire-heat': <Flame className="w-4 h-4" />,
  'light-sources': <Sun className="w-4 h-4" />,
  'fantasy-magic': <Sparkles className="w-4 h-4" />,
  'life-nature': <Leaf className="w-4 h-4" />,
  'city-settlement': <Building2 className="w-4 h-4" />,
  'horror-dark': <Skull className="w-4 h-4" />,
  'sci-fi': <Rocket className="w-4 h-4" />,
  'cyberpunk': <Cpu className="w-4 h-4" />,
  'steampunk': <Cog className="w-4 h-4" />,
  'wasteland': <Radiation className="w-4 h-4" />,
  'set-pieces': <Mountain className="w-4 h-4" />,
}

// Performance badge colors
const performanceColors: Record<PerformanceLevel, string> = {
  'Light': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Medium': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Heavy': 'bg-red-500/20 text-red-400 border-red-500/30',
}

// Genre tag colors
const genreColors: Record<GenreTag, string> = {
  'Fantasy': 'bg-purple-500/20 text-purple-300',
  'Horror': 'bg-red-500/20 text-red-300',
  'Sci-Fi': 'bg-cyan-500/20 text-cyan-300',
  'Cyberpunk': 'bg-pink-500/20 text-pink-300',
  'Steampunk': 'bg-amber-500/20 text-amber-300',
  'Wasteland': 'bg-orange-500/20 text-orange-300',
  'Nature': 'bg-green-500/20 text-green-300',
  'City': 'bg-slate-500/20 text-slate-300',
}

// Local storage keys
const FAVORITES_KEY = 'arcane-animator-favorites'
const RECENT_KEY = 'arcane-animator-recent'

interface EffectsBrowserProps {
  onAddEffect: (effect: ExpandedEffectDefinition) => void
  isCollapsed?: boolean
}

// Effect card component with animated preview
const EffectCard = memo(function EffectCard({
  effect,
  isFavorite,
  onToggleFavorite,
  onAdd,
  viewMode,
}: {
  effect: ExpandedEffectDefinition
  isFavorite: boolean
  onToggleFavorite: () => void
  onAdd: () => void
  viewMode: 'grid' | 'list'
}) {
  const [isHovered, setIsHovered] = useState(false)

  if (viewMode === 'list') {
    return (
      <div 
        className="group flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card transition-all cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onAdd}
      >
        {/* Mini preview */}
        <div className="relative w-10 h-10 rounded bg-background/80 overflow-hidden flex-shrink-0">
          {isHovered && (
            <UnifiedEffectRenderer
              baseComponent={effect.baseComponent}
              settings={effect.defaultSettings}
              width={40}
              height={40}
              isPreview
            />
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{effect.name}</span>
            <Badge variant="outline" className={`text-[10px] px-1 py-0 ${performanceColors[effect.performance]}`}>
              {effect.performance}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{effect.description}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
          >
            <Star className={`w-3 h-3 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="group relative rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card transition-all overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onAdd}
    >
      {/* Preview area */}
      <div className="relative aspect-square bg-background/80 overflow-hidden">
        {isHovered ? (
          <UnifiedEffectRenderer
            baseComponent={effect.baseComponent}
            settings={effect.defaultSettings}
            width={120}
            height={120}
            isPreview
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {categoryIcons[effect.category]}
          </div>
        )}
        
        {/* Favorite button */}
        <button
          className="absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
        >
          <Star className={`w-3 h-3 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
        </button>
        
        {/* Performance badge */}
        <div className="absolute bottom-1 left-1">
          <Badge variant="outline" className={`text-[9px] px-1 py-0 ${performanceColors[effect.performance]}`}>
            {effect.performance}
          </Badge>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-medium truncate">{effect.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{effect.description}</p>
      </div>
      
      {/* Add overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-primary rounded-full p-2">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
    </div>
  )
})

// Category section component
const CategorySection = memo(function CategorySection({
  category,
  effects,
  favorites,
  onToggleFavorite,
  onAddEffect,
  viewMode,
  isExpanded,
  onToggleExpand,
}: {
  category: EffectCategory
  effects: ExpandedEffectDefinition[]
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onAddEffect: (effect: ExpandedEffectDefinition) => void
  viewMode: 'grid' | 'list'
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const meta = categoryMeta[category]

  return (
    <div className="border-b border-border/30 last:border-b-0">
      <button
        className="w-full flex items-center gap-2 p-2 hover:bg-muted/50 transition-colors"
        onClick={onToggleExpand}
      >
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <span className="text-primary/80">{categoryIcons[category]}</span>
        <span className="text-sm font-medium flex-1 text-left">{meta.name}</span>
        <Badge variant="secondary" className="text-[10px]">{effects.length}</Badge>
      </button>
      
      {isExpanded && (
        <div className={`p-2 pt-0 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-1'}`}>
          {effects.map((effect) => (
            <EffectCard
              key={effect.id}
              effect={effect}
              isFavorite={favorites.has(effect.id)}
              onToggleFavorite={() => onToggleFavorite(effect.id)}
              onAdd={() => onAddEffect(effect)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  )
})

export function EffectsBrowser({ onAddEffect, isCollapsed = false }: EffectsBrowserProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>('all')
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<EffectCategory>>(new Set(['weather-atmosphere', 'fantasy-magic']))
  const [activeGenreFilters, setActiveGenreFilters] = useState<Set<GenreTag>>(new Set())
  const [activeEffectFilters, setActiveEffectFilters] = useState<Set<EffectTypeTag>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  
  // Favorites and recent from localStorage
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const saved = localStorage.getItem(FAVORITES_KEY)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  
  const [recentEffects, setRecentEffects] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(RECENT_KEY)
    return saved ? JSON.parse(saved) : []
  })

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...newFavorites]))
      return newFavorites
    })
  }, [])

  // Add to recent
  const addToRecent = useCallback((id: string) => {
    setRecentEffects(prev => {
      const filtered = prev.filter(x => x !== id)
      const newRecent = [id, ...filtered].slice(0, 20)
      localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent))
      return newRecent
    })
  }, [])

  // Handle add effect
  const handleAddEffect = useCallback((effect: ExpandedEffectDefinition) => {
    addToRecent(effect.id)
    onAddEffect(effect)
  }, [addToRecent, onAddEffect])

  // Toggle category expansion
  const toggleCategory = useCallback((category: EffectCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }, [])

  // Toggle genre filter
  const toggleGenreFilter = useCallback((genre: GenreTag) => {
    setActiveGenreFilters(prev => {
      const newSet = new Set(prev)
      if (newSet.has(genre)) {
        newSet.delete(genre)
      } else {
        newSet.add(genre)
      }
      return newSet
    })
  }, [])

  // Toggle effect type filter
  const toggleEffectFilter = useCallback((effectType: EffectTypeTag) => {
    setActiveEffectFilters(prev => {
      const newSet = new Set(prev)
      if (newSet.has(effectType)) {
        newSet.delete(effectType)
      } else {
        newSet.add(effectType)
      }
      return newSet
    })
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveGenreFilters(new Set())
    setActiveEffectFilters(new Set())
    setSelectedCategory(null)
    setSearchQuery('')
  }, [])

  // Filter effects
  const filteredEffects = useMemo(() => {
    let results = searchQuery ? searchEffects(searchQuery) : effectsLibrary

    // Apply tab filter
    if (activeTab === 'favorites') {
      results = results.filter(e => favorites.has(e.id))
    } else if (activeTab === 'recent') {
      const recentSet = new Set(recentEffects)
      results = results.filter(e => recentSet.has(e.id))
      // Sort by recent order
      results.sort((a, b) => recentEffects.indexOf(a.id) - recentEffects.indexOf(b.id))
    }

    // Apply category filter
    if (selectedCategory) {
      results = results.filter(e => e.category === selectedCategory)
    }

    // Apply genre filters
    if (activeGenreFilters.size > 0) {
      results = results.filter(e => 
        e.genreTags.some(t => activeGenreFilters.has(t))
      )
    }

    // Apply effect type filters
    if (activeEffectFilters.size > 0) {
      results = results.filter(e => 
        e.effectTags.some(t => activeEffectFilters.has(t))
      )
    }

    return results
  }, [searchQuery, activeTab, selectedCategory, activeGenreFilters, activeEffectFilters, favorites, recentEffects])

  // Group by category for display
  const groupedEffects = useMemo(() => {
    const groups = new Map<EffectCategory, ExpandedEffectDefinition[]>()
    
    for (const effect of filteredEffects) {
      if (!groups.has(effect.category)) {
        groups.set(effect.category, [])
      }
      groups.get(effect.category)!.push(effect)
    }
    
    return groups
  }, [filteredEffects])

  // Category list for sidebar
  const categories = Object.keys(categoryMeta) as EffectCategory[]

  const hasActiveFilters = activeGenreFilters.size > 0 || activeEffectFilters.size > 0 || selectedCategory !== null

  if (isCollapsed) {
    return (
      <div className="w-12 bg-card border-r border-border flex flex-col items-center py-2 gap-2">
        <TooltipProvider>
          {categories.slice(0, 8).map((cat) => (
            <Tooltip key={cat}>
              <TooltipTrigger asChild>
                <button
                  className={`p-2 rounded-lg transition-colors ${selectedCategory === cat ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                >
                  {categoryIcons[cat]}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {categoryMeta[cat].name}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold">Arcane Effects</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search effects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-background/50"
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          className={`flex-1 py-2 text-xs font-medium transition-colors ${activeTab === 'all' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${activeTab === 'favorites' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('favorites')}
        >
          <Star className="w-3 h-3" />
          Favorites
        </button>
        <button
          className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${activeTab === 'recent' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('recent')}
        >
          <Clock className="w-3 h-3" />
          Recent
        </button>
      </div>
      
      {/* Filter bar */}
      <div className="p-2 border-b border-border flex items-center gap-2">
        <Button
          variant={showFilters ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-3 h-3 mr-1" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
              {activeGenreFilters.size + activeEffectFilters.size + (selectedCategory ? 1 : 0)}
            </Badge>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={clearFilters}
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
        
        <div className="flex-1" />
        
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewMode('grid')}
        >
          <Grid3X3 className="w-3 h-3" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewMode('list')}
        >
          <List className="w-3 h-3" />
        </Button>
      </div>
      
      {/* Filter chips */}
      {showFilters && (
        <div className="p-2 border-b border-border space-y-2">
          {/* Genre filters */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Genre</p>
            <div className="flex flex-wrap gap-1">
              {(['Fantasy', 'Horror', 'Sci-Fi', 'Cyberpunk', 'Steampunk', 'Wasteland', 'Nature', 'City'] as GenreTag[]).map((genre) => (
                <button
                  key={genre}
                  className={`px-2 py-0.5 rounded-full text-[10px] transition-all ${
                    activeGenreFilters.has(genre) 
                      ? genreColors[genre] + ' ring-1 ring-white/20'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => toggleGenreFilter(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
          
          {/* Effect type filters */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Type</p>
            <div className="flex flex-wrap gap-1">
              {(['Weather', 'Fire', 'Water', 'Magic', 'Light', 'Creature', 'Environmental', 'Set Piece'] as EffectTypeTag[]).map((type) => (
                <button
                  key={type}
                  className={`px-2 py-0.5 rounded-full text-[10px] transition-all ${
                    activeEffectFilters.has(type)
                      ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => toggleEffectFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Category rail + content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Category rail */}
        <div className="w-10 border-r border-border/50 flex flex-col py-1">
          <TooltipProvider>
            {categories.map((cat) => {
              const count = groupedEffects.get(cat)?.length || 0
              return (
                <Tooltip key={cat}>
                  <TooltipTrigger asChild>
                    <button
                      className={`p-2 transition-colors relative ${
                        selectedCategory === cat 
                          ? 'bg-primary/20 text-primary' 
                          : count > 0 
                            ? 'hover:bg-muted text-foreground' 
                            : 'text-muted-foreground/50'
                      }`}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    >
                      {categoryIcons[cat]}
                      {count > 0 && selectedCategory !== cat && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {categoryMeta[cat].name} ({count})
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </div>
        
        {/* Effects list */}
        <ScrollArea className="flex-1">
          <div className="p-1">
            {filteredEffects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No effects found</p>
                <p className="text-xs">Try adjusting your filters</p>
              </div>
            ) : selectedCategory || searchQuery ? (
              // Flat list when category selected or searching
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-1'}>
                {filteredEffects.map((effect) => (
                  <EffectCard
                    key={effect.id}
                    effect={effect}
                    isFavorite={favorites.has(effect.id)}
                    onToggleFavorite={() => toggleFavorite(effect.id)}
                    onAdd={() => handleAddEffect(effect)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              // Grouped by category
              categories.map((cat) => {
                const effects = groupedEffects.get(cat)
                if (!effects || effects.length === 0) return null
                return (
                  <CategorySection
                    key={cat}
                    category={cat}
                    effects={effects}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onAddEffect={handleAddEffect}
                    viewMode={viewMode}
                    isExpanded={expandedCategories.has(cat)}
                    onToggleExpand={() => toggleCategory(cat)}
                  />
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Footer stats */}
      <div className="p-2 border-t border-border text-center">
        <p className="text-[10px] text-muted-foreground">
          {filteredEffects.length} of {effectsLibrary.length} effects
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { useEditor, mockAssets } from '@/lib/editor-store'
import type { AssetCategory, Asset } from '@/lib/types'
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
  Image
} from 'lucide-react'

const categories: { id: AssetCategory; label: string; icon: React.ElementType }[] = [
  { id: 'weather', label: 'Weather', icon: Cloud },
  { id: 'fire', label: 'Fire', icon: Flame },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'magic', label: 'Magic', icon: Sparkles },
  { id: 'user', label: 'User Assets', icon: Upload },
]

function AssetCard({ asset, onClick }: { asset: Asset; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-square rounded-lg border border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50 transition-all overflow-hidden"
    >
      {/* Placeholder for asset thumbnail */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-arcane-blue/20 to-purple-energy/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary/70" />
        </div>
      </div>
      
      {/* Asset name */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2">
        <span className="text-xs text-foreground/80 truncate block">
          {asset.name}
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
  assets,
  isOpen,
  onToggle,
  onAssetClick 
}: { 
  category: { id: AssetCategory; label: string; icon: React.ElementType }
  assets: Asset[]
  isOpen: boolean
  onToggle: () => void
  onAssetClick: (asset: Asset) => void
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
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <div className="px-2 pb-3">
          {assets.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {assets.map((asset) => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset} 
                  onClick={() => onAssetClick(asset)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No assets in this category
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function AssetLibrary() {
  const { state, addAssetLayer, addMapLayer } = useEditor()
  const [openCategories, setOpenCategories] = useState<Set<AssetCategory>>(new Set(['weather', 'fire']))
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleCategory = (categoryId: AssetCategory) => {
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

  const handleAssetClick = (asset: Asset) => {
    if (!state.project) return
    addAssetLayer(asset)
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
        // For user uploads, treat as overlay asset
        addAssetLayer({
          id: `user-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          category: 'user',
          thumbnail: src,
          src,
        })
      }
    }
    reader.readAsDataURL(file)
    
    // Reset input
    e.target.value = ''
  }

  const getAssetsByCategory = (categoryId: AssetCategory) => {
    return mockAssets.filter(a => a.category === categoryId)
  }

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h2 className="font-serif text-sm font-semibold text-primary tracking-wide flex items-center gap-2">
          <Image className="w-4 h-4" />
          Asset Library
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
          Upload Asset
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Asset categories */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              assets={getAssetsByCategory(category.id)}
              isOpen={openCategories.has(category.id)}
              onToggle={() => toggleCategory(category.id)}
              onAssetClick={handleAssetClick}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <div className="p-3 border-t border-border/50 text-xs text-muted-foreground text-center">
        Click an asset to add to canvas
      </div>
    </div>
  )
}

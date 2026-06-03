'use client'

import { EditorProvider, useEditor } from '@/lib/editor-store'
import { TopNavBar } from './top-nav-bar'
import { EffectsDrawer } from './effects-drawer'
import { MapCanvas } from './map-canvas'
import { LayerPanel } from './layer-panel'
import type { EffectDefinition } from '@/lib/effects-library'

function EditorContent() {
  const { addEffectLayer } = useEditor()
  
  const handleAddEffect = (effect: EffectDefinition) => {
    addEffectLayer(effect)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Navigation */}
      <TopNavBar />
      
      {/* Main Content - Three column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Effects Drawer (240px max) */}
        <EffectsDrawer onAddEffect={handleAddEffect} />
        
        {/* Center - Map Canvas */}
        <MapCanvas />
        
        {/* Right Sidebar - Layer Stack + Inspector */}
        <LayerPanel />
      </div>
    </div>
  )
}

export function ArcaneEditor() {
  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  )
}

'use client'

import { EditorProvider, useEditor } from '@/lib/editor-store'
import { AuthProvider } from '@/lib/auth-store'
import { TopNavBar } from './top-nav-bar'
import { EffectsBrowser } from './effects-browser'
import { MapCanvas } from './map-canvas'
import { LayerInspector } from './layer-inspector'
import { LayerTimeline } from './layer-timeline'
import type { ExpandedEffectDefinition } from '@/lib/effects-library'

function EditorContent() {
  const { addExpandedEffectLayer } = useEditor()
  
  const handleAddEffect = (effect: ExpandedEffectDefinition) => {
    addExpandedEffectLayer(effect)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <TopNavBar />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Effects Browser */}
        <EffectsBrowser onAddEffect={handleAddEffect} />
        
        {/* Center - Canvas and Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Map Canvas */}
          <MapCanvas />
          
          {/* Bottom Panel - Layer Timeline */}
          <LayerTimeline />
        </div>
        
        {/* Right Sidebar - Layer Inspector */}
        <LayerInspector />
      </div>
    </div>
  )
}

export function ArcaneEditor() {
  return (
    <AuthProvider>
      <EditorProvider>
        <EditorContent />
      </EditorProvider>
    </AuthProvider>
  )
}

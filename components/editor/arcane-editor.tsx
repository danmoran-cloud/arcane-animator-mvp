'use client'

import { EditorProvider } from '@/lib/editor-store'
import { AuthProvider } from '@/lib/auth-store'
import { TopNavBar } from './top-nav-bar'
import { AssetLibrary } from './asset-library'
import { MapCanvas } from './map-canvas'
import { LayerInspector } from './layer-inspector'
import { LayerTimeline } from './layer-timeline'

export function ArcaneEditor() {
  return (
    <AuthProvider>
      <EditorProvider>
        <div className="h-screen flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <TopNavBar />
          
          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Asset Library */}
            <AssetLibrary />
            
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
      </EditorProvider>
    </AuthProvider>
  )
}

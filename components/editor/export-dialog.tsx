'use client'

import { useState } from 'react'
import { useAuth, TIER_INFO, TOKEN_COSTS, type ExportFormat } from '@/lib/auth-store'
import { useEditor } from '@/lib/editor-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { 
  Download, 
  Coins, 
  Lock, 
  Film, 
  Image as ImageIcon,
  Video,
  Sparkles,
  AlertTriangle,
  Check,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormatOption {
  format: ExportFormat
  label: string
  description: string
  icon: React.ReactNode
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    format: 'webm',
    label: 'WebM',
    description: 'Best for web, smaller file size',
    icon: <Film className="w-5 h-5" />,
  },
  {
    format: 'gif',
    label: 'GIF',
    description: 'Universal support, larger files',
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    format: 'mp4',
    label: 'MP4',
    description: 'Best quality, widest compatibility',
    icon: <Video className="w-5 h-5" />,
  },
]

export function ExportDialog() {
  const { state: authState, closeExportModal, canExport, useToken, openUpgradeModal, getTierInfo } = useAuth()
  const { state: editorState } = useEditor()
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('webm')
  const [duration, setDuration] = useState(5)
  const [fps, setFps] = useState(30)
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)

  if (!authState.user || !editorState.project) return null

  const tierInfo = getTierInfo()
  const hasWatermark = tierInfo.watermark
  const tokenCost = TOKEN_COSTS[selectedFormat]
  const canExportFormat = canExport(selectedFormat)
  const formatAvailable = tierInfo.exportFormats.includes(selectedFormat)

  const handleExport = async () => {
    if (!canExportFormat) return

    setIsExporting(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Use the token
    const success = useToken(selectedFormat)
    
    if (success) {
      setExportComplete(true)
      // Reset after showing success
      setTimeout(() => {
        setExportComplete(false)
        closeExportModal()
      }, 1500)
    }
    
    setIsExporting(false)
  }

  return (
    <Dialog open={authState.isExportModalOpen} onOpenChange={(open) => !open && closeExportModal()}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-primary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Animated Map
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose your export format and settings
          </DialogDescription>
        </DialogHeader>

        {exportComplete ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-serif text-lg text-foreground mb-2">Export Complete!</h3>
            <p className="text-sm text-muted-foreground">
              Your animated map has been exported successfully.
            </p>
          </div>
        ) : (
          <>
            {/* Preview Section */}
            <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30 aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-primary/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {editorState.project.name}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {editorState.project.layers.length} layers
                  </p>
                </div>
              </div>
              
              {/* Watermark Preview */}
              {hasWatermark && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/50 rounded text-white/70 text-xs">
                  <Sparkles className="w-3 h-3" />
                  Arcane Animator
                </div>
              )}
            </div>

            {/* Watermark Warning */}
            {hasWatermark && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-500 font-medium">Watermark will be applied</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Upgrade to Apprentice or Master tier to remove watermarks.{' '}
                    <button 
                      onClick={() => {
                        closeExportModal()
                        openUpgradeModal()
                      }}
                      className="text-primary hover:underline"
                    >
                      Upgrade now
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-foreground/80">Export Format</Label>
              <div className="grid grid-cols-3 gap-2">
                {FORMAT_OPTIONS.map((option) => {
                  const isAvailable = tierInfo.exportFormats.includes(option.format)
                  const cost = TOKEN_COSTS[option.format]
                  const hasEnoughTokens = authState.user!.tokens >= cost

                  return (
                    <button
                      key={option.format}
                      onClick={() => isAvailable && setSelectedFormat(option.format)}
                      disabled={!isAvailable}
                      className={cn(
                        'relative p-3 rounded-lg border text-left transition-all',
                        selectedFormat === option.format
                          ? 'border-primary bg-primary/10'
                          : isAvailable
                          ? 'border-border hover:border-primary/50 bg-card/50'
                          : 'border-border/50 bg-muted/30 opacity-60 cursor-not-allowed'
                      )}
                    >
                      {!isAvailable && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      <div className={cn(
                        'mb-2',
                        selectedFormat === option.format ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {option.icon}
                      </div>
                      <div className="font-medium text-sm text-foreground">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                      <div className={cn(
                        'flex items-center gap-1 mt-2 text-xs',
                        hasEnoughTokens ? 'text-primary' : 'text-destructive'
                      )}>
                        <Coins className="w-3 h-3" />
                        {cost} token{cost > 1 ? 's' : ''}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Export Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground/80">Duration</Label>
                  <span className="text-sm text-muted-foreground">{duration}s</span>
                </div>
                <Slider
                  value={[duration]}
                  onValueChange={([value]) => setDuration(value)}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground/80">Frame Rate</Label>
                  <span className="text-sm text-muted-foreground">{fps} FPS</span>
                </div>
                <Slider
                  value={[fps]}
                  onValueChange={([value]) => setFps(value)}
                  min={15}
                  max={60}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Token Balance */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Your balance:</span>
              </div>
              <span className="font-medium text-foreground">
                {authState.user.tokens} tokens
              </span>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeExportModal}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={!canExportFormat || isExporting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : !formatAvailable ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Upgrade Required
                  </>
                ) : authState.user.tokens < tokenCost ? (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Not Enough Tokens
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export ({tokenCost} token{tokenCost > 1 ? 's' : ''})
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Demo notice */}
        {!exportComplete && (
          <div className="p-3 bg-muted/30 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              This is a demo. The export simulates the process and deducts tokens,
              but does not generate an actual video file.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

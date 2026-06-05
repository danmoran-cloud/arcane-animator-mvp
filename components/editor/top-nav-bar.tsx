'use client'

import { useState } from 'react'
import { useEditor } from '@/lib/editor-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Save, 
  FolderOpen, 
  Download, 
  Plus,
  Sparkles,
} from 'lucide-react'
import { ExportModal } from './export-modal'
import { UserMenu } from './user-menu'

export function TopNavBar() {
  const { state, createProject, saveProject, loadProject, getSavedProjects, dispatch } = useEditor()
  const [newProjectName, setNewProjectName] = useState('')
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [isLoadProjectOpen, setIsLoadProjectOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState('')

  const savedProjects = getSavedProjects()

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim())
      setNewProjectName('')
      setIsNewProjectOpen(false)
    }
  }

  const handleSave = () => {
    saveProject()
  }

  const handleStartEditName = () => {
    if (state.project) {
      setTempName(state.project.name)
      setEditingName(true)
    }
  }

  const handleSaveName = () => {
    if (tempName.trim()) {
      dispatch({ type: 'UPDATE_PROJECT_NAME', name: tempName.trim() })
    }
    setEditingName(false)
  }

  return (
    <nav className="h-12 border-b-2 border-border bg-gradient-to-r from-card via-card/95 to-card flex items-center px-4 gap-3 relative overflow-hidden">
      {/* Decorative border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Sparkles className="w-6 h-6 text-primary" />
          <div className="absolute inset-0 blur-sm bg-primary/40 -z-10 animate-pulse" />
        </div>
        <span className="font-serif text-base font-semibold text-primary tracking-wide">
          Arcane Animator
        </span>
      </div>

      {/* Ornate separator */}
      <div className="flex items-center gap-1 px-2">
        <div className="w-1 h-1 rounded-full bg-primary/40" />
        <div className="w-6 h-px bg-gradient-to-r from-primary/40 to-transparent" />
      </div>

      {/* Project Name */}
      <div className="flex items-center">
        {state.project ? (
          editingName ? (
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="h-7 w-40 bg-muted/50 border-primary/30 text-sm"
              autoFocus
            />
          ) : (
            <button
              onClick={handleStartEditName}
              className="text-foreground/90 hover:text-foreground text-sm font-medium px-2 py-1 rounded hover:bg-muted/50 transition-colors"
            >
              {state.project.name}
            </button>
          )
        ) : (
          <span className="text-muted-foreground text-sm italic">No project</span>
        )}
      </div>

      {/* Center spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* New Project */}
        <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs hover:bg-primary/10 hover:text-primary">
              <Plus className="w-3.5 h-3.5" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-primary">Create New Project</DialogTitle>
              <DialogDescription>Begin a new map animation project</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                className="bg-muted/50 border-primary/30"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateProject} className="bg-primary text-primary-foreground">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSave}
          disabled={!state.project}
          className="h-8 gap-1.5 text-xs hover:bg-primary/10 hover:text-primary"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>

        {/* Load */}
        <Dialog open={isLoadProjectOpen} onOpenChange={setIsLoadProjectOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs hover:bg-primary/10 hover:text-primary">
              <FolderOpen className="w-3.5 h-3.5" />
              Load
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-primary">Load Project</DialogTitle>
              <DialogDescription>Continue your previous work</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[300px] py-4">
              {savedProjects.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No saved projects</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        loadProject(project.id)
                        setIsLoadProjectOpen(false)
                      }}
                      className="w-full p-3 rounded border border-border hover:border-primary/50 hover:bg-muted/30 transition-all text-left"
                    >
                      <div className="text-sm font-medium">{project.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Export */}
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={!state.project}
          onClick={() => setIsExportOpen(true)}
          className="h-8 gap-1.5 text-xs hover:bg-primary/10 hover:text-primary"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>

        {/* Export Modal */}
        <ExportModal 
          open={isExportOpen} 
          onOpenChange={setIsExportOpen}
          project={state.project}
        />

        {/* Ornate separator */}
        <div className="flex items-center gap-1 px-2">
          <div className="w-6 h-px bg-gradient-to-l from-primary/40 to-transparent" />
          <div className="w-1 h-1 rounded-full bg-primary/40" />
        </div>

        {/* User Menu with Auth */}
        <UserMenu />
      </div>
    </nav>
  )
}

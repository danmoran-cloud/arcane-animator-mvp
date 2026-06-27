'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useEditor } from '@/lib/editor-store'
import { deleteProject, getSaveQuota, type ProjectSummary } from '@/app/actions/projects'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Save,
  FolderOpen,
  Download,
  Plus,
  Trash2,
} from 'lucide-react'
import { ExportModal } from './export-modal'
import { UserMenu } from './user-menu'
import { Logo } from '@/components/logo'
import { DiscordLink } from '@/components/discord-link'

export function TopNavBar() {
  const { state, createProject, saveProject, loadProject, getSavedProjects, dispatch } = useEditor()
  const [newProjectName, setNewProjectName] = useState('')
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [isLoadProjectOpen, setIsLoadProjectOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [savedProjects, setSavedProjects] = useState<ProjectSummary[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [quota, setQuota] = useState<{ used: number; limit: number; unlimited: boolean } | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(null)

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim())
      setNewProjectName('')
      setIsNewProjectOpen(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await saveProject()
    setIsSaving(false)
    if (result.success) {
      toast.success('Project saved')
    } else {
      toast.error(result.error ?? 'Could not save project')
    }
  }

  // Load the user's saved projects from the cloud when the Load dialog opens.
  const handleLoadDialogChange = async (open: boolean) => {
    setIsLoadProjectOpen(open)
    if (open) {
      setLoadingProjects(true)
      const [projects, q] = await Promise.all([getSavedProjects(), getSaveQuota()])
      setSavedProjects(projects)
      setQuota(q)
      setLoadingProjects(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return
    const { id, name } = projectToDelete
    setProjectToDelete(null)
    const result = await deleteProject(id)
    if (result.success) {
      setSavedProjects(prev => prev.filter(p => p.id !== id))
      setQuota(prev => prev ? { ...prev, used: Math.max(0, prev.used - 1) } : prev)
      toast.success(`Deleted "${name}"`)
    } else {
      toast.error(result.error ?? 'Could not delete project')
    }
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
      <Logo size={26} href="/" />

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
          disabled={!state.project || isSaving}
          className="h-8 gap-1.5 text-xs hover:bg-primary/10 hover:text-primary"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving…' : 'Save'}
        </Button>

        {/* Load */}
        <Dialog open={isLoadProjectOpen} onOpenChange={handleLoadDialogChange}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs hover:bg-primary/10 hover:text-primary">
              <FolderOpen className="w-3.5 h-3.5" />
              Load
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-primary flex items-center justify-between gap-2">
                <span>Load Project</span>
                {quota && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {quota.unlimited ? 'Unlimited saves' : `${quota.used} / ${quota.limit} saved`}
                  </span>
                )}
              </DialogTitle>
              <DialogDescription>Continue your previous work</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[300px] py-4">
              {loadingProjects ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">Loading…</p>
                </div>
              ) : savedProjects.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No saved projects</p>
                  <p className="text-xs mt-1">Sign in and save a project to see it here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="group flex items-center rounded border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
                    >
                      <button
                        onClick={async () => {
                          const ok = await loadProject(project.id)
                          setIsLoadProjectOpen(false)
                          if (ok) toast.success(`Loaded "${project.name}"`)
                          else toast.error('Could not load project')
                        }}
                        className="flex-1 p-3 text-left"
                      >
                        <div className="text-sm font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </button>
                      <button
                        onClick={() => setProjectToDelete(project)}
                        title="Delete project"
                        className="p-3 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation (styled, in-app) */}
        <AlertDialog open={projectToDelete !== null} onOpenChange={(open) => !open && setProjectToDelete(null)}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif text-primary">Delete project?</AlertDialogTitle>
              <AlertDialogDescription>
                {projectToDelete
                  ? `"${projectToDelete.name}" will be permanently deleted. This cannot be undone.`
                  : ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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

        {/* Community Discord */}
        <DiscordLink variant="icon" label="Join our Discord community" />

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

'use client'

import { useState } from 'react'
import { useEditor } from '@/lib/editor-store'
import { useAuth, TIER_INFO } from '@/lib/auth-store'
import { TokenDisplay } from './upgrade-modal'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText, 
  Save, 
  FolderOpen, 
  Download, 
  Settings, 
  Plus,
  ChevronDown,
  Sparkles,
  User,
  LogOut,
  Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function TopNavBar() {
  const { state, createProject, saveProject, loadProject, getSavedProjects, dispatch } = useEditor()
  const { state: authState, openAuthModal, openExportModal, logout } = useAuth()
  const [newProjectName, setNewProjectName] = useState('')
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [isLoadProjectOpen, setIsLoadProjectOpen] = useState(false)
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

  const handleExport = () => {
    if (!authState.user) {
      openAuthModal('login')
      return
    }
    openExportModal()
  }

  const tierInfo = authState.user ? TIER_INFO[authState.user.tier] : null

  return (
    <nav className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <div className="relative">
          <Sparkles className="w-7 h-7 text-primary" />
          <div className="absolute inset-0 blur-md bg-primary/30 -z-10" />
        </div>
        <span className="font-serif text-lg font-semibold text-primary tracking-wider">
          Arcane Animator
        </span>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-border" />

      {/* Project Name */}
      <div className="flex items-center gap-2">
        {state.project ? (
          editingName ? (
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="h-8 w-48 bg-muted/50 border-primary/30 font-medium"
              autoFocus
            />
          ) : (
            <button
              onClick={handleStartEditName}
              className="text-foreground/90 hover:text-foreground font-medium px-2 py-1 rounded hover:bg-muted/50 transition-colors"
            >
              {state.project.name}
            </button>
          )
        ) : (
          <span className="text-muted-foreground italic">No project open</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* New Project */}
        <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted/50 hover:text-primary">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Project</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-serif text-primary">Create New Project</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Begin a new magical cartography session
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                className="bg-muted/50 border-primary/30"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSave}
          disabled={!state.project}
          className="gap-2 hover:bg-muted/50 hover:text-primary disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        {/* Load Project */}
        <Dialog open={isLoadProjectOpen} onOpenChange={setIsLoadProjectOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted/50 hover:text-primary">
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Load</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-serif text-primary">Load Project</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Continue your magical cartography work
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[300px] py-4">
              {savedProjects.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No saved projects found</p>
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
                      className="w-full p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all text-left group"
                    >
                      <div className="font-medium group-hover:text-primary transition-colors">
                        {project.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last edited: {new Date(project.updatedAt).toLocaleDateString()}
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
          onClick={handleExport}
          disabled={!state.project}
          className="gap-2 hover:bg-muted/50 hover:text-primary disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        {/* Separator */}
        <div className="h-6 w-px bg-border mx-2" />

        {/* Token Display (if logged in) */}
        {authState.user && <TokenDisplay />}

        {/* Separator */}
        {authState.user && <div className="h-6 w-px bg-border mx-2" />}

        {/* User Menu / Auth */}
        {authState.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted/50 hover:text-primary">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden sm:inline max-w-24 truncate">{authState.user.name}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <div className="px-2 py-2 border-b border-border">
                <div className="font-medium text-foreground truncate">{authState.user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{authState.user.email}</div>
                <div className={cn(
                  'flex items-center gap-1 mt-1.5 text-xs',
                  authState.user.tier === 'master' ? 'text-amber-500' : 
                  authState.user.tier === 'apprentice' ? 'text-primary' : 'text-muted-foreground'
                )}>
                  <Crown className="w-3 h-3" />
                  {tierInfo?.name}
                </div>
              </div>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => openAuthModal('login')}
              className="hover:bg-muted/50 hover:text-primary"
            >
              Sign In
            </Button>
            <Button 
              size="sm" 
              onClick={() => openAuthModal('signup')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign Up
            </Button>
          </div>
        )}

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted/50 hover:text-primary">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-muted-foreground">
              Version 1.0.0
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

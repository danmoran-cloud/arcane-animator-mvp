'use server'

import { createClient } from '@/lib/supabase/server'
import type { Project } from '@/lib/types'

export interface ProjectSummary {
  id: string
  name: string
  updatedAt: string
}

export interface SaveResult {
  success: boolean
  error?: string
}

// Free/standard users can store up to this many projects. Holders of the
// Noble's Pack (unlimited tokens) get unlimited saves.
const MAX_PROJECTS = 10
// Noble's Pack credits a sentinel balance (9,999,999). Anything this high
// means the user has unlimited tokens, so we grant unlimited saves too.
const UNLIMITED_TOKEN_THRESHOLD = 1_000_000

/**
 * Create or update a project for the signed-in user. The client-generated
 * project.id is used as the primary key, so repeated saves upsert in place.
 */
export async function saveProject(project: Project): Promise<SaveResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Please sign in to save your project.' }

  // Enforce the save limit for non-unlimited users — but only when creating a
  // NEW project. Updating an existing project is always allowed.
  const { data: profile } = await supabase
    .from('profiles')
    .select('token_balance')
    .eq('id', user.id)
    .single()
  const unlimited = (profile?.token_balance ?? 0) >= UNLIMITED_TOKEN_THRESHOLD

  if (!unlimited) {
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing) {
      const { count } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if ((count ?? 0) >= MAX_PROJECTS) {
        return {
          success: false,
          error: `You've reached the ${MAX_PROJECTS}-project limit. Delete a project, or get the Noble's Pack for unlimited saves.`,
        }
      }
    }
  }

  const { error } = await supabase
    .from('projects')
    .upsert({
      id: project.id,
      user_id: user.id,
      name: project.name,
      data: project,
    })

  if (error) {
    return { success: false, error: 'Failed to save project. Please try again.' }
  }
  return { success: true }
}

/** List the signed-in user's projects, newest first. */
export async function listProjects(): Promise<ProjectSummary[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('projects')
    .select('id, name, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error || !data) return []
  return data.map(row => ({ id: row.id, name: row.name, updatedAt: row.updated_at }))
}

/** Load a single project's full data. Returns null if not found / not owned. */
export async function loadProject(id: string): Promise<Project | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('projects')
    .select('data')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null
  return data.data as Project
}

/** Delete one of the signed-in user's projects, plus its uploaded map images. */
export async function deleteProject(id: string): Promise<SaveResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Please sign in.' }

  // Remove the project's uploaded images from storage so they don't orphan.
  // All of a project's images live under maps/<user_id>/<project_id>/.
  const folder = `${user.id}/${id}`
  const { data: files } = await supabase.storage.from('maps').list(folder)
  if (files && files.length > 0) {
    await supabase.storage.from('maps').remove(files.map(f => `${folder}/${f.name}`))
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: 'Failed to delete project.' }
  return { success: true }
}

/** Current save usage for the signed-in user, for displaying the quota. */
export async function getSaveQuota(): Promise<{ used: number; limit: number; unlimited: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { used: 0, limit: MAX_PROJECTS, unlimited: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('token_balance')
    .eq('id', user.id)
    .single()
  const unlimited = (profile?.token_balance ?? 0) >= UNLIMITED_TOKEN_THRESHOLD

  const { count } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return { used: count ?? 0, limit: MAX_PROJECTS, unlimited }
}

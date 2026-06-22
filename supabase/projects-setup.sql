-- ============================================================================
-- Arcane Animator — Cloud Save/Load setup
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).
-- ============================================================================

-- 1) PROJECTS TABLE -----------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Untitled Map',
  data        jsonb not null default '{}'::jsonb,  -- the full project (layers, grid, etc.)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Fast lookups of a user's projects, newest first.
create index if not exists projects_user_id_updated_at_idx
  on public.projects (user_id, updated_at desc);

-- 2) ROW-LEVEL SECURITY -------------------------------------------------------
-- Every user can only see and modify their own projects.
alter table public.projects enable row level security;

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

-- 3) updated_at AUTO-TOUCH ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- 4) MAP IMAGE STORAGE --------------------------------------------------------
-- Bucket for uploaded base maps (so we store URLs, not multi-MB base64 blobs).
-- Public read so the <img>/canvas can load them; writes restricted to the owner.
insert into storage.buckets (id, name, public)
values ('maps', 'maps', true)
on conflict (id) do nothing;

-- Users can upload/update/delete only within their own folder: maps/<user_id>/...
drop policy if exists "maps_read_all" on storage.objects;
create policy "maps_read_all" on storage.objects
  for select using (bucket_id = 'maps');

drop policy if exists "maps_insert_own" on storage.objects;
create policy "maps_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'maps' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "maps_update_own" on storage.objects;
create policy "maps_update_own" on storage.objects
  for update using (
    bucket_id = 'maps' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "maps_delete_own" on storage.objects;
create policy "maps_delete_own" on storage.objects
  for delete using (
    bucket_id = 'maps' and (storage.foldername(name))[1] = auth.uid()::text
  );

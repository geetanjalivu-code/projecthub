-- Project Hub — paste this entire script into
-- Supabase Dashboard → SQL Editor → New query → Run
--
-- Do this once per project. Safe to re-run.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email text not null default '',
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create table if not exists public.projects (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists projects_user_id_idx on public.projects (user_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.projects'::regclass
      and contype = 'p'
      and pg_get_constraintdef(oid) = 'PRIMARY KEY (user_id, id)'
  ) then
    alter table public.projects drop constraint if exists projects_pkey;
    alter table public.projects add primary key (user_id, id);
  end if;
end $$;

alter table public.projects enable row level security;

drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

create policy "projects_select_own"
  on public.projects for select to authenticated
  using (user_id = auth.uid());

create policy "projects_insert_own"
  on public.projects for insert to authenticated
  with check (user_id = auth.uid());

create policy "projects_update_own"
  on public.projects for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "projects_delete_own"
  on public.projects for delete to authenticated
  using (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, ''), '@', 1),
      'Designer'
    ),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant usage on schema public to anon, authenticated;
-- DML grants are required in addition to RLS. Missing grants produce
-- "permission denied for table projects" for signed-in users.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;

-- Per-account Hub Guide keys (not shared across the browser)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ai_api_key text not null default '',
  ai_model text not null default 'gpt-4o-mini',
  ai_provider text not null default 'openai',
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
drop policy if exists "user_settings_insert_own" on public.user_settings;
drop policy if exists "user_settings_update_own" on public.user_settings;
drop policy if exists "user_settings_delete_own" on public.user_settings;

create policy "user_settings_select_own"
  on public.user_settings for select to authenticated
  using (user_id = auth.uid());

create policy "user_settings_insert_own"
  on public.user_settings for insert to authenticated
  with check (user_id = auth.uid());

create policy "user_settings_update_own"
  on public.user_settings for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_settings_delete_own"
  on public.user_settings for delete to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.user_settings to authenticated;

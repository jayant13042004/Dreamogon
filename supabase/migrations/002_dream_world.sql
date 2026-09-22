-- Dream Artifacts Table
create table public.dream_artifacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  artifact_type text not null check (artifact_type in ('person','place','object','emotion','animal','activity','symbol','theme')),
  name text not null,
  description text,
  metadata jsonb default '{}'::jsonb,
  appearance_count int default 1 not null,
  first_seen_at timestamptz default now() not null,
  last_seen_at timestamptz default now() not null,
  position_x float not null default 0,
  position_y float not null default 0,
  position_z float not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, artifact_type, name)
);

-- Dream Connections Table
create table public.dream_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  artifact_id_1 uuid references public.dream_artifacts(id) on delete cascade not null,
  artifact_id_2 uuid references public.dream_artifacts(id) on delete cascade not null,
  connection_strength float default 1.0 not null,
  first_connected_at timestamptz default now() not null,
  unique(artifact_id_1, artifact_id_2)
);

-- Dream Insights Table (For higher level observations & pro teasers)
create table public.dream_insights (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  is_pro_locked boolean default false not null,
  related_dream_ids uuid[] default '{}',
  related_artifact_ids uuid[] default '{}',
  created_at timestamptz default now() not null
);

-- Dream World State Table
create table public.dream_world_state (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  world_theme text default 'ethereal' check (world_theme in ('ethereal', 'deep_ocean', 'twilight', 'lucid')),
  maturity_level int default 1 not null,
  camera_position_x float default 0,
  camera_position_y float default 0,
  camera_position_z float default 5,
  unlocked_features jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index idx_dream_artifacts_user_id on public.dream_artifacts(user_id);
create index idx_dream_artifacts_type on public.dream_artifacts(artifact_type);
create index idx_dream_connections_user_id on public.dream_connections(user_id);
create index idx_dream_insights_user_id on public.dream_insights(user_id);

-- RLS
alter table public.dream_artifacts enable row level security;
alter table public.dream_connections enable row level security;
alter table public.dream_insights enable row level security;
alter table public.dream_world_state enable row level security;

-- RLS Policies
create policy "Users can manage own artifacts" on public.dream_artifacts
  for all using (auth.uid() = user_id);

create policy "Users can manage own connections" on public.dream_connections
  for all using (auth.uid() = user_id);

create policy "Users can manage own insights" on public.dream_insights
  for all using (auth.uid() = user_id);

create policy "Users can manage own world state" on public.dream_world_state
  for all using (auth.uid() = user_id);

-- Trigger to create default world state for new users
create or replace function public.handle_new_user_world_state()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.dream_world_state (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created_world
  after insert on auth.users
  for each row execute function public.handle_new_user_world_state();

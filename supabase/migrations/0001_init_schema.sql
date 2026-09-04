-- Juniores Manager — initial schema
-- Run this in the Supabase SQL Editor for BOTH the staging and production projects
-- (staging first, verify, then production once that project exists).

-- ============================================================================
-- profiles — extends auth.users with the app's own identity/role/status
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  cognome text not null,
  username text not null unique,
  email text not null,
  telefono text,
  role text check (role in ('admin', 'allenatore', 'preparatore', 'dirigente', 'tifoso')),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  theme_preference text check (theme_preference in ('light', 'dark')),
  player_size_preference numeric,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per app user, keyed to auth.users. role is null until an admin approves the signup.';

-- Auto-create a pending profile row whenever someone signs up via Supabase Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, cognome, username, email, telefono)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    coalesce(new.raw_user_meta_data ->> 'cognome', ''),
    coalesce(new.raw_user_meta_data ->> 'username', new.id::text),
    new.email,
    new.raw_user_meta_data ->> 'telefono'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- players
-- ============================================================================
create table public.players (
  id bigint generated always as identity primary key,
  nome text not null,
  cognome text not null,
  birthdate date,
  pos text not null check (pos in ('POR', 'DIF', 'CEN', 'ATT')),
  goals int not null default 0,
  assists int not null default 0,
  minutes int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- matches
-- ============================================================================
create table public.matches (
  id bigint generated always as identity primary key,
  match_date date not null,
  match_time time,
  opponent text not null,
  is_home boolean not null,
  played boolean not null default false,
  score_for int,
  score_against int,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- trainings
-- ============================================================================
create table public.trainings (
  id bigint generated always as identity primary key,
  training_date date not null,
  training_time time not null,
  place text not null default 'Campo comunale',
  focus text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- training_attendance — the real attendance ledger.
-- Replaces the prototype's disconnected presAtt/presTot counters and
-- scheduledAbsences list: presence % everywhere is derived live from this.
-- ============================================================================
create table public.training_attendance (
  training_id bigint not null references public.trainings (id) on delete cascade,
  player_id bigint not null references public.players (id) on delete cascade,
  status text not null check (status in ('present', 'absent', 'planned_absence')),
  motivo text,
  created_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  primary key (training_id, player_id)
);

-- ============================================================================
-- notes
-- ============================================================================
create table public.notes (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  author_id uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- mvp_awards — unique(match_id) prevents assigning more than one MVP per match
-- (the prototype allowed this by accident).
-- ============================================================================
create table public.mvp_awards (
  id bigint generated always as identity primary key,
  match_id bigint not null references public.matches (id) on delete cascade,
  player_id bigint not null references public.players (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (match_id)
);

-- ============================================================================
-- opponent_notes — scouting notes per opposing team. Fully editable in the
-- real app (the prototype had this as a hardcoded read-only list).
-- ============================================================================
create table public.opponent_notes (
  id bigint generated always as identity primary key,
  team_name text not null,
  note text,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- tactical_schemes — the "Archivio allenamenti" saved tactical-board schemes.
-- ============================================================================
create table public.tactical_schemes (
  id bigint generated always as identity primary key,
  name text not null,
  tokens jsonb not null default '[]'::jsonb,
  lines jsonb not null default '[]'::jsonb,
  player_size numeric,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- Optional: one autosaved in-progress board draft per user (see plan §5 —
-- local AsyncStorage is used by default; this table exists as a ready
-- fallback if cross-device draft continuity is wanted later).
create table public.tactical_board_drafts (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  tokens jsonb not null default '[]'::jsonb,
  lines jsonb not null default '[]'::jsonb,
  player_size numeric,
  updated_at timestamptz not null default now()
);

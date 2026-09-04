-- Juniores Manager — Row Level Security policies
-- Run this AFTER 0001_init_schema.sql, in the same project.
-- Encodes the role/permission matrix at the database level, so a hidden
-- button in the UI is never the only thing stopping an unauthorized write.

-- ----------------------------------------------------------------------------
-- Helper functions
-- ----------------------------------------------------------------------------
create function public.current_role()
returns text
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_approved()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select status = 'approved' from public.profiles where id = auth.uid()), false);
$$;

-- Roles that can see every section except Utenti (allenatore/preparatore/dirigente/admin).
create function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_approved() and public.current_role() in ('admin', 'allenatore', 'preparatore', 'dirigente');
$$;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy profiles_select_self on public.profiles
  for select using (id = auth.uid());

create policy profiles_select_admin on public.profiles
  for select using (public.current_role() = 'admin');

create policy profiles_update_self_prefs on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_all on public.profiles
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ----------------------------------------------------------------------------
-- players — everyone approved can read; admin/allenatore can write
-- ----------------------------------------------------------------------------
alter table public.players enable row level security;

create policy players_select on public.players
  for select using (public.is_approved());

create policy players_write on public.players
  for all using (public.current_role() in ('admin', 'allenatore'))
  with check (public.current_role() in ('admin', 'allenatore'));

-- ----------------------------------------------------------------------------
-- matches — everyone approved can read; admin/allenatore can write
-- ----------------------------------------------------------------------------
alter table public.matches enable row level security;

create policy matches_select on public.matches
  for select using (public.is_approved());

create policy matches_write on public.matches
  for all using (public.current_role() in ('admin', 'allenatore'))
  with check (public.current_role() in ('admin', 'allenatore'));

-- ----------------------------------------------------------------------------
-- trainings — staff-only read/write (tifoso has no "Allenamenti" section)
-- ----------------------------------------------------------------------------
alter table public.trainings enable row level security;

create policy trainings_select on public.trainings
  for select using (public.is_staff());

create policy trainings_write on public.trainings
  for all using (public.current_role() in ('admin', 'allenatore', 'preparatore'))
  with check (public.current_role() in ('admin', 'allenatore', 'preparatore'));

-- ----------------------------------------------------------------------------
-- training_attendance — staff can read/write (dirigente included, per spec)
-- ----------------------------------------------------------------------------
alter table public.training_attendance enable row level security;

create policy attendance_rw on public.training_attendance
  for all using (public.is_staff())
  with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- notes — any approved, non-tifoso role can read/write (no finer gate in spec)
-- ----------------------------------------------------------------------------
alter table public.notes enable row level security;

create policy notes_rw on public.notes
  for all using (public.is_staff())
  with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- mvp_awards — staff can read; admin/allenatore can write
-- ----------------------------------------------------------------------------
alter table public.mvp_awards enable row level security;

create policy mvp_select on public.mvp_awards
  for select using (public.is_staff());

create policy mvp_write on public.mvp_awards
  for all using (public.current_role() in ('admin', 'allenatore'))
  with check (public.current_role() in ('admin', 'allenatore'));

-- ----------------------------------------------------------------------------
-- opponent_notes — staff-only (tifoso has no "Appunti avversarie" section)
-- ----------------------------------------------------------------------------
alter table public.opponent_notes enable row level security;

create policy opponent_notes_rw on public.opponent_notes
  for all using (public.is_staff())
  with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- tactical_schemes — visible to admin/allenatore/preparatore/dirigente
-- ----------------------------------------------------------------------------
alter table public.tactical_schemes enable row level security;

create policy tactical_schemes_rw on public.tactical_schemes
  for all using (public.is_staff())
  with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- tactical_board_drafts — each user only ever touches their own draft
-- ----------------------------------------------------------------------------
alter table public.tactical_board_drafts enable row level security;

create policy tactical_board_drafts_own on public.tactical_board_drafts
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- One-time bootstrap: no admin exists yet to approve the first admin through
-- the Utenti screen, so run this manually (once) after Kevin signs up for
-- real through the app's Register screen:
--
--   update public.profiles
--   set role = 'admin', status = 'approved'
--   where email = 'nerhatikevin38@gmail.com';
-- ----------------------------------------------------------------------------

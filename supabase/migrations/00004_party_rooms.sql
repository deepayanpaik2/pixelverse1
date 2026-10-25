-- ============================================================
-- PARTY ROOMS (live voice / video / chat rooms)
-- Works for guests too (no Supabase Auth account needed).
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

create extension if not exists pgcrypto;

-- 1. Rooms ----------------------------------------------------
create table if not exists public.party_rooms (
  id               uuid primary key default gen_random_uuid(),
  code             text unique not null,
  name             text not null check (char_length(name) between 1 and 60),
  description      text not null default '' check (char_length(description) <= 160),
  host_client_id   text not null,
  host_name        text not null default 'Guest',
  visibility       text not null default 'public' check (visibility in ('public', 'unlisted', 'private')),
  max_participants int  not null default 8 check (max_participants between 2 and 12),
  selected_game_id text,
  member_count     int  not null default 0,
  is_closed        boolean not null default false,
  created_at       timestamptz not null default now(),
  last_active_at   timestamptz not null default now()
);

create index if not exists idx_party_rooms_listing
  on public.party_rooms (visibility, is_closed, last_active_at desc);

-- 2. Chat history (live chat itself goes over Realtime Broadcast) ----
create table if not exists public.party_messages (
  id          uuid primary key default gen_random_uuid(),
  room_code   text not null references public.party_rooms(code) on delete cascade,
  client_id   text not null,
  sender_name text not null check (char_length(sender_name) <= 40),
  body        text not null check (char_length(body) between 1 and 500),
  created_at  timestamptz not null default now()
);

create index if not exists idx_party_messages_room
  on public.party_messages (room_code, created_at desc);

-- 3. Row level security ----------------------------------------
alter table public.party_rooms    enable row level security;
alter table public.party_messages enable row level security;

drop policy if exists "party_rooms_read"   on public.party_rooms;
drop policy if exists "party_rooms_create" on public.party_rooms;
drop policy if exists "party_msgs_read"    on public.party_messages;
drop policy if exists "party_msgs_create"  on public.party_messages;

-- Anyone can read rooms (private rooms are protected by their secret code)
create policy "party_rooms_read"   on public.party_rooms    for select using (true);
create policy "party_rooms_create" on public.party_rooms    for insert with check (true);
create policy "party_msgs_read"    on public.party_messages for select using (true);
create policy "party_msgs_create"  on public.party_messages for insert with check (true);

-- No direct UPDATE / DELETE for anonymous users: they go through the
-- functions below, which check who the host is.

-- 4. Safe functions --------------------------------------------

-- Keeps the room "alive" and shows the live member count in the room list.
create or replace function public.party_room_heartbeat(p_code text, p_count int)
returns void
language sql
security definer
set search_path = public
as $$
  update public.party_rooms
     set member_count = greatest(p_count, 0),
         last_active_at = now()
   where code = p_code and is_closed = false;
$$;

-- Only the host can close the room.
create or replace function public.close_party_room(p_code text, p_client_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  update public.party_rooms
     set is_closed = true, member_count = 0
   where code = p_code and host_client_id = p_client_id;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

-- Only the host can change the party game.
create or replace function public.set_party_room_game(p_code text, p_client_id text, p_game text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  update public.party_rooms
     set selected_game_id = p_game
   where code = p_code and host_client_id = p_client_id and is_closed = false;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

grant execute on function public.party_room_heartbeat(text, int)        to anon, authenticated;
grant execute on function public.close_party_room(text, text)           to anon, authenticated;
grant execute on function public.set_party_room_game(text, text, text)  to anon, authenticated;

-- 5. Optional cleanup: delete rooms that were inactive for 2 days.
--    (Run manually now and then, or schedule with pg_cron if you enable it.)
-- delete from public.party_rooms where last_active_at < now() - interval '2 days';

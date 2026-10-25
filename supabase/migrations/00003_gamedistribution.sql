-- Migration 00003: GameDistribution catalog fields
alter table public.games add column if not exists gd_game_hash text unique;
alter table public.games add column if not exists embed_url text;
alter table public.games add column if not exists thumbnail_large_url text;
alter table public.games add column if not exists aspect_ratio text default '16:9';
alter table public.games add column if not exists supports_mobile boolean default true;
alter table public.games add column if not exists supports_desktop boolean default true;
alter table public.games add column if not exists is_multiplayer boolean default false;
alter table public.games add column if not exists developer_name text;
alter table public.games add column if not exists source text default 'gamedistribution';
alter table public.games add column if not exists status text default 'active';
alter table public.games add column if not exists featured boolean default false;
alter table public.games add column if not exists last_synced_at timestamptz;
alter table public.games add column if not exists instructions text;
create index if not exists idx_games_status on public.games(status);
create index if not exists idx_games_featured on public.games(featured);
create index if not exists idx_games_play_count on public.games(play_count desc);

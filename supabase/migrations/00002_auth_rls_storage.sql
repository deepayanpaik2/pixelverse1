-- 00002 (safe to re-run)

-- 1. Signup trigger: creates profile + preferences
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text,1,8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'New Player'),
    ''
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Make sure RLS is on everywhere
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.friendships enable row level security;
alter table public.friend_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;
alter table public.message_attachments enable row level security;
alter table public.notifications enable row level security;
alter table public.games enable row level security;
alter table public.game_favorites enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_events enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.room_invitations enable row level security;
alter table public.parties enable row level security;
alter table public.party_members enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_channels enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.user_blocks enable row level security;
alter table public.stickers enable row level security;

-- 3. Core policies (drop first so re-running never fails)
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can read own preferences" on public.user_preferences;
create policy "Users can read own preferences" on public.user_preferences for select using (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences" on public.user_preferences for update using (auth.uid() = user_id);

-- 4. Storage buckets with size/type limits
insert into storage.buckets (id, name, public) values ('avatars','avatars',true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('banners','banners',true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('stickers','stickers',true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('attachments','attachments',false) on conflict do nothing;

update storage.buckets set file_size_limit = 2097152,  allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'] where id = 'avatars';
update storage.buckets set file_size_limit = 5242880,  allowed_mime_types = array['image/png','image/jpeg','image/webp'] where id = 'banners';
update storage.buckets set file_size_limit = 1048576,  allowed_mime_types = array['image/png','image/webp','image/gif'] where id = 'stickers';
update storage.buckets set file_size_limit = 10485760, allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'] where id = 'attachments';

-- 5. Avatar storage policies
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible" on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
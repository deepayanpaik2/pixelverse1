-- ====================================================================
-- 00005_auth_profile_setup.sql  (safe to re-run)
-- Real sign-up -> profile creation flow, DP uploads, missing columns
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- ====================================================================

-- 1. New profile columns -------------------------------------------------
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='profiles' and column_name='profile_completed') then
    alter table public.profiles add column profile_completed boolean not null default false;
    -- everyone who already exists keeps working: mark them completed once
    update public.profiles set profile_completed = true;
  end if;
end $$;

alter table public.profiles add column if not exists last_seen_at timestamptz default now();

-- 2. Columns the app already expects on user_preferences -----------------
alter table public.user_preferences add column if not exists kids_mode boolean default false;
alter table public.user_preferences add column if not exists language text default 'en';

-- 3. Username format (not valid = does not break old rows) ---------------
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username ~ '^[a-z0-9_]{3,20}$') not valid;

-- 4. Signup trigger: sanitised username, default avatar, collision-safe --
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_display  text;
begin
  v_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username',''), '[^a-zA-Z0-9_]', '', 'g'));
  if length(v_username) < 3 then
    v_username := 'user_' || substr(replace(new.id::text,'-',''),1,8);
  end if;
  v_username := left(v_username, 20);
  v_display := coalesce(nullif(new.raw_user_meta_data->>'display_name',''), v_username);

  begin
    insert into public.profiles (id, username, display_name, avatar_url, status, profile_completed)
    values (new.id, v_username, v_display,
            'https://api.dicebear.com/7.x/bottts/svg?seed=' || v_username, 'online', false)
    on conflict (id) do nothing;
  exception when unique_violation then
    -- username already taken: keep signup working with a unique suffix
    insert into public.profiles (id, username, display_name, avatar_url, status, profile_completed)
    values (new.id, left(v_username,14) || '_' || substr(replace(new.id::text,'-',''),1,5), v_display,
            'https://api.dicebear.com/7.x/bottts/svg?seed=' || v_username, 'online', false)
    on conflict (id) do nothing;
  end;

  insert into public.user_preferences (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Policies the client needs ------------------------------------------
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can insert own preferences" on public.user_preferences;
create policy "Users can insert own preferences" on public.user_preferences
  for insert with check (auth.uid() = user_id);

-- 6. Avatar bucket (already created by 00002, re-assert so DP uploads work)
insert into storage.buckets (id, name, public) values ('avatars','avatars',true) on conflict (id) do nothing;
update storage.buckets
   set file_size_limit = 2097152,
       allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif']
 where id = 'avatars';

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

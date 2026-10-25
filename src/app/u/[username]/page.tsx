'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, 
  Gamepad2, 
  Trophy, 
  Clock, 
  Share2, 
  UserPlus, 
  MessageSquare, 
  ShieldAlert, 
  Ban, 
  Check, 
  Calendar,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { mockStore } from '@/lib/supabase/mock-store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Profile } from '@/types';
import { ProfileCover } from '@/components/profile/ProfileCover';
import { useAuth } from '@/features/auth/AuthContext';
import { FEATURED_GAMES } from '@/lib/games';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const { user, isLoading } = useAuth();

  // 1) demo players, 2) the signed-in account itself, 3) a real account stored in the backend
  const [remote, setRemote] = useState<Profile | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const wanted = String(username || '').toLowerCase();
  const local =
    mockStore.getProfileByUsername(username) ??
    (user && user.username.toLowerCase() === wanted ? user : undefined);

  useEffect(() => {
    setRemote(null);
    if (local || !wanted || !isSupabaseConfigured()) return;
    let cancelled = false;
    setLookingUp(true);
    supabase
      .from('profiles')
      .select('*')
      .ilike('username', wanted)
      .maybeSingle()
      .then(({ data: row }) => {
        if (cancelled) return;
        if (row) {
          setRemote({
            id: row.id,
            username: row.username,
            display_name: row.display_name || row.username,
            avatar_url: row.avatar_url || '',
            banner_url: row.banner_url || undefined,
            bio: row.bio || '',
            status: row.status || 'online',
            custom_status: row.custom_status || undefined,
            favorite_categories: row.favorite_categories || [],
            level: row.level ?? 1,
            xp: row.xp ?? 0,
            is_admin: !!row.is_admin,
            is_moderator: !!row.is_moderator,
            created_at: row.created_at || new Date().toISOString(),
            updated_at: row.updated_at,
          } as Profile);
        }
      })
      .then(() => { if (!cancelled) setLookingUp(false); }, () => { if (!cancelled) setLookingUp(false); });
    return () => { cancelled = true; };
  }, [local, wanted]);

  const profile = local ?? remote ?? undefined;

  const [copied, setCopied] = useState(false);
  const [friendStatus, setFriendStatus] = useState<string>('none');
  const [showBlockModal, setShowBlockModal] = useState(false);

  if (!profile && (isLoading || lookingUp)) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-5 text-slate-400" role="status">
        <div className="gem-loader" />
        <p className="text-sm">Loading profile</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center glass-panel rounded-xl border border-arcade-border">
        <User className="w-12 h-12 text-arcade-rose mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Player Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">No profile exists with the username @{username}.</p>
        <Link href="/players" className="btn-gold mt-4 inline-block px-5 py-2 font-bold text-xs rounded-full">
          Discover Players
        </Link>
      </div>
    );
  }

  const isMe = user?.id === profile.id;
  const favorites = mockStore.getFavorites(profile.id);
  const favoriteGames = FEATURED_GAMES.filter(g => favorites.includes(g.id));

  const copyProfileLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddFriend = () => {
    if (!user) return;
    mockStore.sendFriendRequest(user.id, profile.id);
    setFriendStatus('sent');
  };

  const handleBlockUser = () => {
    if (user) {
      mockStore.blockUser(user.id, profile.id);
      router.push('/friends');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Back button */}
      <Link
        href="/players"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-arcade-champagne transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Players
      </Link>

      {/* Profile Header & Banner Card */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-arcade-border shadow-2xl">
        {/* Cover */}
        <div className="h-44 sm:h-60 w-full relative bg-arcade-midnight">
          <ProfileCover bannerUrl={profile.banner_url} seed={profile.username} />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 pb-6 pt-0 relative z-10 -mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="relative">
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-arcade-dark shadow-2xl bg-arcade-surface"
              />
              <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-arcade-dark ${
                profile.status === 'online' ? 'bg-arcade-sage' : profile.status === 'dnd' ? 'bg-arcade-rose' : 'bg-slate-500'
              }`} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">{profile.display_name}</h1>
                {profile.is_admin && (
                  <span className="px-2 py-0.5 rounded bg-arcade-rose text-white text-[10px] font-bold uppercase tracking-wider">
                    Staff
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono">@{profile.username}</div>
            </div>
          </div>

          {/* Social Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyProfileLink}
              className="px-3 py-2 rounded-xl bg-arcade-surface border border-arcade-border text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-arcade-sage" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Share'}
            </button>

            {!isMe && (
              <>
                <Link
                  href="/messages"
                  className="px-3 py-2 rounded-xl bg-arcade-surface border border-arcade-border text-xs font-bold text-slate-300 hover:text-arcade-champagne transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </Link>

                <button
                  onClick={handleAddFriend}
                  disabled={friendStatus === 'sent'}
                  className="px-4 py-2 rounded-xl bg-arcade-champagne text-arcade-dark font-extrabold text-xs shadow-champagne-glow hover:bg-white transition-colors flex items-center gap-1.5"
                >
                  {friendStatus === 'sent' ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  {friendStatus === 'sent' ? 'Request Sent' : 'Add Friend'}
                </button>

                <button
                  onClick={() => setShowBlockModal(true)}
                  className="p-2 rounded-xl bg-arcade-surface border border-arcade-border text-slate-400 hover:text-arcade-rose"
                  title="Block User"
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details & Gaming Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bio & Badges */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-arcade-border space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">About Player</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {profile.bio || 'This player keeps their bio shrouded in mystery.'}
            </p>

            <div className="pt-3 border-t border-arcade-border/60 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-arcade-champagne" />
                <span>Status: <b className="text-arcade-sage capitalize">{profile.status}</b></span>
              </div>
            </div>
          </div>

          {/* Level Progression */}
          <div className="glass-panel p-6 rounded-2xl border border-arcade-border space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase tracking-wider">Arcade Level</span>
              <span className="font-mono text-arcade-orchid font-bold">Lv. {profile.level}</span>
            </div>
            <div className="w-full bg-arcade-midnight h-2 rounded-full overflow-hidden border border-arcade-border">
              <div className="bg-gradient-to-r from-arcade-orchid to-arcade-champagne h-full w-3/4 rounded-full" />
            </div>
            <div className="text-[10px] text-slate-400 text-right font-mono">
              {profile.xp.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Favorite Games & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-arcade-border space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-arcade-champagne" /> Favorite Games
            </h2>

            {favoriteGames.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No favorite games added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteGames.map(game => (
                  <Link
                    key={game.id}
                    href={`/games/${game.slug}`}
                    className="p-3 rounded-xl bg-arcade-midnight border border-arcade-border hover:border-arcade-champagne transition-all flex items-center gap-3"
                  >
                    <img src={game.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{game.title}</div>
                      <div className="text-[10px] text-slate-400">{game.category}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-arcade-border space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ban className="w-4 h-4 text-arcade-rose" /> Block @{profile.username}?
            </h3>
            <p className="text-xs text-slate-400">
              Blocked users cannot send you messages, friend requests, or room invites.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-arcade-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-arcade-rose text-white hover:bg-arcade-rose/80"
              >
                Block User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

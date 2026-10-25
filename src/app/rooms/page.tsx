'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Tv, 
  Plus, 
  Users, 
  Volume2, 
  Lock, 
  Globe, 
  Gamepad2, 
  Search,
  LogIn,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { FEATURED_GAMES } from '@/lib/games';
import { GameSelect } from '@/components/portal/GameSelect';
import {
  createRoom,
  listPublicRooms,
  getIdentity,
  normalizeCode,
  roomsBackendReady,
  type PartyRoom,
} from '@/lib/party/rooms';

function RoomsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldOpenCreate = searchParams.get('create') === 'true';
  const preselectedGame = searchParams.get('game') || '';

  const { user } = useAuth();

  const [rooms, setRooms] = useState<PartyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(shouldOpenCreate);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [selectedGameId, setSelectedGameId] = useState(preselectedGame || FEATURED_GAMES[0].id);
  const [maxParticipants, setMaxParticipants] = useState(8);

  const refresh = useCallback(async () => {
    if (!roomsBackendReady()) {
      setLoadError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.');
      setLoading(false);
      return;
    }
    try {
      setRooms(await listPublicRooms());
      setLoadError('');
    } catch (e: any) {
      setLoadError(e?.message || 'Could not load rooms. Did you run the 00004_party_rooms.sql migration?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 10000);
    return () => clearInterval(t);
  }, [refresh]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || creating) return;
    setCreating(true);
    setCreateError('');
    try {
      const room = await createRoom({
        name: name.trim(),
        description: description.trim(),
        visibility,
        maxParticipants,
        gameId: selectedGameId || null,
        identity: getIdentity(user?.display_name),
      });
      router.push(`/rooms/${room.code}`);
    } catch (err: any) {
      setCreateError(err?.message || 'Could not create the room.');
      setCreating(false);
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = normalizeCode(joinCode);
    if (code) router.push(`/rooms/${code}`);
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arcade-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Tv className="w-7 h-7 text-arcade-sage" /> Live Gaming Rooms
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Free live voice, video and screen-share parties with text chat. No download, no account needed.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-mosaic flex items-center gap-2 px-4 py-2 rounded-xl bg-arcade-sage text-arcade-dark font-extrabold text-xs sm:text-sm shadow-sage-glow hover:bg-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Room
        </button>
      </div>

      {/* Search + Join by code */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-arcade-midnight border border-arcade-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-arcade-sage"
          />
        </div>
        <form onSubmit={handleJoinByCode} className="flex gap-2">
          <input
            type="text"
            placeholder="Have a code? e.g. K7P2QX"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            maxLength={12}
            className="w-48 bg-arcade-midnight border border-arcade-border rounded-lg px-3 py-2 text-xs font-mono uppercase text-white placeholder-slate-400 focus:outline-none focus:border-arcade-champagne"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-arcade-champagne text-arcade-dark font-extrabold text-xs hover:bg-white transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" /> Join
          </button>
        </form>
      </div>

      {loadError && (
        <div className="p-3 rounded-lg border border-arcade-rose/40 bg-arcade-rose/10 text-xs text-arcade-rose">
          {loadError}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading live rooms...
        </div>
      )}
      {!loading && !loadError && filteredRooms.length === 0 && (
        <div className="py-14 text-center glass-panel rounded-xl border border-arcade-border">
          <Tv className="w-10 h-10 text-arcade-sage mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No live rooms right now</h3>
          <p className="text-xs text-slate-400 mt-1">Be the first: create a room and share the link with your friends.</p>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => {
          const game = FEATURED_GAMES.find(g => g.id === room.selected_game_id);

          return (
            <div
              key={room.id}
              className="glass-panel p-5 rounded-xl border border-arcade-border flex flex-col justify-between space-y-4 hover:border-arcade-sage transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-arcade-sage/10 text-arcade-sage border border-arcade-sage/30">
                    CODE: {room.code}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {room.visibility === 'public' ? (
                      <span title="Public Room"><Globe className="w-3.5 h-3.5 text-slate-400" /></span>
                    ) : (
                      <span title="Private"><Lock className="w-3.5 h-3.5 text-arcade-rose" /></span>
                    )}
                    <span className="flex items-center gap-1 font-semibold">
                      <Users className="w-3.5 h-3.5" /> {room.member_count}/{room.max_participants}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{room.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{room.description}</p>
                </div>

                {game && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-arcade-midnight border border-arcade-border/60">
                    <img src={game.thumbnail_url} alt={game.title} className="w-7 h-7 rounded object-cover" />
                    <div className="truncate">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Featured Game</div>
                      <div className="text-xs font-bold text-arcade-champagne truncate">{game.title}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-arcade-border/50">
                <div className="flex items-center gap-1.5 text-xs text-arcade-sage">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">Voice &amp; Video</span>
                </div>
                <Link
                  href={`/rooms/${room.code}`}
                  className="px-4 py-1.5 rounded-lg bg-arcade-sage text-arcade-dark font-extrabold text-xs hover:bg-white transition-colors"
                >
                  Join Room
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRoom}
            className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-arcade-border space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-arcade-border">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-arcade-sage" /> Create New Gaming Room
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Neon Speedrun Squad"
                  className="w-full bg-arcade-midnight border border-arcade-border rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-arcade-sage"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this party doing? (Voice required, casual, etc.)"
                  className="w-full bg-arcade-midnight border border-arcade-border rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-arcade-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Selected Game</label>
                  <GameSelect
                    value={selectedGameId}
                    onChange={(id) => setSelectedGameId(id)}
                    className="w-full bg-arcade-midnight border border-arcade-border rounded-lg p-2.5 text-white focus:outline-none focus:border-arcade-sage"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Math.min(12, Math.max(2, parseInt(e.target.value, 10) || 2)))}
                    className="w-full bg-arcade-midnight border border-arcade-border rounded-lg p-2.5 text-white focus:outline-none focus:border-arcade-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Visibility</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['public', 'unlisted', 'private'] as const).map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setVisibility(v)}
                      className={`p-2 rounded-lg capitalize font-bold transition-colors ${
                        visibility === v
                          ? 'bg-arcade-sage text-arcade-dark'
                          : 'bg-arcade-midnight border border-arcade-border text-slate-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {createError && (
              <div className="p-2.5 rounded-lg border border-arcade-rose/40 bg-arcade-rose/10 text-xs text-arcade-rose">
                {createError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-arcade-border">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-arcade-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-arcade-sage text-arcade-dark shadow-sage-glow hover:bg-white transition-colors disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Launch Room'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading rooms...</div>}>
      <RoomsContent />
    </Suspense>
  );
}

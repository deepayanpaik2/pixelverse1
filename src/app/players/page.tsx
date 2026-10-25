'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Search, 
  UserPlus, 
  MessageSquare, 
  Trophy, 
  Gamepad2, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';

export default function PlayersDiscoveryPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const players = mockStore.searchPlayers(query);

  const handleSendRequest = (targetId: string) => {
    if (!user) return;
    const res = mockStore.sendFriendRequest(user.id, targetId);
    if (res) {
      setSentRequests(prev => [...prev, targetId]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arcade-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Compass className="w-7 h-7 text-arcade-orchid" /> Discover Players
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search global arcade players, find co-op buddies, and view achievements.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username, name, or bio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-arcade-midnight border border-arcade-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-orchid"
          />
        </div>
      </div>

      {/* Players Mosaic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {players.map((p) => {
          const isMe = p.id === user?.id;
          const isSent = sentRequests.includes(p.id);

          return (
            <div
              key={p.id}
              className="glass-panel p-5 rounded-2xl border border-arcade-border flex flex-col justify-between space-y-4 hover:border-arcade-orchid transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={p.avatar_url}
                        alt={p.display_name}
                        className="w-12 h-12 rounded-xl object-cover border border-arcade-border group-hover:scale-105 transition-transform"
                      />
                      <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-arcade-dark ${
                        p.status === 'online' ? 'bg-arcade-sage' : p.status === 'dnd' ? 'bg-arcade-rose' : 'bg-slate-500'
                      }`} />
                    </div>

                    <div className="truncate">
                      <Link href={`/u/${p.username}`} className="text-sm font-bold text-white hover:text-arcade-orchid transition-colors truncate block">
                        {p.display_name}
                      </Link>
                      <span className="text-xs text-slate-400">@{p.username}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-arcade-orchid/10 border border-arcade-orchid/30 text-arcade-orchid text-[10px] font-bold font-mono">
                    Lv.{p.level}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {p.bio || 'Casual arcade gamer exploring Pixelverse.'}
                </p>

                {p.favorite_categories && p.favorite_categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.favorite_categories.map(cat => (
                      <span key={cat} className="px-2 py-0.5 rounded bg-arcade-surface text-[10px] text-slate-400 font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-arcade-border/50">
                <span className="text-[11px] font-mono text-slate-400">
                  {p.xp.toLocaleString()} XP
                </span>

                {!isMe && (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/messages"
                      className="p-1.5 rounded-lg bg-arcade-surface border border-arcade-border text-slate-300 hover:text-arcade-champagne transition-colors"
                      title="Direct Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      disabled={isSent}
                      onClick={() => handleSendRequest(p.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSent
                          ? 'bg-arcade-sage/20 text-arcade-sage border border-arcade-sage/40'
                          : 'bg-arcade-orchid text-white shadow-orchid-glow hover:bg-white hover:text-arcade-dark'
                      }`}
                    >
                      {isSent ? <Check className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                      {isSent ? 'Sent' : 'Add Friend'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

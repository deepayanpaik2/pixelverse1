'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Check, 
  X, 
  Search, 
  UserMinus, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';
import { Profile } from '@/types';

export default function FriendsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'pending' | 'add'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addFeedback, setAddFeedback] = useState<string | null>(null);

  const friends = user ? mockStore.getFriendships(user.id) : [];
  const { incoming, outgoing } = user ? mockStore.getFriendRequests(user.id) : { incoming: [], outgoing: [] };

  const onlineFriends = friends.filter(f => f.status === 'online');

  const displayedFriends = (activeTab === 'online' ? onlineFriends : friends).filter(f =>
    f.display_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleAccept = (reqId: string) => {
    mockStore.acceptFriendRequest(reqId);
    setActiveTab('all');
  };

  const handleReject = (reqId: string) => {
    mockStore.rejectFriendRequest(reqId);
  };

  const handleRemoveFriend = (friendId: string) => {
    if (user) {
      mockStore.removeFriend(user.id, friendId);
    }
  };

  const handleSendFriendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !addUsername.trim()) return;

    const target = mockStore.getProfileByUsername(addUsername.trim());
    if (!target) {
      setAddFeedback('Player not found with that username.');
      return;
    }

    if (target.id === user.id) {
      setAddFeedback('You cannot send a friend request to yourself!');
      return;
    }

    const res = mockStore.sendFriendRequest(user.id, target.id);
    if (!res) {
      setAddFeedback('Friend request is already pending or you are already friends.');
    } else {
      setAddFeedback(`Friend request sent to ${target.display_name}!`);
      setAddUsername('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arcade-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-arcade-champagne" /> Friends & Social Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Connect with arcade companions, track online presence, and jump into parties together.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-arcade-midnight border border-arcade-border rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'all' ? 'bg-arcade-champagne text-arcade-dark' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'online' ? 'bg-arcade-champagne text-arcade-dark' : 'text-slate-400 hover:text-white'
            }`}
          >
            Online ({onlineFriends.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors relative ${
              activeTab === 'pending' ? 'bg-arcade-champagne text-arcade-dark' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending {incoming.length > 0 && `(${incoming.length})`}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'add' ? 'bg-arcade-sage text-arcade-dark' : 'text-arcade-sage hover:bg-arcade-sage/10'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Friend
          </button>
        </div>
      </div>

      {activeTab === 'add' ? (
        /* Add Friend Form */
        <div className="max-w-xl glass-panel p-6 rounded-2xl border border-arcade-border space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-arcade-sage" /> Send Friend Request
          </h2>
          <p className="text-xs text-slate-400">
            Enter a player's exact username to invite them to your gaming circle.
          </p>

          <form onSubmit={handleSendFriendRequest} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. neon_rider, cyber_valkyrie"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                className="w-full bg-arcade-midnight border border-arcade-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-sage"
              />
            </div>

            {addFeedback && (
              <div className="text-xs font-semibold p-2.5 rounded-lg bg-arcade-surface border border-arcade-border text-arcade-champagne">
                {addFeedback}
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-arcade-sage text-arcade-dark font-extrabold text-xs shadow-sage-glow hover:bg-white transition-colors"
            >
              Send Request
            </button>
          </form>
        </div>
      ) : activeTab === 'pending' ? (
        /* Pending Requests View */
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Incoming Requests ({incoming.length})
            </h3>
            {incoming.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-xl border border-arcade-border text-xs text-slate-400">
                No pending incoming requests
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incoming.map((r) => (
                  <div
                    key={r.id}
                    className="glass-panel p-4 rounded-xl border border-arcade-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img src={r.sender?.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="text-xs font-bold text-white">{r.sender?.display_name}</div>
                        <div className="text-[10px] text-slate-400">@{r.sender?.username}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(r.id)}
                        className="p-2 rounded-lg bg-arcade-sage text-arcade-dark hover:bg-white"
                        title="Accept Request"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        className="p-2 rounded-lg bg-arcade-surface text-slate-400 hover:text-arcade-rose"
                        title="Decline Request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* All / Online Friends View */
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-arcade-midnight border border-arcade-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-champagne"
            />
          </div>

          {displayedFriends.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-xl border border-arcade-border">
              <Users className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No friends found</h3>
              <p className="text-xs text-slate-400 mt-1">Discover other players or invite friends using the Add Friend tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedFriends.map((f) => (
                <div
                  key={f.id}
                  className="glass-panel p-4 rounded-xl border border-arcade-border flex items-center justify-between hover:border-arcade-champagne transition-all"
                >
                  <Link href={`/u/${f.username}`} className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img src={f.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-arcade-border" />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-arcade-dark ${
                        f.status === 'online' ? 'bg-arcade-sage' : f.status === 'dnd' ? 'bg-arcade-rose' : 'bg-slate-500'
                      }`} />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate hover:underline">{f.display_name}</div>
                      <div className="text-[10px] text-slate-400 truncate">@{f.username} • Lv.{f.level}</div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href="/messages"
                      className="p-1.5 rounded-lg bg-arcade-surface border border-arcade-border text-slate-300 hover:text-arcade-champagne hover:border-arcade-champagne transition-colors"
                      title="Send Direct Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleRemoveFriend(f.id)}
                      className="p-1.5 rounded-lg bg-arcade-surface border border-arcade-border text-slate-400 hover:text-arcade-rose hover:border-arcade-rose transition-colors"
                      title="Remove Friend"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

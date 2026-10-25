'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCheck, 
  UserPlus, 
  Tv, 
  MessageSquare, 
  Trophy, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const notifications = user ? mockStore.getNotifications(user.id) : [];

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const handleMarkAllRead = () => {
    if (user) {
      mockStore.markAllNotificationsRead(user.id);
      setRefreshKey(k => k + 1);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-arcade-champagne" />;
      case 'room_invite':
        return <Tv className="w-4 h-4 text-arcade-sage" />;
      case 'direct_message':
        return <MessageSquare className="w-4 h-4 text-arcade-orchid" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-arcade-amber" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arcade-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-arcade-champagne" /> Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Stay up to date with invitations, friendships, and gaming activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-arcade-midnight p-1 border border-arcade-border text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded font-bold transition-colors ${
                filter === 'all' ? 'bg-arcade-champagne text-arcade-dark' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded font-bold transition-colors ${
                filter === 'unread' ? 'bg-arcade-champagne text-arcade-dark' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arcade-surface border border-arcade-border text-xs font-bold text-slate-300 hover:text-arcade-champagne hover:border-arcade-champagne transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="glass-panel rounded-2xl border border-arcade-border overflow-hidden divide-y divide-arcade-border/50">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <Bell className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            No notifications to display.
          </div>
        ) : (
          filtered.map((n) => (
            <Link
              key={n.id}
              href={n.link || '#'}
              className={`flex items-start gap-3.5 p-4 hover:bg-arcade-surface/60 transition-colors ${
                !n.is_read ? 'bg-arcade-champagne/5 border-l-2 border-arcade-champagne' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-arcade-surface border border-arcade-border flex-shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">{n.title}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{n.content}</p>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-1" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

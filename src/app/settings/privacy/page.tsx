'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  Ban, 
  ArrowLeft,
  Check
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';

export default function PrivacySettingsPage() {
  const { user, preferences, updatePreferences } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState(user ? mockStore.getBlockedUsers(user.id) : []);

  const handleUnblock = (targetId: string) => {
    if (user) {
      mockStore.unblockUser(user.id, targetId);
      setBlockedUsers(mockStore.getBlockedUsers(user.id));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Back button */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-arcade-champagne transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Settings
      </Link>

      <div className="border-b border-arcade-border pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Lock className="w-6 h-6 text-arcade-champagne" /> Privacy & Social Safety Controls
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Control your gaming visibility, direct messaging permissions, and manage blocked users.
        </p>
      </div>

      {/* Safety Controls Card */}
      <div className="glass-panel p-6 rounded-2xl border border-arcade-border space-y-6">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">Direct Message Permissions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['everyone', 'friends', 'none'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => updatePreferences({ privacy_allow_dms_from: opt })}
              className={`p-3 rounded-xl border text-left transition-all ${
                preferences.privacy_allow_dms_from === opt
                  ? 'border-arcade-champagne bg-arcade-champagne/10 text-white'
                  : 'border-arcade-border bg-arcade-midnight text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold capitalize">{opt === 'none' ? 'Nobody' : opt === 'everyone' ? 'Everyone' : 'Friends Only'}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {opt === 'everyone' ? 'Any registered player' : opt === 'friends' ? 'Accepted friends only' : 'Disable incoming DMs'}
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-arcade-border space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Show Game Activity on Profile</div>
              <div className="text-[11px] text-slate-400">Display games currently playing and recent sessions to friends</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.privacy_show_activity}
              onChange={(e) => updatePreferences({ privacy_show_activity: e.target.checked })}
              className="w-4 h-4 accent-arcade-champagne rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Display Online Status</div>
              <div className="text-[11px] text-slate-400">Allow friends to see when you are online in Pixelverse</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.privacy_show_online_status}
              onChange={(e) => updatePreferences({ privacy_show_online_status: e.target.checked })}
              className="w-4 h-4 accent-arcade-champagne rounded"
            />
          </div>
        </div>
      </div>

      {/* Blocked Users Section */}
      <div className="glass-panel p-6 rounded-2xl border border-arcade-border space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Ban className="w-4 h-4 text-arcade-rose" /> Blocked Users ({blockedUsers.length})
        </h2>
        <p className="text-xs text-slate-400">
          Blocked users cannot message you, view your detailed activity, or join private voice rooms you host.
        </p>

        {blockedUsers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-arcade-midnight rounded-xl border border-arcade-border">
            You haven't blocked any users.
          </div>
        ) : (
          <div className="divide-y divide-arcade-border/50">
            {blockedUsers.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={b.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <div className="text-xs font-bold text-white">{b.display_name}</div>
                    <div className="text-[10px] text-slate-400">@{b.username}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleUnblock(b.id)}
                  className="px-3 py-1.5 rounded-lg bg-arcade-surface border border-arcade-border text-xs text-slate-300 hover:text-white hover:border-arcade-rose transition-colors"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Gamepad2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';
import { GameTile } from '@/components/portal/GameTile';
import { GameManifest } from '@/types';

export default function HistoryPage() {
  const { user } = useAuth();
  const [historyGames, setHistoryGames] = useState<GameManifest[]>([]);

  useEffect(() => {
    const actorKey = user ? user.id : 'guest';
    setHistoryGames(mockStore.getHistory(actorKey));
  }, [user]);

  return (
    <div className="space-y-6 pb-16">
      <div className="border-b border-arcade-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <Clock className="w-7 h-7 text-arcade-champagne" /> Recently Played
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Jump right back into the games you recently played without losing your progress.
        </p>
      </div>

      {historyGames.length === 0 ? (
        <div className="py-24 text-center glass-panel rounded-2xl border border-arcade-border">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No play history recorded yet</h3>
          <p className="text-xs text-slate-400 mt-1">Start playing any browser game and it will appear here automatically.</p>
          <Link href="/" className="mt-4 inline-block px-5 py-2 bg-arcade-champagne text-arcade-dark rounded-xl text-xs font-bold shadow-champagne-glow">
            Start Playing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {historyGames.map((game) => (
            <GameTile key={game.id} game={game} size="1x1" />
          ))}
        </div>
      )}
    </div>
  );
}

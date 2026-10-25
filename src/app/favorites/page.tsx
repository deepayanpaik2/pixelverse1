'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Gamepad2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { FEATURED_GAMES } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';

export default function FavoritesPage() {
  const { favorites, user } = useAuth();
  const favGames = FEATURED_GAMES.filter(g => favorites.includes(g.id));

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arcade-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Heart className="w-7 h-7 text-arcade-rose fill-current" /> My Favorites
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {user ? 'Your personal library of bookmarked games.' : 'Saved on this device. Sign in to sync across phones and computers!'}
          </p>
        </div>

        {!user && (
          <Link
            href="/auth/sign-in"
            className="px-4 py-2 rounded-xl bg-arcade-champagne text-arcade-dark font-extrabold text-xs shadow-champagne-glow hover:bg-white transition-colors"
          >
            Sign in to Sync
          </Link>
        )}
      </div>

      {favGames.length === 0 ? (
        <div className="py-24 text-center glass-panel rounded-2xl border border-arcade-border">
          <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No favorites yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click the heart icon on any game tile to quickly pin it to your personal library.
          </p>
          <Link href="/" className="mt-4 inline-block px-5 py-2 bg-arcade-champagne text-arcade-dark rounded-xl text-xs font-bold shadow-champagne-glow">
            Explore Free Games
          </Link>
        </div>
      ) : (
        <GameGrid games={favGames} mosaic={false} />
      )}
    </div>
  );
}

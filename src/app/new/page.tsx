'use client';

import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { getNewGames } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';
import { CategoryChips } from '@/components/portal/CategoryChips';

export default function NewGamesPage() {
  const games = useMemo(() => getNewGames(), []);

  return (
    <div className="space-y-6 pb-16">
      <div className="border-b border-arcade-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-arcade-sage" /> New Online Games
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          The latest games added by the GameMonetize network, newest first.
        </p>
      </div>

      <CategoryChips />

      <GameGrid games={games} mosaic={false} />
    </div>
  );
}

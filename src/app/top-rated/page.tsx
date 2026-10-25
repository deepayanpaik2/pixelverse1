'use client';

import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import { getTopRatedGames } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';
import { CategoryChips } from '@/components/portal/CategoryChips';

export default function TopRatedPage() {
  const games = useMemo(() => getTopRatedGames(), []);

  return (
    <div className="space-y-6 pb-16">
      <div className="border-b border-arcade-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <Star className="w-7 h-7 text-arcade-amber fill-current" /> Top Rated Games
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Ranked by the thumbs-up votes players give on this site. Vote on any game page to help shape this list.
        </p>
      </div>

      <CategoryChips />

      <GameGrid games={games} mosaic={false} />
    </div>
  );
}

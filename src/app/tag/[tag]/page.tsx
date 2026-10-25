'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Hash, ArrowLeft, Gamepad2 } from 'lucide-react';
import { getGamesByTag } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';

export default function TagDetailPage() {
  const params = useParams();
  const rawTag = params?.tag as string;
  const tag = decodeURIComponent(rawTag || '');
  const games = useMemo(() => getGamesByTag(tag), [tag]);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between pb-4 border-b border-arcade-border">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-1.5">
            <Hash className="w-6 h-6 text-arcade-champagne" /> {tag} Games
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-arcade-champagne/10 text-arcade-champagne border border-arcade-champagne/30">
            {games.length}
          </span>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-2xl border border-arcade-border">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No games tagged with #{tag}</h3>
          <Link href="/" className="mt-4 inline-block px-4 py-2 bg-arcade-champagne text-arcade-dark rounded-xl text-xs font-bold">
            Explore All Games
          </Link>
        </div>
      ) : (
        <GameGrid games={games} mosaic={false} />
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GameManifest } from '@/types';
import { GameTile } from './GameTile';

interface GameGridProps {
  games: GameManifest[];
  /** how many tiles to add each time the visitor nears the bottom */
  pageSize?: number;
  /** poki-style grid with big and wide tiles mixed in */
  mosaic?: boolean;
  className?: string;
}

const DEFAULT_COLS = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';
const MOSAIC_COLS = 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 grid-flow-dense';

function mosaicSize(idx: number): '1x1' | '2x2' | 'wide' {
  const n = idx % 24;
  if (n === 0) return '2x2';
  if (n === 9 || n === 17) return 'wide';
  return '1x1';
}

/**
 * Renders a long list of games in chunks and keeps adding more as the visitor scrolls,
 * so a 5,000-game catalog stays instant instead of mounting thousands of tiles at once.
 */
export function GameGrid({ games, pageSize = 48, mosaic = false, className }: GameGridProps) {
  const [count, setCount] = useState(pageSize);
  const sentinel = useRef<HTMLDivElement>(null);

  // new list (filter / sort / category change) => start from the top again
  const listKey = `${games.length}:${games[0]?.id ?? ''}:${games[games.length - 1]?.id ?? ''}`;
  useEffect(() => { setCount(pageSize); }, [listKey, pageSize]);

  const total = games.length;
  const visible = Math.min(count, total);
  const hasMore = visible < total;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setCount((c) => c + pageSize); },
      { rootMargin: '1100px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, visible, pageSize]);

  return (
    <div>
      <div className={className || `grid gap-3 sm:gap-4 ${mosaic ? MOSAIC_COLS : DEFAULT_COLS}`}>
        {games.slice(0, visible).map((game, idx) => (
          <GameTile
            key={game.id}
            game={game}
            size={mosaic ? mosaicSize(idx) : '1x1'}
            priority={idx < 6}
          />
        ))}
      </div>

      {total > 0 && (
        <div ref={sentinel} className="flex flex-col items-center gap-3 pt-8 text-xs text-slate-400">
          <span className="font-mono">Showing {visible.toLocaleString()} of {total.toLocaleString()} games</span>
          {hasMore && (
            <button
              onClick={() => setCount((c) => c + pageSize * 2)}
              className="glass-chip flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-slate-100"
            >
              Load more <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

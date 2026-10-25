'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Heart, Star } from 'lucide-react';
import { GameManifest } from '@/types';
import { useAuth } from '@/features/auth/AuthContext';
import { NEW_GAME_IDS } from '@/lib/games';

interface GameTileProps {
  game: GameManifest;
  size?: '1x1' | '2x2' | 'wide';
  priority?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<GameTileProps['size']>, string> = {
  '1x1': 'aspect-[4/3]',
  wide: 'col-span-2 aspect-[8/3]',
  '2x2': 'col-span-2 row-span-2 aspect-[4/3]',
};

function GameTileBase({ game, size = '1x1', priority = false }: GameTileProps) {
  const { favorites, toggleFavorite } = useAuth();
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  // Cached images can finish loading before React attaches onLoad
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);

  const isFav = favorites.includes(game.id);
  const isNew = NEW_GAME_IDS.has(game.id);
  const hasRating = game.likes_count + game.dislikes_count > 0;
  const big = size !== '1x1';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  return (
    <Link
      href={`/game/${game.slug}`}
      title={game.title}
      className={`game-tile group relative rounded-2xl overflow-hidden border border-white/[0.09] bg-arcade-midnight block ${SIZE_CLASSES[size]}`}
    >
      {/* Skeleton while the thumbnail loads */}
      {!loaded && !broken && <div className="absolute inset-0 tile-skeleton" />}

      {broken ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-arcade-orchid/35 to-arcade-champagne/25">
          <span className="font-display text-5xl text-white/70">{game.title.charAt(0)}</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={game.thumbnail_url}
          alt={game.title}
          width={512}
          height={384}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-[transform,opacity] duration-700 ease-out group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Top badges: the left group may shrink (category truncates), "New" never gets overlapped */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="min-w-0 truncate px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/55 text-arcade-champagne border border-white/10">
            {game.category}
          </span>
          {isNew && (
            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#f6e2b0] to-[#e9cb8b] text-[#1a1408]">
              New
            </span>
          )}
        </div>
        <button
          onClick={handleFavoriteClick}
          className="shrink-0 pointer-events-auto p-1.5 rounded-full bg-black/55 border border-white/10 text-slate-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:text-arcade-rose hover:scale-110 transition-all duration-200"
          title={isFav ? 'Remove from favorites' : 'Save to favorites'}
          aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-arcade-rose text-arcade-rose' : ''}`} />
        </button>
      </div>

      {/* Title plate: full width for the title; the play button floats above it on hover */}
      <div className="absolute inset-x-0 bottom-0 tile-plate pt-10 pb-2.5 px-3">
        <h3 className={`font-semibold text-white line-clamp-2 leading-snug drop-shadow-md group-hover:text-arcade-champagne transition-colors ${big ? 'font-display text-base sm:text-xl' : 'text-[13px] sm:text-sm'}`}>
          {game.title}
        </h3>
        {hasRating && (
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-arcade-amber font-bold tabular-nums">
            <Star className="w-3 h-3 fill-current" /> {game.rating_score}
          </div>
        )}
      </div>
      <div className="absolute right-2.5 bottom-12 w-9 h-9 rounded-full btn-gold flex items-center justify-center opacity-0 translate-y-2 scale-75 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-300 pointer-events-none">
        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
      </div>
    </Link>
  );
}

export const GameTile = memo(GameTileBase);

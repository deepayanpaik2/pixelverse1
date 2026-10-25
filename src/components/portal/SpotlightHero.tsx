'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { GameManifest } from '@/types';

interface SpotlightHeroProps {
  games: GameManifest[];
}

export function SpotlightHero({ games }: SpotlightHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (games.length <= 1 || paused) return;
    const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % games.length), 6500);
    return () => clearInterval(interval);
  }, [games.length, paused]);

  if (!games || games.length === 0) return null;
  const current = games[currentIndex % games.length];
  const go = (dir: number) => setCurrentIndex((prev) => (prev + dir + games.length) % games.length);

  return (
    <div
      className="relative rounded-[1.75rem] overflow-hidden border border-white/10 bg-arcade-midnight min-h-[25rem] h-[32rem] sm:h-[26rem] lg:h-[28rem] shadow-2xl group fade-in"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Cross-fading blurred backdrops */}
      {games.map((g, i) => (
        <img
          key={g.id}
          src={g.banner_url || g.thumbnail_url}
          alt=""
          aria-hidden
          loading={i === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 w-full h-full object-cover scale-125 blur-2xl saturate-125 transition-opacity duration-[900ms] ease-in-out ${
            i === currentIndex ? 'opacity-60' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-arcade-dark via-arcade-dark/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-arcade-dark/80 via-arcade-dark/20 to-transparent" />

      <div className="relative h-full flex items-end sm:items-center gap-8 p-4 sm:p-10">
        {/* Frosted info card */}
        <div key={current.id} className="fade-up glass-clear rounded-3xl p-5 sm:p-8 max-w-xl w-full space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold btn-gold">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/10 border border-white/10 text-arcade-champagne">
              {current.category}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/10 border border-white/10 text-slate-200">
              {current.supported_players}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.04] drop-shadow-lg line-clamp-2">
            {current.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200/85 line-clamp-3 leading-relaxed">{current.description}</p>

          <div className="pt-1 flex items-center gap-3">
            <Link
              href={`/game/${current.slug}`}
              className="btn-gold flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm"
            >
              <Play className="w-4 h-4 fill-current" /> Play Now
            </Link>
            <span className="text-[11px] font-semibold text-slate-300/80">Free · no download</span>
          </div>
        </div>

        {/* Floating cover art */}
        <div key={`${current.id}-art`} className="hidden md:block flex-1 fade-in">
          <Link href={`/game/${current.slug}`} className="relative block max-w-sm ml-auto [perspective:900px]">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-arcade-champagne/40 to-arcade-orchid/40 blur-2xl opacity-70" />
            <img
              src={current.thumbnail_url}
              alt={current.title}
              className="relative w-full aspect-[4/3] object-cover rounded-3xl border border-white/25 shadow-2xl [transform:rotateY(-8deg)_rotateX(3deg)] hover:[transform:rotateY(0deg)_rotateX(0deg)_scale(1.03)] transition-transform duration-500 ease-out"
            />
          </Link>
        </div>
      </div>

      {/* Arrows */}
      {games.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous game"
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass-clear text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-arcade-champagne hover:text-black transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next game"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass-clear text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-arcade-champagne hover:text-black transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      <div className="absolute top-4 right-5 sm:top-auto sm:bottom-4 sm:right-6 flex items-center gap-1.5">
        {games.map((g, idx) => (
          <button
            key={g.id}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Show ${g.title}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentIndex === idx ? 'w-7 bg-arcade-champagne' : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

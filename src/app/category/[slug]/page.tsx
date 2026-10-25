'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Gamepad2, ArrowLeft, Grid } from 'lucide-react';
import { CATEGORIES, getGamesByCategory } from '@/lib/games';
import { CategoryChips } from '@/components/portal/CategoryChips';
import { GameGrid } from '@/components/portal/GameGrid';

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const category = CATEGORIES.find(c => c.slug.toLowerCase() === decodeURIComponent(slug || '').toLowerCase() || c.name.toLowerCase() === decodeURIComponent(slug || '').toLowerCase());
  const games = useMemo(() => getGamesByCategory(slug || ''), [slug]);

  return (
    <div className="space-y-6 pb-16">
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arcade-border">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/categories" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {category ? `${category.name} Games` : `${slug} Games`}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-arcade-champagne/10 text-arcade-champagne border border-arcade-champagne/30">
              {games.length.toLocaleString()} titles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {category?.description || 'Browse high-quality free games in this category. Instant play on any device.'}
          </p>
        </div>

        <Link
          href="/categories"
          className="text-xs font-bold text-arcade-champagne hover:underline flex items-center gap-1"
        >
          <Grid className="w-3.5 h-3.5" /> All Categories
        </Link>
      </div>

      {/* Category Chips Bar */}
      <CategoryChips activeCategory={slug} />

      {/* Games Mosaic Grid */}
      {games.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-2xl border border-arcade-border">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No games in this category yet</h3>
          <p className="text-xs text-slate-400 mt-1">Check back soon — new games arrive with every catalog update.</p>
          <Link href="/" className="mt-4 inline-block px-4 py-2 bg-arcade-champagne text-arcade-dark rounded-xl text-xs font-bold">
            Browse All Games
          </Link>
        </div>
      ) : (
        <GameGrid games={games} mosaic={false} />
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo, useDeferredValue, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Gamepad2, 
  Search, 
  Play, 
  Heart, 
  Sparkles, 
  Filter,
  Check
} from 'lucide-react';
import { FEATURED_GAMES, getAllCategories, gameInCategory } from '@/lib/games';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';
import { GameGrid } from '@/components/portal/GameGrid';

function ArcadeContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'played'>('newest');
  const deferredQuery = useDeferredValue(searchQuery);
  const [userFavorites, setUserFavorites] = useState<string[]>(
    user ? mockStore.getFavorites(user.id) : []
  );

  const categories = getAllCategories();

  const toggleFavorite = (e: React.MouseEvent, gameId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const isFav = mockStore.toggleFavorite(user.id, gameId);
    setUserFavorites(mockStore.getFavorites(user.id));
  };

  const filteredGames = useMemo(() => {
    let list = FEATURED_GAMES;

    if (selectedCategory !== 'All') {
      list = list.filter((g) => gameInCategory(g, selectedCategory));
    }

    const q = deferredQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)) ||
          g.description.toLowerCase().includes(q)
      );
      // title matches first
      list = [...list].sort((a, b) => Number(b.title.toLowerCase().includes(q)) - Number(a.title.toLowerCase().includes(q)));
    }

    if (sortBy === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'played') list = [...list].sort((a, b) => b.play_count - a.play_count);
    return list;
  }, [selectedCategory, deferredQuery, sortBy]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arcade-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-arcade-champagne" /> Pixelverse Arcade
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse {FEATURED_GAMES.length.toLocaleString()} free browser games. Play solo or party up with friends.
          </p>
        </div>

        {/* Sort & Search Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search all games…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-arcade-midnight border border-arcade-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-arcade-champagne"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-arcade-midnight border border-arcade-border text-xs rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-arcade-champagne"
          >
            <option value="newest">Newest</option>
            <option value="played">Most played here</option>
            <option value="title">A → Z</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          data-active={selectedCategory === 'All'} className="glass-chip px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap text-slate-200"
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            data-active={selectedCategory === cat.name} className="glass-chip px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap text-slate-200"
          >
            {cat.name}
          </button>
        ))}
      </div>

      <p className="text-[11px] font-mono text-slate-400">{filteredGames.length.toLocaleString()} games</p>

      {/* Games Mosaic Grid */}
      {filteredGames.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-xl border border-arcade-border">
          <Gamepad2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No games match your query</h3>
          <p className="text-xs text-slate-400 mt-1">Try searching with different keywords or clear categories</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 bg-arcade-champagne text-arcade-dark rounded-lg text-xs font-bold hover:bg-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <GameGrid games={filteredGames} />
      )}
    </div>
  );
}

export default function ArcadePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading arcade...</div>}>
      <ArcadeContent />
    </Suspense>
  );
}

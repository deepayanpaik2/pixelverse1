'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Gamepad2, Sparkles, Users, Smartphone } from 'lucide-react';
import { CATEGORIES, gameInCategory } from '@/lib/games';
import { SpotlightHero } from '@/components/portal/SpotlightHero';
import { CategoryChips } from '@/components/portal/CategoryChips';
import { GameTile } from '@/components/portal/GameTile';
import { GameGrid } from '@/components/portal/GameGrid';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';

function Shelf({
  title,
  subtitle,
  href,
  color,
  icon,
  games,
}: {
  title: string;
  subtitle: string;
  href?: string;
  color: string;
  icon?: React.ReactNode;
  games: ReturnType<typeof mockStore.getGames>;
}) {
  if (games.length === 0) return null;
  return (
    <section className="space-y-4 fade-up">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="diamond" style={{ color }} />
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl text-white flex items-center gap-2 truncate">
              {icon}
              {title}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
          </div>
        </div>
        {href && (
          <Link
            href={href}
            className="glass-chip shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-100"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {games.map((game) => (
          <GameTile key={game.id} game={game} size="1x1" />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { kidsMode } = useAuth();

  const games = useMemo(() => mockStore.getGames(kidsMode), [kidsMode]);

  const spotlightGames = useMemo(() => games.filter((g) => g.is_featured).slice(0, 5), [games]);
  const freshGames = useMemo(() => games.slice(0, 18), [games]);
  const multiplayerGames = useMemo(
    () => games.filter((g) => g.is_multiplayer || g.supported_players.includes('2')).slice(0, 6),
    [games]
  );
  const mobileGames = useMemo(() => games.filter((g) => g.mobile_friendly).slice(0, 6), [games]);

  // One shelf for each of the biggest categories in the feed
  const categoryShelves = useMemo(
    () =>
      CATEGORIES.slice(0, 6).map((cat) => ({
        cat,
        games: games.filter((g) => g.category === cat.name || gameInCategory(g, cat.name)).slice(0, 6),
      })),
    [games]
  );

  return (
    <div className="space-y-10 sm:space-y-12 pb-12">
      <SpotlightHero games={spotlightGames} />

      <CategoryChips />

      {/* Fresh releases: mosaic with big + wide tiles */}
      <section className="space-y-4 fade-up">
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="diamond text-arcade-champagne" />
            <div>
              <h2 className="text-lg sm:text-2xl text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-arcade-champagne" /> New Releases
              </h2>
              <p className="text-[11px] text-slate-400">Fresh from the feed, newest first</p>
            </div>
          </div>
          <Link href="/new" className="glass-chip shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-100">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 grid-flow-dense gap-3 sm:gap-4">
          {freshGames.map((game, idx) => (
            <GameTile
              key={game.id}
              game={game}
              size={idx === 0 ? '2x2' : idx === 9 || idx === 15 ? 'wide' : '1x1'}
              priority={idx < 4}
            />
          ))}
        </div>
      </section>

      {categoryShelves.map(({ cat, games: shelfGames }) => (
        <Shelf
          key={cat.slug}
          title={`${cat.name} Games`}
          subtitle={cat.description}
          href={`/category/${cat.slug}`}
          color={cat.color}
          games={shelfGames}
        />
      ))}

      <Shelf
        title="2 Player & Multiplayer"
        subtitle="Play together on one screen or battle online"
        href="/category/multiplayer"
        color="#8fd9b6"
        icon={<Users className="w-5 h-5 text-arcade-sage" />}
        games={multiplayerGames}
      />

      <Shelf
        title="Made for Mobile"
        subtitle="Tap and swipe controls on any phone or tablet"
        color="#b7a0f5"
        icon={<Smartphone className="w-5 h-5 text-arcade-orchid" />}
        games={mobileGames}
      />

      {/* Every single game */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="diamond text-arcade-orchid" />
            <div>
              <h2 className="text-lg sm:text-2xl text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-arcade-orchid" /> All Games
              </h2>
              <p className="text-[11px] text-slate-400">Keep scrolling — the whole catalog loads as you go</p>
            </div>
          </div>
          <span className="glass-chip px-3 py-1.5 rounded-full text-xs font-semibold tabular-nums text-arcade-champagne">
            {games.length.toLocaleString()} games
          </span>
        </div>
        <GameGrid games={games} mosaic />
      </section>
    </div>
  );
}

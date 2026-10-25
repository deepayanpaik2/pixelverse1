'use client';

import React from 'react';
import Link from 'next/link';
import {
  Grid, Gamepad2, Flame, Sparkles, Trophy, Zap, Users, Compass, Shield, Crosshair, Smile, Coffee,
  Globe, ChevronsUp, MousePointer, Puzzle, Car, Heart, MousePointerClick, Swords, Rocket, Goal, Box, ChefHat,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/games';

const ICON_MAP: Record<string, any> = {
  Flame,
  Compass,
  Gamepad2,
  Sparkles,
  Zap,
  Trophy,
  Shield,
  Crosshair,
  Users,
  Smile,
  Coffee,
  Globe,
  ChevronsUp,
  MousePointer,
  Grid,
  Puzzle,
  Car,
  Heart,
  MousePointerClick,
  Swords,
  Rocket,
  Goal,
  Box,
  ChefHat,
};

export default function CategoriesPage() {
  return (
    <div className="space-y-6 pb-16">
      <div className="border-b border-arcade-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <Grid className="w-7 h-7 text-arcade-champagne" /> All Game Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore the full catalog, organized into {CATEGORIES.length} genres.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon_name] || Gamepad2;

          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="glass-panel p-5 rounded-2xl border border-arcade-border hover:border-arcade-champagne transition-all group flex items-start gap-4"
            >
              <div 
                className="p-3 rounded-xl border flex-shrink-0 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: `${cat.color}15`, borderColor: `${cat.color}40`, color: cat.color }}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white group-hover:text-arcade-champagne transition-colors truncate">
                    {cat.name}
                  </h2>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {cat.game_count.toLocaleString()} games
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {cat.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

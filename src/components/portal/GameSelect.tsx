'use client';

import React, { useMemo, useState } from 'react';
import { FEATURED_GAMES } from '@/lib/games';

interface GameSelectProps {
  value: string;
  onChange: (gameId: string) => void;
  className?: string;
  /** extra fixed options shown at the end, e.g. { value: 'other', label: 'Other / Custom URL' } */
  extraOptions?: { value: string; label: string }[];
  renderLabel?: (title: string, author: string) => string;
}

/** A search box + dropdown that stays fast with thousands of games (shows at most 60 matches). */
export function GameSelect({ value, onChange, className = '', extraOptions = [], renderLabel }: GameSelectProps) {
  const [query, setQuery] = useState('');

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = [] as typeof FEATURED_GAMES;
    for (const g of FEATURED_GAMES) {
      if (!q || g.title.toLowerCase().includes(q)) {
        out.push(g);
        if (out.length >= 60) break;
      }
    }
    const selected = FEATURED_GAMES.find((g) => g.id === value);
    if (selected && !out.some((g) => g.id === selected.id)) out.unshift(selected);
    return out;
  }, [query, value]);

  return (
    <div className="space-y-1.5">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search games by name…"
        className="w-full bg-arcade-midnight/80 border border-arcade-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-champagne"
      />
      <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
        {options.map((g) => (
          <option key={g.id} value={g.id}>{renderLabel ? renderLabel(g.title, g.author) : g.title}</option>
        ))}
        {extraOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

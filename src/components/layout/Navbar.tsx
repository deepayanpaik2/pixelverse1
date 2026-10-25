'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Heart, Baby, Globe, Upload } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { useAuth } from '@/features/auth/AuthContext';
import { TRANSLATIONS, LanguageCode } from '@/lib/i18n';
import { FEATURED_GAMES } from '@/lib/games';

export function Navbar() {
  const router = useRouter();
  const { user, kidsMode, setKidsMode, language, setLanguage, favorites, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/arcade?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const suggestions = searchQuery.trim().length > 1
    ? FEATURED_GAMES.filter(g => 
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-clear border-b border-white/10 px-3 sm:px-6 py-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))]">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2 sm:gap-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Pixelverse home">
          <BrandMark className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[0_0_14px_rgba(233,203,139,0.45)] group-hover:rotate-[8deg] group-hover:scale-105 transition-transform duration-500" />
          <div className="hidden sm:flex flex-col leading-none">
            <span className="wordmark font-display text-[1.45rem] font-semibold tracking-tight text-gradient">
              Pixelverse
            </span>
            <span className="text-[10px] text-slate-400 mt-1 tracking-[0.04em]">
              Free games, instantly
            </span>
          </div>
        </Link>

        {/* Global Instant Autosuggest Search */}
        <div className="flex-1 max-w-lg relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-arcade-midnight/80 border border-arcade-border text-sm sm:text-xs rounded-full pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-arcade-champagne focus:bg-arcade-midnight transition-colors"
            />
          </form>

          {/* Autosuggest Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 glass-panel rounded-xl border border-arcade-border overflow-hidden shadow-2xl z-50 divide-y divide-arcade-border/40">
              {suggestions.map((game) => (
                <Link
                  key={game.id}
                  href={`/game/${game.slug}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 p-2.5 hover:bg-arcade-surface transition-colors"
                >
                  <img src={game.thumbnail_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  <div className="flex-1 truncate">
                    <div className="text-xs font-bold text-white truncate">{game.title}</div>
                    <div className="text-[10px] text-arcade-champagne">{game.category}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Kids Mode Toggle Pill */}
          <button
            onClick={() => setKidsMode(!kidsMode)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              kidsMode 
                ? 'bg-arcade-sage text-arcade-dark shadow-sage-glow'
                : 'bg-arcade-surface border border-arcade-border text-slate-300 hover:text-arcade-sage hover:border-arcade-sage'
            }`}
            title="Toggle Kids Mode (Age-appropriate games filter)"
          >
            <Baby className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kids Mode</span>
            {kidsMode && <span className="text-[10px] ml-0.5 bg-black/20 px-1 rounded font-mono">ON</span>}
          </button>

          {/* Submit Game Link */}
          <Link
            href="/submit"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-arcade-surface border border-arcade-border text-xs font-bold text-slate-300 hover:text-white hover:border-arcade-orchid transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-arcade-orchid" />
            <span>Submit</span>
          </Link>

          {/* i18n Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 rounded-xl bg-arcade-surface border border-arcade-border text-slate-300 hover:text-arcade-champagne transition-colors flex items-center gap-1 text-xs font-bold"
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase text-[11px] hidden md:inline">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 glass-panel rounded-xl border border-arcade-border p-1.5 shadow-2xl z-50">
                {languages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                      language === l.code ? 'bg-arcade-champagne text-arcade-dark font-bold' : 'text-slate-300 hover:bg-arcade-surface'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites Quick Pill */}
          <Link
            href="/favorites"
            className="hidden sm:block p-2 rounded-xl bg-arcade-surface border border-arcade-border text-slate-300 hover:text-arcade-rose hover:border-arcade-rose transition-colors relative"
            title="Saved Favorites"
          >
            <Heart className="w-4 h-4" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-arcade-rose text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* User Account / Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl bg-arcade-surface border border-arcade-border hover:border-arcade-champagne transition-colors"
              >
                <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-lg object-cover" />
                <span className="text-xs font-bold text-white hidden md:block max-w-[90px] truncate pr-1">
                  {user.display_name}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl border border-arcade-border p-2 shadow-2xl z-50 space-y-1 text-xs">
                  <div className="px-3 py-1.5 border-b border-arcade-border text-slate-400">
                    <div className="font-bold text-white truncate">{user.display_name}</div>
                    <div className="text-[10px]">@{user.username}</div>
                  </div>
                  <Link href={`/u/${user.username}`} onClick={() => setShowUserMenu(false)} className="block px-3 py-1.5 rounded hover:bg-arcade-surface text-slate-300 hover:text-white">
                    My Profile
                  </Link>
                  <Link href="/history" onClick={() => setShowUserMenu(false)} className="block px-3 py-1.5 rounded hover:bg-arcade-surface text-slate-300 hover:text-white">
                    Play History
                  </Link>
                  <Link href="/settings" onClick={() => setShowUserMenu(false)} className="block px-3 py-1.5 rounded hover:bg-arcade-surface text-slate-300 hover:text-white">
                    Settings
                  </Link>
                  {user.is_admin && (
                    <Link href="/admin" onClick={() => setShowUserMenu(false)} className="block px-3 py-1.5 rounded hover:bg-arcade-surface text-arcade-rose font-bold">
                      Admin Portal
                    </Link>
                  )}
                  <button onClick={() => { signOut(); setShowUserMenu(false); }} className="w-full text-left px-3 py-1.5 rounded hover:bg-arcade-rose/10 text-arcade-rose">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/sign-in"
              className="btn-gold px-3.5 py-2 rounded-full font-bold text-xs whitespace-nowrap"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Flame, 
  Sparkles, 
  Grid, 
  Users, 
  Heart, 
  Clock, 
  Settings,
  Baby
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { TRANSLATIONS } from '@/lib/i18n';

export function Sidebar() {
  const pathname = usePathname();
  const { language, favorites } = useAuth();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const items = [
    { label: t.home, href: '/', icon: Home },
    { label: t.trending, href: '/trending', icon: Flame },
    { label: t.newGames, href: '/new', icon: Sparkles },
    { label: t.categories, href: '/categories', icon: Grid },
    { label: t.multiplayer, href: '/category/multiplayer', icon: Users },
    { label: t.favorites, href: '/favorites', icon: Heart, badge: favorites.length > 0 ? favorites.length : undefined },
    { label: t.history, href: '/history', icon: Clock },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop / Tablet Slim Vertical Icon Sidebar */}
      <aside className="hidden md:flex flex-col items-center justify-between w-16 lg:w-56 glass-clear border-r border-white/10 h-[calc(100dvh-57px)] sticky top-[57px] z-40 py-4 px-2">
        <div className="w-full space-y-1.5">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-arcade-champagne/15 to-transparent text-arcade-champagne shadow-[inset_2px_0_0_0_#e9cb8b]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-arcade-champagne' : 'group-hover:text-arcade-champagne'}`} />
                <span className="hidden lg:inline truncate">{item.label}</span>

                {item.badge && (
                  <span className="hidden lg:flex ml-auto bg-arcade-rose text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Pixelverse Footer Badge */}
        <div className="hidden lg:block w-full px-3 py-3 border-t border-arcade-border/50 text-[10px] text-slate-500">
          <div className="font-display text-sm text-slate-300">Pixelverse</div>
          <div>Free instant play</div>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-clear border-t border-white/10 px-1 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] flex items-stretch justify-around">
        {[items[0], items[1], items[2], items[3], items[4], items[5]].map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex-1 min-w-0 flex flex-col items-center py-1.5 rounded-lg text-[10px] font-semibold ${
                isActive ? 'text-arcade-champagne' : 'text-slate-400 active:text-white'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] mb-0.5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(233,203,139,0.7)]' : ''}`} />
              <span className="w-full text-center truncate px-0.5">{item.label}</span>
              {item.badge && (
                <span className="absolute top-0.5 right-[22%] bg-arcade-rose text-arcade-dark text-[9px] min-w-[14px] h-[14px] px-1 rounded-full font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

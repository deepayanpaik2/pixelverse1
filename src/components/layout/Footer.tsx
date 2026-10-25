'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { CATEGORIES } from '@/lib/games';

export function Footer() {
  return (
    <footer className="glass-panel border-t border-arcade-border mt-16 text-xs text-slate-400 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <BrandMark className="w-8 h-8" />
              <span className="font-display text-xl font-semibold text-gradient">Pixelverse</span>
            </Link>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Free browser games that start in one tap. No downloads, no account needed, on phone and desktop.
            </p>
          </div>

          {/* Popular Categories */}
          <div className="space-y-2">
            <h4 className="font-display text-sm font-semibold text-white">Popular Categories</h4>
            <div className="flex flex-col space-y-1.5 text-[11px]">
              {CATEGORIES.slice(0, 6).map(c => (
                <Link key={c.slug} href={`/category/${c.slug}`} className="hover:text-arcade-champagne transition-colors">
                  {c.name} Games
                </Link>
              ))}
            </div>
          </div>

          {/* Discovery & Community */}
          <div className="space-y-2">
            <h4 className="font-display text-sm font-semibold text-white">Explore</h4>
            <div className="flex flex-col space-y-1.5 text-[11px]">
              <Link href="/trending" className="hover:text-arcade-champagne">Trending Games</Link>
              <Link href="/new" className="hover:text-arcade-champagne">New Releases</Link>
              <Link href="/category/multiplayer" className="hover:text-arcade-champagne">2 Player Games</Link>
              <Link href="/categories" className="hover:text-arcade-champagne">All Categories</Link>
              <Link href="/submit" className="hover:text-arcade-sage font-bold">Submit a Game</Link>
            </div>
          </div>

          {/* Legal & Safety */}
          <div className="space-y-2">
            <h4 className="font-display text-sm font-semibold text-white">Legal & Safety</h4>
            <div className="flex flex-col space-y-1.5 text-[11px]">
              <Link href="/about" className="hover:text-arcade-champagne">About Us</Link>
              <Link href="/dmca" className="hover:text-arcade-rose font-bold">DMCA & Copyright</Link>
              <Link href="/privacy" className="hover:text-arcade-champagne">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-arcade-champagne">Terms of Service</Link>
              <Link href="/contact" className="hover:text-arcade-champagne">Contact & Support</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-arcade-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} Pixelverse. All game trademarks and assets belong to their respective publishers and developers.
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Shield className="w-3.5 h-3.5 text-arcade-champagne" />
            <span>Games run in a sandboxed frame</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

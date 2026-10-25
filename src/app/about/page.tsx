import React from 'react';
import Link from 'next/link';
import { 
  Gamepad2, 
  Sparkles, 
  ShieldCheck, 
  Globe2, 
  Cpu, 
  HeartHandshake, 
  Award,
  Layers
} from 'lucide-react';
import { FEATURED_GAMES, CATEGORIES } from '@/lib/games';

export const metadata = {
  title: 'About Pixelverse - Instant Browser Gaming Universe',
  description: 'Learn about Pixelverse: the lawful, ultra-fast free browser games portal featuring high-performance Canvas, WebGL, and verified publisher games.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-arcade-champagne/10 border border-arcade-champagne/30 text-arcade-champagne text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Next-Generation Web Arcade
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-arcade-champagne via-arcade-orchid to-arcade-rose">Pixelverse</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Pixelverse is a next-generation browser games portal built for instant play, zero-friction discovery, and 100% lawful game distribution. No app installs, no mandatory sign-up, and no waiting.
        </p>
      </div>

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-arcade-champagne/10 border border-arcade-champagne/30 flex items-center justify-center text-arcade-champagne">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Instant-Play Technology</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every game launches in sub-second time directly in your browser. With sandboxed iframe isolation, Web Audio API synthesis, and full keyboard-scroll mitigation, games run at a silky smooth 60 FPS.
          </p>
        </div>

        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">100% Lawful & Ethical Sourcing</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            We never scrape or pirate content. Our catalog is strictly curated from the official GameMonetize publisher distribution feed, verified open-source game repos, and direct developer contracts.
          </p>
        </div>

        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-arcade-orchid/10 border border-arcade-orchid/30 flex items-center justify-center text-arcade-orchid">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Mosaic Discovery Grid</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspired by organic mosaic design, our game grid arranges titles dynamically by popularity, genre, and aspect ratio. Hover over any tile to preview gameplay before you even click.
          </p>
        </div>

        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-arcade-rose/10 border border-arcade-rose/30 flex items-center justify-center text-arcade-rose">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Developer-First Community</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Indie game developers can submit their HTML5 games directly to Pixelverse. We provide creator attribution, links back to developer portfolios, and zero-fee distribution to a global player base.
          </p>
        </div>
      </div>

      {/* Catalog Metrics */}
      <div className="bg-arcade-midnight border border-arcade-border rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-arcade-champagne" /> Pixelverse Live Numbers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-white">{FEATURED_GAMES.length}</div>
            <div className="text-xs text-slate-400 mt-1">Verified Games</div>
          </div>
          <div>
            <div className="text-3xl font-black text-arcade-champagne">{CATEGORIES.length}</div>
            <div className="text-xs text-slate-400 mt-1">Game Categories</div>
          </div>
          <div>
            <div className="text-3xl font-black text-arcade-orchid">100%</div>
            <div className="text-xs text-slate-400 mt-1">Free to Play</div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400">0s</div>
            <div className="text-xs text-slate-400 mt-1">Install Time</div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-arcade-orchid/20 to-arcade-champagne/20 border border-arcade-border rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-white">Are you a game developer?</h3>
          <p className="text-xs text-slate-300 mt-0.5">Publish your game on Pixelverse and reach millions of players.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/submit"
            className="px-5 py-2.5 rounded-xl bg-arcade-champagne hover:bg-arcade-champagne/90 text-arcade-dark font-black text-xs transition"
          >
            Submit Game
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border hover:border-slate-500 text-white font-bold text-xs transition"
          >
            Play Games
          </Link>
        </div>
      </div>
    </div>
  );
}

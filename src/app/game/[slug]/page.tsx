'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Play, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Heart, 
  Share2, 
  ThumbsUp, 
  ThumbsDown, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone, 
  Gamepad2, 
  ArrowLeft,
  Check,
  Star,
  Info,
  RefreshCw,
  Zap
} from 'lucide-react';
import { getGameBySlug, getRelatedGames, categorySlug } from '@/lib/games';
import { getLaunchUrl, isOnSiteGame } from '@/lib/games/launch';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';
import { GameTile } from '@/components/portal/GameTile';

export default function GamePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const game = getGameBySlug(slug);
  const { user, favorites, toggleFavorite, rateGame, getUserRating } = useAuth();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFitScreen, setIsFitScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [pseudoFs, setPseudoFs] = useState(false); // fullscreen fallback for iPhone Safari
  const [copiedLink, setCopiedLink] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');

  // Ratings
  const [likes, setLikes] = useState(game?.likes_count || 0);
  const [dislikes, setDislikes] = useState(game?.dislikes_count || 0);
  const [userRating, setUserRating] = useState<boolean | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // "still loading?" watchdog. Games run in a cross-origin iframe, so the page cannot read their state:
  // we simply offer help after a while.
  const [showStuckHint, setShowStuckHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const onSite = game ? isOnSiteGame(game) : true;

  // The hint only appears if the game frame itself never finished loading. A game that has loaded and is
  // showing its own splash or ad is not "stuck" from the page's point of view, so we leave it alone.
  useEffect(() => {
    setShowStuckHint(false);
    setIframeLoaded(false);
  }, [iframeKey, isPlaying]);

  useEffect(() => {
    if (!isPlaying || onSite || hintDismissed || iframeLoaded) return;
    const t = setTimeout(() => setShowStuckHint(true), 12000);
    return () => clearTimeout(t);
  }, [isPlaying, onSite, iframeKey, hintDismissed, iframeLoaded]);

  // Tell the page a game is running so the falling-glitter backdrop stops using the CPU
  useEffect(() => {
    const el = document.documentElement;
    if (isPlaying) el.dataset.playing = 'true';
    else delete el.dataset.playing;
    return () => { delete el.dataset.playing; };
  }, [isPlaying]);

  // Keep React state in sync with the real browser fullscreen state (Esc key, etc.)
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Esc closes the fallback fullscreen too
  useEffect(() => {
    if (!pseudoFs) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPseudoFs(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [pseudoFs]);

  useEffect(() => {
    if (game) {
      // Record game in user or guest history
      const actorKey = user ? user.id : 'guest';
      mockStore.recordPlayedGame(actorKey, game.slug);

      // Load user rating if any
      setUserRating(getUserRating(game.id));
      setLikes(game.likes_count);
      setDislikes(game.dislikes_count);
    }
  }, [game?.id, user?.id]);

  // Arrow key window scroll blocker when game is playing
  useEffect(() => {
    const preventScroll = (e: KeyboardEvent) => {
      if (isPlaying && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        // Prevent window scroll only when game container is active
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventScroll, { passive: false });
    return () => window.removeEventListener('keydown', preventScroll);
  }, [isPlaying]);

  if (!game) {
    return (
      <div className="py-24 text-center glass-panel rounded-2xl border border-arcade-border max-w-lg mx-auto">
        <Gamepad2 className="w-12 h-12 text-arcade-rose mx-auto mb-3" />
        <h2 className="text-xl font-black text-white">Game Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested game does not exist or has been archived.</p>
        <Link href="/" className="mt-4 inline-block px-5 py-2 bg-arcade-champagne text-arcade-dark font-extrabold text-xs rounded-xl shadow-champagne-glow">
          Return to Pixelverse
        </Link>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const launchUrl = getLaunchUrl(game, origin);

  const isFav = favorites.includes(game.id);
  const related = getRelatedGames(game.id, game.category, 6);
  const alternatives = related.slice(0, 3);
  const catHref = `/category/${categorySlug(game.category)}`;
  const totalVotes = likes + dislikes;
  const ratingPercent = totalVotes > 0 ? Math.round((likes / totalVotes) * 100) : null;

  const handleRating = (isLike: boolean) => {
    const res = rateGame(game.id, isLike);
    setLikes(res.likes);
    setDislikes(res.dislikes);
    setUserRating(res.userRating);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (pseudoFs) { setPseudoFs(false); return; }
    if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); return; }
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => setPseudoFs(true));
    } else {
      setPseudoFs(true); // iPhone Safari has no element fullscreen: fill the viewport instead
    }
  };

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* JSON-LD Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            'name': game.title,
            'description': game.description,
            'genre': game.category,
            'gamePlatform': 'Web Browser',
            'applicationCategory': 'Game',
            'operatingSystem': 'Any',
            'author': {
              '@type': 'Person',
              'name': game.author,
            },
            ...(game.likes_count + game.dislikes_count > 0
              ? {
                  'aggregateRating': {
                    '@type': 'AggregateRating',
                    'ratingValue': game.rating_score,
                    'bestRating': '5',
                    'worstRating': '1',
                    'ratingCount': game.likes_count + game.dislikes_count,
                  },
                }
              : {}),
          }),
        }}
      />

      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-arcade-champagne">Home</Link>
          <span>/</span>
          <Link href={catHref} className="hover:text-arcade-champagne">{game.category}</Link>
          <span>/</span>
          <span className="text-white font-bold truncate max-w-[200px]">{game.title}</span>
        </div>

        <Link
          href={catHref}
          className="text-arcade-champagne hover:underline font-bold hidden sm:inline"
        >
          More {game.category} Games →
        </Link>
      </div>

      {/* Main Game Player Viewport */}
      <div
        ref={containerRef}
        className={`relative flex flex-col glass-panel overflow-hidden border border-arcade-border shadow-2xl ${
          pseudoFs
            ? 'fixed inset-0 z-[100] rounded-none w-full h-[100dvh] bg-black'
            : isFullscreen
            ? 'rounded-none w-screen h-screen bg-black'
            : isFitScreen
            ? 'rounded-3xl h-[92dvh] min-h-[480px] w-full'
            : 'rounded-2xl sm:rounded-3xl h-[68dvh] sm:h-[78dvh] min-h-[420px] sm:min-h-[520px] w-full'
        }`}
      >
        {/* Loading / Play Screen Overlay */}
        {!isPlaying ? (
          <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-arcade-midnight flex items-center justify-center">
            {/* Blurred backdrop */}
            <img
              src={game.banner_url || game.thumbnail_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-arcade-dark/80 via-arcade-dark/60 to-arcade-dark/90" />
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-arcade-champagne/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-arcade-orchid/20 blur-3xl" />

            {/* Content card */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 px-6 py-8 max-w-3xl w-full justify-center">
              <div className="relative shrink-0">
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-arcade-champagne/45 to-arcade-orchid/45 blur-xl opacity-70" />
                <img
                  src={game.thumbnail_url}
                  alt={game.title}
                  className="relative w-36 h-36 sm:w-52 sm:h-52 rounded-[1.75rem] object-cover border-2 border-white/20 shadow-2xl"
                />
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-arcade-champagne/15 text-arcade-champagne border border-arcade-champagne/30">
                    {game.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
                    {game.supported_players}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-arcade-sage/15 text-arcade-sage border border-arcade-sage/30">
                    Free to play
                  </span>
                  {onSite && (
                    <span className="px-2.5 py-1 rounded-full bg-arcade-orchid/20 text-arcade-orchid border border-arcade-orchid/40 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Runs on Pixelverse
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-5xl text-white leading-tight drop-shadow-lg line-clamp-2">
                  {game.title}
                </h1>

                <button
                  onClick={() => setIsPlaying(true)}
                  className="btn-gold group relative flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg"
                >
                  <span className="absolute inset-0 rounded-full bg-arcade-champagne/40 animate-ping opacity-30 group-hover:hidden motion-reduce:hidden" />
                  <Play className="relative w-6 h-6 fill-current" />
                  <span className="relative">Play now</span>
                </button>

                <p className="text-xs text-slate-300/80">
                  No download, no sign-up. Tap play and you're in.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Sandboxed Game Iframe */
          <div className="w-full flex-1 min-h-0 bg-black relative">
            {/* Shown behind the frame until the game document has loaded */}
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-slate-400" role="status" aria-live="polite">
                <div className="gem-loader" />
                <p className="text-sm">Loading {game.title}</p>
              </div>
            )}
            <iframe
              key={iframeKey}
              src={launchUrl}
              title={game.title}
              onLoad={(e) => { setIframeLoaded(true); try { e.currentTarget.focus(); } catch {} }}
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-orientation-lock allow-presentation allow-modals"
              allow="fullscreen; autoplay; gamepad; accelerometer; gyroscope; clipboard-write"
              allowFullScreen
              className="relative w-full h-full border-none"
            />
          </div>
        )}

        {/* Viewport Control Bar (Bottom Overlay) */}
        <div className="relative shrink-0 z-40 bg-arcade-dark px-3 sm:px-4 py-2 border-t border-arcade-border/80 flex items-center justify-between pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-sm text-white truncate max-w-[170px] sm:max-w-xs">{game.title}</h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIframeKey(k => k + 1)}
              className="p-2 rounded-lg bg-arcade-surface border border-arcade-border text-slate-300 hover:text-white"
              title="Restart Game"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFitScreen(!isFitScreen)}
              className="p-2 rounded-lg bg-arcade-surface border border-arcade-border text-slate-300 hover:text-white hidden sm:block"
              title="Fit to Screen"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-arcade-surface border border-arcade-border text-slate-300 hover:text-arcade-champagne"
              title={isFullscreen || pseudoFs ? 'Exit fullscreen' : 'Fullscreen'}
              aria-label={isFullscreen || pseudoFs ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen || pseudoFs ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Loading help. It sits under the player, never on top of it, so it can never cover a game's own buttons
          (for example an ad's Skip button). It only appears when the game frame has not loaded after 12 seconds. */}
      {showStuckHint && !hintDismissed && !iframeLoaded && isPlaying && (
        <div role="status" className="fade-in glass-panel rounded-2xl px-4 py-3 text-xs flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <AlertTriangle className="w-4 h-4 text-arcade-amber shrink-0 mt-0.5" />
            <p className="text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">This game hasn't started yet.</span>{' '}
              Try Reload. Browser extensions that block frames or scripts can also stop it, and some games aren't built for every device.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setIframeKey((k) => k + 1)} className="btn-gold flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold">
              <RefreshCw className="w-3 h-3" /> Reload
            </button>
            {alternatives.slice(0, 2).map((g) => (
              <Link key={g.id} href={`/game/${g.slug}`} className="px-3 py-2 rounded-full bg-arcade-surface border border-arcade-border text-slate-200 hover:border-arcade-champagne font-semibold max-w-[11rem] truncate">
                {g.title}
              </Link>
            ))}
            <button onClick={() => setHintDismissed(true)} className="px-2 py-2 text-slate-500 hover:text-white font-semibold">Dismiss</button>
          </div>
        </div>
      )}

      {/* Action Bar (Ratings, Favorites, Share) */}
      <div className="glass-panel p-4 rounded-2xl border border-arcade-border flex flex-wrap items-center justify-between gap-4">
        {/* Rating Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRating(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              userRating === true
                ? 'bg-arcade-sage/20 border-arcade-sage text-arcade-sage'
                : 'bg-arcade-surface border-arcade-border text-slate-300 hover:text-white'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{likes}</span>
          </button>

          <button
            onClick={() => handleRating(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              userRating === false
                ? 'bg-arcade-rose/20 border-arcade-rose text-arcade-rose'
                : 'bg-arcade-surface border-arcade-border text-slate-300 hover:text-white'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{dislikes}</span>
          </button>

          <span className="text-xs font-mono text-slate-400 ml-1">
            {ratingPercent === null ? 'Be the first to rate' : `${ratingPercent}% positive`}
          </span>
        </div>

        {/* Favorite, Party & Share Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/arcade"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-arcade-surface border border-arcade-border text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-arcade-champagne" />
            <span className="hidden sm:inline">Arcade</span>
          </Link>

          <Link
            href={`/rooms?game=${game.id}`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-arcade-orchid/20 border border-arcade-orchid/40 text-xs font-bold text-arcade-orchid hover:bg-arcade-orchid hover:text-white transition-all shadow-sm"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Create Party</span>
          </Link>

          <button
            onClick={() => toggleFavorite(game.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isFav
                ? 'bg-arcade-rose/20 border-arcade-rose text-arcade-rose shadow-rose-glow'
                : 'bg-arcade-surface border-arcade-border text-slate-300 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            <span>{isFav ? 'Favorited' : 'Favorite'}</span>
          </button>

          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-arcade-surface border border-arcade-border text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-arcade-sage" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="p-2 rounded-xl bg-arcade-surface border border-arcade-border text-slate-400 hover:text-arcade-rose transition-colors"
            title="Report Broken Game"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Description, How to Play, & Licensing Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Overview & Instructions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-arcade-border space-y-4">
            <div>
              <h2 className="text-lg font-black text-white">About {game.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Category: {game.category} • Publisher: {game.author}</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {game.description}
            </p>

            {/* How to Play Section */}
            {game.instructions && (
              <div className="pt-4 border-t border-arcade-border/60 space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-arcade-champagne" /> How to Play
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-arcade-midnight p-3.5 rounded-xl border border-arcade-border">
                  {game.instructions}
                </p>
              </div>
            )}

            {/* Controls Guide */}
            <div className="pt-4 border-t border-arcade-border/60 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Controls</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {!!game.controls.keyboard?.length && (
                  <div className="bg-arcade-midnight p-3 rounded-xl border border-arcade-border flex items-center justify-between">
                    <span className="text-slate-400">Keyboard:</span>
                    <span className="font-bold text-arcade-champagne">{game.controls.keyboard.join(', ')}</span>
                  </div>
                )}
                {game.controls.touch && (
                  <div className="bg-arcade-midnight p-3 rounded-xl border border-arcade-border flex items-center justify-between">
                    <span className="text-slate-400">Touch/Mobile:</span>
                    <span className="font-bold text-arcade-sage">Tap & Swipe Supported</span>
                  </div>
                )}
              </div>
            </div>

            {/* Game Tags */}
            <div className="pt-3 border-t border-arcade-border/60 flex flex-wrap gap-1.5">
              {game.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="px-2.5 py-1 rounded-lg bg-arcade-surface border border-arcade-border text-[11px] font-semibold text-slate-400 hover:text-arcade-champagne hover:border-arcade-champagne transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: License & Safety */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-arcade-border space-y-3 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-arcade-sage" /> Licensing & Attribution
            </h3>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="font-mono text-arcade-champagne uppercase text-[10px]">{game.source_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">License:</span>
                <span className="font-mono text-white text-[10px] truncate max-w-[150px]">{game.license}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Publisher:</span>
                <span className="text-slate-200">{game.author}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Games Row */}
      {related.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-arcade-border/60">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">You May Also Like</h3>
            <Link href={catHref} className="text-xs font-bold text-arcade-champagne hover:underline">
              View All {game.category} Games
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {related.map(rg => (
              <GameTile key={rg.id} game={rg} size="1x1" />
            ))}
          </div>
        </section>
      )}

      {/* Report Broken Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-arcade-border space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-arcade-rose" /> Report Issue: {game.title}
            </h3>
            <p className="text-xs text-slate-400">
              Is this game failing to load, displaying broken controls, or infringing copyright? Please let us know.
            </p>
            <textarea
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Explain the issue..."
              className="w-full bg-arcade-midnight border border-arcade-border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-rose"
            />
            <div className="flex justify-between items-center pt-2">
              <Link href="/dmca" className="text-[11px] text-arcade-rose hover:underline">
                DMCA Copyright Claim →
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-arcade-surface"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (reportText.trim()) {
                      mockStore.createReport({
                        reporter_id: user ? user.id : 'guest',
                        target_type: 'game',
                        target_id: game.id,
                        reason: `Game Issue: ${game.title}`,
                        details: reportText.trim()
                      });
                    }
                    setShowReportModal(false);
                    setReportText('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-arcade-rose text-white hover:bg-arcade-rose/80"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

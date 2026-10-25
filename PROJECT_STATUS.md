# PIXELVERSE — PROJECT STATUS

## Catalog
- **5,001 games** from the GameMonetize HTML5 feed (18 categories), newest first.
- Source of truth: `src/lib/games/registry.json` (compact rows) expanded by `src/lib/games/index.ts`.
- Refresh: `npm run sync:feed` (downloads the feed, cleans text, rewrites the registry), then redeploy.
- Games embed from `https://html5.gamemonetize.co/{id}/` inside a sandboxed iframe; thumbnails come from `img.gamemonetize.com`.
- All previous in-house games, GameDistribution games, their sync script/API route and reports were removed.

## Experience
- Glass/transparency design system (`.glass-panel`, `.glass-clear`, `.glass-chip`), animated aurora background, frosted spotlight hero, smooth tile hover effects.
- Infinite-scroll grids (`GameGrid`) on home, arcade, categories, tags, new, trending, top-rated and favorites.
- Home page: spotlight, New Releases mosaic, six category shelves, 2-player and mobile shelves, then every game.

## Verification
- `npm test` — 15 tests (feed cleaning, registry integrity, social/i18n logic).
- `npx tsc --noEmit` — 0 errors.
- Play counts, likes and ratings are not invented: they start at 0 and grow from real activity on the site.

## Still mock / local-only
- Auth, friends, rooms, chat, favorites, ratings and history run on the built-in mock store (localStorage) unless Supabase env vars are configured.

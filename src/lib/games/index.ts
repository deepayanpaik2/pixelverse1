import { GameManifest, CategoryInfo } from '@/types';
import rawRegistry from './registry.json';

/**
 * Catalog = every game in the GameMonetize feed.
 *
 * registry.json is a compact list of rows (see scripts/sync-games/gamemonetize-feed.js):
 *   [hash, id, title, category, tags[], width, height, description, instructions]
 * and is expanded into full GameManifest objects here, once, when the site starts.
 * Rebuild it any time with:  npm run sync:feed
 */
type Row = [string, string, string, string, string[], number, number, string, string];

export const EMBED_HOST = 'https://html5.gamemonetize.co';
export const THUMB_HOST = 'https://img.gamemonetize.com';

export function categorySlug(name: string): string {
  const s = name.toLowerCase().replace(/^\./, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s || 'games';
}

function slugify(title: string): string {
  return title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const NOT_FOR_KIDS = /\b(zombies?|blood|gore|horror|guns?|sniper|weapons?|murder|kill(?:ing|er)?|crime|war|shoot(?:er|ing)?|fight(?:ing)?|battle|assassin|gangster|mafia|scary)\b/i;

function expand(row: Row, slug: string): GameManifest {
  const [hash, id, title, category, tags, width, height, description, instructions] = row;
  const orientation = height > width * 1.1 ? 'portrait' : width > height * 1.1 ? 'landscape' : 'both';
  const lowerTags = tags.map((t) => t.toLowerCase());
  const isMobile = lowerTags.includes('mobile') || orientation === 'portrait';
  const isTwoPlayer = lowerTags.includes('2 player') || category === '2 Player';
  const isMulti =
    isTwoPlayer || category === 'Multiplayer' || category === '.IO' ||
    lowerTags.some((t) => /multiplayer|\.io$|2 player|two player/.test(t));
  const text = `${title} ${category} ${tags.join(' ')}`;
  const kidsSafe = !NOT_FOR_KIDS.test(text);
  const thumb = `${THUMB_HOST}/${hash}/512x384.jpg`;
  const embed = `${EMBED_HOST}/${hash}/`;

  return {
    id,
    slug,
    gd_game_hash: hash, // kept for backwards compatibility with older saved data
    title,
    description: description || `${title} — play it free in your browser on Pixelverse.`,
    instructions: instructions || 'Use your mouse, keyboard or touch screen to play.',
    category,
    tags,
    thumbnail_url: thumb,
    thumbnail_large_url: thumb,
    banner_url: thumb,
    launch_path: embed,
    embed_url: embed,
    source_type: 'gamemonetize',
    source: 'gamemonetize',
    author: 'GameMonetize',
    developer_name: 'GameMonetize',
    license: 'GameMonetize Publisher Network (Free to Play)',
    license_url: 'https://gamemonetize.com',
    supported_players: isTwoPlayer ? '2 Players' : isMulti ? 'Multiplayer' : '1 Player',
    is_multiplayer: isMulti,
    controls: { keyboard: [], mouse: [], touch: isMobile },
    orientation,
    mobile_friendly: isMobile,
    supports_mobile: isMobile,
    supports_desktop: true,
    aspect_ratio: orientation === 'portrait' ? '9/16' : '16/9',
    width,
    height,
    is_featured: false,
    is_editor_pick: false,
    is_kids_safe: kidsSafe,
    // Real numbers only: the feed has no play counts or ratings, so everything starts at zero
    // and grows from what players actually do on this site.
    play_count: 0,
    likes_count: 0,
    dislikes_count: 0,
    rating_score: 0,
    status: 'published',
  };
}

function buildCatalog(): GameManifest[] {
  const rows = rawRegistry as unknown as Row[];
  const used = new Set<string>();
  const list = rows.map((row) => {
    let slug = slugify(row[2]) || `game-${row[1]}`;
    if (used.has(slug)) slug = `${slug}-${row[1]}`;
    used.add(slug);
    return expand(row, slug);
  });
  // Spotlight: the newest games that are landscape (they look best in the wide hero).
  let featured = 0;
  for (const g of list) {
    if (featured >= 6) break;
    if (g.orientation !== 'portrait') { g.is_featured = true; g.featured = true; featured++; }
  }
  return list;
}

/** Newest first — the same order as the GameMonetize feed. */
export const FEATURED_GAMES: GameManifest[] = buildCatalog();

/** ids of the freshest games — used for the NEW badge */
export const NEW_GAME_IDS: Set<string> = new Set(FEATURED_GAMES.slice(0, 40).map((g) => g.id));

const BY_KEY = new Map<string, GameManifest>();
for (const g of FEATURED_GAMES) {
  BY_KEY.set(g.slug, g);
  if (!BY_KEY.has(g.id)) BY_KEY.set(g.id, g);
}

type CategoryDef = Omit<CategoryInfo, 'game_count' | 'id' | 'slug'> & { name: string };

// Display metadata for the categories that exist in the feed. Unknown ones are added automatically.
const CATEGORY_META: Record<string, Omit<CategoryDef, 'name'>> = {
  'Puzzles':     { description: 'Brain teasers, match-3, logic and word games.', icon_name: 'Puzzle', color: '#8fd9b6' },
  'Hypercasual': { description: 'One-tap, pick-up-and-play games for quick sessions.', icon_name: 'Zap', color: '#f0b95c' },
  'Arcade':      { description: 'Timeless score-chasers and fast reflex classics.', icon_name: 'Gamepad2', color: '#e9cb8b' },
  'Adventure':   { description: 'Explore worlds, solve mysteries and go on epic quests.', icon_name: 'Compass', color: '#b7a0f5' },
  'Shooting':    { description: 'Target practice, space defense and tactical shooters.', icon_name: 'Crosshair', color: '#f28ba8' },
  'Racing':      { description: 'High-speed circuits, drifts and stunt tracks.', icon_name: 'Car', color: '#f0a06a' },
  'Girls':       { description: 'Dress-up, makeover, cooking and stylish fun.', icon_name: 'Heart', color: '#f2a0c6' },
  'Sports':      { description: 'Football, basketball, tennis and athletic championships.', icon_name: 'Trophy', color: '#9fc4f2' },
  'Clicker':     { description: 'Tap, upgrade and watch the numbers go up.', icon_name: 'MousePointerClick', color: '#d596e8' },
  'Action':      { description: 'High-octane combat, platforming and survival.', icon_name: 'Flame', color: '#f28ba8' },
  'Fighting':    { description: 'Brawlers, duels and martial arts showdowns.', icon_name: 'Swords', color: '#ec7b7b' },
  'Multiplayer': { description: 'Co-op, 2-player and online arena games.', icon_name: 'Users', color: '#8fd9b6' },
  'Boys':        { description: 'Cars, battles, building and big adventures.', icon_name: 'Rocket', color: '#8fd0e8' },
  'Soccer':      { description: 'Penalties, free kicks and full-match football.', icon_name: 'Goal', color: '#7fcf9a' },
  '3D':          { description: 'Immersive 3D worlds that run right in your browser.', icon_name: 'Box', color: '#b7a0f5' },
  'Cooking':     { description: 'Kitchen chaos, bakeries and tasty challenges.', icon_name: 'ChefHat', color: '#f0a06a' },
  '.IO':         { description: 'Join a live arena and outgrow everyone else.', icon_name: 'Globe', color: '#e9cb8b' },
  '2 Player':    { description: 'Grab a friend and play on the same screen.', icon_name: 'Users', color: '#f0b95c' },
};

export function gameInCategory(g: GameManifest, categoryName: string): boolean {
  return matchesCategory(g, categoryName.toLowerCase());
}

function matchesCategory(g: GameManifest, nameLower: string): boolean {
  return g.category.toLowerCase() === nameLower || g.tags.some((t) => t.toLowerCase() === nameLower);
}

export const RAW_CATEGORIES: Omit<CategoryInfo, 'game_count'>[] = (() => {
  const counts = new Map<string, number>();
  for (const g of FEATURED_GAMES) counts.set(g.category, (counts.get(g.category) || 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => {
      const meta = CATEGORY_META[name] || { description: `Free ${name} games.`, icon_name: 'Gamepad2', color: '#e9cb8b' };
      const display = name === '.IO' ? '.io' : name;
      return { id: `cat-${categorySlug(name)}`, slug: categorySlug(name), name: display, ...meta };
    });
})();

export const CATEGORIES: CategoryInfo[] = RAW_CATEGORIES.map((cat) => ({
  ...cat,
  game_count: FEATURED_GAMES.filter((g) => matchesCategory(g, cat.name.toLowerCase())).length,
}));

export function getGameBySlug(slug: string): GameManifest | undefined {
  return BY_KEY.get(slug);
}

export function getAllCategories(): CategoryInfo[] {
  return CATEGORIES;
}

export function getGamesByCategory(categorySlugOrName: string): GameManifest[] {
  const key = decodeURIComponent(categorySlugOrName || '').toLowerCase();
  const cat = CATEGORIES.find((c) => c.slug === key || c.name.toLowerCase() === key || c.name.toLowerCase() === key.replace(/-/g, ' '));
  const name = cat ? cat.name.toLowerCase() : key;
  return FEATURED_GAMES.filter((g) => matchesCategory(g, name));
}

export function getGamesByTag(tag: string): GameManifest[] {
  const q = tag.toLowerCase();
  return FEATURED_GAMES.filter((g) => g.tags.some((t) => t.toLowerCase() === q));
}

export function getRelatedGames(currentGameId: string, category: string, limit: number = 8): GameManifest[] {
  const out: GameManifest[] = [];
  for (const g of FEATURED_GAMES) {
    if (g.id !== currentGameId && g.category === category) {
      out.push(g);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** Ranked by plays recorded on this site (ties keep the feed's newest-first order). */
export function getTrendingGames(): GameManifest[] {
  return [...FEATURED_GAMES].sort((a, b) => b.play_count - a.play_count);
}

/** Ranked by likes recorded on this site (ties keep the feed's newest-first order). */
export function getTopRatedGames(): GameManifest[] {
  return [...FEATURED_GAMES].sort((a, b) => b.likes_count - a.likes_count || b.rating_score - a.rating_score);
}

export function getNewGames(): GameManifest[] {
  return FEATURED_GAMES;
}

export function getKidsGames(): GameManifest[] {
  return FEATURED_GAMES.filter((g) => g.is_kids_safe);
}

export function getTwoPlayerGames(): GameManifest[] {
  return FEATURED_GAMES.filter((g) => g.is_multiplayer || g.supported_players.includes('2'));
}

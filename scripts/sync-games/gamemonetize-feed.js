#!/usr/bin/env node
/**
 * GameMonetize feed -> src/lib/games/registry.json
 *
 * Usage:
 *   npm run sync:feed                      # downloads GAMEMONETIZE_FEED_URL (or the default feed below)
 *   npm run sync:feed -- path/to/feed.json # builds from a feed JSON you already downloaded
 *
 * The registry is stored compactly (one array per game). `src/lib/games/index.ts`
 * expands every row into a full GameManifest when the site starts.
 *
 * Row layout:  [hash, id, title, category, tags[], width, height, description, instructions]
 * Thumbnail :  https://img.gamemonetize.com/{hash}/512x384.jpg
 * Embed URL :  https://html5.gamemonetize.co/{hash}/
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_FEED =
  'https://rss.gamemonetize.com/rssfeed.php?format=json&category=All&type=html5&popularity=newest&company=All&amount=All';
const OUT_FILE = path.join(__dirname, '../../src/lib/games/registry.json');

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', sbquo: '‚', bdquo: '„',
  ndash: '–', mdash: '—', hellip: '…', bull: '•', middot: '·',
  copy: '©', reg: '®', trade: '™', deg: '°', times: '×', laquo: '«', raquo: '»',
  eacute: 'é', egrave: 'è', aacute: 'á', agrave: 'à', iacute: 'í', oacute: 'ó', uacute: 'ú',
  ntilde: 'ñ', uuml: 'ü', ouml: 'ö', auml: 'ä', ccedil: 'ç',
};

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => (NAMED[n.toLowerCase()] !== undefined ? NAMED[n.toLowerCase()] : ' '));
}
function safeChar(code) {
  try { return code > 0 && code < 0x110000 ? String.fromCodePoint(code) : ' '; } catch { return ' '; }
}

/** Feed text arrives HTML-escaped and sometimes carries promo links ("Web Dev <a ...>"). Make it plain text. */
function cleanText(raw, max) {
  let t = decodeEntities(String(raw == null ? '' : raw));
  t = t.replace(/\bWeb\s*Dev\b\s*(?:<a\b[^>]*>.*?<\/a>)?/gi, ' ');   // promo credit
  t = t.replace(/<a\b[^>]*>(.*?)<\/a>/gi, ' ');                        // other links: drop entirely
  t = t.replace(/<br\s*\/?>/gi, ' ').replace(/<\/p>/gi, ' ').replace(/<[^>]+>/g, ' ');
  t = decodeEntities(t).replace(/<[^>]+>/g, ' ');                      // double-escaped leftovers
  t = t.replace(/https?:\/\/\S+/gi, ' ').replace(/\bwww\.\S+/gi, ' ');
  t = t.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (max && t.length > max) {
    const cut = t.slice(0, max);
    const sp = cut.lastIndexOf(' ');
    t = (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.\-–—]+$/, '') + '…';
  }
  return t;
}

function slugify(title) {
  return String(title).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function hashFromUrl(url) {
  const m = /gamemonetize\.co\/([a-z0-9]+)\/?/i.exec(String(url));
  return m ? m[1].toLowerCase() : null;
}

function buildRegistry(feed) {
  if (!Array.isArray(feed)) throw new Error('Feed must be a JSON array');
  const rows = [];
  const seenId = new Set();
  const seenSlug = new Set();
  let skipped = 0;
  for (const g of feed) {
    const hash = hashFromUrl(g && g.url);
    const id = String((g && g.id) || '').trim();
    const title = cleanText(g && g.title, 120);
    if (!hash || !id || !title || seenId.has(id)) { skipped++; continue; }
    seenId.add(id);
    const category = cleanText(g.category, 40) || 'Arcade';
    const tags = Array.from(new Set(String(g.tags || '').split(',').map((x) => cleanText(x, 40)).filter(Boolean)));
    const w = parseInt(g.width, 10); const h = parseInt(g.height, 10);
    rows.push([
      hash, id, title, category, tags,
      Number.isFinite(w) && w > 0 ? w : 800,
      Number.isFinite(h) && h > 0 ? h : 600,
      cleanText(g.description, 420),
      cleanText(g.instructions, 220),
    ]);
  }
  return { rows, skipped };
}

/** Same slug rules as src/lib/games/index.ts (kept here so tests can check uniqueness). */
function slugsFor(rows) {
  const used = new Set();
  return rows.map((r) => {
    let s = slugify(r[2]) || `game-${r[1]}`;
    if (used.has(s)) s = `${s}-${r[1]}`;
    used.add(s);
    return s;
  });
}

async function loadFeed(arg) {
  if (arg && fs.existsSync(arg)) return JSON.parse(fs.readFileSync(arg, 'utf-8'));
  const url = process.env.GAMEMONETIZE_FEED_URL || DEFAULT_FEED;
  console.log('Downloading feed…');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Feed request failed: HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const feed = await loadFeed(process.argv[2]);
  const { rows, skipped } = buildRegistry(feed);
  if (rows.length === 0) throw new Error('No games parsed — refusing to overwrite the registry.');
  fs.writeFileSync(OUT_FILE, JSON.stringify(rows));
  const byCat = {};
  rows.forEach((r) => { byCat[r[3]] = (byCat[r[3]] || 0) + 1; });
  const mb = (fs.statSync(OUT_FILE).size / 1048576).toFixed(2);
  console.log(`Wrote ${rows.length} games (${skipped} skipped) to src/lib/games/registry.json (${mb} MB)`);
  console.log('Categories:', byCat);
}

module.exports = { cleanText, slugify, hashFromUrl, buildRegistry, slugsFor, decodeEntities };
if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });

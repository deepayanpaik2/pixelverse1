const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { cleanText, slugify, hashFromUrl, buildRegistry, slugsFor } = require('../scripts/sync-games/gamemonetize-feed.js');

const registryPath = path.join(__dirname, '../src/lib/games/registry.json');

test('cleanText turns escaped feed HTML into plain text and drops promo links', () => {
  const raw = "Fight for the city&rsquo;s future. Web Dev &lt;a href='https://www.example.com/'&gt;https://www.example.com/&lt;/a&gt; Enjoy &amp; play!";
  const out = cleanText(raw);
  assert.strictEqual(out, 'Fight for the city’s future. Enjoy & play!');
  assert.ok(!/http|href|Web Dev|&[a-z]+;/i.test(out));
});

test('cleanText truncates on a word boundary', () => {
  const out = cleanText('word '.repeat(200), 50);
  assert.ok(out.length <= 51 && out.endsWith('…'));
});

test('buildRegistry maps feed items, skips broken ones and de-duplicates ids', () => {
  const feed = [
    { id: '1', title: 'A Game', description: 'd', instructions: 'i', url: 'https://html5.gamemonetize.co/abc123/', category: 'Arcade', tags: 'Fun, 2D', thumb: 'x', width: '800', height: '600' },
    { id: '1', title: 'Dup', url: 'https://html5.gamemonetize.co/zzz999/' },
    { id: '2', title: 'No URL', url: 'https://example.com/nope' },
    { id: '3', title: 'A Game', url: 'https://html5.gamemonetize.co/def456/', category: 'Puzzles', tags: '', width: 'x', height: '' },
  ];
  const { rows, skipped } = buildRegistry(feed);
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(skipped, 2);
  assert.deepStrictEqual(rows[0].slice(0, 5), ['abc123', '1', 'A Game', 'Arcade', ['Fun', '2D']]);
  assert.deepStrictEqual(rows[1].slice(5, 7), [800, 600], 'bad sizes fall back to 800x600');
  const slugs = slugsFor(rows);
  assert.deepStrictEqual(slugs, ['a-game', 'a-game-3'], 'duplicate titles get unique slugs');
});

test('hashFromUrl reads the game hash from a GameMonetize embed URL', () => {
  assert.strictEqual(hashFromUrl('https://html5.gamemonetize.co/901eh9sn07eefyfjkfotl4zv432wgvud/'), '901eh9sn07eefyfjkfotl4zv432wgvud');
  assert.strictEqual(hashFromUrl('https://example.com/x/'), null);
});

test('Live registry: every game is a valid, unique GameMonetize game', () => {
  assert.ok(fs.existsSync(registryPath), 'registry.json must exist');
  const rows = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  assert.ok(Array.isArray(rows) && rows.length >= 1000, `expected a full catalog, got ${rows.length}`);

  const ids = new Set();
  for (const r of rows) {
    const [hash, id, title, category, tags, w, h, desc, instr] = r;
    assert.match(hash, /^[a-z0-9]{20,}$/, `bad hash for ${title}`);
    assert.ok(id && !ids.has(id), `duplicate id ${id}`);
    ids.add(id);
    assert.ok(title && category, `missing title/category for id ${id}`);
    assert.ok(Array.isArray(tags));
    assert.ok(w > 0 && h > 0, `bad size for ${title}`);
    assert.ok(typeof desc === 'string' && typeof instr === 'string');
    assert.ok(!/<a |href=|https?:\/\/|Web Dev/i.test(desc + instr), `uncleaned text in ${title}`);
  }

  const slugs = slugsFor(rows);
  assert.strictEqual(new Set(slugs).size, rows.length, 'slugs must be unique');
  slugs.forEach((s) => assert.match(s, /^[a-z0-9-]+$/));
});

test('No old games or GameDistribution integration are left in the project', () => {
  const root = path.join(__dirname, '..');
  assert.ok(!fs.existsSync(path.join(root, 'public/games')), 'public/games must be gone');
  assert.ok(!fs.existsSync(path.join(root, 'src/lib/games/gamedistribution-registry.json')));
  assert.ok(!fs.existsSync(path.join(root, 'scripts/sync-gamedistribution')));
  const idx = fs.readFileSync(path.join(root, 'src/lib/games/index.ts'), 'utf-8');
  assert.ok(!/inhouse-|gd-[0-9a-f]{8}/.test(idx));
});

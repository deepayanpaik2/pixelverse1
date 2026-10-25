const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { mapFeedItem, normalizeCategory } = require('../scripts/sync-gamedistribution/index.js');

// =========================================================================
// 1. GAMEDISTRIBUTION FEED-TO-MANIFEST MAPPING
// =========================================================================
test('GameDistribution Feed-to-Manifest Mapping using Real Sample', (t) => {
  const sampleFeedItem = {
    "Title": "Rocketman Stunt Hero",
    "Md5": "e49e7655f70f4d2ca6a007f2698a0d9b",
    "Description": "Step right up! Load a fearless stunt kid into the circus cannon and fire them across the sky.",
    "Instructions": "Aim: Arrow keys. Launch: Hold Space to power up. Boost: Space.",
    "Type": "html5",
    "SubType": "Javascript",
    "Mobile": "true",
    "Height": 600,
    "Width": 800,
    "Https": true,
    "Status": 2,
    "Url": "https://html5.gamedistribution.com/e49e7655f70f4d2ca6a007f2698a0d9b/",
    "Asset": [
      "https://img.gamedistribution.com/e49e7655f70f4d2ca6a007f2698a0d9b-512x512.jpg",
      "https://img.gamedistribution.com/e49e7655f70f4d2ca6a007f2698a0d9b-1280x720.jpg"
    ],
    "Category": ["Adventure", "Shooter"],
    "Tag": ["ragdoll", "rocket", "Kids Friendly", "Action"]
  };

  const manifest = mapFeedItem(sampleFeedItem, 'https://pixelverse.local');

  // Verify core identification
  assert.strictEqual(manifest.gd_game_hash, 'e49e7655f70f4d2ca6a007f2698a0d9b');
  assert.strictEqual(manifest.id, 'gd-e49e7655f70f4d2ca6a007f2698a0d9b');
  assert.strictEqual(manifest.slug, 'rocketman-stunt-hero');
  assert.strictEqual(manifest.title, 'Rocketman Stunt Hero');

  // Verify official embed URL structure per GameDistribution specification
  assert.ok(manifest.embed_url.startsWith('https://html5.gamedistribution.com/e49e7655f70f4d2ca6a007f2698a0d9b/'), 'Embed URL must use html5.gamedistribution.com');
  assert.ok(manifest.embed_url.includes('gd_sdk_referrer_url='), 'Embed URL must include required gd_sdk_referrer_url');

  // Verify real photo thumbnail from img.gamedistribution.com
  assert.strictEqual(manifest.thumbnail_url, 'https://img.gamedistribution.com/e49e7655f70f4d2ca6a007f2698a0d9b-512x512.jpg');
  assert.strictEqual(manifest.thumbnail_large_url, 'https://img.gamedistribution.com/e49e7655f70f4d2ca6a007f2698a0d9b-1280x720.jpg');

  // Verify category normalization & tagging
  assert.strictEqual(manifest.category, 'Adventure');
  assert.ok(manifest.tags.includes('Kids Friendly'));
  assert.strictEqual(manifest.source_type, 'gamedistribution');
  assert.strictEqual(manifest.mobile_friendly, true);
  assert.strictEqual(manifest.is_kids_safe, true);
  assert.strictEqual(manifest.status, 'published');
});

// =========================================================================
// 2. CATEGORY NORMALIZATION MATRIX
// =========================================================================
test('GameDistribution Category Normalization Matrix', (t) => {
  assert.strictEqual(normalizeCategory(['shooter']), 'Action');
  assert.strictEqual(normalizeCategory(['battle']), 'Action');
  assert.strictEqual(normalizeCategory(['agility']), 'Arcade');
  assert.strictEqual(normalizeCategory(['puzzle']), 'Puzzle');
  assert.strictEqual(normalizeCategory(['match-3']), 'Puzzle');
  assert.strictEqual(normalizeCategory(['racing & driving']), 'Racing');
  assert.strictEqual(normalizeCategory(['sports']), 'Sports');
  assert.strictEqual(normalizeCategory(['football']), 'Sports');
  assert.strictEqual(normalizeCategory(['.io']), 'Multiplayer');
  assert.strictEqual(normalizeCategory(['boardgames']), 'Board/Card');
  assert.strictEqual(normalizeCategory(['dress-up']), 'Casual');
  assert.strictEqual(normalizeCategory(['unknown-genre']), 'Arcade'); // Fallback
});

// =========================================================================
// 3. CATALOG REGISTRY SCHEMA VALIDATION (100 LIVE GAMES)
// =========================================================================
test('Live GameDistribution Registry Schema & Asset Integrity', (t) => {
  const registryPath = path.join(__dirname, '../src/lib/games/registry.json');
  assert.ok(fs.existsSync(registryPath), 'registry.json must exist');

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  assert.ok(Array.isArray(registry), 'Registry must be an array');
  assert.ok(registry.length >= 20, 'Catalog must contain GameDistribution games');

  const seenHashes = new Set();
  const seenSlugs = new Set();

  for (const game of registry) {
    // Unique slugs and hashes
    assert.ok(game.slug, 'Game must have slug');
    assert.ok(!seenSlugs.has(game.slug), `Duplicate slug detected: ${game.slug}`);
    seenSlugs.add(game.slug);

    if (game.gd_game_hash) {
      assert.ok(!seenHashes.has(game.gd_game_hash), `Duplicate hash detected: ${game.gd_game_hash}`);
      seenHashes.add(game.gd_game_hash);
      
      // Real GameDistribution photo thumbnail check
      assert.ok(
        game.thumbnail_url.includes('img.gamedistribution.com') || game.thumbnail_url.startsWith('https://'),
        `Game ${game.slug} thumbnail must be hosted on img.gamedistribution.com: ${game.thumbnail_url}`
      );

      // Embed URL check
      assert.ok(
        game.embed_url.includes('html5.gamedistribution.com'),
        `Game ${game.slug} embed_url must point to html5.gamedistribution.com: ${game.embed_url}`
      );
    }
  }
});

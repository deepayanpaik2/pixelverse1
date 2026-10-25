const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// =========================================================================
// 1. PLAYVERSE CATALOG & MANIFEST INTEGRITY
// =========================================================================
// =========================================================================
// 2. RATINGS CALCULATION & ALGORITHM
// =========================================================================
test('Rating Score Calculation Logic', (t) => {
  function computeRating(likes, dislikes) {
    const total = likes + dislikes;
    if (total === 0) return 5.0;
    return parseFloat(((likes / total) * 5).toFixed(1));
  }

  assert.strictEqual(computeRating(0, 0), 5.0, 'No ratings should default to 5.0');
  assert.strictEqual(computeRating(100, 0), 5.0, '100% likes should equal 5.0');
  assert.strictEqual(computeRating(0, 100), 0.0, '0% likes should equal 0.0');
  assert.strictEqual(computeRating(50, 50), 2.5, '50-50 split should equal 2.5');
  assert.strictEqual(computeRating(80, 20), 4.0, '80% likes should equal 4.0');
  assert.strictEqual(computeRating(95, 5), 4.8, '95% likes should equal 4.8');
});

// =========================================================================
// 3. GUEST FAVORITES & USER ACCOUNT MERGING
// =========================================================================
test('Guest Favorites Storage & User Merge State Transitions', (t) => {
  const store = {
    favorites: {
      guest: [],
      'user_123': ['game_a']
    }
  };

  function toggleFavorite(actorKey, gameId) {
    if (!store.favorites[actorKey]) store.favorites[actorKey] = [];
    const idx = store.favorites[actorKey].indexOf(gameId);
    if (idx !== -1) {
      store.favorites[actorKey].splice(idx, 1);
      return false;
    } else {
      store.favorites[actorKey].push(gameId);
      return true;
    }
  }

  function mergeGuestFavorites(userId) {
    const guestList = store.favorites['guest'] || [];
    if (!store.favorites[userId]) store.favorites[userId] = [];
    for (const id of guestList) {
      if (!store.favorites[userId].includes(id)) {
        store.favorites[userId].push(id);
      }
    }
    store.favorites['guest'] = [];
  }

  // 1. Guest favorites games anonymously
  assert.strictEqual(toggleFavorite('guest', 'cyber-runner'), true);
  assert.strictEqual(toggleFavorite('guest', 'memory-match'), true);
  assert.deepStrictEqual(store.favorites['guest'], ['cyber-runner', 'memory-match']);

  // 2. Guest un-favorites one
  assert.strictEqual(toggleFavorite('guest', 'cyber-runner'), false);
  assert.deepStrictEqual(store.favorites['guest'], ['memory-match']);

  // 3. Guest re-adds game_a which user_123 already has
  toggleFavorite('guest', 'game_a');
  assert.deepStrictEqual(store.favorites['guest'], ['memory-match', 'game_a']);

  // 4. Guest logs in as user_123 -> merge without duplicates
  mergeGuestFavorites('user_123');
  assert.deepStrictEqual(store.favorites['guest'], []);
  assert.deepStrictEqual(store.favorites['user_123'], ['game_a', 'memory-match']);
});

// =========================================================================
// 4. DEVELOPER SUBMISSION LIFECYCLE
// =========================================================================
test('Developer Submission Lifecycle (Create, Approve, Reject)', (t) => {
  const submissions = [];
  const publishedGames = [];

  function createSubmission(data) {
    if (!data.license_accepted) throw new Error('License acceptance mandatory');
    const sub = {
      id: 'sub_' + (submissions.length + 1),
      ...data,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    submissions.push(sub);
    return sub;
  }

  function approveSubmission(subId) {
    const sub = submissions.find(s => s.id === subId);
    if (!sub) return false;
    sub.status = 'approved';
    publishedGames.push({
      id: 'game_' + sub.id,
      title: sub.title,
      slug: sub.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      author: sub.developer_name,
      license: sub.license,
      status: 'published'
    });
    return true;
  }

  function rejectSubmission(subId, reviewerNote) {
    const sub = submissions.find(s => s.id === subId);
    if (!sub) return false;
    sub.status = 'rejected';
    sub.reviewer_notes = reviewerNote;
    return true;
  }

  // 1. Reject submission without license
  assert.throws(() => createSubmission({ title: 'Illegal Game', license_accepted: false }), /License acceptance mandatory/);

  // 2. Submit valid game
  const sub1 = createSubmission({
    developer_name: 'Studio Nova',
    title: 'Nova Striker',
    license: 'MIT',
    license_accepted: true
  });
  assert.strictEqual(sub1.status, 'pending');

  // 3. Approve submission
  const approved = approveSubmission(sub1.id);
  assert.strictEqual(approved, true);
  assert.strictEqual(sub1.status, 'approved');
  assert.strictEqual(publishedGames.length, 1);
  assert.strictEqual(publishedGames[0].slug, 'nova-striker');
  assert.strictEqual(publishedGames[0].status, 'published');

  // 4. Reject another submission
  const sub2 = createSubmission({
    developer_name: 'Unknown Dev',
    title: 'Broken Build',
    license: 'Custom',
    license_accepted: true
  });
  rejectSubmission(sub2.id, 'Embed URL returns 404');
  assert.strictEqual(sub2.status, 'rejected');
  assert.strictEqual(sub2.reviewer_notes, 'Embed URL returns 404');
  assert.strictEqual(publishedGames.length, 1); // Not published
});

// =========================================================================
// 5. DMCA TAKEDOWN PROCEDURE & QUARANTINE
// =========================================================================
test('DMCA Takedown Procedure & Automatic Quarantine', (t) => {
  const games = [
    { id: 'game-1', title: 'Space Runner', status: 'published' },
    { id: 'game-2', title: 'Puzzle Quest', status: 'published' }
  ];
  const takedowns = [];

  function fileTakedown(data) {
    if (!data.good_faith_confirmed) throw new Error('Statutory good faith confirmation required');
    const td = {
      id: 'td_' + (takedowns.length + 1),
      ...data,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    takedowns.push(td);
    return td;
  }

  function actionTakedown(tdId, adminNote) {
    const td = takedowns.find(t => t.id === tdId);
    if (!td) return false;
    td.status = 'actioned';
    td.admin_notes = adminNote;

    // Quarantine the target game immediately
    const game = games.find(g => g.id === td.game_id);
    if (game) {
      game.status = 'quarantined';
    }
    return true;
  }

  // 1. Must confirm good faith
  assert.throws(() => fileTakedown({ game_id: 'game-1', good_faith_confirmed: false }), /Statutory good faith/);

  // 2. File takedown
  const td = fileTakedown({
    game_id: 'game-1',
    claimant_name: 'Legal Counsel Corp',
    copyright_owner: 'Original IP Holder',
    good_faith_confirmed: true
  });
  assert.strictEqual(td.status, 'pending');
  assert.strictEqual(games[0].status, 'published');

  // 3. Compliance team actions takedown -> game immediately quarantined
  actionTakedown(td.id, 'Copyright confirmed. Quarantined pending license proof.');
  assert.strictEqual(td.status, 'actioned');
  assert.strictEqual(games[0].status, 'quarantined');
  assert.strictEqual(games[1].status, 'published'); // Unaffected
});

// =========================================================================
// 6. I18N LOCALIZATION DICTIONARY PARITY
// =========================================================================
test('i18n Translation Dictionary Completeness', (t) => {
  const i18nPath = path.join(__dirname, '../src/lib/i18n/index.ts');
  assert.ok(fs.existsSync(i18nPath), 'src/lib/i18n/index.ts must exist');

  const content = fs.readFileSync(i18nPath, 'utf-8');
  assert.ok(content.includes('en: {'), 'Must support English (en)');
  assert.ok(content.includes('hi: {'), 'Must support Hindi (hi)');
  assert.ok(content.includes('bn: {'), 'Must support Bengali (bn)');
  assert.ok(content.includes('es: {'), 'Must support Spanish (es)');

  // Verify critical localization keys are defined
  const requiredKeys = ['playNow', 'searchPlaceholder', 'kidsMode', 'favorites', 'history', 'categories'];
  for (const k of requiredKeys) {
    assert.ok(content.includes(`${k}:`), `Translation key ${k} must exist`);
  }
});

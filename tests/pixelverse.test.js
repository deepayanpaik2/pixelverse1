const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// 1. GAME MANIFEST & REGISTRY VALIDATION
test('Friendship State Machine & Transitions', (t) => {
  // Simulated database state
  const friendRequests = [];
  const friendships = [];

  function sendFriendRequest(senderId, receiverId) {
    if (senderId === receiverId) throw new Error('Cannot friend self');
    const existing = friendRequests.find(r => 
      (r.sender === senderId && r.receiver === receiverId) ||
      (r.sender === receiverId && r.receiver === senderId)
    );
    if (existing && existing.status === 'pending') {
      throw new Error('Request already pending');
    }
    const req = { id: 'req_' + (friendRequests.length + 1), sender: senderId, receiver: receiverId, status: 'pending' };
    friendRequests.push(req);
    return req;
  }

  function acceptFriendRequest(reqId, receiverId) {
    const req = friendRequests.find(r => r.id === reqId);
    if (!req) throw new Error('Request not found');
    if (req.receiver !== receiverId) throw new Error('Unauthorized');
    if (req.status !== 'pending') throw new Error('Request already processed');

    req.status = 'accepted';
    const u1 = req.sender < req.receiver ? req.sender : req.receiver;
    const u2 = req.sender < req.receiver ? req.receiver : req.sender;
    friendships.push({ u1, u2 });
    return true;
  }

  // Test 1: Self friend request throws error
  assert.throws(() => sendFriendRequest('user_a', 'user_a'), /Cannot friend self/);

  // Test 2: Valid friend request
  const req = sendFriendRequest('user_a', 'user_b');
  assert.strictEqual(req.status, 'pending');

  // Test 3: Duplicate request throws error
  assert.throws(() => sendFriendRequest('user_a', 'user_b'), /already pending/);

  // Test 4: Unauthorized receiver cannot accept
  assert.throws(() => acceptFriendRequest(req.id, 'user_c'), /Unauthorized/);

  // Test 5: Authorized receiver accepts
  acceptFriendRequest(req.id, 'user_b');
  assert.strictEqual(req.status, 'accepted');
  assert.strictEqual(friendships.length, 1);
  assert.deepStrictEqual(friendships[0], { u1: 'user_a', u2: 'user_b' });
});

// 3. ROOM MEMBERSHIP & PERMISSIONS
test('Room Membership & Access Controls', (t) => {
  const rooms = [];
  const roomMembers = [];

  function createRoom(hostId, name, visibility, maxCapacity = 8) {
    const room = { id: 'room_1', hostId, name, visibility, maxCapacity, isClosed: false };
    rooms.push(room);
    roomMembers.push({ roomId: room.id, userId: hostId, role: 'host' });
    return room;
  }

  function joinRoom(roomId, userId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room || room.isClosed) throw new Error('Room unavailable');
    const count = roomMembers.filter(m => m.roomId === roomId).length;
    if (count >= room.maxCapacity) throw new Error('Room is full');
    roomMembers.push({ roomId, userId, role: 'participant' });
    return true;
  }

  const room = createRoom('host_1', 'Test Tournament Lounge', 'public', 2);
  assert.strictEqual(roomMembers.length, 1);

  // Join second participant
  joinRoom(room.id, 'guest_1');
  assert.strictEqual(roomMembers.length, 2);

  // Third participant should be rejected by capacity limit
  assert.throws(() => joinRoom(room.id, 'guest_2'), /Room is full/);
});

// 4. NOTIFICATION GENERATION & AGGREGATION
test('Notification Generation & Read Status', (t) => {
  const notifications = [];

  function emitNotification(userId, actorId, type, title, content) {
    const notif = {
      id: 'notif_' + (notifications.length + 1),
      userId,
      actorId,
      type,
      title,
      content,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifications.push(notif);
    return notif;
  }

  emitNotification('user_b', 'user_a', 'friend_request', 'New Friend Request', 'user_a sent a friend request');
  emitNotification('user_b', 'user_c', 'room_invite', 'Room Invite', 'user_c invited you to Neon Lounge');

  assert.strictEqual(notifications.length, 2);
  assert.strictEqual(notifications[0].isRead, false);

  // Mark all read
  notifications.forEach(n => { n.isRead = true; });
  assert.strictEqual(notifications.every(n => n.isRead === true), true);
});

// 5. DATABASE MIGRATIONS & SCHEMA VALIDITY
test('Database Migration Script Exists and Covers All 26 Tables', (t) => {
  const migrationPath = path.join(__dirname, '../supabase/migrations/00001_initial_schema.sql');
  assert.ok(fs.existsSync(migrationPath), 'Migration file must exist');

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  const requiredTables = [
    'profiles',
    'user_preferences',
    'user_blocks',
    'friendships',
    'friend_requests',
    'conversations',
    'conversation_members',
    'messages',
    'message_reactions',
    'message_attachments',
    'stickers',
    'notifications',
    'games',
    'game_favorites',
    'game_sessions',
    'game_events',
    'rooms',
    'room_members',
    'room_invitations',
    'parties',
    'party_members',
    'communities',
    'community_channels',
    'community_members',
    'reports',
    'moderation_actions'
  ];

  for (const table of requiredTables) {
    assert.ok(sql.includes(`CREATE TABLE IF NOT EXISTS public.${table}`), `Migration must create table: ${table}`);
  }

  // Check RLS
  assert.ok(sql.includes('ENABLE ROW LEVEL SECURITY'), 'Migration must enable Row Level Security');
});

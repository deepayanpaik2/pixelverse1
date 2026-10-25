import { 
  Profile, 
  UserPreferences, 
  GameManifest, 
  GameRating,
  GameSubmission,
  TakedownNotice,
  Conversation, 
  Message, 
  Room, 
  Community, 
  CommunityChannel, 
  NotificationItem, 
  FriendRequest, 
  Friendship, 
  Report,
  CategoryInfo
} from '@/types';
import { FEATURED_GAMES, CATEGORIES } from '../games';

const SEED_PROFILES: Profile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    username: 'playmaster',
    display_name: 'Play Master',
    avatar_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
    banner_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
    bio: 'Lead Arcade Architect & High-Score Champion 🕹️ Playing since 1999.',
    status: 'online',
    custom_status: 'Building next-gen browser games',
    favorite_categories: ['Arcade', 'Action', 'Puzzle'],
    level: 42,
    xp: 18450,
    is_admin: true,
    is_moderator: true,
    created_at: '2026-01-15T08:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    username: 'neon_runner',
    display_name: 'Neon Runner',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    banner_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
    bio: 'Speedrunner | Synthwave enthusiast | Cyber Runner specialist ⚡',
    status: 'online',
    custom_status: 'Chasing world record distance',
    favorite_categories: ['Racing', 'Action', 'Arcade'],
    level: 28,
    xp: 9200,
    is_admin: false,
    is_moderator: false,
    created_at: '2026-02-10T12:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    username: 'pixel_valkyrie',
    display_name: 'Pixel Valkyrie',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
    bio: 'Streamer & competitive multiplayer tactician 🎧',
    status: 'dnd',
    custom_status: 'Live on Pixelverse',
    favorite_categories: ['Multiplayer', 'Action', 'io Games'],
    level: 35,
    xp: 14200,
    is_admin: false,
    is_moderator: true,
    created_at: '2026-03-01T15:30:00Z',
  }
];

class MockPixelverseStore {
  private profiles: Profile[] = [...SEED_PROFILES];
  private games: GameManifest[] = [...FEATURED_GAMES];
  private ratings: GameRating[] = [];
  private submissions: GameSubmission[] = [
    {
      id: 'sub-001',
      developer_name: 'AeroPixel Games',
      developer_email: 'dev@aeropixel.com',
      developer_url: 'https://aeropixel.dev',
      title: 'Neon Drift Highway',
      category: 'Racing',
      tags: ['Racing', 'Cars', 'Drift'],
      description: 'Endless highway drift with retro synthwave aesthetic.',
      instructions: 'A/D to steer, Space to boost.',
      launch_url: 'https://aeropixel.dev/games/neon-drift/',
      thumbnail_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
      license: 'MIT',
      license_accepted: true,
      status: 'pending',
      created_at: '2026-04-22T10:00:00Z'
    }
  ];
  private takedowns: TakedownNotice[] = [];
  private favorites: { [key: string]: string[] } = {
    '11111111-1111-1111-1111-111111111111': FEATURED_GAMES.slice(0, 3).map(g => g.id)
  };
  private history: { [key: string]: string[] } = {};
  private blockedUsers: { [userId: string]: string[] } = {};
  private reports: Report[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const savedFavs = localStorage.getItem('playverse_favorites');
      if (savedFavs) this.favorites = JSON.parse(savedFavs);

      const savedHistory = localStorage.getItem('playverse_history');
      if (savedHistory) this.history = JSON.parse(savedHistory);

      const savedSubmissions = localStorage.getItem('playverse_submissions');
      if (savedSubmissions) this.submissions = JSON.parse(savedSubmissions);

      const savedTakedowns = localStorage.getItem('playverse_takedowns');
      if (savedTakedowns) this.takedowns = JSON.parse(savedTakedowns);

      const savedRatings = localStorage.getItem('playverse_ratings');
      if (savedRatings) this.ratings = JSON.parse(savedRatings);
    } catch (e) {
      console.warn('Could not load localStorage in PixelverseStore', e);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('playverse_favorites', JSON.stringify(this.favorites));
      localStorage.setItem('playverse_history', JSON.stringify(this.history));
      localStorage.setItem('playverse_submissions', JSON.stringify(this.submissions));
      localStorage.setItem('playverse_takedowns', JSON.stringify(this.takedowns));
      localStorage.setItem('playverse_ratings', JSON.stringify(this.ratings));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  // --- Games Catalog & Status ---
  getGames(kidsMode: boolean = false): GameManifest[] {
    let list = this.games.filter(g => g.status === 'published');
    if (kidsMode) {
      list = list.filter(g => g.is_kids_safe);
    }
    return list;
  }

  getAllGamesAdmin(): GameManifest[] {
    return [...this.games];
  }

  getGameBySlug(slug: string): GameManifest | undefined {
    return this.games.find(g => g.slug === slug);
  }

  updateGameStatus(gameId: string, status: 'published' | 'quarantined' | 'takedown') {
    const game = this.games.find(g => g.id === gameId);
    if (game) {
      game.status = status;
      this.saveToStorage();
    }
  }

  // --- Ratings ---
  rateGame(gameId: string, isLike: boolean, userId?: string, guestId: string = 'guest'): { likes: number; dislikes: number; userRating: boolean } {
    const actorKey = userId || guestId;
    const existing = this.ratings.findIndex(r => r.game_id === gameId && (r.user_id === actorKey || r.guest_id === actorKey));
    
    if (existing !== -1) {
      this.ratings[existing].is_like = isLike;
    } else {
      this.ratings.push({
        id: 'rate-' + Date.now(),
        game_id: gameId,
        user_id: userId,
        guest_id: guestId,
        is_like: isLike,
        created_at: new Date().toISOString()
      });
    }

    const game = this.games.find(g => g.id === gameId);
    if (game) {
      if (isLike) game.likes_count++;
      else game.dislikes_count++;
      const total = game.likes_count + game.dislikes_count;
      game.rating_score = total > 0 ? parseFloat(((game.likes_count / total) * 5).toFixed(1)) : 5.0;
    }

    this.saveToStorage();
    return {
      likes: game?.likes_count || 0,
      dislikes: game?.dislikes_count || 0,
      userRating: isLike
    };
  }

  getUserGameRating(gameId: string, userId?: string, guestId: string = 'guest'): boolean | null {
    const actorKey = userId || guestId;
    const r = this.ratings.find(item => item.game_id === gameId && (item.user_id === actorKey || item.guest_id === actorKey));
    return r ? r.is_like : null;
  }

  // --- Favorites & History (with Guest support) ---
  getFavorites(actorId: string = 'guest'): string[] {
    return this.favorites[actorId] || [];
  }

  toggleFavorite(actorId: string = 'guest', gameId: string): boolean {
    if (!this.favorites[actorId]) this.favorites[actorId] = [];
    const idx = this.favorites[actorId].indexOf(gameId);
    let isFav = false;
    if (idx !== -1) {
      this.favorites[actorId].splice(idx, 1);
      isFav = false;
    } else {
      this.favorites[actorId].push(gameId);
      isFav = true;
    }
    this.saveToStorage();
    return isFav;
  }

  mergeGuestFavorites(userId: string) {
    const guestFavs = this.favorites['guest'] || [];
    if (guestFavs.length > 0) {
      if (!this.favorites[userId]) this.favorites[userId] = [];
      for (const fav of guestFavs) {
        if (!this.favorites[userId].includes(fav)) {
          this.favorites[userId].push(fav);
        }
      }
      this.favorites['guest'] = [];
      this.saveToStorage();
    }
  }

  recordPlayedGame(actorId: string = 'guest', gameSlug: string) {
    if (!this.history[actorId]) this.history[actorId] = [];
    this.history[actorId] = [gameSlug, ...this.history[actorId].filter(s => s !== gameSlug)].slice(0, 20);

    const game = this.games.find(g => g.slug === gameSlug);
    if (game) {
      game.play_count++;
    }
    this.saveToStorage();
  }

  getHistory(actorId: string = 'guest'): GameManifest[] {
    const slugs = this.history[actorId] || [];
    return slugs.map(s => this.games.find(g => g.slug === s)).filter(Boolean) as GameManifest[];
  }

  // --- Developer Submissions ---
  createSubmission(sub: Omit<GameSubmission, 'id' | 'status' | 'created_at'>): GameSubmission {
    const newSub: GameSubmission = {
      ...sub,
      id: 'sub-' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.submissions.unshift(newSub);
    this.saveToStorage();
    return newSub;
  }

  getSubmissions(): GameSubmission[] {
    return [...this.submissions];
  }

  approveSubmission(subId: string): boolean {
    const sub = this.submissions.find(s => s.id === subId);
    if (!sub) return false;
    sub.status = 'approved';

    // Add as published game
    const slug = sub.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    this.games.push({
      id: 'dev-' + Date.now(),
      slug,
      title: sub.title,
      description: sub.description,
      instructions: sub.instructions,
      category: sub.category,
      tags: sub.tags,
      thumbnail_url: sub.thumbnail_url,
      launch_path: sub.launch_url,
      embed_url: sub.launch_url,
      source_type: 'developer_submitted',
      author: sub.developer_name,
      developer_url: sub.developer_url,
      license: sub.license,
      supported_players: '1 Player',
      controls: { keyboard: [], touch: true },
      orientation: 'landscape',
      mobile_friendly: true,
      is_featured: false,
      is_kids_safe: true,
      play_count: 0,
      likes_count: 0,
      dislikes_count: 0,
      rating_score: 5.0,
      tile_size: '1x1',
      status: 'published'
    });

    this.saveToStorage();
    return true;
  }

  rejectSubmission(subId: string, notes: string): boolean {
    const sub = this.submissions.find(s => s.id === subId);
    if (!sub) return false;
    sub.status = 'rejected';
    sub.reviewer_notes = notes;
    this.saveToStorage();
    return true;
  }

  // --- DMCA / Takedowns ---
  createTakedown(notice: Omit<TakedownNotice, 'id' | 'status' | 'created_at'>): TakedownNotice {
    const newNotice: TakedownNotice = {
      ...notice,
      id: 'td-' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.takedowns.unshift(newNotice);
    this.saveToStorage();
    return newNotice;
  }

  getTakedowns(): TakedownNotice[] {
    return [...this.takedowns];
  }

  actionTakedown(noticeId: string, notes: string): boolean {
    const notice = this.takedowns.find(t => t.id === noticeId);
    if (!notice) return false;
    notice.status = 'actioned';
    notice.admin_notes = notes;

    // Immediately quarantine the infringing game
    if (notice.game_id) {
      this.updateGameStatus(notice.game_id, 'takedown');
    }
    this.saveToStorage();
    return true;
  }

  // --- Profiles & Friends ---
  getProfiles(): Profile[] { return [...this.profiles]; }

  getProfileById(id: string): Profile | undefined {
    return this.profiles.find(p => p.id === id);
  }

  getProfileByUsername(username: string): Profile | undefined {
    return this.profiles.find(p => p.username.toLowerCase() === username.toLowerCase());
  }

  updateProfile(id: string, updates: Partial<Profile>): Profile | undefined {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.profiles[idx] = { ...this.profiles[idx], ...updates };
      return this.profiles[idx];
    }
    return undefined;
  }

  createProfile(profile: Profile): Profile {
    this.profiles.push(profile);
    return profile;
  }

  searchPlayers(query: string): Profile[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.profiles;
    return this.profiles.filter(p => 
      p.username.toLowerCase().includes(q) || 
      p.display_name.toLowerCase().includes(q)
    );
  }

  // --- Reports ---
  createReport(report: Omit<Report, 'id' | 'status' | 'created_at'>): Report {
    const r: Report = {
      ...report,
      id: 'rep-' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.reports.push(r);
    return r;
  }

  getReports(): Report[] {
    return this.reports.map(r => ({
      ...r,
      reporter: this.getProfileById(r.reporter_id)
    }));
  }

  resolveReport(reportId: string, notes: string): boolean {
    const rep = this.reports.find(r => r.id === reportId);
    if (rep) {
      rep.status = 'resolved';
      rep.reviewer_notes = notes;
      return true;
    }
    return false;
  }

  // --- Friendships & Rooms ---
  getFriendships(userId: string): Profile[] {
    return this.profiles.filter(p => p.id !== userId);
  }

  getFriendRequests(userId: string): { incoming: FriendRequest[]; outgoing: FriendRequest[] } {
    return {
      incoming: [
        {
          id: 'fr-inc-1',
          sender_id: '22222222-2222-2222-2222-222222222222',
          receiver_id: userId,
          status: 'pending',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender: this.profiles[1] || this.profiles[0],
        }
      ],
      outgoing: []
    };
  }

  sendFriendRequest(senderId: string, receiverId: string): FriendRequest {
    return { id: 'fr-' + Date.now(), sender_id: senderId, receiver_id: receiverId, status: 'pending', created_at: new Date().toISOString() };
  }

  acceptFriendRequest(id: string): boolean { return true; }
  rejectFriendRequest(id: string): boolean { return true; }
  removeFriend(u1: string, u2: string): boolean { return true; }
  blockUser(userId: string, targetId: string) {}
  unblockUser(userId: string, targetId: string) {}
  getBlockedUsers(userId: string): Profile[] { return []; }

  getConversations(userId: string): Conversation[] {
    return [
      {
        id: 'conv-general',
        type: 'group',
        name: 'General Arcade Lounge',
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        last_message: {
          id: 'm-init',
          conversation_id: 'conv-general',
          sender_id: this.profiles[0]?.id || 'admin',
          content: 'Welcome to the Pixelverse global arcade chat! 🎮',
          is_edited: false,
          is_pinned: true,
          created_at: new Date().toISOString(),
          sender: this.profiles[0]
        }
      }
    ];
  }

  getMessages(convId: string): Message[] {
    return [
      {
        id: 'm-1',
        conversation_id: convId,
        sender_id: this.profiles[0]?.id || 'admin',
        content: 'Welcome to the Pixelverse global arcade lounge! 🎮',
        is_edited: false,
        is_pinned: true,
        created_at: new Date().toISOString(),
        sender: this.profiles[0]
      }
    ];
  }

  sendMessage(convId: string, senderId: string, content: string, replyToId?: string): Message {
    return {
      id: 'm-' + Date.now(),
      conversation_id: convId,
      sender_id: senderId,
      content,
      reply_to_id: replyToId,
      is_edited: false,
      is_pinned: false,
      created_at: new Date().toISOString(),
      sender: this.profiles.find(p => p.id === senderId)
    };
  }

  addReaction(msgId: string, userId: string, emoji: string) {}

  getRooms(): Room[] {
    return [
      {
        id: 'room-1',
        code: 'RETRO-99',
        name: 'Retro Speedruns & High Scores',
        description: 'Chasing high scores together. Voice chat enabled!',
        host_id: this.profiles[0]?.id || '11111111-1111-1111-1111-111111111111',
        visibility: 'public',
        max_participants: 8,
        selected_game_id: this.games[0]?.id,
        selected_game: this.games[0],
        is_voice_active: true,
        is_closed: false,
        created_at: new Date().toISOString(),
        members_count: 3,
        host: this.profiles[0]
      },
      {
        id: 'room-2',
        code: 'PUZZLE-42',
        name: 'Chill Puzzle Co-Op',
        description: 'Casual relaxing puzzle runs with fellow gamers.',
        host_id: this.profiles[1]?.id || '22222222-2222-2222-2222-222222222222',
        visibility: 'public',
        max_participants: 6,
        selected_game_id: this.games[1]?.id,
        selected_game: this.games[1],
        is_voice_active: false,
        is_closed: false,
        created_at: new Date().toISOString(),
        members_count: 2,
        host: this.profiles[1]
      }
    ];
  }

  getRoomById(id: string): Room | undefined {
    return this.getRooms().find(r => r.id === id || r.code === id);
  }

  createRoom(room: Partial<Room>): Room {
    return {
      id: 'room-' + Date.now(),
      code: 'PLAY-' + Math.floor(1000 + Math.random() * 9000),
      name: room.name || 'New Gaming Room',
      description: room.description || '',
      host_id: room.host_id || this.profiles[0]?.id || 'admin',
      visibility: room.visibility || 'public',
      max_participants: room.max_participants || 8,
      selected_game_id: room.selected_game_id,
      selected_game: this.games.find(g => g.id === room.selected_game_id),
      is_voice_active: room.is_voice_active || false,
      is_closed: false,
      created_at: new Date().toISOString(),
      members_count: 1,
      host: this.profiles.find(p => p.id === room.host_id)
    };
  }

  getCommunities(): Community[] {
    return [
      {
        id: 'comm-1',
        slug: 'arcade-legends',
        name: 'Arcade Legends',
        description: 'Global competitive hub for browser speedrunners and high-score chasers.',
        avatar_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150',
        banner_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
        owner_id: this.profiles[0]?.id || 'admin',
        is_featured: true,
        created_at: new Date().toISOString(),
        members_count: 1420,
        channels: [
          {
            id: 'ch-announcements',
            community_id: 'comm-1',
            name: 'announcements',
            topic: 'Official tournaments and updates',
            type: 'announcement',
            position: 1,
            created_at: new Date().toISOString(),
          },
          {
            id: 'ch-general',
            community_id: 'comm-1',
            name: 'general',
            topic: 'General arcade discussion',
            type: 'text',
            position: 2,
            created_at: new Date().toISOString(),
          },
          {
            id: 'ch-voice',
            community_id: 'comm-1',
            name: 'Arcade Voice Lounge',
            type: 'voice',
            position: 3,
            created_at: new Date().toISOString(),
          }
        ]
      }
    ];
  }

  getCommunityBySlug(slug: string): Community | undefined {
    return this.getCommunities().find(c => c.slug === slug);
  }

  getNotifications(userId: string): NotificationItem[] {
    return [
      {
        id: 'notif-1',
        user_id: userId,
        actor_id: this.profiles[1]?.id,
        actor: this.profiles[1],
        type: 'friend_request',
        title: 'New Friend Request',
        content: 'Neon Runner sent you a friend request!',
        link: '/friends',
        is_read: false,
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'notif-2',
        user_id: userId,
        type: 'achievement',
        title: 'Achievement Unlocked: Arcade Explorer',
        content: 'You played 5 different browser games on Pixelverse!',
        link: '/history',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      }
    ];
  }

  markAllNotificationsRead(userId: string) {}
}

export const mockStore = new MockPixelverseStore();

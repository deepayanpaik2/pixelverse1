export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  banner_url?: string;
  bio?: string;
  status: UserStatus;
  custom_status?: string;
  favorite_categories: string[];
  level: number;
  xp: number;
  is_admin: boolean;
  is_moderator: boolean;
  created_at: string;
  updated_at?: string;
  profile_completed?: boolean;
  last_seen_at?: string;
}

export interface UserPreferences {
  user_id: string;
  theme: 'dark' | 'light' | 'high-contrast' | 'cyberpunk' | 'synthwave';
  accent_color: 'cyan' | 'purple' | 'lime' | 'coral' | 'gold';
  animation_intensity: 'full' | 'reduced' | 'minimal';
  sound_effects_enabled: boolean;
  privacy_show_activity: boolean;
  privacy_allow_dms_from: 'everyone' | 'friends' | 'none';
  privacy_show_online_status: boolean;
  notifications_sound: boolean;
  notifications_email: boolean;
  kids_mode: boolean;
  language: 'en' | 'hi' | 'bn' | 'es';
}

export type GameSourceType = 'gamemonetize' | 'gamedistribution' | 'feed' | 'self_hosted' | 'in_house' | 'developer_submitted';
export type GameOrientation = 'landscape' | 'portrait' | 'both';

export interface GameControls {
  keyboard?: string[];
  mouse?: string[];
  touch?: boolean;
  gamepad?: boolean;
}

export interface GameManifest {
  id: string;
  slug: string;
  gd_game_hash?: string;
  title: string;
  description: string;
  instructions?: string;
  category: string;
  tags: string[];
  thumbnail_url: string;
  thumbnail_large_url?: string;
  banner_url?: string;
  preview_video_url?: string;
  launch_path: string;
  embed_url?: string;
  source_type: GameSourceType;
  source?: 'gamemonetize' | 'gamedistribution' | 'feed' | 'self_hosted' | 'in_house' | 'developer_submitted';
  repository_url?: string;
  author: string;
  developer_name?: string;
  developer_url?: string;
  license: string;
  license_url?: string;
  supported_players: string;
  is_multiplayer?: boolean;
  controls: GameControls;
  orientation: GameOrientation;
  mobile_friendly: boolean;
  supports_mobile?: boolean;
  supports_desktop?: boolean;
  aspect_ratio?: string; // e.g. "16/9", "4/3", "1/1"
  width?: number;
  height?: number;
  is_featured: boolean;
  featured?: boolean;
  is_editor_pick?: boolean;
  is_kids_safe: boolean;
  play_count: number;
  likes_count: number;
  dislikes_count: number;
  rating_score: number; // 0.0 - 5.0
  tile_size?: '1x1' | '2x2' | 'wide';
  status: 'published' | 'pending_review' | 'quarantined' | 'takedown' | 'active' | 'unavailable' | 'hidden';
  last_synced_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GameRating {
  id: string;
  game_id: string;
  user_id?: string;
  guest_id?: string;
  is_like: boolean;
  created_at: string;
}

export interface GamePlayEvent {
  id: string;
  game_id: string;
  user_id?: string;
  guest_id?: string;
  playtime_seconds: number;
  score?: number;
  created_at: string;
}

export interface GameSubmission {
  id: string;
  developer_name: string;
  developer_email: string;
  developer_url?: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  instructions: string;
  launch_url: string;
  thumbnail_url: string;
  license: string;
  license_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_notes?: string;
  created_at: string;
}

export interface TakedownNotice {
  id: string;
  game_id: string;
  claimant_name: string;
  claimant_email: string;
  copyright_owner: string;
  infringing_url: string;
  description: string;
  good_faith_confirmed: boolean;
  status: 'pending' | 'actioned' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

export interface CategoryInfo {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_name: string;
  color: string;
  game_count: number;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  last_read_at: string;
  is_muted: boolean;
  created_at: string;
  profile?: Profile;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  reply_to_id?: string;
  is_edited: boolean;
  is_pinned: boolean;
  created_at: string;
  sender?: Profile;
  reactions?: MessageReaction[];
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar_url?: string;
  last_message_at: string;
  created_at: string;
  last_message?: Message;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  description?: string;
  host_id: string;
  visibility: 'public' | 'unlisted' | 'private';
  max_participants: number;
  selected_game_id?: string;
  selected_game?: GameManifest;
  is_voice_active: boolean;
  is_closed: boolean;
  created_at: string;
  members_count?: number;
  host?: Profile;
}

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  avatar_url?: string;
  banner_url?: string;
  owner_id: string;
  is_featured: boolean;
  created_at: string;
  channels?: CommunityChannel[];
  members_count?: number;
}

export interface CommunityChannel {
  id: string;
  community_id: string;
  name: string;
  topic?: string;
  type: 'text' | 'voice' | 'announcement';
  position: number;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  actor_id?: string;
  actor?: Profile;
  type: string;
  title: string;
  content: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'canceled';
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Friendship {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  friend?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'user' | 'game' | 'room' | 'community';
  target_id: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewer_id?: string;
  reviewer_notes?: string;
  created_at: string;
}

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Profile, UserPreferences } from '@/types';
import { mockStore } from '@/lib/supabase/mock-store';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { LanguageCode } from '@/lib/i18n';
import { DEFAULT_AVATAR, cropToSquare, blobToDataUrl, validateImageFile } from '@/lib/avatar';

type Result = { success: boolean; error?: string };

interface AuthContextType {
  user: Profile | null;
  preferences: UserPreferences;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRealBackend: boolean;
  kidsMode: boolean;
  language: LanguageCode;
  favorites: string[];
  setKidsMode: (enabled: boolean) => void;
  setLanguage: (lang: LanguageCode) => void;
  toggleFavorite: (gameId: string) => boolean;
  rateGame: (gameId: string, isLike: boolean) => { likes: number; dislikes: number; userRating: boolean };
  getUserRating: (gameId: string) => boolean | null;
  signIn: (email: string, pass: string) => Promise<Result>;
  signUp: (email: string, pass: string, username: string, displayName: string) => Promise<Result & { needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Result>;
  uploadAvatar: (file: File) => Promise<Result & { url?: string }>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  switchUser: (username: string) => void;
}

const defaultPreferences: UserPreferences = {
  user_id: '11111111-1111-1111-1111-111111111111',
  theme: 'dark',
  accent_color: 'cyan',
  animation_intensity: 'full',
  sound_effects_enabled: true,
  privacy_show_activity: true,
  privacy_allow_dms_from: 'everyone',
  privacy_show_online_status: true,
  notifications_sound: true,
  notifications_email: false,
  kids_mode: false,
  language: 'en',
};

const PREF_COLUMNS: (keyof UserPreferences)[] = [
  'theme', 'accent_color', 'animation_intensity', 'sound_effects_enabled',
  'privacy_show_activity', 'privacy_allow_dms_from', 'privacy_show_online_status',
  'notifications_sound', 'notifications_email', 'kids_mode', 'language',
];

const PROFILE_COLUMNS = [
  'username', 'display_name', 'avatar_url', 'banner_url', 'bio', 'status',
  'custom_status', 'favorite_categories', 'profile_completed',
] as const;

const cleanUsername = (u: string) => u.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);

function rowToProfile(row: any): Profile {
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    avatar_url: row.avatar_url || DEFAULT_AVATAR(row.username),
    banner_url: row.banner_url || undefined,
    bio: row.bio || '',
    status: row.status || 'online',
    custom_status: row.custom_status || undefined,
    favorite_categories: row.favorite_categories || [],
    level: row.level ?? 1,
    xp: row.xp ?? 0,
    is_admin: !!row.is_admin,
    is_moderator: !!row.is_moderator,
    created_at: row.created_at,
    updated_at: row.updated_at,
    profile_completed: row.profile_completed ?? true,
    last_seen_at: row.last_seen_at,
  };
}

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Wrong email or password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for the link.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'That email already has an account. Try signing in.';
  if (m.includes('password') && m.includes('characters')) return 'Password is too short. Use at least 8 characters.';
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a minute and try again.';
  return message;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const real = !!isSupabaseConfigured();

  const [user, setUser] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [kidsMode, setKidsModeState] = useState<boolean>(false);
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<Profile | null>(null);
  userRef.current = user;

  // ---------- load profile + preferences from Supabase ----------
  const loadRealUser = useCallback(async (userId: string, meta?: Record<string, any>) => {
    let { data: row } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    if (!row) {
      // Safety net if the signup trigger has not been installed yet
      const username = cleanUsername(meta?.username || '') || `user_${userId.slice(0, 8)}`;
      const ins = await supabase
        .from('profiles')
        .insert({ id: userId, username, display_name: meta?.display_name || username, avatar_url: DEFAULT_AVATAR(username), status: 'online' })
        .select('*')
        .maybeSingle();
      row = ins.data;
    }
    if (!row) return null;

    const profile = rowToProfile(row);
    setUser(profile);

    const { data: prefRow } = await supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle();
    if (prefRow) {
      setPreferences({ ...defaultPreferences, ...prefRow, user_id: userId });
    } else {
      setPreferences({ ...defaultPreferences, user_id: userId });
    }
    setFavorites(mockStore.getFavorites(userId));
    return profile;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKids = localStorage.getItem('playverse_kids_mode');
      if (savedKids) setKidsModeState(savedKids === 'true');
      const savedLang = localStorage.getItem('playverse_language') as LanguageCode;
      if (savedLang) setLanguageState(savedLang);
    }

    if (!real) {
      // ---- offline / demo mode (no Supabase keys): original mock behaviour ----
      const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('playverse_current_user_id') : null;
      const initialUser = savedUserId ? mockStore.getProfileById(savedUserId) : null;
      if (initialUser) setUser(initialUser);
      setFavorites(mockStore.getFavorites(initialUser ? initialUser.id : 'guest'));
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setFavorites(mockStore.getFavorites('guest'));

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      if (data.session?.user) await loadRealUser(data.session.user.id, data.session.user.user_metadata);
      if (!cancelled) setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // never await supabase calls inside this callback (can dead-lock) -> defer
      setTimeout(() => {
        if (cancelled) return;
        if (session?.user) {
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
            loadRealUser(session.user.id, session.user.user_metadata);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setPreferences(defaultPreferences);
          setFavorites(mockStore.getFavorites('guest'));
        }
      }, 0);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [real, loadRealUser]);

  // ---------- simple local settings ----------
  const setKidsMode = (enabled: boolean) => {
    setKidsModeState(enabled);
    if (typeof window !== 'undefined') localStorage.setItem('playverse_kids_mode', enabled.toString());
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') localStorage.setItem('playverse_language', lang);
  };

  const toggleFavorite = (gameId: string): boolean => {
    const actorKey = user ? user.id : 'guest';
    const isFav = mockStore.toggleFavorite(actorKey, gameId);
    setFavorites([...mockStore.getFavorites(actorKey)]);
    return isFav;
  };

  const rateGame = (gameId: string, isLike: boolean) => {
    const actorKey = user ? user.id : 'guest';
    return mockStore.rateGame(gameId, isLike, user ? user.id : undefined, actorKey);
  };

  const getUserRating = (gameId: string) => {
    const actorKey = user ? user.id : 'guest';
    return mockStore.getUserGameRating(gameId, user ? user.id : undefined, actorKey);
  };

  // ---------- sign in ----------
  const signIn = async (email: string, pass: string): Promise<Result> => {
    if (!real) {
      const username = email.split('@')[0];
      const matched = mockStore.getProfileByUsername(username) || mockStore.getProfiles()[0];
      setUser(matched);
      localStorage.setItem('playverse_current_user_id', matched.id);
      mockStore.mergeGuestFavorites(matched.id);
      setFavorites(mockStore.getFavorites(matched.id));
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    if (error) return { success: false, error: friendlyAuthError(error.message) };
    if (data.user) {
      await loadRealUser(data.user.id, data.user.user_metadata);
      mockStore.mergeGuestFavorites(data.user.id);
      setFavorites(mockStore.getFavorites(data.user.id));
    }
    return { success: true };
  };

  // ---------- sign up ----------
  const signUp = async (email: string, pass: string, username: string, displayName: string) => {
    const clean = cleanUsername(username);
    if (clean.length < 3) return { success: false, error: 'Username must be 3-20 characters (letters, numbers, underscore).' };

    if (!real) {
      if (mockStore.getProfileByUsername(clean)) return { success: false, error: 'That username is already taken.' };
      const newProfile: Profile = {
        id: 'usr-' + Date.now(),
        username: clean,
        display_name: displayName || clean,
        avatar_url: DEFAULT_AVATAR(clean),
        bio: '',
        status: 'online',
        favorite_categories: [],
        level: 1,
        xp: 0,
        is_admin: false,
        is_moderator: false,
        created_at: new Date().toISOString(),
        profile_completed: false,
      };
      mockStore.createProfile(newProfile);
      setUser(newProfile);
      localStorage.setItem('playverse_current_user_id', newProfile.id);
      mockStore.mergeGuestFavorites(newProfile.id);
      setFavorites(mockStore.getFavorites(newProfile.id));
      return { success: true };
    }

    if (!(await checkUsernameAvailable(clean))) return { success: false, error: 'That username is already taken.' };

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: {
        data: { username: clean, display_name: displayName.trim() || clean },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    if (error) return { success: false, error: friendlyAuthError(error.message) };

    // Supabase hides "already registered" when email confirmation is ON: identities comes back empty
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { success: false, error: 'That email already has an account. Try signing in.' };
    }

    if (!data.session) return { success: true, needsConfirmation: true };

    await loadRealUser(data.user!.id, data.user!.user_metadata);
    return { success: true };
  };

  const signOut = async () => {
    if (real) {
      if (userRef.current) await supabase.from('profiles').update({ status: 'offline' }).eq('id', userRef.current.id);
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('playverse_current_user_id');
    }
    setUser(null);
    setPreferences(defaultPreferences);
    setFavorites(mockStore.getFavorites('guest'));
  };

  // ---------- profile ----------
  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const clean = cleanUsername(username);
    if (clean.length < 3) return false;
    if (user && user.username === clean) return true;
    if (!real) return !mockStore.getProfileByUsername(clean);
    const { data } = await supabase.from('profiles').select('id').eq('username', clean).maybeSingle();
    return !data;
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<Result> => {
    if (!user) return { success: false, error: 'You are not signed in.' };

    if (!real) {
      const updated = mockStore.updateProfile(user.id, updates);
      if (updated) setUser({ ...updated });
      return { success: true };
    }

    const payload: Record<string, any> = {};
    for (const key of PROFILE_COLUMNS) {
      if (key in updates && (updates as any)[key] !== undefined) payload[key] = (updates as any)[key];
    }
    if (payload.username) payload.username = cleanUsername(payload.username);
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from('profiles').update(payload).eq('id', user.id).select('*').maybeSingle();
    if (error) {
      if (error.code === '23505') return { success: false, error: 'That username is already taken.' };
      if (error.code === '23514') return { success: false, error: 'Username must be 3-20 characters: a-z, 0-9 and _ only.' };
      return { success: false, error: error.message };
    }
    if (!data) return { success: false, error: 'Could not save your profile. Check the database policies (run migration 00005).' };
    setUser(rowToProfile(data));
    return { success: true };
  };

  const uploadAvatar = async (file: File): Promise<Result & { url?: string }> => {
    if (!user) return { success: false, error: 'You are not signed in.' };
    const problem = validateImageFile(file);
    if (problem) return { success: false, error: problem };

    try {
      const blob = await cropToSquare(file, 512, 0.9);

      if (!real) {
        return { success: true, url: await blobToDataUrl(blob) };
      }

      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
      if (error) return { success: false, error: `Upload failed: ${error.message}` };

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);

      // tidy up older pictures of this user (best effort)
      supabase.storage.from('avatars').list(user.id).then(({ data: files }) => {
        const stale = (files || []).filter((f) => !path.endsWith(f.name)).map((f) => `${user.id}/${f.name}`);
        if (stale.length) supabase.storage.from('avatars').remove(stale);
      });

      return { success: true, url: data.publicUrl };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Could not process that image.' };
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const next = { ...preferences, ...updates };
    setPreferences(next);
    if (real && user) {
      const row: Record<string, any> = { user_id: user.id };
      for (const k of PREF_COLUMNS) row[k] = (next as any)[k];
      supabase.from('user_preferences').upsert(row).then(({ error }) => {
        if (error) console.warn('[prefs] could not save:', error.message);
      });
    }
  };

  const switchUser = (username: string) => {
    if (real) return; // demo-only helper
    const target = mockStore.getProfileByUsername(username);
    if (target) {
      setUser(target);
      localStorage.setItem('playverse_current_user_id', target.id);
      setFavorites(mockStore.getFavorites(target.id));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user, preferences, isAuthenticated: !!user, isLoading, isRealBackend: real,
        kidsMode, language, favorites,
        setKidsMode, setLanguage, toggleFavorite, rateGame, getUserRating,
        signIn, signUp, signOut, updateProfile, uploadAvatar, checkUsernameAvailable,
        updatePreferences, switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Volume2, 
  User, 
  Shield, 
  Sparkles, 
  Check,
  Eye,
  Lock
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { COVER_STYLES, coverDataUri, isPhoto } from '@/lib/cover';

export default function SettingsPage() {
  const { user, preferences, updateProfile, updatePreferences } = useAuth();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [status, setStatus] = useState(user?.status || 'online');
  const [bannerUrl, setBannerUrl] = useState(user?.banner_url || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      display_name: displayName,
      bio,
      avatar_url: avatarUrl,
      banner_url: bannerUrl.trim() || undefined,
      status: status as any
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const themes = [
    { id: 'dark', label: 'Midnight Gala (Default)', bg: '#0a0912', accent: '#e9cb8b' },
    { id: 'cyberpunk', label: 'Emerald Night', bg: '#0b0714', accent: '#8fd9b6' },
    { id: 'synthwave', label: 'Rose Dusk', bg: '#0f0b1e', accent: '#f28ba8' },
    { id: 'light', label: 'Clean Light', bg: '#f8fafc', accent: '#0284c7' },
    { id: 'high-contrast', label: 'High Contrast', bg: '#000000', accent: '#ffff00' },
  ];

  const accents = [
    { id: 'cyan', label: 'Champagne', color: '#e9cb8b' },
    { id: 'lime', label: 'Sage', color: '#8fd9b6' },
    { id: 'purple', label: 'Orchid', color: '#b7a0f5' },
    { id: 'coral', label: 'Rose', color: '#f28ba8' },
    { id: 'gold', label: 'Amber', color: '#f0b95c' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-arcade-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-arcade-champagne" /> Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Customize your digital identity, mosaic arcade visuals, and audio settings.
          </p>
        </div>

        <Link
          href="/settings/privacy"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-arcade-surface border border-arcade-border text-xs font-bold text-slate-300 hover:text-white hover:border-arcade-champagne transition-colors"
        >
          <Lock className="w-3.5 h-3.5" /> Privacy & Blocking
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Identity Editor */}
        <div className="glass-panel p-6 rounded-2xl border border-arcade-border space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-arcade-champagne" /> Player Identity
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-arcade-midnight border border-arcade-border rounded-lg p-2.5 text-white focus:outline-none focus:border-arcade-champagne"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Avatar Image URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-arcade-midnight border border-arcade-border rounded-lg p-2.5 text-white focus:outline-none focus:border-arcade-champagne"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Cover</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                {COVER_STYLES.map((c) => {
                  const value = `cover:${c.id}`;
                  const active = bannerUrl === value;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setBannerUrl(value)}
                      aria-label={`${c.label} cover`}
                      aria-pressed={active}
                      className={`relative aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all ${active ? 'border-arcade-champagne scale-[1.04]' : 'border-arcade-border hover:border-arcade-borderLight'}`}
                    >
                      <img src={coverDataUri(c, c.id)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/55 text-[10px] py-0.5 text-white">{c.label}</span>
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder="…or paste a photo link (https://)"
                value={isPhoto(bannerUrl) ? bannerUrl : ''}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full bg-arcade-midnight border border-arcade-border rounded-lg p-2.5 text-white focus:outline-none focus:border-arcade-champagne"
              />
              <button type="button" onClick={() => setBannerUrl('')} className="mt-1.5 text-[11px] text-slate-400 hover:text-white underline">
                Use the automatic cover
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-arcade-midnight border border-arcade-border rounded-lg p-2.5 text-white focus:outline-none focus:border-arcade-champagne"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Online Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-arcade-midnight border border-arcade-border rounded-lg p-2.5 text-white focus:outline-none focus:border-arcade-champagne"
              >
                <option value="online">Online (Available)</option>
                <option value="idle">Idle (Away)</option>
                <option value="dnd">Do Not Disturb (In Game)</option>
                <option value="offline">Invisible (Offline)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-arcade-sage text-xs font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Profile updated!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-arcade-champagne text-arcade-dark font-extrabold text-xs shadow-champagne-glow hover:bg-white transition-colors"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Visual Themes & Mosaic System */}
        <div className="glass-panel p-6 rounded-2xl border border-arcade-border space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-arcade-orchid" /> Interface Modes & Themes
          </h2>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">Color Themes</label>
            <div className="grid grid-cols-1 gap-2">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => updatePreferences({ theme: t.id as any })}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-semibold ${
                    preferences.theme === t.id
                      ? 'border-arcade-champagne bg-arcade-champagne/10 text-white'
                      : 'border-arcade-border bg-arcade-midnight text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.bg }} />
                    <span>{t.label}</span>
                  </div>
                  {preferences.theme === t.id && <Check className="w-4 h-4 text-arcade-champagne" />}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-300">Accent Glow Color</label>
            <div className="flex gap-2">
              {accents.map(a => (
                <button
                  key={a.id}
                  onClick={() => updatePreferences({ accent_color: a.id as any })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all border ${
                    preferences.accent_color === a.id
                      ? 'border-white scale-105 shadow-md'
                      : 'border-arcade-border'
                  }`}
                  style={{ backgroundColor: `${a.color}25`, color: a.color }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio & Animation Toggles */}
          <div className="pt-3 border-t border-arcade-border space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-arcade-champagne" /> Sound Effects & Audio FX
              </span>
              <input
                type="checkbox"
                checked={preferences.sound_effects_enabled}
                onChange={(e) => updatePreferences({ sound_effects_enabled: e.target.checked })}
                className="w-4 h-4 accent-arcade-champagne rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-arcade-sage" /> Reduced Motion Animations
              </span>
              <input
                type="checkbox"
                checked={preferences.animation_intensity === 'reduced'}
                onChange={(e) => updatePreferences({ animation_intensity: e.target.checked ? 'reduced' : 'full' })}
                className="w-4 h-4 accent-arcade-sage rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

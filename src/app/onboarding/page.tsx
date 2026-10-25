'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Check, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { SignupStepper } from '@/components/profile/SignupStepper';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { CATEGORIES } from '@/lib/games';
import { DEFAULT_AVATAR } from '@/lib/avatar';

const BIO_MAX = 160;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, updateProfile, uploadAvatar, checkUsernameAvailable } = useAuth();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [cats, setCats] = useState<string[]>([]);
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [nameState, setNameState] = useState<'idle' | 'checking' | 'ok' | 'taken' | 'invalid'>('idle');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // prefill from the account that was just created
  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace('/auth/sign-in'); return; }
    if (!hydrated) {
      setUsername(user.username);
      setDisplayName(user.display_name);
      setBio(user.bio || '');
      setCats(user.favorite_categories || []);
      setPreview(user.avatar_url);
      setHydrated(true);
    }
  }, [user, isLoading, hydrated, router]);

  const cleanName = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

  useEffect(() => {
    if (!hydrated) return;
    if (cleanName.length < 3) { setNameState(cleanName ? 'invalid' : 'idle'); return; }
    setNameState('checking');
    const t = setTimeout(async () => setNameState((await checkUsernameAvailable(cleanName)) ? 'ok' : 'taken'), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanName, hydrated]);

  const toggleCat = (name: string) =>
    setCats((c) => (c.includes(name) ? c.filter((x) => x !== name) : c.length >= 5 ? c : [...c, name]));

  const finish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    if (nameState === 'taken' || cleanName.length < 3) return setError('Pick a free username (3-20 characters).');
    if (!displayName.trim()) return setError('Add a display name.');

    setSaving(true);
    let avatarUrl = generatedUrl || user.avatar_url || DEFAULT_AVATAR(cleanName);

    if (file) {
      const up = await uploadAvatar(file);
      if (!up.success) { setSaving(false); return setError(up.error || 'Upload failed.'); }
      avatarUrl = up.url!;
    }

    const res = await updateProfile({
      username: cleanName,
      display_name: displayName.trim(),
      bio: bio.trim(),
      avatar_url: avatarUrl,
      favorite_categories: cats,
      status: 'online',
      profile_completed: true,
    });
    setSaving(false);
    if (!res.success) return setError(res.error || 'Could not save your profile.');
    router.push('/');
  };

  if (isLoading || !user) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-arcade-champagne" /></div>;
  }

  const inputCls = 'w-full bg-arcade-midnight border border-arcade-border rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-arcade-champagne focus:shadow-champagne-glow transition-all';

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-start sm:items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl glass-panel rounded-2xl border border-arcade-border shadow-2xl p-5 sm:p-8 space-y-6"
      >
        <SignupStepper step={2} />
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Create your player profile</h1>
          <p className="text-xs text-slate-400">This is how friends will see you. You can change everything later in Settings.</p>
        </div>

        <form onSubmit={finish} className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 text-xs">
          <div className="space-y-5 order-2 lg:order-1">
            <div className="flex justify-center lg:hidden">
              <AvatarPicker preview={preview} seed={cleanName} onError={setError}
                onFile={(f, url) => { setFile(f); setGeneratedUrl(null); setPreview(url); }}
                onGenerated={(url) => { setFile(null); setGeneratedUrl(url); setPreview(url); }} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                  <input value={username} maxLength={20} onChange={(e) => setUsername(e.target.value)} className={`${inputCls} pl-8 pr-9`} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {nameState === 'checking' && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                    {nameState === 'ok' && <CheckCircle2 className="w-4 h-4 text-arcade-sage" />}
                    {(nameState === 'taken' || nameState === 'invalid') && <XCircle className="w-4 h-4 text-arcade-rose" />}
                  </span>
                </div>
                <p className={`mt-1 text-[10px] ${nameState === 'taken' || nameState === 'invalid' ? 'text-arcade-rose' : 'text-slate-500'}`}>
                  {nameState === 'taken' ? 'Already taken.' : nameState === 'invalid' ? 'At least 3 characters.' : 'Friends find you by this name.'}
                </p>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Display Name</label>
                <input value={displayName} maxLength={32} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300 font-bold">About you</label>
                <span className="text-[10px] text-slate-500">{bio.length}/{BIO_MAX}</span>
              </div>
              <textarea rows={3} value={bio} maxLength={BIO_MAX} onChange={(e) => setBio(e.target.value)}
                placeholder="Speedrunner, 2048 grinder, always up for a co-op match..." className={`${inputCls} resize-none`} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-slate-300 font-bold">Favourite game types</label>
                <span className="text-[10px] text-slate-500">pick up to 5</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const on = cats.includes(c.name);
                  return (
                    <motion.button key={c.id} type="button" whileTap={{ scale: 0.92 }} onClick={() => toggleCat(c.name)}
                      className={`px-3 py-1.5 rounded-full border font-bold flex items-center gap-1 transition-colors ${
                        on ? 'bg-arcade-champagne/15 border-arcade-champagne text-arcade-champagne' : 'bg-arcade-midnight border-arcade-border text-slate-400 hover:text-white'
                      }`}>
                      {on && <Check className="w-3 h-3" />} {c.name}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-lg bg-arcade-rose/15 border border-arcade-rose/30 text-arcade-rose font-semibold">
                {error}
              </motion.div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={saving || nameState === 'taken'}
              className="w-full sm:w-auto sm:min-w-[220px] px-6 py-3 rounded-xl bg-arcade-champagne text-arcade-dark font-extrabold shadow-champagne-glow hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <>Enter Pixelverse <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </div>

          {/* live preview card (desktop) */}
          <aside className="order-1 lg:order-2 hidden lg:flex flex-col items-center gap-5">
            <AvatarPicker preview={preview} seed={cleanName} onError={setError}
              onFile={(f, url) => { setFile(f); setGeneratedUrl(null); setPreview(url); }}
              onGenerated={(url) => { setFile(null); setGeneratedUrl(url); setPreview(url); }} />
            <div className="w-full rounded-2xl border border-arcade-border bg-arcade-midnight/80 overflow-hidden">
              <div className="h-14 bg-gradient-to-r from-arcade-champagne/30 via-arcade-orchid/30 to-arcade-rose/30" />
              <div className="px-4 pb-4 -mt-7">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview || DEFAULT_AVATAR(cleanName)} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-arcade-midnight" />
                <div className="mt-2 font-extrabold text-white truncate">{displayName || 'Your name'}</div>
                <div className="text-[10px] text-arcade-champagne">@{cleanName || 'username'}</div>
                <p className="mt-2 text-[11px] text-slate-400 line-clamp-3 min-h-[2.2em]">{bio || 'Your bio shows up here.'}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {cats.slice(0, 3).map((c) => <span key={c} className="px-2 py-0.5 rounded-full bg-arcade-surface text-[9px] text-slate-300 font-bold">{c}</span>)}
                </div>
              </div>
            </div>
          </aside>
        </form>
      </motion.div>
    </div>
  );
}

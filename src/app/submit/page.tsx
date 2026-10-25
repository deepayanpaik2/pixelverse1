'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  UploadCloud, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Gamepad2, 
  ExternalLink,
  Code2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { CATEGORIES } from '@/lib/games';
import { mockStore } from '@/lib/supabase/mock-store';
import confetti from 'canvas-confetti';

export default function SubmitGamePage() {
  const [formData, setFormData] = useState({
    developer_name: '',
    developer_email: '',
    developer_url: '',
    title: '',
    category: 'Action',
    tags: 'arcade, 2d, html5',
    description: '',
    instructions: '',
    launch_url: '',
    thumbnail_url: '',
    license: 'Non-Exclusive Portal Distribution License (Free-to-Play)',
    rights_certified: false,
    license_accepted: false,
  });

  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.developer_name.trim() || !formData.developer_email.trim() || !formData.title.trim()) {
      setErrorMsg('Please fill in developer name, email, and game title.');
      return;
    }

    if (!formData.launch_url.trim()) {
      setErrorMsg('Please provide a valid game launch or embed URL.');
      return;
    }

    if (!formData.rights_certified || !formData.license_accepted) {
      setErrorMsg('You must certify ownership rights and accept the distribution terms.');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedTags = formData.tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      const sub = mockStore.createSubmission({
        developer_name: formData.developer_name,
        developer_email: formData.developer_email,
        developer_url: formData.developer_url || undefined,
        title: formData.title,
        category: formData.category,
        tags: parsedTags.length > 0 ? parsedTags : ['arcade', 'casual'],
        description: formData.description || 'Exciting browser game created for Pixelverse.',
        instructions: formData.instructions || 'Use keyboard or touch controls to play.',
        launch_url: formData.launch_url,
        thumbnail_url: formData.thumbnail_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
        license: formData.license,
        license_accepted: true,
      });

      setSubmittedId(sub.id);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit game. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-arcade-orchid/20 via-arcade-champagne/20 to-arcade-rose/20 border border-arcade-border p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-arcade-champagne/10 border border-arcade-champagne/30 text-arcade-champagne text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> For Independent Game Developers
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Submit Your Game to Pixelverse
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Distribute your HTML5, WebGL, or Canvas game to millions of players worldwide. 
              Zero setup fees, fast editorial review, and non-exclusive hosting.
            </p>
          </div>
          <div className="flex flex-col gap-2 bg-arcade-dark/80 backdrop-blur-md p-4 rounded-xl border border-arcade-border text-xs text-slate-300 min-w-[220px]">
            <div className="flex items-center gap-2 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Safe & Lawful Portal
            </div>
            <p className="text-slate-400">100% verified copyright, explicit license agreements, and creator attribution.</p>
          </div>
        </div>
      </div>

      {submittedId ? (
        <div className="bg-arcade-card border border-emerald-500/40 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Submission Received!</h2>
            <p className="text-slate-300 max-w-lg mx-auto text-sm">
              Thank you, <span className="font-bold text-white">{formData.developer_name}</span>. 
              Your game <span className="font-bold text-arcade-champagne">"{formData.title}"</span> has been queued for editorial review.
            </p>
            <div className="inline-block mt-3 px-3 py-1.5 bg-arcade-midnight border border-arcade-border rounded-lg text-xs font-mono text-slate-400">
              Tracking ID: <span className="text-arcade-rose font-bold">{submittedId}</span>
            </div>
          </div>

          <div className="p-4 bg-arcade-midnight/60 rounded-xl border border-arcade-border max-w-md mx-auto text-left text-xs space-y-2 text-slate-300">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-arcade-champagne" /> What happens next?
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Our editorial team tests your embed URL and controls compatibility.</li>
              <li>We verify safe sandboxing, performance, and family-friendly status.</li>
              <li>Once approved, your game appears instantly in the catalog and trending feeds.</li>
            </ol>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setSubmittedId(null);
                setFormData({
                  developer_name: '',
                  developer_email: '',
                  developer_url: '',
                  title: '',
                  category: 'Action',
                  tags: 'arcade, 2d, html5',
                  description: '',
                  instructions: '',
                  launch_url: '',
                  thumbnail_url: '',
                  license: 'Non-Exclusive Portal Distribution License (Free-to-Play)',
                  rights_certified: false,
                  license_accepted: false,
                });
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
            >
              Submit Another Game
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-arcade-champagne hover:bg-arcade-champagne/90 text-arcade-dark font-black text-sm transition"
            >
              Back to Pixelverse
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Developer Information */}
          <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-arcade-champagne" /> Developer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Developer / Studio Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.developer_name}
                  onChange={e => setFormData({ ...formData, developer_name: e.target.value })}
                  placeholder="e.g. Pixel Forge Studios"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-champagne"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.developer_email}
                  onChange={e => setFormData({ ...formData, developer_email: e.target.value })}
                  placeholder="developer@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-champagne"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Portfolio / Website (Optional)
              </label>
              <input
                type="url"
                value={formData.developer_url}
                onChange={e => setFormData({ ...formData, developer_url: e.target.value })}
                placeholder="https://yourportfolio.io"
                className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-champagne"
              />
            </div>
          </div>

          {/* Game Information */}
          <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-arcade-rose" /> Game Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Game Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Neon Velocity"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-rose"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-rose"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                placeholder="action, retro, space, multiplayer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-rose"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Game Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your game story, objective, and what makes it fun..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-rose"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                How to Play & Controls
              </label>
              <textarea
                rows={2}
                value={formData.instructions}
                onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Arrow keys to drive, Space to nitro boost, Click to shoot..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-rose"
              />
            </div>
          </div>

          {/* Technical Hosting & Assets */}
          <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-arcade-orchid" /> Launch URL & Assets
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Game Launch / Embed URL * (HTTPS required)
                </label>
                <input
                  type="url"
                  required
                  value={formData.launch_url}
                  onChange={e => setFormData({ ...formData, launch_url: e.target.value })}
                  placeholder="https://yourdomain.com/games/my-game/index.html"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-orchid font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Must be an iframe-embeddable HTML5/WebGL game running over HTTPS without restrictive X-Frame-Options.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Thumbnail Image URL (512x512 recommended)
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://yourdomain.com/thumbnail.png"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-orchid font-mono"
                />
              </div>

              {formData.thumbnail_url && (
                <div className="flex items-center gap-3 p-3 bg-arcade-midnight rounded-xl border border-arcade-border">
                  <img
                    src={formData.thumbnail_url}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover bg-slate-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80';
                    }}
                  />
                  <div className="text-xs">
                    <p className="text-white font-bold">Thumbnail Preview</p>
                    <p className="text-slate-400">Aspect ratio: 1:1 or 16:9 will be automatically adapted for mosaic grid tiles.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Licensing & Rights Legal Section */}
          <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Intellectual Property & Distribution License
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Distribution License *
              </label>
              <select
                value={formData.license}
                onChange={e => setFormData({ ...formData, license: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-emerald-400"
              >
                <option value="Non-Exclusive Portal Distribution License (Free-to-Play)">
                  Non-Exclusive Portal Distribution License (Free-to-Play)
                </option>
                <option value="MIT License (Open Source)">
                  MIT License (Open Source)
                </option>
                <option value="Apache-2.0">
                  Apache License 2.0
                </option>
                <option value="Creative Commons (CC-BY-4.0)">
                  Creative Commons Attribution (CC-BY 4.0)
                </option>
                <option value="GPL-3.0 (Open Source Copyleft)">
                  GPL-3.0
                </option>
                <option value="Custom Permissive Publisher License">
                  Custom Permissive Publisher License
                </option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.rights_certified}
                  onChange={e => setFormData({ ...formData, rights_certified: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-arcade-midnight text-arcade-champagne focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-300">
                  <span className="font-bold text-white">Ownership Certification:</span> I certify that I am the author or authorized rights holder of this game, its source code, audio, and visual assets, or possess the lawful license rights to distribute it.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.license_accepted}
                  onChange={e => setFormData({ ...formData, license_accepted: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-arcade-midnight text-arcade-champagne focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-300">
                  <span className="font-bold text-white">Distribution Agreement:</span> I grant Pixelverse a non-exclusive, worldwide, royalty-free license to host, display, and make available this game for free instant play on the Pixelverse portal.
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Cancel and return to catalog
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-arcade-champagne to-arcade-orchid text-arcade-dark font-black text-sm tracking-wide hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-arcade-champagne/20 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Game for Review'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

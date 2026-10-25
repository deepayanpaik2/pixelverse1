'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  CheckCircle2, 
  FileWarning, 
  Mail, 
  Building, 
  Scale, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { FEATURED_GAMES } from '@/lib/games';
import { GameSelect } from '@/components/portal/GameSelect';
import { mockStore } from '@/lib/supabase/mock-store';

export default function DmcaPolicyPage() {
  const [formData, setFormData] = useState({
    claimant_name: '',
    claimant_email: '',
    copyright_owner: '',
    game_id: FEATURED_GAMES[0]?.id || '',
    infringing_url: '',
    original_work_url: '',
    description: '',
    good_faith_confirmed: false,
    perjury_confirmed: false,
  });

  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.claimant_name.trim() || !formData.claimant_email.trim() || !formData.copyright_owner.trim()) {
      setErrorMsg('Please fill in your name, contact email, and the copyright owner identity.');
      return;
    }

    if (!formData.infringing_url.trim()) {
      setErrorMsg('Please specify the exact URL of the material on Pixelverse.');
      return;
    }

    if (!formData.good_faith_confirmed || !formData.perjury_confirmed) {
      setErrorMsg('You must certify both good faith and penalty of perjury statutory declarations.');
      return;
    }

    setIsSubmitting(true);
    try {
      const notice = mockStore.createTakedown({
        game_id: formData.game_id,
        claimant_name: formData.claimant_name,
        claimant_email: formData.claimant_email,
        copyright_owner: formData.copyright_owner,
        infringing_url: formData.infringing_url,
        description: `Original work reference: ${formData.original_work_url}. Details: ${formData.description}`,
        good_faith_confirmed: true,
      });

      setSubmittedId(notice.id);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit takedown notice. Please email dmca@pixelverse.games directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/40 via-arcade-dark to-slate-900 border border-red-500/30 p-6 sm:p-8">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" /> Legal & Intellectual Property Compliance
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            DMCA & Copyright Takedown Notice
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Pixelverse respects copyright laws including the Digital Millennium Copyright Act (17 U.S.C. § 512). 
            We index and host browser games under strict publisher agreements and open-source licenses. 
            If you believe content on Pixelverse infringes your copyright, use this form for immediate review.
          </p>
        </div>
      </div>

      {/* Designated Copyright Agent Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-arcade-card border border-arcade-border rounded-xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-arcade-champagne/10 border border-arcade-champagne/30 flex items-center justify-center text-arcade-champagne">
            <Mail className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Designated DMCA Agent</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct Email: <a href="mailto:dmca@pixelverse.games" className="text-arcade-champagne hover:underline font-mono">dmca@pixelverse.games</a>
          </p>
          <p className="text-[11px] text-slate-500">Response time: within 24 hours.</p>
        </div>

        <div className="bg-arcade-card border border-arcade-border rounded-xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-arcade-orchid/10 border border-arcade-orchid/30 flex items-center justify-center text-arcade-orchid">
            <Building className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Registered Address</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Pixelverse Operations Ltd.<br />
            100 Arcade Plaza, 4th Floor<br />
            San Francisco, CA 94107
          </p>
        </div>

        <div className="bg-arcade-card border border-arcade-border rounded-xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Quarantine Policy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Reported games are immediately flagged for administrative audit and quarantined upon verification of prima facie infringement.
          </p>
        </div>
      </div>

      {/* Submission Confirmation or Form */}
      {submittedId ? (
        <div className="bg-arcade-card border border-emerald-500/40 rounded-2xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Notice Successfully Logged</h2>
            <p className="text-slate-300 max-w-lg mx-auto text-sm">
              Your takedown notification has been registered under case reference:
            </p>
            <div className="inline-block px-4 py-2 bg-arcade-midnight border border-arcade-border rounded-lg text-sm font-mono text-arcade-rose font-bold">
              {submittedId}
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto pt-2">
              Our compliance team will review the claim against our publisher licenses and origin repositories. A formal confirmation has been sent to <span className="text-white font-mono">{formData.claimant_email}</span>.
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl bg-arcade-champagne hover:bg-arcade-champagne/90 text-arcade-dark font-black text-sm transition"
            >
              Return to Pixelverse Homepage
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Claimant Information */}
          <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-arcade-champagne" /> 1. Claimant & Rights Holder Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Legal Name of Claimant *
                </label>
                <input
                  type="text"
                  required
                  value={formData.claimant_name}
                  onChange={e => setFormData({ ...formData, claimant_name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-champagne"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Official Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.claimant_email}
                  onChange={e => setFormData({ ...formData, claimant_email: e.target.value })}
                  placeholder="legal@rightsholder.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-champagne"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Copyright Owner / Entity Represented *
              </label>
              <input
                type="text"
                required
                value={formData.copyright_owner}
                onChange={e => setFormData({ ...formData, copyright_owner: e.target.value })}
                placeholder="Self (if independent author) or Studio / Publisher Company Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-champagne"
              />
            </div>
          </div>

          {/* Alleged Infringement Details */}
          <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-arcade-rose" /> 2. Alleged Infringing Material
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Select Game in Catalog (if applicable)
                </label>
                <GameSelect
                  value={formData.game_id}
                  onChange={(id) => {
                    const sel = FEATURED_GAMES.find(g => g.id === id);
                    setFormData({
                      ...formData,
                      game_id: id,
                      infringing_url: sel ? `${typeof window !== 'undefined' ? window.location.origin : ''}/game/${sel.slug}` : formData.infringing_url
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-rose"
                  renderLabel={(title, author) => `${title} (${author})`}
                  extraOptions={[{ value: 'other', label: 'Other / Custom URL' }]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Exact Pixelverse URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.infringing_url}
                  onChange={e => setFormData({ ...formData, infringing_url: e.target.value })}
                  placeholder="https://pixelverse.local/game/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-rose font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Link to Original Copyrighted Work (or Proof of Ownership)
              </label>
              <input
                type="url"
                value={formData.original_work_url}
                onChange={e => setFormData({ ...formData, original_work_url: e.target.value })}
                placeholder="https://original-publisher.com/game or copyright registration link"
                className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-rose font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Description of the Infringement
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detail specifically which elements (source code, artwork, audio, trademarks) are infringed..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-rose"
              />
            </div>
          </div>

          {/* Statutory Statements */}
          <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" /> 3. Statutory Declarations (17 U.S.C. § 512(c)(3))
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.good_faith_confirmed}
                  onChange={e => setFormData({ ...formData, good_faith_confirmed: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-arcade-midnight text-red-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white">Good Faith Belief:</span> I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.perjury_confirmed}
                  onChange={e => setFormData({ ...formData, perjury_confirmed: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-arcade-midnight text-red-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white">Penalty of Perjury:</span> I state under penalty of perjury that the information in this notification is accurate and that I am the copyright owner or authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
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
              className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm tracking-wide transition disabled:opacity-50 shadow-lg shadow-red-600/20 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              {isSubmitting ? 'Logging Notice...' : 'Submit Takedown Notice'}
            </button>
          </div>
        </form>
      )}

      {/* Counter-Notification Explanation */}
      <div className="bg-arcade-dark border border-arcade-border rounded-xl p-5 text-xs text-slate-400 space-y-2">
        <h4 className="font-bold text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-arcade-champagne" /> DMCA Counter-Notification Process
        </h4>
        <p className="leading-relaxed">
          If your submitted game was quarantined or removed due to a takedown notice and you believe this was due to mistake or misidentification, you may submit a formal Counter-Notification pursuant to 17 U.S.C. § 512(g)(3). 
          Send your written notice to <span className="font-mono text-slate-200">dmca@pixelverse.games</span> including your identification, statement consenting to federal court jurisdiction, and signature under penalty of perjury.
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, Baby, Database, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - Pixelverse',
  description: 'Pixelverse Privacy Policy: how we handle anonymous guest play, local storage, child privacy (COPPA), and personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="space-y-3 pt-4 border-b border-arcade-border pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-arcade-champagne/10 border border-arcade-champagne/30 text-arcade-champagne text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> Privacy & Data Transparency
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Last updated: October 24, 2026. Effective immediately for all visitors and players.
        </p>
      </div>

      <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
        {/* Section 1: Core Philosophy */}
        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Lock className="w-4 h-4 text-arcade-champagne" /> 1. Privacy-First Gaming (Play Without Sign-Up)
          </div>
          <p className="text-xs text-slate-400">
            Pixelverse is designed so that anyone can play games immediately without creating an account, disclosing an email address, or supplying any personal identification. 
            All games run in your browser as an anonymous guest.
          </p>
        </div>

        {/* Section 2: Local Storage */}
        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Database className="w-4 h-4 text-arcade-orchid" /> 2. Browser Local Storage
          </div>
          <p className="text-xs text-slate-400">
            To give you a seamless experience, we use your device's browser <code className="text-arcade-champagne font-mono">localStorage</code> to remember:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
            <li>Your favorite games list so your bookmarks stay saved.</li>
            <li>Your recently played games history.</li>
            <li>Your anonymous game ratings (likes/dislikes).</li>
            <li>Your interface preferences: Kids Mode toggle and language choice.</li>
          </ul>
          <p className="text-xs text-slate-400">
            This data remains strictly on your device and is never sold to or shared with third-party data brokers.
          </p>
        </div>

        {/* Section 3: COPPA & Children's Privacy */}
        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Baby className="w-4 h-4 text-emerald-400" /> 3. Children's Online Privacy Protection Act (COPPA) & Kids Mode
          </div>
          <p className="text-xs text-slate-400">
            Pixelverse complies with the Children's Online Privacy Protection Act (COPPA) and international child safety regulations:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
            <li>We do not knowingly collect personal information from children under the age of 13.</li>
            <li>We provide a dedicated <strong>Kids Mode</strong> toggle on every page. When enabled, the portal filters out any games with complex or intense themes, restricts external links, and serves only verified family-friendly titles.</li>
            <li>Third-party personalized ad tracking is disabled in Kids Mode.</li>
          </ul>
        </div>

        {/* Section 4: Game Embeds and Publisher Distribution */}
        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <EyeOff className="w-4 h-4 text-arcade-rose" /> 4. Third-Party Game Embeds & Sandboxing
          </div>
          <p className="text-xs text-slate-400">
            Certain games are provided via the GameMonetize publisher distribution feed. 
            These games run in sandboxed iframes. While in-game, these publisher networks may serve non-personalized or contextual advertisements compliant with web advertising privacy standards.
          </p>
        </div>

        {/* Section 5: Contact & Inquiries */}
        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <HelpCircle className="w-4 h-4 text-arcade-champagne" /> 5. Questions and Data Requests
          </div>
          <p className="text-xs text-slate-400">
            If you have questions regarding this Privacy Policy or wish to request the deletion of any developer submission data, please contact our privacy compliance officer at:
          </p>
          <div className="p-3 bg-arcade-midnight rounded-xl border border-arcade-border text-xs font-mono text-slate-300">
            Email: privacy@pixelverse.games<br />
            Address: Pixelverse Operations, 100 Arcade Plaza, Suite 400, San Francisco, CA 94107
          </div>
        </div>
      </div>
    </div>
  );
}

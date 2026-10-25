import React from 'react';
import Link from 'next/link';
import { Scale, FileCheck, ShieldAlert, Award, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - Pixelverse',
  description: 'Terms of Service for Pixelverse gaming portal. Read our guidelines on instant play, game distribution, and intellectual property.',
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="space-y-3 pt-4 border-b border-arcade-border pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-arcade-champagne/10 border border-arcade-champagne/30 text-arcade-champagne text-xs font-bold uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5" /> Legal Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Last revised: October 24, 2026. By accessing Pixelverse, you agree to these terms.
        </p>
      </div>

      <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-arcade-champagne" /> 1. Acceptance of Terms
          </h2>
          <p className="text-xs text-slate-400">
            Welcome to Pixelverse ("we", "our", or "us"). By visiting, accessing, or playing games on Pixelverse, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" /> 2. License to Use the Portal
          </h2>
          <p className="text-xs text-slate-400">
            We grant you a personal, non-exclusive, revocable, non-transferable license to access and play games on Pixelverse for personal, non-commercial entertainment. You agree not to:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
            <li>Reverse engineer, decompile, or extract the source code of Pixelverse or its sandboxed games without explicit open-source permission.</li>
            <li>Use automated scrapers, bots, or unauthorized spiders to extract game assets, catalog feeds, or user data.</li>
            <li>Circumvent or tamper with security sandboxing, iframe isolation, or rate limiting mechanisms.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-arcade-orchid" /> 3. Intellectual Property Rights & Game Licensing
          </h2>
          <p className="text-xs text-slate-400">
            Games featured on Pixelverse are protected by intellectual property laws. They are provided to players under lawful licenses, including:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
            <li>Authorized distribution agreements with the GameMonetize publisher feed.</li>
            <li>Permissive open-source licenses (MIT, Apache-2.0, GPL-3.0) with preserved copyright notices and repository attribution.</li>
            <li>Original proprietary software developed by the Pixelverse engineering team.</li>
            <li>Submissions made directly by game developers who have certified non-infringement.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-arcade-rose" /> 4. Copyright Complaints (DMCA)
          </h2>
          <p className="text-xs text-slate-400">
            We expeditiously investigate all legitimate allegations of copyright infringement. To file a formal notice or counter-notification, visit our dedicated <Link href="/dmca" className="text-arcade-champagne underline hover:text-white">DMCA Policy & Notice page</Link> or email <span className="font-mono text-slate-200">dmca@pixelverse.games</span>.
          </p>
        </div>

        {/* Section 5 */}
        <div className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-300" /> 5. Disclaimer of Warranties
          </h2>
          <p className="text-xs text-slate-400">
            Pixelverse and all embedded games are provided on an "as is" and "as available" basis without warranties of any kind. We do not guarantee that games will be error-free, uninterrupted, or compatible with every hardware configuration.
          </p>
        </div>
      </div>
    </div>
  );
}

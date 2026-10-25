'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, ShieldQuestion } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSent(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-arcade-border shadow-2xl space-y-6">
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-arcade-champagne transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-arcade-orchid/10 border border-arcade-orchid/30 rounded-xl flex items-center justify-center text-arcade-orchid mb-2">
            <ShieldQuestion className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Reset Password</h1>
          <p className="text-xs text-slate-400">Enter your email and we will dispatch a secure recovery link</p>
        </div>

        {sent ? (
          <div className="p-4 rounded-xl bg-arcade-sage/10 border border-arcade-sage/30 text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-arcade-sage mx-auto" />
            <h3 className="text-xs font-bold text-white">Recovery Link Dispatched</h3>
            <p className="text-[11px] text-slate-300">
              Check your inbox for <b>{email}</b> to complete your password reset.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@arcade.com"
                  className="w-full bg-arcade-midnight border border-arcade-border rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-arcade-orchid"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-arcade-orchid text-white font-extrabold text-xs shadow-orchid-glow hover:bg-white hover:text-arcade-dark transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

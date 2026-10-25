'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Send, CheckCircle2, LifeBuoy, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="space-y-3 pt-4 border-b border-arcade-border pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-arcade-champagne/10 border border-arcade-champagne/30 text-arcade-champagne text-xs font-bold uppercase tracking-wider">
          <LifeBuoy className="w-3.5 h-3.5" /> Support & Inquiries
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Contact Pixelverse
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Have feedback, need developer support, or want to explore distribution partnerships? Reach out to our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact cards */}
        <div className="space-y-4 md:col-span-1">
          <div className="bg-arcade-card border border-arcade-border rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-arcade-champagne/10 border border-arcade-champagne/30 flex items-center justify-center text-arcade-champagne">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">General & Support</h3>
            <p className="text-xs text-slate-400">Questions about games or bug reports:</p>
            <a href="mailto:support@pixelverse.games" className="text-xs text-arcade-champagne hover:underline font-mono">
              support@pixelverse.games
            </a>
          </div>

          <div className="bg-arcade-card border border-arcade-border rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-arcade-orchid/10 border border-arcade-orchid/30 flex items-center justify-center text-arcade-orchid">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Developer Partnerships</h3>
            <p className="text-xs text-slate-400">Distribute your studio's titles:</p>
            <a href="mailto:devs@pixelverse.games" className="text-xs text-arcade-orchid hover:underline font-mono">
              devs@pixelverse.games
            </a>
          </div>

          <div className="bg-arcade-card border border-arcade-border rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-arcade-rose/10 border border-arcade-rose/30 flex items-center justify-center text-arcade-rose">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Legal & DMCA</h3>
            <p className="text-xs text-slate-400">Copyright claims & compliance:</p>
            <Link href="/dmca" className="text-xs text-arcade-rose hover:underline font-mono">
              /dmca takedown page
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="bg-arcade-card border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Message Sent!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Thank you for contacting Pixelverse. We have received your inquiry and our team typically responds within 24-48 business hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                }}
                className="mt-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-arcade-card border border-arcade-border rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Send a Direct Message</h3>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Mercer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-champagne"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-champagne"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-champagne"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bug Report">Technical Bug Report</option>
                  <option value="Game Developer Inquiry">Game Developer Partnership</option>
                  <option value="Advertising">Advertising / Publisher Query</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-sm focus:outline-none focus:border-arcade-champagne"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-arcade-champagne to-arcade-orchid text-arcade-dark font-black text-sm tracking-wide hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

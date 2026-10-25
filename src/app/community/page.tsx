'use client';

import React, { useState } from 'react';
import { 
  Flame, 
  Hash, 
  Volume2, 
  Users, 
  Send, 
  Plus, 
  Sparkles, 
  Crown,
  Search
} from 'lucide-react';
import { mockStore } from '@/lib/supabase/mock-store';
import { useAuth } from '@/features/auth/AuthContext';
import { useVoice } from '@/features/voice/VoiceContext';

export default function CommunitiesPage() {
  const { user } = useAuth();
  const { joinVoiceRoom } = useVoice();
  const communities = mockStore.getCommunities();

  const [selectedCommunityId, setSelectedCommunityId] = useState(communities[0]?.id || '');
  const [selectedChannelId, setSelectedChannelId] = useState(communities[0]?.channels?.[0]?.id || '');
  const [channelMessages, setChannelMessages] = useState<any[]>([
    { id: '1', user: 'Neon Rider', text: 'Just found a new favorite in the Puzzles category — anyone want to try it with me? ⚡', time: '14:20' },
    { id: '2', user: 'Cyber Valkyrie', text: 'Congrats! We have a tournament run starting in 20 minutes.', time: '14:24' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const currentCommunity = communities.find(c => c.id === selectedCommunityId) || communities[0];
  const currentChannel = currentCommunity?.channels?.find(ch => ch.id === selectedChannelId) || currentCommunity?.channels?.[0];
  const members = mockStore.getProfiles().slice(0, 4);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user) return;
    setChannelMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        user: user.display_name,
        text: inputMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputMessage('');
  };

  return (
    <div className="glass-panel rounded-2xl border border-arcade-border h-[calc(100vh-140px)] flex overflow-hidden shadow-2xl">
      {/* 1. Community Server Hub Sidebar */}
      <div className="w-16 flex-shrink-0 bg-arcade-midnight border-r border-arcade-border flex flex-col items-center py-4 gap-3">
        {communities.map((c) => {
          const isActive = c.id === currentCommunity?.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCommunityId(c.id);
                if (c.channels && c.channels.length > 0) {
                  setSelectedChannelId(c.channels[0].id);
                }
              }}
              className={`relative group rounded-2xl transition-all p-0.5 ${
                isActive ? 'rounded-xl' : 'hover:rounded-xl'
              }`}
            >
              <img
                src={c.avatar_url || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150'}
                alt={c.name}
                className={`w-11 h-11 object-cover rounded-2xl transition-all group-hover:scale-105 border ${
                  isActive ? 'border-arcade-champagne shadow-champagne-glow' : 'border-arcade-border'
                }`}
              />
              {isActive && (
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-arcade-champagne rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Channels Sidebar */}
      <div className="w-60 flex-shrink-0 bg-arcade-dark/80 border-r border-arcade-border flex flex-col">
        <div className="p-4 border-b border-arcade-border">
          <h2 className="text-sm font-black text-white truncate">{currentCommunity?.name}</h2>
          <span className="text-[10px] text-slate-400 font-mono">
            {currentCommunity?.members_count?.toLocaleString()} Members
          </span>
        </div>

        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Text Channels
          </div>
          {currentCommunity?.channels?.filter(ch => ch.type === 'text').map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannelId(ch.id)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                ch.id === currentChannel?.id
                  ? 'bg-arcade-surface text-arcade-champagne font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-arcade-surface/50'
              }`}
            >
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">{ch.name}</span>
            </button>
          ))}

          <div className="px-2 pt-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Voice Channels
          </div>
          {currentCommunity?.channels?.filter(ch => ch.type === 'voice').map((ch) => (
            <button
              key={ch.id}
              onClick={() => joinVoiceRoom(ch.id)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-arcade-sage hover:bg-arcade-surface/50 transition-colors text-left"
            >
              <Volume2 className="w-3.5 h-3.5 text-arcade-sage" />
              <span className="truncate">{ch.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Channel Chat */}
      <div className="flex-1 flex flex-col bg-arcade-dark min-w-0">
        {/* Header */}
        <div className="h-14 px-6 border-b border-arcade-border bg-arcade-midnight/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-white">{currentChannel?.name}</h3>
            {currentChannel?.topic && (
              <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-sm ml-2 pl-2 border-l border-arcade-border">
                {currentChannel.topic}
              </span>
            )}
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {channelMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-arcade-surface border border-arcade-border flex items-center justify-center font-bold text-xs text-arcade-champagne flex-shrink-0">
                {msg.user[0]}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{msg.user}</span>
                  <span className="text-[10px] text-slate-500">{msg.time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-arcade-border bg-arcade-midnight flex gap-2">
          <input
            type="text"
            placeholder={`Message #${currentChannel?.name}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-arcade-surface border border-arcade-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-champagne"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-arcade-champagne text-arcade-dark font-extrabold text-xs shadow-champagne-glow hover:bg-white transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </form>
      </div>

      {/* 4. Community Members Roster */}
      <div className="w-52 flex-shrink-0 bg-arcade-midnight/90 border-l border-arcade-border hidden lg:flex flex-col p-3 space-y-3">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
          Online Members ({members.length})
        </div>
        <div className="space-y-1">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-arcade-surface transition-colors">
              <div className="relative">
                <img src={m.avatar_url} alt="" className="w-7 h-7 rounded-md object-cover" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-arcade-sage border border-arcade-dark" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                  {m.display_name}
                  {m.is_admin && <Crown className="w-3 h-3 text-arcade-amber" />}
                </div>
                <div className="text-[10px] text-slate-400 truncate">Lv.{m.level}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

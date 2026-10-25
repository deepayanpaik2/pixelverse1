'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  Image, 
  Paperclip, 
  MoreVertical, 
  Search, 
  Plus, 
  Phone, 
  Pin, 
  Users,
  Flame,
  Gamepad2,
  Check
} from 'lucide-react';
import { useChat } from '@/features/chat/ChatContext';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';

const ARCADE_STICKERS = [
  { name: 'GG WP', emoji: '🎮' },
  { name: 'Fire Combo', emoji: '🔥' },
  { name: 'High Score', emoji: '🏆' },
  { name: 'Neon Skull', emoji: '💀' },
  { name: 'Hyper Blast', emoji: '⚡' },
  { name: 'Cyber Cat', emoji: '🐱' },
  { name: 'Alien Invader', emoji: '👾' },
  { name: 'Rocket Boost', emoji: '🚀' }
];

export default function MessagesPage() {
  const { user } = useAuth();
  const { 
    conversations, 
    activeConversationId, 
    activeConversation, 
    messages, 
    setActiveConversationId, 
    sendMessage, 
    addReaction 
  } = useChat();

  const [inputContent, setInputContent] = useState('');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;
    sendMessage(inputContent.trim());
    setInputContent('');
    setShowStickerPicker(false);
  };

  const handleSendSticker = (stickerEmoji: string) => {
    sendMessage(`[Sticker: ${stickerEmoji}]`);
    setShowStickerPicker(false);
  };

  const otherMember = activeConversation?.type === 'direct'
    ? mockStore.getProfiles().find(p => p.id !== user?.id)
    : null;

  const title = activeConversation?.type === 'group'
    ? activeConversation.name
    : otherMember?.display_name || 'Direct Message';

  const avatar = activeConversation?.type === 'group'
    ? activeConversation.avatar_url
    : otherMember?.avatar_url;

  return (
    <div className="glass-panel rounded-2xl border border-arcade-border h-[calc(100vh-140px)] flex overflow-hidden shadow-2xl">
      {/* Conversations List Column */}
      <div className="w-72 sm:w-80 flex-shrink-0 border-r border-arcade-border flex flex-col bg-arcade-midnight/90">
        <div className="p-4 border-b border-arcade-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-arcade-champagne" /> Messages
            </h2>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-arcade-surface border border-arcade-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-champagne"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-arcade-border/40 p-2 space-y-1">
          {conversations.map((c) => {
            const isGroup = c.type === 'group';
            const isActive = c.id === activeConversationId;
            const target = isGroup ? null : mockStore.getProfiles().find(p => p.id !== user?.id);

            return (
              <button
                key={c.id}
                onClick={() => setActiveConversationId(c.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  isActive ? 'bg-arcade-champagne/15 border border-arcade-champagne/30 text-white' : 'hover:bg-arcade-surface/60 text-slate-300'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={isGroup ? c.avatar_url : target?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt="Chat"
                    className="w-10 h-10 rounded-xl object-cover border border-arcade-border"
                  />
                  {!isGroup && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-arcade-sage border-2 border-arcade-dark" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate text-white">
                      {isGroup ? c.name : target?.display_name || 'Player'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">12:30</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {c.last_message?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Thread Column */}
      <div className="flex-1 flex flex-col bg-arcade-dark/95 min-w-0">
        {/* Chat Thread Header */}
        <div className="h-14 px-6 border-b border-arcade-border flex items-center justify-between bg-arcade-midnight">
          <div className="flex items-center gap-3">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={title || 'Chat'}
              className="w-8 h-8 rounded-lg object-cover border border-arcade-border"
            />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {title}
                {activeConversation?.type === 'group' && (
                  <span className="text-[10px] text-slate-400 font-normal">Group Chat</span>
                )}
              </h3>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="py-24 text-center text-xs text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              Say hello and start the conversation!
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === user?.id;

              return (
                <div key={m.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={m.sender?.avatar_url || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150'}
                    alt={m.sender?.display_name || 'User'}
                    className="w-8 h-8 rounded-lg object-cover border border-arcade-border flex-shrink-0"
                  />

                  <div className={`space-y-1 max-w-md ${isMe ? 'items-end' : ''}`}>
                    <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isMe ? 'justify-end' : ''}`}>
                      <span className="font-bold text-slate-300">{m.sender?.display_name || 'Player'}</span>
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-arcade-champagne text-arcade-dark font-medium shadow-champagne-glow rounded-tr-none'
                          : 'bg-arcade-surface border border-arcade-border text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {m.content}
                    </div>

                    {/* Reactions Bar */}
                    <div className="flex items-center gap-1 mt-1">
                      {m.reactions && m.reactions.map(r => (
                        <button
                          key={r.id}
                          onClick={() => addReaction(m.id, r.emoji)}
                          className="px-1.5 py-0.5 rounded-full bg-arcade-surface border border-arcade-border text-[11px] hover:border-arcade-champagne transition-colors"
                        >
                          {r.emoji} 1
                        </button>
                      ))}

                      {/* Add quick reaction emoji */}
                      <button
                        onClick={() => addReaction(m.id, '🔥')}
                        className="px-1 text-[10px] text-slate-500 hover:text-white"
                        title="React Fire"
                      >
                        🔥
                      </button>
                      <button
                        onClick={() => addReaction(m.id, '🎮')}
                        className="px-1 text-[10px] text-slate-500 hover:text-white"
                        title="React GG"
                      >
                        🎮
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stickers Drawer */}
        {showStickerPicker && (
          <div className="p-3 border-t border-arcade-border bg-arcade-midnight">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-arcade-border/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arcade Stickers</span>
              <button onClick={() => setShowStickerPicker(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {ARCADE_STICKERS.map(s => (
                <button
                  key={s.name}
                  onClick={() => handleSendSticker(s.emoji)}
                  className="flex flex-col items-center p-2 rounded-lg bg-arcade-surface border border-arcade-border hover:border-arcade-champagne transition-colors"
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-[9px] text-slate-400 mt-1 truncate max-w-full">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-arcade-border bg-arcade-midnight flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            className="p-2 rounded-lg bg-arcade-surface text-slate-400 hover:text-arcade-champagne border border-arcade-border"
            title="Arcade Stickers"
          >
            <Smile className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            className="flex-1 bg-arcade-surface border border-arcade-border rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-champagne"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-arcade-champagne text-arcade-dark font-extrabold text-xs shadow-champagne-glow hover:bg-white transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </form>
      </div>
    </div>
  );
}

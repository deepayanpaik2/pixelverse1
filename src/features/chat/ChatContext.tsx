'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Conversation, Message } from '@/types';
import { mockStore } from '@/lib/supabase/mock-store';
import { useAuth } from '../auth/AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  messages: Message[];
  setActiveConversationId: (id: string) => void;
  sendMessage: (content: string, replyToId?: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  refreshMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!user) return;
    const convs = mockStore.getConversations(user.id);
    setConversations(convs);
    if (convs.length > 0 && !activeConversationId) {
      setActiveConversationId(convs[0].id);
    }
  }, [user]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    const msgs = mockStore.getMessages(activeConversationId);
    setMessages(msgs);
  }, [activeConversationId]);

  const refreshMessages = () => {
    if (activeConversationId) {
      setMessages(mockStore.getMessages(activeConversationId));
    }
    if (user) {
      setConversations(mockStore.getConversations(user.id));
    }
  };

  const sendMessage = (content: string, replyToId?: string) => {
    if (!activeConversationId || !user || !content.trim()) return;
    mockStore.sendMessage(activeConversationId, user.id, content.trim(), replyToId);
    refreshMessages();
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!user) return;
    mockStore.addReaction(messageId, user.id, emoji);
    refreshMessages();
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        activeConversation,
        messages,
        setActiveConversationId,
        sendMessage,
        addReaction,
        refreshMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

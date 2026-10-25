'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { VoiceEngine, VoiceParticipantState } from '@/lib/webrtc/voice-engine';
import { useAuth } from '../auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';

interface VoiceContextType {
  currentRoomId: string | null;
  isVoiceConnected: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  participants: VoiceParticipantState[];
  joinVoiceRoom: (roomId: string) => Promise<boolean>;
  leaveVoiceRoom: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [participants, setParticipants] = useState<VoiceParticipantState[]>([]);

  const voiceEngineRef = useRef<VoiceEngine | null>(null);

  useEffect(() => {
    voiceEngineRef.current = new VoiceEngine();
    voiceEngineRef.current.onSpeakingChange((speaking, level) => {
      setIsSpeaking(speaking);
      setAudioLevel(level);

      // Update current user in participant list
      if (user) {
        setParticipants(prev =>
          prev.map(p => (p.id === user.id ? { ...p, isSpeaking: speaking, audioLevel: level } : p))
        );
      }
    });

    return () => {
      voiceEngineRef.current?.stop();
    };
  }, [user]);

  const joinVoiceRoom = async (roomId: string): Promise<boolean> => {
    if (!voiceEngineRef.current) return false;

    await voiceEngineRef.current.startLocalAudio();
    setCurrentRoomId(roomId);
    setIsVoiceConnected(true);

    // Populate participant roster with room members + simulated chatter
    const profiles = mockStore.getProfiles();
    const otherUsers = profiles.filter(p => p.id !== user?.id).slice(0, 3);

    const initialParticipants: VoiceParticipantState[] = [
      ...(user
        ? [
            {
              id: user.id,
              name: user.display_name,
              avatar_url: user.avatar_url,
              isMuted: isMuted,
              isDeafened: isDeafened,
              isSpeaking: false,
              audioLevel: 0,
            },
          ]
        : []),
      ...otherUsers.map((p, idx) => ({
        id: p.id,
        name: p.display_name,
        avatar_url: p.avatar_url,
        isMuted: idx === 1,
        isDeafened: false,
        isSpeaking: false,
        audioLevel: 0,
      })),
    ];

    setParticipants(initialParticipants);
    return true;
  };

  const leaveVoiceRoom = () => {
    voiceEngineRef.current?.stop();
    setCurrentRoomId(null);
    setIsVoiceConnected(false);
    setIsSpeaking(false);
    setAudioLevel(0);
    setParticipants([]);
  };

  const toggleMute = () => {
    if (!voiceEngineRef.current) return;
    const nextMuted = !isMuted;
    voiceEngineRef.current.setMute(nextMuted);
    setIsMuted(nextMuted);
    if (user) {
      setParticipants(prev =>
        prev.map(p => (p.id === user.id ? { ...p, isMuted: nextMuted } : p))
      );
    }
  };

  const toggleDeafen = () => {
    if (!voiceEngineRef.current) return;
    const nextDeaf = !isDeafened;
    voiceEngineRef.current.setDeafen(nextDeaf);
    setIsDeafened(nextDeaf);
    if (nextDeaf) {
      setIsMuted(true);
    }
    if (user) {
      setParticipants(prev =>
        prev.map(p => (p.id === user.id ? { ...p, isDeafened: nextDeaf, isMuted: nextDeaf || p.isMuted } : p))
      );
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        currentRoomId,
        isVoiceConnected,
        isMuted,
        isDeafened,
        isSpeaking,
        audioLevel,
        participants,
        joinVoiceRoom,
        leaveVoiceRoom,
        toggleMute,
        toggleDeafen,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

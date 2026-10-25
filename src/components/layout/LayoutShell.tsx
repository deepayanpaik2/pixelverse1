'use client';

import React from 'react';
import { AuthProvider } from '@/features/auth/AuthContext';
import { VoiceProvider } from '@/features/voice/VoiceContext';
import { ChatProvider } from '@/features/chat/ChatContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ProfileGate } from './ProfileGate';
import { FallingGlitter } from './FallingGlitter';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <VoiceProvider>
        <ChatProvider>
          <div className="grain relative isolate min-h-screen flex flex-col bg-arcade-dark text-[#f4efe6]">
            <div className="aurora" aria-hidden="true"><span /><span /><span /></div>
            <FallingGlitter />
            <ProfileGate />
            <Navbar />
            <div className="flex-1 flex w-full">
              <Sidebar />
              <div className="flex-1 min-w-0 flex flex-col">
                <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 max-w-[1920px] mx-auto w-full pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8">
                  {children}
                </main>
                <Footer />
              </div>
            </div>
          </div>
        </ChatProvider>
      </VoiceProvider>
    </AuthProvider>
  );
}

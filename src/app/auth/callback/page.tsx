'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let done = false;
    const go = (path: string) => { if (!done) { done = true; router.replace(path); } };

    // Email-confirmation / magic links land here with the session in the URL
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) go('/'); // ProfileGate forwards new accounts to /onboarding
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) go('/'); });
    const t = setTimeout(() => go('/auth/sign-in'), 6000);

    return () => { sub.subscription.unsubscribe(); clearTimeout(t); };
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-300">
      <Loader2 className="w-8 h-8 animate-spin text-arcade-champagne" />
      <p className="text-sm font-bold">Verifying your account...</p>
    </div>
  );
}

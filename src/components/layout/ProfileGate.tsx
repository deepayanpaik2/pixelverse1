'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';

/** Sends brand-new accounts to the profile-creation step until it is finished. */
export function ProfileGate() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;
    if (user.profile_completed === false && !pathname.startsWith('/onboarding') && !pathname.startsWith('/auth')) {
      router.replace('/onboarding');
    }
  }, [user, isLoading, pathname, router]);

  return null;
}

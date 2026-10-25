'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/** Old URL shape. The player lives at /game/[slug]. */
export default function GamesRedirect() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  useEffect(() => {
    router.replace(slug ? `/game/${slug}` : '/arcade');
  }, [slug, router]);
  return <div className="p-4 text-slate-400">Loading…</div>;
}

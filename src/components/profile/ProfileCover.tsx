'use client';

import React, { useMemo, useState } from 'react';
import { coverDataUri, isPhoto, styleFor } from '@/lib/cover';

/**
 * Fills its parent completely. Uses the player's photo when there is one (and falls back to a
 * generated cover if the photo fails to load), then fades into the card below it.
 */
export function ProfileCover({ bannerUrl, seed, className = '' }: { bannerUrl?: string; seed: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  const generated = useMemo(() => coverDataUri(styleFor(bannerUrl, seed), seed), [bannerUrl, seed]);
  const src = isPhoto(bannerUrl) && !broken ? (bannerUrl as string) : generated;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <img
        src={src}
        alt=""
        onError={() => setBroken(true)}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* gentle fade into the card so the avatar and name always read clearly */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#17142a] via-[#17142a]/55 to-transparent" />
    </div>
  );
}

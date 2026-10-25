import React from 'react';

/** The Pixelverse mark: a cut gem built from pixel facets. */
export function BrandMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pv-gem" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fbeecb" />
          <stop offset="0.5" stopColor="#e9cb8b" />
          <stop offset="1" stopColor="#b98d3f" />
        </linearGradient>
      </defs>
      <path d="M20 2 36 14 20 38 4 14Z" fill="url(#pv-gem)" />
      <path d="M20 2 28 14H12Z" fill="#fff6dc" opacity=".55" />
      <path d="M4 14h32L20 38Z" fill="#0a0912" opacity=".16" />
      {/* a play triangle cut into the gem */}
      <path d="M17 17.5v8.5l7.2-4.25Z" fill="#1a1408" />
    </svg>
  );
}

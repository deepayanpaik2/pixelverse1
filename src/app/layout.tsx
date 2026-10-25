import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LayoutShell } from '@/components/layout/LayoutShell';

export const viewport: Viewport = {
  themeColor: '#0a0912',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pixelverse.local'),
  title: {
    default: 'Pixelverse — Instant Free Online Games Portal',
    template: '%s | Pixelverse',
  },
  description: 'Play thousands of free online games instantly. No downloads, no login required. Discover high-performance HTML5, WebGL, and retro arcade titles.',
  manifest: '/manifest.json',
  keywords: ['online games', 'free games', 'browser games', 'instant play', 'html5 games', 'poki alternative', 'arcade'],
  authors: [{ name: 'Pixelverse Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pixelverse.local',
    siteName: 'Pixelverse',
    title: 'Pixelverse — Instant Free Online Games Portal',
    description: 'Instant-play browser games with zero downloads. Silky smooth 60 FPS Canvas and WebGL games.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixelverse — Instant Free Online Games Portal',
    description: 'Play free online games instantly on any device. Zero downloads, no account needed.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Fraunces (display serif) + Figtree (body) + Noto for Hindi and Bengali. Google Fonts only ships the glyphs a page uses. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Fraunces:opsz,wght,SOFT,WONK@9..144,400..700,0..100,0..1&family=JetBrains+Mono:wght@500;700&family=Noto+Sans+Bengali:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Serif+Bengali:wght@500;700&family=Noto+Serif+Devanagari:wght@500;700&display=swap"
        />
      </head>
      <body className="antialiased font-sans">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}

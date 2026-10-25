/**
 * Profile covers. When a player has no cover photo (or picks one of the built-in styles),
 * we draw one: a gradient, soft lights and scattered gold glints, seeded by the username
 * so every player gets their own.
 *
 * banner_url values:  "cover:<style>"  → built-in style  ·  http(s)/data URL → a photo  ·  empty → automatic
 */

export interface CoverStyle { id: string; label: string; bg: [string, string]; lights: [string, string, string]; }

export const COVER_STYLES: CoverStyle[] = [
  { id: 'gala',    label: 'Gala',    bg: ['#1b1433', '#0d0b19'], lights: ['#e9cb8b', '#7c5cd6', '#f28ba8'] },
  { id: 'aurora',  label: 'Aurora',  bg: ['#0c1f2e', '#0a0912'], lights: ['#8fd9b6', '#5b8def', '#b7a0f5'] },
  { id: 'ember',   label: 'Ember',   bg: ['#2a1213', '#0e0a12'], lights: ['#f0a06a', '#f28ba8', '#e9cb8b'] },
  { id: 'orchid',  label: 'Orchid',  bg: ['#1f1238', '#0b0814'], lights: ['#b7a0f5', '#f2a0c6', '#7c5cd6'] },
  { id: 'tide',    label: 'Tide',    bg: ['#0b1d26', '#08101a'], lights: ['#9fc4f2', '#8fd9b6', '#e9cb8b'] },
  { id: 'noir',    label: 'Noir',    bg: ['#17151f', '#09080d'], lights: ['#e9cb8b', '#8d86a8', '#e9cb8b'] },
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function styleFor(bannerUrl: string | undefined, seed: string): CoverStyle {
  if (bannerUrl?.startsWith('cover:')) {
    const found = COVER_STYLES.find((s) => s.id === bannerUrl.slice(6));
    if (found) return found;
  }
  return COVER_STYLES[hash(seed) % COVER_STYLES.length];
}

export function isPhoto(bannerUrl?: string): boolean {
  return !!bannerUrl && /^(https?:|data:image|blob:|\/)/i.test(bannerUrl);
}

export function coverDataUri(style: CoverStyle, seed: string): string {
  const r = rng(hash(seed + style.id));
  const W = 1600, H = 420;
  const [l1, l2, l3] = style.lights;

  const orb = (c: string, cx: number, cy: number, rad: number, op: number, id: string) =>
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${rad}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c}" stop-opacity="${op}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;

  const o1 = [W * (0.1 + r() * 0.25), H * (0.1 + r() * 0.5)];
  const o2 = [W * (0.45 + r() * 0.2), H * (0.3 + r() * 0.5)];
  const o3 = [W * (0.75 + r() * 0.2), H * (0.05 + r() * 0.5)];

  let glints = '';
  for (let i = 0; i < 46; i++) {
    const x = r() * W, y = r() * H * 0.92, s = 2 + r() * 6;
    const c = [l1, '#fff4dc', l3, l2][Math.floor(r() * 4)];
    const op = (0.25 + r() * 0.6).toFixed(2);
    glints += r() > 0.35
      ? `<rect x="${(x - s / 2).toFixed(1)}" y="${(y - s / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" fill="${c}" opacity="${op}" transform="rotate(45 ${x.toFixed(1)} ${y.toFixed(1)})"/>`
      : `<path d="M${x.toFixed(1)} ${(y - s * 2).toFixed(1)} L${(x + s * 0.5).toFixed(1)} ${(y - s * 0.5).toFixed(1)} L${(x + s * 2).toFixed(1)} ${y.toFixed(1)} L${(x + s * 0.5).toFixed(1)} ${(y + s * 0.5).toFixed(1)} L${x.toFixed(1)} ${(y + s * 2).toFixed(1)} L${(x - s * 0.5).toFixed(1)} ${(y + s * 0.5).toFixed(1)} L${(x - s * 2).toFixed(1)} ${y.toFixed(1)} L${(x - s * 0.5).toFixed(1)} ${(y - s * 0.5).toFixed(1)}Z" fill="${c}" opacity="${op}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${style.bg[0]}"/><stop offset="1" stop-color="${style.bg[1]}"/></linearGradient>
${orb(l1, o1[0], o1[1], 460, 0.5, 'a')}${orb(l2, o2[0], o2[1], 520, 0.5, 'b')}${orb(l3, o3[0], o3[1], 440, 0.42, 'c')}
<pattern id="px" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#fff4dc" stroke-opacity=".035"/></pattern>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#a)"/><rect width="${W}" height="${H}" fill="url(#b)"/><rect width="${W}" height="${H}" fill="url(#c)"/>
<rect width="${W}" height="${H}" fill="url(#px)"/>
${glints}
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

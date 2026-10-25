/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [{
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "frame-src 'self' https://html5.gamemonetize.co https://*.gamemonetize.co https://*.gamemonetize.com",
          "img-src 'self' data: blob: https:",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline' https:",
          "font-src 'self' data: https:",
          "connect-src 'self' https: wss:",
          "media-src 'self' blob: https:",
        ].join('; ') + ';',
      }],
    }];
  },
};
export default nextConfig;
import type { NextConfig } from 'next';

// Permissive enough for the embedded Sanity Studio (eval + sanity.io
// connections) while locking down the public surface.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://*.api.sanity.io https://*.apicdn.sanity.io",
  "frame-src 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Sanity-hosted assets; logos served from the CDN.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  // Keep server-only packages out of the client bundle.
  serverExternalPackages: ['sanitize-html'],
  experimental: {
    // Trim what gets traced into Netlify functions.
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/studio/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;

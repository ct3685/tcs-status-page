import type { NextConfig } from 'next';

// CSP is split by route. The public status page gets a strict policy; only the
// embedded Sanity Studio needs 'unsafe-eval' for its in-browser bundler, so that
// relaxation is scoped to /studio rather than applied site-wide.
function buildCsp(scriptSrc: string): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.sanity.io",
    "font-src 'self' data:",
    "worker-src 'self' blob:",
    "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://*.api.sanity.io https://*.apicdn.sanity.io",
    "frame-src 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

// 'unsafe-inline' is retained for scripts because Next.js' App Router injects
// inline hydration/runtime scripts without a nonce; dropping it would break the
// page. 'unsafe-eval' is removed from the public policy (Studio-only below).
const PUBLIC_CSP = buildCsp("'self' 'unsafe-inline'");
const STUDIO_CSP = buildCsp("'self' 'unsafe-inline' 'unsafe-eval'");

// Non-CSP security headers shared by every route.
const baseSecurityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

// Isolation headers applied to the public surface only. Studio is excluded
// because its Sanity auth uses cross-origin popups that COOP 'same-origin'
// would sever.
const publicIsolationHeaders = [
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Sanity-hosted assets; logos served from the CDN.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  experimental: {
    // Trim what gets traced into Netlify functions.
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  async headers() {
    return [
      // Shared, non-CSP security headers on every route.
      { source: '/:path*', headers: baseSecurityHeaders },
      // Strict CSP + isolation for everything except the embedded Studio.
      {
        source: '/((?!studio).*)',
        headers: [
          { key: 'Content-Security-Policy', value: PUBLIC_CSP },
          ...publicIsolationHeaders,
        ],
      },
      // Studio: eval-permissive CSP scoped here only, plus noindex.
      {
        source: '/studio/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: STUDIO_CSP },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;

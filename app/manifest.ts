import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Last Rev — System Status',
    short_name: 'LR Status',
    description:
      'Real-time status of the third-party services the Last Rev team relies on.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'maskable' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  };
}

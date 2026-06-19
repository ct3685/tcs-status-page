import type { MetadataRoute } from 'next';
import { publicEnv } from '@/lib/env';
import { loadSettings } from '@/lib/status/settings';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await loadSettings();
  const base = publicEnv.NEXT_PUBLIC_SITE_URL;

  if (!settings.indexable) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/studio', '/api'] },
    sitemap: `${base}/sitemap.xml`,
  };
}

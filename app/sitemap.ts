import type { MetadataRoute } from 'next';
import { publicEnv } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: publicEnv.NEXT_PUBLIC_SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ];
}

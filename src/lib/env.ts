import { z } from 'zod';

/**
 * Public env is exposed to the browser. Only NEXT_PUBLIC_* values belong here.
 * Defaults keep local dev and pre-Sanity builds green; the app degrades
 * gracefully (manual/seed fallback) when Sanity is not yet configured.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().default(''),
  NEXT_PUBLIC_SANITY_DATASET: z.string().default('production'),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().default('2024-10-01'),
});

/**
 * Server env is never bundled to the client. Read lazily so importing this
 * module on the client (for publicEnv) does not throw on missing secrets.
 */
const serverSchema = z.object({
  SANITY_READ_TOKEN: z.string().optional(),
  SANITY_REVALIDATE_SECRET: z.string().optional(),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
});

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

export function serverEnv(): z.infer<typeof serverSchema> {
  if (cachedServerEnv) return cachedServerEnv;
  cachedServerEnv = serverSchema.parse({
    SANITY_READ_TOKEN: process.env.SANITY_READ_TOKEN,
    SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
  });
  return cachedServerEnv;
}

export const isSanityConfigured = publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID.length > 0;

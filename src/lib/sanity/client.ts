import { createClient, type SanityClient } from 'next-sanity';
import { isSanityConfigured, publicEnv, serverEnv } from '../env';

// Memoized so the client is created at most once. `undefined` = not yet
// resolved; `null` = Sanity is not configured (no projectId).
let cached: SanityClient | null | undefined;

/**
 * Lazily create the read client for published content. Returns null when Sanity
 * is not configured (e.g. local dev / CI without env), so callers fall back to
 * seed data instead of crashing — creating the client eagerly with an empty
 * projectId throws at module load and defeats the graceful-degradation guards.
 *
 * Uses the CDN for anonymous public datasets; when a server token is present
 * (private dataset), authenticated live reads are used instead.
 */
export function getSanityClient(): SanityClient | null {
  if (cached !== undefined) return cached;
  if (!isSanityConfigured) {
    cached = null;
    return cached;
  }
  const token = serverEnv().SANITY_READ_TOKEN;
  cached = createClient({
    projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: publicEnv.NEXT_PUBLIC_SANITY_API_VERSION,
    useCdn: !token,
    token,
    perspective: 'published',
  });
  return cached;
}

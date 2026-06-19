import { createClient } from 'next-sanity';
import { publicEnv, serverEnv } from '../env';

// Server-only token (undefined in the browser, where process.env secrets are
// not inlined). Used for reads when the dataset is private.
const token = serverEnv().SANITY_READ_TOKEN;

/**
 * Client for reading published content. Uses the CDN for anonymous public
 * datasets; when a server token is present (private dataset), authenticated
 * live reads are used instead.
 */
export const sanityClient = createClient({
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: publicEnv.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: !token,
  token,
  perspective: 'published',
});

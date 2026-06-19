import type { Config } from '@netlify/functions';
import { refreshStatusSnapshot } from '../../src/lib/status/cache';

/**
 * Scheduled aggregator: fetches all enabled feeds, normalizes them, and writes
 * the snapshot to Netlify Blobs so the page never waits on upstream status pages.
 */
export default async function handler(): Promise<Response> {
  try {
    const snapshot = await refreshStatusSnapshot('scheduled');
    return Response.json({
      ok: true,
      generatedAt: snapshot.generatedAt,
      services: snapshot.services.length,
      errors: snapshot.errors.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error(`[update-status] failed: ${message}`);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export const config: Config = {
  schedule: '*/3 * * * *',
};

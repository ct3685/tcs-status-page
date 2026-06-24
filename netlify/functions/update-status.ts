import type { Config } from '@netlify/functions';
import { refreshStatusSnapshot, snapshotAgeSeconds } from '../../src/lib/status/cache';

/**
 * Scheduled aggregator: fetches all enabled feeds, normalizes them, and writes
 * the snapshot to Netlify Blobs so the page never waits on upstream status pages.
 *
 * A Blob write failure now propagates out of refreshStatusSnapshot, so this
 * handler returns 500 (visible in Netlify function logs / alerts) instead of
 * silently leaving the public page on a stale snapshot.
 */
export default async function handler(): Promise<Response> {
  try {
    const snapshot = await refreshStatusSnapshot('scheduled');
    return Response.json({
      ok: true,
      generatedAt: snapshot.generatedAt,
      ageSeconds: snapshotAgeSeconds(snapshot),
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

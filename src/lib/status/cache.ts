import { getStore } from '@netlify/blobs';
import { buildSnapshot } from './snapshot';
import { loadManualIncidents, loadServiceConfigs } from './source';
import type { StatusSnapshot } from './types';

const STORE_NAME = 'status';
const SNAPSHOT_KEY = 'snapshot.json';

function logError(scope: string, err: unknown): void {
  // Avoid leaking tokens/payloads; log only the message.
  const message = err instanceof Error ? err.message : 'unknown error';
  console.warn(`[status:${scope}] ${message}`);
}

/** Read the cached snapshot from Netlify Blobs. Returns null when unavailable. */
export async function readSnapshotBlob(): Promise<StatusSnapshot | null> {
  try {
    const store = getStore(STORE_NAME);
    return (await store.get(SNAPSHOT_KEY, { type: 'json' })) as StatusSnapshot | null;
  } catch (err) {
    logError('blob-read', err);
    return null;
  }
}

async function writeSnapshotBlob(snapshot: StatusSnapshot): Promise<void> {
  try {
    const store = getStore(STORE_NAME);
    await store.setJSON(SNAPSHOT_KEY, snapshot);
  } catch (err) {
    logError('blob-write', err);
  }
}

/** Recompute a fresh snapshot from feeds and persist it to Blobs. */
export async function refreshStatusSnapshot(
  source: StatusSnapshot['source'] = 'scheduled',
): Promise<StatusSnapshot> {
  const [services, manualIncidentsBySlug] = await Promise.all([
    loadServiceConfigs(),
    loadManualIncidents(),
  ]);
  const snapshot = await buildSnapshot({ services, manualIncidentsBySlug, source });
  await writeSnapshotBlob(snapshot);
  return snapshot;
}

/**
 * Read-through accessor for the UI. Prefers the cached Blob snapshot (written by
 * the scheduled function); marks it stale past nextRefreshAt. Falls back to an
 * on-demand computation when no Blob exists (e.g. local dev, cold start).
 */
export async function getStatusSnapshot(): Promise<StatusSnapshot> {
  const cached = await readSnapshotBlob();
  if (cached) {
    return { ...cached, stale: Date.now() > new Date(cached.nextRefreshAt).getTime() };
  }
  return refreshStatusSnapshot('fallback');
}

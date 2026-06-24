import { getStore } from '@netlify/blobs';
import { buildSnapshot } from './snapshot';
import { loadManualIncidents, loadServiceConfigs } from './source';
import type { StatusSnapshot } from './types';

const STORE_NAME = 'status';
const SNAPSHOT_KEY = 'snapshot.json';

function logError(scope: string, err: unknown): void {
  // Avoid leaking tokens/payloads; log only the message.
  const message =
    err instanceof Error ? err.message : typeof err === 'string' ? err : 'unknown error';
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

/**
 * Persist a snapshot to Netlify Blobs. Throws on failure so callers (notably the
 * scheduled function) can report a non-200 instead of silently serving stale
 * data — a silently-swallowed write is the failure mode that lets the public
 * page drift hours behind without anyone noticing.
 */
async function writeSnapshotBlob(snapshot: StatusSnapshot): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.setJSON(SNAPSHOT_KEY, snapshot);
}

/** Build a fresh snapshot from feeds + Sanity without persisting it. */
async function computeSnapshot(source: StatusSnapshot['source']): Promise<StatusSnapshot> {
  const [services, manualIncidentsBySlug] = await Promise.all([
    loadServiceConfigs(),
    loadManualIncidents(),
  ]);
  return buildSnapshot({ services, manualIncidentsBySlug, source });
}

/**
 * Recompute a fresh snapshot from feeds and persist it to Blobs. A write failure
 * propagates so the scheduled aggregator surfaces it (returns 500); the UI's
 * read path tolerates write failures separately (see getStatusSnapshot).
 */
export async function refreshStatusSnapshot(
  source: StatusSnapshot['source'] = 'scheduled',
): Promise<StatusSnapshot> {
  const snapshot = await computeSnapshot(source);
  await writeSnapshotBlob(snapshot);
  return snapshot;
}

/** Whether a snapshot is older than its declared next-refresh time. */
export function isSnapshotStale(snapshot: StatusSnapshot, now: number = Date.now()): boolean {
  return now > new Date(snapshot.nextRefreshAt).getTime();
}

/** Age of a snapshot in seconds (floored, never negative). */
export function snapshotAgeSeconds(snapshot: StatusSnapshot, now: number = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(snapshot.generatedAt).getTime()) / 1000));
}

/**
 * Read-through accessor for the UI. Prefers the cached Blob snapshot (written by
 * the scheduled function); marks it stale past nextRefreshAt. Falls back to an
 * on-demand computation when no Blob exists (e.g. local dev, cold start), and
 * persists that result best-effort without breaking the page if the write fails.
 */
export async function getStatusSnapshot(): Promise<StatusSnapshot> {
  const cached = await readSnapshotBlob();
  if (cached) {
    const stale = isSnapshotStale(cached);
    if (stale) {
      // Visible in function logs so a wedged scheduled refresh is diagnosable.
      logError('stale-snapshot', `serving snapshot ${snapshotAgeSeconds(cached)}s old`);
    }
    return { ...cached, stale };
  }

  const snapshot = await computeSnapshot('fallback');
  try {
    await writeSnapshotBlob(snapshot);
  } catch (err) {
    logError('blob-write', err);
  }
  return snapshot;
}

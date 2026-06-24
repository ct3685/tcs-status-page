'use server';

import { revalidatePath } from 'next/cache';
import {
  readSnapshotBlob,
  refreshStatusSnapshot,
  snapshotAgeSeconds,
} from '@/lib/status/cache';

// Soft throttle so the public refresh action can't be used to hammer upstream
// feeds. Two layers: a per-instance timer (fast, no I/O) and a shared check
// against the persisted snapshot's age (covers separate serverless instances
// that don't share in-memory state). Within the window we just re-render.
const MIN_REFRESH_INTERVAL_MS = 15_000;
let lastRefresh = 0;

export async function refreshStatus(): Promise<{ refreshed: boolean }> {
  const now = Date.now();
  let refreshed = false;

  if (now - lastRefresh >= MIN_REFRESH_INTERVAL_MS) {
    lastRefresh = now;
    // Shared guard: skip the upstream fetch if the persisted snapshot is still
    // fresh, so concurrent instances can't collectively bypass the throttle.
    const current = await readSnapshotBlob();
    const freshEnough =
      current !== null && snapshotAgeSeconds(current, now) * 1000 < MIN_REFRESH_INTERVAL_MS;
    if (!freshEnough) {
      await refreshStatusSnapshot('on-demand');
      refreshed = true;
    }
  }

  revalidatePath('/');
  return { refreshed };
}

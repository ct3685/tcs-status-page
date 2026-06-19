'use server';

import { revalidatePath } from 'next/cache';
import { refreshStatusSnapshot } from '@/lib/status/cache';

// Soft throttle (per warm server instance) so the public refresh action can't
// be used to hammer upstream feeds. Within the window we just re-render.
const MIN_REFRESH_INTERVAL_MS = 15_000;
let lastRefresh = 0;

export async function refreshStatus(): Promise<{ refreshed: boolean }> {
  const now = Date.now();
  let refreshed = false;
  if (now - lastRefresh >= MIN_REFRESH_INTERVAL_MS) {
    lastRefresh = now;
    await refreshStatusSnapshot('on-demand');
    refreshed = true;
  }
  revalidatePath('/');
  return { refreshed };
}

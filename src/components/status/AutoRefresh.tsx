'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MIN_INTERVAL_MS = 30_000;
const MAX_INTERVAL_MS = 5 * 60_000;
// Small grace period after nextRefreshAt so the scheduled function has written
// the new Blob before we re-fetch.
const REFRESH_GRACE_MS = 3_000;

/**
 * Invisible client island that periodically calls router.refresh() so an open
 * tab self-heals to fresh data. Refreshes are aligned to the snapshot's
 * nextRefreshAt, clamped to a sane interval, and skipped while the tab is hidden
 * (a refresh fires on the next tick once it becomes visible again).
 */
export default function AutoRefresh({ nextRefreshAt }: { nextRefreshAt: string }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const nextDelay = () => {
      const due = new Date(nextRefreshAt).getTime() - Date.now() + REFRESH_GRACE_MS;
      if (Number.isNaN(due)) return MIN_INTERVAL_MS;
      return Math.min(Math.max(due, MIN_INTERVAL_MS), MAX_INTERVAL_MS);
    };

    const tick = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        // After a successful refresh the new nextRefreshAt re-runs this effect.
        router.refresh();
      }
      timer = setTimeout(tick, nextDelay());
    };

    timer = setTimeout(tick, nextDelay());
    return () => clearTimeout(timer);
  }, [nextRefreshAt, router]);

  return null;
}

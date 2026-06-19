'use client';

import { useSyncExternalStore } from 'react';
import Box from '@mui/material/Box';

// Shared 30s clock. Snapshot is cached between ticks so useSyncExternalStore
// stays stable (no render loop) and renders hydration-safe client-only times.
let current = 0;
let started = false;
const listeners = new Set<() => void>();

function ensureStarted() {
  if (started) return;
  started = true;
  current = Date.now();
  setInterval(() => {
    current = Date.now();
    for (const l of listeners) l();
  }, 30_000);
}

function subscribe(onChange: () => void): () => void {
  ensureStarted();
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => (current === 0 ? Date.now() : current),
    () => null,
  );
}

function relativeFrom(iso: string, now: number): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return '';
  const diffSec = Math.round((ts - now) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (abs < 60) return rtf.format(Math.round(diffSec), 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  return rtf.format(Math.round(diffSec / 86400), 'day');
}

/** Relative time ("3 minutes ago"), computed client-side to avoid TZ hydration drift. */
export function TimeAgo({ iso }: { iso: string }) {
  const now = useNow();
  return (
    <Box component="time" dateTime={iso} suppressHydrationWarning>
      {now === null ? '' : relativeFrom(iso, now)}
    </Box>
  );
}

/** Absolute local time, formatted client-side (null server snapshot avoids mismatch). */
export function LocalTime({ iso, withTime = true }: { iso: string; withTime?: boolean }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  let text = '';
  if (mounted) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      text = d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
      });
    }
  }
  return (
    <Box component="time" dateTime={iso} suppressHydrationWarning>
      {text}
    </Box>
  );
}

import type { StatusTone } from '@/lib/status/types';

/**
 * Status color tokens shared by server and client components. Kept free of the
 * 'use client' directive so Server Components can import them safely.
 */
export const statusTokens: Record<StatusTone, { main: string; glow: string; soft: string }> = {
  operational: { main: '#22c55e', glow: 'rgba(34,197,94,0.30)', soft: 'rgba(34,197,94,0.12)' },
  degraded: { main: '#f5a623', glow: 'rgba(245,166,35,0.30)', soft: 'rgba(245,166,35,0.12)' },
  outage: { main: '#ef4444', glow: 'rgba(239,68,68,0.32)', soft: 'rgba(239,68,68,0.12)' },
  maintenance: { main: '#3b82f6', glow: 'rgba(59,130,246,0.30)', soft: 'rgba(59,130,246,0.12)' },
  unknown: { main: '#94a3b8', glow: 'rgba(148,163,184,0.22)', soft: 'rgba(148,163,184,0.12)' },
};

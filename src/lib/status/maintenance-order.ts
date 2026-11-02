import type { Incident } from './types';

type MaintenanceOrder = Pick<Incident, 'startedAt' | 'publishedAt' | 'isCurrentMaintenance'>;

/** Instant shown on the maintenance row: window start, else publish time. */
export function maintenanceStartMs(incident: Pick<Incident, 'startedAt' | 'publishedAt'>): number {
  const iso = incident.startedAt ?? incident.publishedAt;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : Number.POSITIVE_INFINITY;
}

/**
 * Display order for upcoming maintenance: in-progress windows first, then the
 * soonest start. Feed order is publish-time descending, which puts the
 * furthest windows at the top of the list.
 */
export function compareScheduledMaintenance(a: MaintenanceOrder, b: MaintenanceOrder): number {
  if (a.isCurrentMaintenance !== b.isCurrentMaintenance) {
    return a.isCurrentMaintenance ? -1 : 1;
  }
  return maintenanceStartMs(a) - maintenanceStartMs(b);
}

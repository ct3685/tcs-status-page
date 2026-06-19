import {
  computeRecency,
  maintenanceTiming,
  parseDate,
  stableIncidentId,
} from '../classify';
import { sanitizeFeedHtml, toPlainTextSummary } from '../sanitize';
import type { Incident, IncidentSeverity, IncidentStatus, StatusThresholds } from '../types';

export interface ManualIncidentInput {
  id: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startTime?: string | null;
  endTime?: string | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  bodyHtml?: string | null;
  externalLink?: string | null;
}

const MAINTENANCE_STATUSES: ReadonlySet<IncidentStatus> = new Set([
  'scheduled',
  'inProgress',
  'completed',
]);

export function normalizeManualIncident(
  input: ManualIncidentInput,
  serviceSlug: string,
  now: Date,
  t: StatusThresholds,
): Incident {
  const isMaintenance =
    input.severity === 'maintenance' || MAINTENANCE_STATUSES.has(input.status);
  const type = isMaintenance ? 'maintenance' : 'incident';

  const startedAt =
    parseDate(input.startTime) ?? parseDate(input.scheduledStart) ?? now.toISOString();
  const resolvedAt = parseDate(input.endTime) ?? parseDate(input.scheduledEnd);
  const publishedAt = startedAt;

  const isResolved = input.status === 'resolved' || input.status === 'completed';
  const { isRecent, isVeryRecent } = computeRecency(publishedAt, now, t);
  const timing = isMaintenance
    ? maintenanceTiming(startedAt, resolvedAt, now)
    : { isFutureMaintenance: false, isCurrentMaintenance: false };

  const isActive = isMaintenance ? timing.isCurrentMaintenance : !isResolved;

  return {
    id: stableIncidentId(serviceSlug, input.id, publishedAt, input.title),
    sourceId: input.id,
    title: input.title,
    summary: toPlainTextSummary(input.bodyHtml),
    contentHtmlSanitized: sanitizeFeedHtml(input.bodyHtml),
    url: input.externalLink ?? null,
    publishedAt,
    updatedAt: resolvedAt,
    startedAt,
    resolvedAt,
    status: input.status,
    severity: input.severity,
    type,
    isActive,
    isResolved,
    isRecent,
    isVeryRecent,
    isFutureMaintenance: timing.isFutureMaintenance,
    isCurrentMaintenance: timing.isCurrentMaintenance,
    updates: [],
  };
}

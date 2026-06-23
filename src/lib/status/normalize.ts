import {
  computeRecency,
  deriveIncidentStatus,
  detectIncidentType,
  isManualOverrideActive,
  isNoIncidentTitle,
  maintenanceTiming,
  matchesAnyPattern,
  parseDate,
  parseMaintenanceWindow,
  severityFromText,
  severityToLevel,
  stableIncidentId,
  statusLabel,
  toneFromLevel,
  worstSeverity,
} from './classify';
import { sanitizeFeedHtml, toPlainTextSummary } from './sanitize';
import type { RawFeedItem } from './fetchers/rss';
import type {
  Incident,
  ServiceConfig,
  ServiceStatus,
  ServiceStatusLevel,
  StatusThresholds,
} from './types';

export function normalizeIncident(
  raw: RawFeedItem,
  cfg: ServiceConfig,
  now: Date,
  t: StatusThresholds,
): Incident | null {
  const publishedAt = parseDate(raw.publishedAt) ?? parseDate(raw.updatedAt);
  if (!publishedAt) return null;

  if (cfg.ignoreTitlePatterns.length && matchesAnyPattern(raw.title, cfg.ignoreTitlePatterns)) {
    return null;
  }

  const type = detectIncidentType(raw.title, raw.contentHtml, {
    maintenanceKeywords: cfg.maintenanceKeywords,
    informationalPatterns: cfg.noIncidentPatterns,
  });

  // "All systems operational" / "no incidents reported" are not incidents.
  if (type === 'informational' || isNoIncidentTitle(raw.title, cfg.noIncidentPatterns)) {
    return null;
  }

  const updatedAt = parseDate(raw.updatedAt);
  const status = deriveIncidentStatus(raw.title, raw.contentHtml, type);
  const severity = severityFromText(raw.title, raw.contentHtml, type);
  const { isRecent, isVeryRecent } = computeRecency(publishedAt, now, t);

  const isResolved = status === 'resolved' || status === 'completed';

  // Prefer an explicit window parsed from the body (e.g. Atlassian's
  // "on YYYY-MM-DD between HH:MM and HH:MM UTC") over the feed's publish date,
  // which is unreliable for timing future/current/past maintenance.
  const window = type === 'maintenance' ? parseMaintenanceWindow(raw.contentHtml) : null;
  const startedAt = window?.startsAt ?? publishedAt;
  const resolvedAt = isResolved ? (window?.endsAt ?? updatedAt ?? publishedAt) : null;

  const timing =
    type === 'maintenance'
      ? maintenanceTiming(startedAt, window?.endsAt ?? resolvedAt, now)
      : { isFutureMaintenance: false, isCurrentMaintenance: false };

  // Without a definitive end time, don't let an open-ended maintenance appear
  // "current" indefinitely; only treat very recent items as current.
  if (type === 'maintenance' && !window && !resolvedAt && !isVeryRecent) {
    timing.isCurrentMaintenance = false;
  }

  const isActive = type === 'maintenance' ? timing.isCurrentMaintenance : !isResolved && isRecent;

  return {
    id: stableIncidentId(cfg.slug, raw.sourceId, publishedAt, raw.title),
    sourceId: raw.sourceId,
    title: raw.title.trim() || 'Untitled incident',
    summary: toPlainTextSummary(raw.contentHtml),
    contentHtmlSanitized: sanitizeFeedHtml(raw.contentHtml),
    url: raw.link,
    publishedAt,
    updatedAt,
    startedAt,
    resolvedAt,
    status,
    severity,
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

function byPublishedDesc(a: Incident, b: Incident): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

function dedupeById(incidents: Incident[]): Incident[] {
  const seen = new Map<string, Incident>();
  for (const incident of incidents) {
    if (!seen.has(incident.id)) seen.set(incident.id, incident);
  }
  return [...seen.values()];
}

function deriveServiceLevel(
  active: Incident[],
  maintenance: Incident[],
): ServiceStatusLevel {
  // Status reflects the live state only. Red (partial/major outage) and yellow
  // (degraded) are reserved for incidents that are ACTIVE and unresolved right
  // now — surfaced at their real severity. Once an incident is resolved the
  // service returns to operational immediately; the just-resolved incident
  // still appears in `recentIncidents` history, but it must not keep the
  // service looking unhealthy (which would contradict its "Resolved" label).
  if (active.length > 0) {
    return severityToLevel(worstSeverity(active.map((i) => i.severity)));
  }
  if (maintenance.some((i) => i.isCurrentMaintenance)) return 'maintenance';
  return 'operational';
}

export interface BuildServiceInput {
  config: ServiceConfig;
  rawItems?: RawFeedItem[];
  manualIncidents?: Incident[];
  fetchError?: string | null;
}

export function buildServiceStatus(
  input: BuildServiceInput,
  now: Date,
  t: StatusThresholds,
): ServiceStatus {
  const { config, rawItems = [], manualIncidents = [], fetchError = null } = input;

  const base = {
    id: config.id,
    slug: config.slug,
    name: config.name,
    description: config.description ?? null,
    category: config.category ?? null,
    logo: config.logo ?? null,
    externalStatusPageUrl: config.externalStatusPageUrl ?? null,
    criticality: config.criticality,
    pinned: config.pinned,
    order: config.order,
    lastCheckedAt: now.toISOString(),
    rawSourceMeta: {
      feedType: config.feedType,
      feedUrl: config.feedUrl ?? null,
      itemCount: rawItems.length,
    },
  } as const;

  // Manual override takes precedence over everything except surfacing incidents.
  const overrideActive =
    config.manualStatusOverride !== undefined &&
    isManualOverrideActive(config.manualOverrideExpiry, now);

  if (fetchError && manualIncidents.length === 0 && !overrideActive) {
    return {
      ...base,
      currentStatus: config.fallbackStatus ?? 'unknown',
      statusLabel: statusLabel(config.fallbackStatus ?? 'unknown'),
      statusTone: toneFromLevel(config.fallbackStatus ?? 'unknown'),
      severity: 'unknown',
      lastIncidentAt: null,
      isFetchError: true,
      fetchErrorMessage: fetchError,
      activeIncidents: [],
      recentIncidents: [],
      scheduledMaintenance: [],
      pastMaintenance: [],
    };
  }

  const normalized = dedupeById([
    ...manualIncidents,
    ...rawItems
      .map((raw) => normalizeIncident(raw, config, now, t))
      .filter((i): i is Incident => i !== null),
  ]).sort(byPublishedDesc);

  const incidents = normalized.filter((i) => i.type === 'incident');
  const maintenance = normalized.filter((i) => i.type === 'maintenance');

  const activeIncidents = incidents.filter((i) => i.isActive);
  const recentIncidents = incidents
    .filter((i) => i.isRecent && !i.isActive)
    .slice(0, t.maxIncidentsPerService);

  const scheduledMaintenance = maintenance.filter(
    (m) => m.isFutureMaintenance || m.isCurrentMaintenance,
  );
  const pastMaintenance = maintenance
    .filter((m) => !m.isFutureMaintenance && !m.isCurrentMaintenance)
    .slice(0, t.maxIncidentsPerService);

  let level: ServiceStatusLevel;
  if (overrideActive && config.manualStatusOverride) {
    level = config.manualStatusOverride;
  } else {
    level = deriveServiceLevel(activeIncidents, scheduledMaintenance);
  }

  const severity =
    level === 'maintenance'
      ? 'maintenance'
      : worstSeverity(activeIncidents.map((i) => i.severity));

  const lastIncidentAt = incidents[0]?.publishedAt ?? null;

  return {
    ...base,
    currentStatus: level,
    statusLabel: statusLabel(level),
    statusTone: toneFromLevel(level),
    severity,
    lastIncidentAt,
    isFetchError: false,
    fetchErrorMessage: null,
    activeIncidents,
    recentIncidents,
    scheduledMaintenance,
    pastMaintenance,
  };
}

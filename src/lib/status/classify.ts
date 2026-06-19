import type {
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  ServiceStatusLevel,
  StatusThresholds,
  StatusTone,
} from './types';

const DEFAULT_MAINTENANCE_KEYWORDS = [
  'scheduled maintenance',
  'planned maintenance',
  'maintenance window',
  'service maintenance',
  'emergency maintenance',
  'this is a scheduled event',
];

const DEFAULT_NO_INCIDENT_PATTERNS = [
  'no incidents reported',
  'all systems operational',
  'operating normally',
  'no known issues',
];

// Announcements that are neither incidents nor maintenance (common on noisy
// feeds like Zoom). Excluded from the UI to keep signal high.
const DEFAULT_INFORMATIONAL_PATTERNS = [
  'no operational impact',
  'no impact',
  'announcing',
  'announcement',
  'deprecation',
  'deprecating',
  'decommission',
  'end of life',
  'advisory',
  'reminder:',
];

/** Deterministic, dependency-free string hash (djb2) -> base36. */
export function stableHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  // Force unsigned 32-bit then base36.
  return (hash >>> 0).toString(36);
}

export function stableIncidentId(
  serviceSlug: string,
  sourceId: string,
  publishedAt: string,
  title: string,
): string {
  return `${serviceSlug}-${stableHash(`${sourceId}|${publishedAt}|${title}`)}`;
}

/** Parse a date string to an ISO string, or null when invalid. */
export function parseDate(value: string | number | Date | null | undefined): string | null {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function normalize(text: string | null | undefined): string {
  return (text ?? '').toLowerCase();
}

/**
 * "No incident" / "all operational" style messages that must NOT be treated as
 * real incidents (matches the title only, like the legacy logic intended).
 */
export function isNoIncidentTitle(title: string, extraPatterns: string[] = []): boolean {
  const t = normalize(title);
  if (!t) return false;
  return [...DEFAULT_NO_INCIDENT_PATTERNS, ...extraPatterns.map(normalize)].some((p) =>
    t.includes(p),
  );
}

export function matchesAnyPattern(text: string, patterns: string[]): boolean {
  const t = normalize(text);
  return patterns.some((p) => {
    const needle = normalize(p);
    return needle.length > 0 && t.includes(needle);
  });
}

export function detectIncidentType(
  title: string,
  content: string,
  opts: { maintenanceKeywords?: string[]; informationalPatterns?: string[] } = {},
): IncidentType {
  const t = normalize(title);
  const c = normalize(content);
  const customMaintenance = (opts.maintenanceKeywords ?? []).map(normalize);

  // Maintenance is detected from the title (reliable) plus opt-in custom
  // keywords (which may also match content). Content alone is too noisy.
  if (
    t.includes('maintenance') ||
    DEFAULT_MAINTENANCE_KEYWORDS.some((k) => t.includes(k)) ||
    customMaintenance.some((k) => t.includes(k) || c.includes(k))
  ) {
    return 'maintenance';
  }

  if (
    isNoIncidentTitle(title) ||
    matchesAnyPattern(title, [...DEFAULT_INFORMATIONAL_PATTERNS, ...(opts.informationalPatterns ?? [])])
  ) {
    return 'informational';
  }
  return 'incident';
}

/** Best-effort lifecycle status from feed text (Atlassian feeds rarely expose it). */
export function deriveIncidentStatus(title: string, content: string, type: IncidentType): IncidentStatus {
  const text = `${normalize(title)} ${normalize(content)}`;
  if (type === 'maintenance') {
    if (text.includes('completed')) return 'completed';
    if (text.includes('in progress') || text.includes('in-progress')) return 'inProgress';
    return 'scheduled';
  }
  if (text.includes('resolved')) return 'resolved';
  if (text.includes('monitoring')) return 'monitoring';
  if (text.includes('identified')) return 'identified';
  if (text.includes('investigating')) return 'investigating';
  return 'unknown';
}

export function severityFromText(
  title: string,
  content: string,
  type: IncidentType,
): IncidentSeverity {
  if (type === 'maintenance') return 'maintenance';
  if (type === 'informational') return 'operational';
  const text = `${normalize(title)} ${normalize(content)}`;
  if (text.includes('major outage') || text.includes('major service outage')) return 'majorOutage';
  if (text.includes('partial outage') || text.includes('partial service')) return 'partialOutage';
  if (
    text.includes('degraded') ||
    text.includes('degradation') ||
    text.includes('elevated') ||
    text.includes('slow')
  ) {
    return 'degraded';
  }
  if (text.includes('outage') || text.includes('unavailable') || text.includes('down')) {
    return 'partialOutage';
  }
  // A real incident with unclear wording is treated as degraded, not unknown.
  return 'degraded';
}

export function computeRecency(
  publishedAt: string,
  now: Date,
  t: StatusThresholds,
): { isRecent: boolean; isVeryRecent: boolean } {
  const ts = new Date(publishedAt).getTime();
  const nowMs = now.getTime();
  if (Number.isNaN(ts) || ts > nowMs) {
    return { isRecent: false, isVeryRecent: false };
  }
  const ageMs = nowMs - ts;
  return {
    isVeryRecent: ageMs <= t.veryRecentHours * 3_600_000,
    isRecent: ageMs <= t.recentHours * 3_600_000,
  };
}

export function maintenanceTiming(
  startedAt: string | null,
  resolvedAt: string | null,
  now: Date,
): { isFutureMaintenance: boolean; isCurrentMaintenance: boolean } {
  const nowMs = now.getTime();
  const start = startedAt ? new Date(startedAt).getTime() : NaN;
  const end = resolvedAt ? new Date(resolvedAt).getTime() : NaN;
  const hasStart = !Number.isNaN(start);
  const hasEnd = !Number.isNaN(end);

  const isFutureMaintenance = hasStart && start > nowMs;
  const isCurrentMaintenance =
    hasStart && start <= nowMs && (!hasEnd || end >= nowMs) && !isFutureMaintenance;
  return { isFutureMaintenance, isCurrentMaintenance };
}

export function toneFromLevel(level: ServiceStatusLevel): StatusTone {
  switch (level) {
    case 'operational':
      return 'operational';
    case 'degraded':
      return 'degraded';
    case 'partialOutage':
    case 'majorOutage':
      return 'outage';
    case 'maintenance':
      return 'maintenance';
    case 'unknown':
    default:
      return 'unknown';
  }
}

export function statusLabel(level: ServiceStatusLevel): string {
  switch (level) {
    case 'operational':
      return 'Operational';
    case 'degraded':
      return 'Degraded';
    case 'partialOutage':
      return 'Partial outage';
    case 'majorOutage':
      return 'Major outage';
    case 'maintenance':
      return 'Under maintenance';
    case 'unknown':
    default:
      return 'Status unavailable';
  }
}

const SEVERITY_RANK: Record<IncidentSeverity, number> = {
  operational: 0,
  maintenance: 1,
  degraded: 2,
  partialOutage: 3,
  majorOutage: 4,
  unknown: 0,
};

export function worstSeverity(severities: IncidentSeverity[]): IncidentSeverity {
  return severities.reduce<IncidentSeverity>(
    (worst, s) => (SEVERITY_RANK[s] > SEVERITY_RANK[worst] ? s : worst),
    'operational',
  );
}

export function severityToLevel(severity: IncidentSeverity): ServiceStatusLevel {
  switch (severity) {
    case 'majorOutage':
      return 'majorOutage';
    case 'partialOutage':
      return 'partialOutage';
    case 'degraded':
      return 'degraded';
    case 'maintenance':
      return 'maintenance';
    case 'operational':
      return 'operational';
    case 'unknown':
    default:
      return 'unknown';
  }
}

export function isManualOverrideActive(expiry: string | null | undefined, now: Date): boolean {
  if (!expiry) return false;
  const exp = new Date(expiry).getTime();
  return !Number.isNaN(exp) && exp > now.getTime();
}

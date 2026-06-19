/**
 * Canonical status model. Everything internal is stored in UTC/ISO strings;
 * human/local formatting happens only in the UI layer.
 */

// Color bucket used by the UI. Never the sole signal (icon + label always accompany).
export const STATUS_TONES = ['operational', 'degraded', 'outage', 'maintenance', 'unknown'] as const;
export type StatusTone = (typeof STATUS_TONES)[number];

// Fine-grained service health level.
export const SERVICE_STATUS_LEVELS = [
  'operational',
  'degraded',
  'partialOutage',
  'majorOutage',
  'maintenance',
  'unknown',
] as const;
export type ServiceStatusLevel = (typeof SERVICE_STATUS_LEVELS)[number];

// Incident severity (shared vocabulary with manual incidents in Sanity).
export const INCIDENT_SEVERITIES = [
  'operational',
  'degraded',
  'partialOutage',
  'majorOutage',
  'maintenance',
  'unknown',
] as const;
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

// Lifecycle status of an incident/update.
export const INCIDENT_STATUSES = [
  'investigating',
  'identified',
  'monitoring',
  'resolved',
  'scheduled',
  'inProgress',
  'completed',
  'unknown',
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_TYPES = ['incident', 'maintenance', 'informational', 'unknown'] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const FEED_TYPES = [
  'rss',
  'atlassianStatuspageRss',
  'herokuApi',
  'statuspageRss',
  'customJson',
  'manualOnly',
] as const;
export type FeedType = (typeof FEED_TYPES)[number];

export const CRITICALITIES = ['critical', 'high', 'normal', 'low'] as const;
export type Criticality = (typeof CRITICALITIES)[number];

export interface IncidentUpdate {
  status: IncidentStatus;
  body: string;
  publishedAt: string; // ISO
}

export interface Incident {
  /** Stable hash: serviceSlug + sourceId + publishedAt + title. */
  id: string;
  sourceId: string;
  title: string;
  summary: string;
  /** Sanitized HTML, safe to render. */
  contentHtmlSanitized: string;
  url: string | null;
  publishedAt: string; // ISO
  updatedAt: string | null;
  startedAt: string | null;
  resolvedAt: string | null;
  status: IncidentStatus;
  severity: IncidentSeverity;
  type: IncidentType;
  isActive: boolean;
  isResolved: boolean;
  isRecent: boolean;
  isVeryRecent: boolean;
  isFutureMaintenance: boolean;
  isCurrentMaintenance: boolean;
  updates: IncidentUpdate[];
}

export interface ServiceCategoryRef {
  name: string;
  slug: string;
}

export interface ServiceStatus {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: ServiceCategoryRef | null;
  logo: string | null;
  externalStatusPageUrl: string | null;
  currentStatus: ServiceStatusLevel;
  statusLabel: string;
  statusTone: StatusTone;
  severity: IncidentSeverity;
  criticality: Criticality;
  pinned: boolean;
  order: number;
  lastIncidentAt: string | null;
  lastCheckedAt: string;
  isFetchError: boolean;
  fetchErrorMessage: string | null;
  activeIncidents: Incident[];
  recentIncidents: Incident[];
  scheduledMaintenance: Incident[];
  pastMaintenance: Incident[];
  rawSourceMeta: {
    feedType: FeedType;
    feedUrl: string | null;
    itemCount: number;
  };
}

export interface SnapshotError {
  serviceSlug: string;
  serviceName: string;
  message: string;
}

export interface StatusSummary {
  total: number;
  operational: number;
  degraded: number;
  outage: number;
  maintenance: number;
  unknown: number;
  /** True when any non-maintenance service is degraded/outage/unknown. */
  hasActiveProblems: boolean;
  activeIncidentCount: number;
  scheduledMaintenanceCount: number;
}

export interface StatusSnapshot {
  generatedAt: string; // ISO
  source: 'scheduled' | 'on-demand' | 'fallback';
  stale: boolean;
  nextRefreshAt: string; // ISO
  services: ServiceStatus[];
  summary: StatusSummary;
  errors: SnapshotError[];
}

/** Normalized service configuration consumed by the pipeline (from Sanity or seed). */
export interface ServiceConfig {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: ServiceCategoryRef;
  logo?: string;
  externalStatusPageUrl?: string;
  feedUrl?: string;
  feedType: FeedType;
  enabled: boolean;
  hidden: boolean;
  pinned: boolean;
  criticality: Criticality;
  order: number;
  tags: string[];
  owner?: string;
  fallbackStatus?: ServiceStatusLevel;
  timeoutMs?: number;
  ignoreTitlePatterns: string[];
  maintenanceKeywords: string[];
  incidentKeywords: string[];
  noIncidentPatterns: string[];
  manualStatusOverride?: ServiceStatusLevel;
  manualOverrideExpiry?: string;
}

export interface StatusThresholds {
  veryRecentHours: number;
  recentHours: number;
  maxIncidentsPerService: number;
  defaultTimeoutMs: number;
  maxResponseBytes: number;
  refreshIntervalSeconds: number;
}

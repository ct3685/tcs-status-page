import pLimit from 'p-limit';
import { thresholds } from './config';
import { fetchFeedText } from './fetchers/fetch-feed';
import { parseHerokuIncidents } from './fetchers/heroku';
import { normalizeManualIncident, type ManualIncidentInput } from './fetchers/manual';
import { parseRssFeed, type RawFeedItem } from './fetchers/rss';
import { buildServiceStatus } from './normalize';
import type {
  ServiceConfig,
  ServiceStatus,
  SnapshotError,
  StatusSnapshot,
  StatusSummary,
} from './types';

async function fetchServiceRaw(config: ServiceConfig): Promise<RawFeedItem[]> {
  if (config.feedType === 'manualOnly' || !config.feedUrl) return [];
  const body = await fetchFeedText(config.feedUrl, { timeoutMs: config.timeoutMs });
  if (config.feedType === 'herokuApi') return parseHerokuIncidents(body);
  return parseRssFeed(body).items;
}

function compareServices(a: ServiceStatus, b: ServiceStatus): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  if (a.order !== b.order) return a.order - b.order;
  return a.name.localeCompare(b.name);
}

function summarize(services: ServiceStatus[]): StatusSummary {
  const summary: StatusSummary = {
    total: services.length,
    operational: 0,
    degraded: 0,
    outage: 0,
    maintenance: 0,
    unknown: 0,
    hasActiveProblems: false,
    activeIncidentCount: 0,
    scheduledMaintenanceCount: 0,
  };
  for (const service of services) {
    summary[service.statusTone] += 1;
    summary.activeIncidentCount += service.activeIncidents.length;
    summary.scheduledMaintenanceCount += service.scheduledMaintenance.filter(
      (m) => m.isFutureMaintenance || m.isCurrentMaintenance,
    ).length;
  }
  summary.hasActiveProblems = summary.degraded + summary.outage + summary.unknown > 0;
  return summary;
}

export interface BuildSnapshotOptions {
  services: ServiceConfig[];
  manualIncidentsBySlug?: Record<string, ManualIncidentInput[]>;
  source?: StatusSnapshot['source'];
  now?: Date;
  concurrency?: number;
}

export async function buildSnapshot(options: BuildSnapshotOptions): Promise<StatusSnapshot> {
  const {
    services,
    manualIncidentsBySlug = {},
    source = 'on-demand',
    now = new Date(),
    concurrency = 8,
  } = options;

  const limit = pLimit(concurrency);
  const errors: SnapshotError[] = [];

  // Disabled excluded entirely; hidden excluded from the public UI snapshot.
  const visible = services.filter((s) => s.enabled && !s.hidden);

  const serviceStatuses = await Promise.all(
    visible.map((config) =>
      limit(async () => {
        const manualIncidents = (manualIncidentsBySlug[config.slug] ?? []).map((mi) =>
          normalizeManualIncident(mi, config.slug, now, thresholds),
        );

        let rawItems: RawFeedItem[] | undefined;
        let fetchError: string | null = null;
        try {
          rawItems = await fetchServiceRaw(config);
        } catch (err) {
          fetchError = err instanceof Error ? err.message : 'Unknown feed error';
          errors.push({ serviceSlug: config.slug, serviceName: config.name, message: fetchError });
        }

        return buildServiceStatus({ config, rawItems, manualIncidents, fetchError }, now, thresholds);
      }),
    ),
  );

  serviceStatuses.sort(compareServices);

  return {
    generatedAt: now.toISOString(),
    source,
    stale: false,
    nextRefreshAt: new Date(now.getTime() + thresholds.refreshIntervalSeconds * 1000).toISOString(),
    services: serviceStatuses,
    summary: summarize(serviceStatuses),
    errors,
  };
}

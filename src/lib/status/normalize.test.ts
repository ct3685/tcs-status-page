import { describe, expect, it } from 'vitest';
import { buildServiceStatus } from './normalize';
import { thresholds } from './config';
import type { RawFeedItem } from './fetchers/rss';
import type { ServiceConfig } from './types';

const NOW = new Date('2026-01-01T12:00:00.000Z');

function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 3600_000).toISOString();
}

const config: ServiceConfig = {
  id: 'demo',
  slug: 'demo',
  name: 'Demo',
  feedType: 'atlassianStatuspageRss',
  feedUrl: 'https://status.example.com/history.rss',
  enabled: true,
  hidden: false,
  pinned: false,
  criticality: 'normal',
  order: 1,
  tags: [],
  ignoreTitlePatterns: [],
  maintenanceKeywords: [],
  incidentKeywords: [],
  noIncidentPatterns: [],
};

function raw(partial: Partial<RawFeedItem> & { title: string; publishedAt: string }): RawFeedItem {
  return {
    sourceId: partial.sourceId ?? partial.title,
    title: partial.title,
    link: partial.link ?? null,
    contentHtml: partial.contentHtml ?? '',
    publishedAt: partial.publishedAt,
    updatedAt: partial.updatedAt ?? null,
  };
}

function build(rawItems: RawFeedItem[]) {
  return buildServiceStatus({ config, rawItems }, NOW, thresholds);
}

describe('buildServiceStatus', () => {
  it('is operational when only old resolved incidents exist', () => {
    const s = build([
      raw({ title: 'Old issue', publishedAt: hoursAgo(100), contentHtml: 'Resolved - fixed' }),
    ]);
    expect(s.statusTone).toBe('operational');
    expect(s.currentStatus).toBe('operational');
    expect(s.activeIncidents).toHaveLength(0);
  });

  it('is operational for a recent resolved incident, but keeps it in history', () => {
    // A resolved incident returns the service to operational immediately so the
    // status never contradicts the incident's "Resolved" label; the incident
    // still surfaces under recentIncidents history.
    const s = build([
      raw({
        title: 'API latency',
        publishedAt: hoursAgo(10),
        contentHtml: 'Resolved - back to normal',
      }),
    ]);
    expect(s.statusTone).toBe('operational');
    expect(s.activeIncidents).toHaveLength(0);
    expect(s.recentIncidents.length).toBeGreaterThan(0);
  });

  it('does not flag a very recently RESOLVED incident as needing attention', () => {
    // A resolved incident must not make a healthy service look unhealthy, even
    // within the very-recent window. Color is reserved for active incidents.
    const s = build([
      raw({ title: 'Errors', publishedAt: hoursAgo(2), contentHtml: 'Resolved - mitigated' }),
    ]);
    expect(s.statusTone).toBe('operational');
    expect(s.activeIncidents).toHaveLength(0);
  });

  it('is outage with active incident for an unresolved major outage', () => {
    const s = build([
      raw({
        title: 'Major outage in production',
        publishedAt: hoursAgo(1),
        contentHtml: 'Investigating',
      }),
    ]);
    expect(s.statusTone).toBe('outage');
    expect(s.currentStatus).toBe('majorOutage');
    expect(s.activeIncidents).toHaveLength(1);
  });

  it('surfaces current maintenance separately (blue) without treating it as an incident', () => {
    const s = build([
      raw({
        title: 'Scheduled maintenance',
        publishedAt: hoursAgo(1),
        contentHtml: 'Maintenance in progress',
      }),
    ]);
    expect(s.statusTone).toBe('maintenance');
    expect(s.scheduledMaintenance.length).toBeGreaterThan(0);
    expect(s.activeIncidents).toHaveLength(0);
    expect(s.recentIncidents).toHaveLength(0);
  });

  it('treats a completed scheduled event (location-only title) as past maintenance, not an active outage', () => {
    // Reproduces the Cloudflare history.rss shape: datacenter/date title with the
    // maintenance wording (and "temporarily unavailable") only in the body.
    const s = build([
      raw({
        title: 'LAX (Los Angeles) on 2026-01-01',
        publishedAt: hoursAgo(1),
        contentHtml:
          'Completed - The scheduled maintenance has been completed. Network interfaces may become temporarily unavailable.',
      }),
    ]);
    expect(s.statusTone).toBe('operational');
    expect(s.activeIncidents).toHaveLength(0);
    expect(s.recentIncidents).toHaveLength(0);
    expect(s.pastMaintenance.length).toBeGreaterThan(0);
  });

  it('times a future maintenance from the parsed body window (upcoming, not blue)', () => {
    // Cloudflare sets a future event's pubDate to the event start; the real
    // window comes from the body. NOW is 2026-01-01T12:00Z, so this is upcoming.
    const s = build([
      raw({
        title: 'ARN (Stockholm) on 2026-01-03',
        publishedAt: hoursAgo(-48),
        contentHtml:
          'Scheduled - We will be performing scheduled maintenance in ARN datacenter on 2026-01-03 between 00:00 and 05:00 UTC.',
      }),
    ]);
    expect(s.scheduledMaintenance.length).toBeGreaterThan(0);
    expect(s.scheduledMaintenance[0]?.isFutureMaintenance).toBe(true);
    expect(s.scheduledMaintenance[0]?.startedAt).toBe('2026-01-03T00:00:00.000Z');
    expect(s.statusTone).toBe('operational');
    expect(s.activeIncidents).toHaveLength(0);
  });

  it('times a current maintenance from the parsed body window (blue)', () => {
    // Window straddles NOW (2026-01-01T12:00Z): 10:00–14:00 UTC.
    const s = build([
      raw({
        title: 'LAX (Los Angeles) on 2026-01-01',
        publishedAt: hoursAgo(3),
        contentHtml:
          'In progress - Scheduled maintenance in LAX datacenter on 2026-01-01 between 10:00 and 14:00 UTC.',
      }),
    ]);
    expect(s.statusTone).toBe('maintenance');
    expect(s.scheduledMaintenance[0]?.isCurrentMaintenance).toBe(true);
    expect(s.activeIncidents).toHaveLength(0);
  });

  it('treats an in-progress scheduled event (location-only title) as current maintenance (blue)', () => {
    const s = build([
      raw({
        title: 'LAX (Los Angeles) on 2026-01-01',
        publishedAt: hoursAgo(1),
        contentHtml: 'In progress - Scheduled maintenance is currently in progress.',
      }),
    ]);
    expect(s.statusTone).toBe('maintenance');
    expect(s.scheduledMaintenance.length).toBeGreaterThan(0);
    expect(s.activeIncidents).toHaveLength(0);
  });

  it('filters out "no incidents reported" messages', () => {
    const s = build([
      raw({ title: 'No incidents reported', publishedAt: hoursAgo(1) }),
      raw({ title: 'All Systems Operational', publishedAt: hoursAgo(2) }),
    ]);
    expect(s.statusTone).toBe('operational');
    expect(s.recentIncidents).toHaveLength(0);
  });

  it('marks fetch errors as unknown without crashing', () => {
    const s = buildServiceStatus({ config, fetchError: 'timeout' }, NOW, thresholds);
    expect(s.isFetchError).toBe(true);
    expect(s.statusTone).toBe('unknown');
    expect(s.fetchErrorMessage).toBe('timeout');
  });

  it('deduplicates identical incidents', () => {
    const dup = raw({
      title: 'Dup',
      sourceId: 'x',
      publishedAt: hoursAgo(5),
      contentHtml: 'Resolved',
    });
    const s = build([dup, { ...dup }]);
    const ids = [...s.recentIncidents, ...s.activeIncidents].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

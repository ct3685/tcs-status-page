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

  it('is degraded (yellow) for a recent resolved incident within 24h', () => {
    const s = build([
      raw({ title: 'API latency', publishedAt: hoursAgo(10), contentHtml: 'Resolved - back to normal' }),
    ]);
    expect(s.statusTone).toBe('degraded');
    expect(s.recentIncidents.length).toBeGreaterThan(0);
  });

  it('is outage (red) for a very recent incident within 3h', () => {
    const s = build([
      raw({ title: 'Errors', publishedAt: hoursAgo(2), contentHtml: 'Resolved - mitigated' }),
    ]);
    expect(s.statusTone).toBe('outage');
  });

  it('is outage with active incident for an unresolved major outage', () => {
    const s = build([
      raw({ title: 'Major outage in production', publishedAt: hoursAgo(1), contentHtml: 'Investigating' }),
    ]);
    expect(s.statusTone).toBe('outage');
    expect(s.currentStatus).toBe('majorOutage');
    expect(s.activeIncidents).toHaveLength(1);
  });

  it('surfaces current maintenance separately (blue) without treating it as an incident', () => {
    const s = build([
      raw({ title: 'Scheduled maintenance', publishedAt: hoursAgo(1), contentHtml: 'Maintenance in progress' }),
    ]);
    expect(s.statusTone).toBe('maintenance');
    expect(s.scheduledMaintenance.length).toBeGreaterThan(0);
    expect(s.activeIncidents).toHaveLength(0);
    expect(s.recentIncidents).toHaveLength(0);
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
    const dup = raw({ title: 'Dup', sourceId: 'x', publishedAt: hoursAgo(5), contentHtml: 'Resolved' });
    const s = build([dup, { ...dup }]);
    const ids = [...s.recentIncidents, ...s.activeIncidents].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

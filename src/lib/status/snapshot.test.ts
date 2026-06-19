import { describe, expect, it } from 'vitest';
import { buildSnapshot } from './snapshot';
import type { ServiceConfig } from './types';

const NOW = new Date('2026-01-01T12:00:00.000Z');

function cfg(partial: Partial<ServiceConfig> & { slug: string; name: string }): ServiceConfig {
  return {
    id: partial.slug,
    feedType: 'manualOnly',
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
    ...partial,
  };
}

describe('buildSnapshot', () => {
  it('builds from manual incidents without network access', async () => {
    const snapshot = await buildSnapshot({
      now: NOW,
      source: 'on-demand',
      services: [cfg({ slug: 'alpha', name: 'Alpha' })],
      manualIncidentsBySlug: {
        alpha: [
          {
            id: 'm1',
            title: 'Active outage',
            status: 'investigating',
            severity: 'majorOutage',
            startTime: new Date(NOW.getTime() - 3600_000).toISOString(),
          },
        ],
      },
    });

    expect(snapshot.services).toHaveLength(1);
    const alpha = snapshot.services[0]!;
    expect(alpha.statusTone).toBe('outage');
    expect(alpha.activeIncidents).toHaveLength(1);
    expect(snapshot.summary.outage).toBe(1);
    expect(snapshot.summary.hasActiveProblems).toBe(true);
    expect(snapshot.nextRefreshAt).toBe('2026-01-01T12:03:00.000Z');
  });

  it('isolates a bad feed host as a fetch error (one bad service does not break others)', async () => {
    const snapshot = await buildSnapshot({
      now: NOW,
      services: [
        cfg({ slug: 'good', name: 'Good' }),
        cfg({
          slug: 'bad',
          name: 'Bad',
          feedType: 'rss',
          feedUrl: 'https://evil.not-allowed.example.com/feed.rss',
        }),
      ],
    });

    const bad = snapshot.services.find((s) => s.slug === 'bad')!;
    const good = snapshot.services.find((s) => s.slug === 'good')!;
    expect(bad.isFetchError).toBe(true);
    expect(bad.statusTone).toBe('unknown');
    expect(good.isFetchError).toBe(false);
    expect(snapshot.errors).toHaveLength(1);
    expect(snapshot.summary.unknown).toBe(1);
  });

  it('excludes disabled and hidden services from the snapshot', async () => {
    const snapshot = await buildSnapshot({
      now: NOW,
      services: [
        cfg({ slug: 'a', name: 'A' }),
        cfg({ slug: 'b', name: 'B', enabled: false }),
        cfg({ slug: 'c', name: 'C', hidden: true }),
      ],
    });
    expect(snapshot.services.map((s) => s.slug)).toEqual(['a']);
  });
});

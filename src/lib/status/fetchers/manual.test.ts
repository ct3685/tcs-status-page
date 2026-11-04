import { describe, expect, it } from 'vitest';
import { thresholds } from '../config';
import { normalizeManualIncident } from './manual';

const NOW = new Date('2026-01-01T12:00:00.000Z');

describe('normalizeManualIncident', () => {
  it('keeps an unresolved incident active and strips unsafe html', () => {
    const incident = normalizeManualIncident(
      {
        id: 'inc-1',
        title: 'Database down',
        status: 'investigating',
        severity: 'majorOutage',
        startTime: '2026-01-01T11:00:00.000Z',
        bodyHtml: '<p>Investigating</p><script>alert(1)</script>',
        externalLink: 'https://status.example/inc-1',
      },
      'netlify',
      NOW,
      thresholds,
    );

    expect(incident.type).toBe('incident');
    expect(incident.isActive).toBe(true);
    expect(incident.isResolved).toBe(false);
    expect(incident.isCurrentMaintenance).toBe(false);
    expect(incident.summary).toBe('Investigating');
    expect(incident.contentHtmlSanitized).toContain('Investigating');
    expect(incident.contentHtmlSanitized).not.toContain('script');
    expect(incident.url).toBe('https://status.example/inc-1');
    expect(incident.startedAt).toBe('2026-01-01T11:00:00.000Z');
  });

  it('marks a resolved incident inactive', () => {
    const incident = normalizeManualIncident(
      {
        id: 'inc-2',
        title: 'Recovered',
        status: 'resolved',
        severity: 'degraded',
        startTime: '2026-01-01T10:00:00.000Z',
        endTime: '2026-01-01T11:30:00.000Z',
      },
      'netlify',
      NOW,
      thresholds,
    );

    expect(incident.isResolved).toBe(true);
    expect(incident.isActive).toBe(false);
    expect(incident.resolvedAt).toBe('2026-01-01T11:30:00.000Z');
  });

  it('treats a future scheduled window as upcoming maintenance', () => {
    const incident = normalizeManualIncident(
      {
        id: 'mnt-1',
        title: 'Database upgrade',
        status: 'scheduled',
        severity: 'maintenance',
        scheduledStart: '2026-01-01T18:00:00.000Z',
        scheduledEnd: '2026-01-01T19:00:00.000Z',
      },
      'github',
      NOW,
      thresholds,
    );

    expect(incident.type).toBe('maintenance');
    expect(incident.isFutureMaintenance).toBe(true);
    expect(incident.isCurrentMaintenance).toBe(false);
    expect(incident.isActive).toBe(false);
  });

  it('treats an open maintenance window as current', () => {
    const incident = normalizeManualIncident(
      {
        id: 'mnt-2',
        title: 'Network maintenance',
        status: 'inProgress',
        severity: 'maintenance',
        startTime: '2026-01-01T11:00:00.000Z',
        endTime: '2026-01-01T13:00:00.000Z',
      },
      'github',
      NOW,
      thresholds,
    );

    expect(incident.isCurrentMaintenance).toBe(true);
    expect(incident.isActive).toBe(true);
    expect(incident.isResolved).toBe(false);
  });

  it('uses the current time when a manual incident has no start', () => {
    const incident = normalizeManualIncident(
      {
        id: 'inc-3',
        title: 'Undated',
        status: 'identified',
        severity: 'degraded',
      },
      'slack',
      NOW,
      thresholds,
    );

    expect(incident.startedAt).toBe(NOW.toISOString());
    expect(incident.publishedAt).toBe(NOW.toISOString());
  });
});

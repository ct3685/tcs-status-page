import { describe, expect, it } from 'vitest';
import {
  computeRecency,
  detectIncidentType,
  deriveIncidentStatus,
  isManualOverrideActive,
  isNoIncidentTitle,
  maintenanceTiming,
  parseDate,
  severityFromText,
  stableIncidentId,
  toneFromLevel,
  worstSeverity,
} from './classify';
import { thresholds } from './config';

const NOW = new Date('2026-01-01T12:00:00.000Z');

describe('isNoIncidentTitle', () => {
  it('matches operational messages', () => {
    expect(isNoIncidentTitle('No incidents reported')).toBe(true);
    expect(isNoIncidentTitle('All Systems Operational')).toBe(true);
    expect(isNoIncidentTitle('Operating Normally')).toBe(true);
  });
  it('does not match real incidents', () => {
    expect(isNoIncidentTitle('API latency increased')).toBe(false);
  });
});

describe('detectIncidentType', () => {
  it('detects maintenance from title', () => {
    expect(detectIncidentType('Scheduled Maintenance window', '')).toBe('maintenance');
    expect(detectIncidentType('Database maintenance', '')).toBe('maintenance');
  });
  it('detects informational/no-incident', () => {
    expect(detectIncidentType('No incidents reported', '')).toBe('informational');
  });
  it('defaults to incident', () => {
    expect(detectIncidentType('Elevated error rates', 'We are investigating')).toBe('incident');
  });
  it('honors custom maintenance keywords', () => {
    expect(detectIncidentType('Patch rollout', 'planned upgrade', { maintenanceKeywords: ['planned upgrade'] })).toBe(
      'maintenance',
    );
  });
});

describe('severityFromText', () => {
  it('maps major and partial outages', () => {
    expect(severityFromText('Major outage', '', 'incident')).toBe('majorOutage');
    expect(severityFromText('Partial outage in EU', '', 'incident')).toBe('partialOutage');
  });
  it('maps degraded', () => {
    expect(severityFromText('Degraded performance', '', 'incident')).toBe('degraded');
  });
  it('maintenance is maintenance', () => {
    expect(severityFromText('anything', '', 'maintenance')).toBe('maintenance');
  });
});

describe('computeRecency', () => {
  it('flags very recent within 3h', () => {
    const r = computeRecency(new Date(NOW.getTime() - 2 * 3600_000).toISOString(), NOW, thresholds);
    expect(r.isVeryRecent).toBe(true);
    expect(r.isRecent).toBe(true);
  });
  it('flags recent but not very recent within 24h', () => {
    const r = computeRecency(new Date(NOW.getTime() - 10 * 3600_000).toISOString(), NOW, thresholds);
    expect(r.isVeryRecent).toBe(false);
    expect(r.isRecent).toBe(true);
  });
  it('old incidents are neither', () => {
    const r = computeRecency(new Date(NOW.getTime() - 72 * 3600_000).toISOString(), NOW, thresholds);
    expect(r.isRecent).toBe(false);
  });
  it('future dates are neither', () => {
    const r = computeRecency(new Date(NOW.getTime() + 3600_000).toISOString(), NOW, thresholds);
    expect(r.isRecent).toBe(false);
    expect(r.isVeryRecent).toBe(false);
  });
});

describe('maintenanceTiming', () => {
  it('detects future maintenance', () => {
    const start = new Date(NOW.getTime() + 24 * 3600_000).toISOString();
    const t = maintenanceTiming(start, null, NOW);
    expect(t.isFutureMaintenance).toBe(true);
    expect(t.isCurrentMaintenance).toBe(false);
  });
  it('detects current maintenance within window', () => {
    const start = new Date(NOW.getTime() - 3600_000).toISOString();
    const end = new Date(NOW.getTime() + 3600_000).toISOString();
    const t = maintenanceTiming(start, end, NOW);
    expect(t.isCurrentMaintenance).toBe(true);
  });
});

describe('stableIncidentId', () => {
  it('is deterministic and slug-scoped', () => {
    const a = stableIncidentId('github', 'guid-1', '2026-01-01T00:00:00Z', 'Outage');
    const b = stableIncidentId('github', 'guid-1', '2026-01-01T00:00:00Z', 'Outage');
    const c = stableIncidentId('slack', 'guid-1', '2026-01-01T00:00:00Z', 'Outage');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a.startsWith('github-')).toBe(true);
  });
});

describe('helpers', () => {
  it('parseDate returns null on garbage', () => {
    expect(parseDate('not a date')).toBeNull();
    expect(parseDate('')).toBeNull();
    expect(parseDate('2026-01-01')).toBe('2026-01-01T00:00:00.000Z');
  });
  it('worstSeverity picks the worst', () => {
    expect(worstSeverity(['degraded', 'majorOutage', 'operational'])).toBe('majorOutage');
  });
  it('toneFromLevel maps outage tones', () => {
    expect(toneFromLevel('majorOutage')).toBe('outage');
    expect(toneFromLevel('partialOutage')).toBe('outage');
    expect(toneFromLevel('maintenance')).toBe('maintenance');
  });
  it('deriveIncidentStatus reads lifecycle words', () => {
    expect(deriveIncidentStatus('x', 'Resolved - all good', 'incident')).toBe('resolved');
    expect(deriveIncidentStatus('x', 'We are investigating', 'incident')).toBe('investigating');
  });
  it('isManualOverrideActive respects expiry', () => {
    expect(isManualOverrideActive(new Date(NOW.getTime() + 3600_000).toISOString(), NOW)).toBe(true);
    expect(isManualOverrideActive(new Date(NOW.getTime() - 3600_000).toISOString(), NOW)).toBe(false);
    expect(isManualOverrideActive(null, NOW)).toBe(false);
  });
});

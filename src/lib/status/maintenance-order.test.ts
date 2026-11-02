import { describe, expect, it } from 'vitest';
import { compareScheduledMaintenance } from './maintenance-order';

function window(
  iso: string,
  isCurrentMaintenance = false,
): { startedAt: string; publishedAt: string; isCurrentMaintenance: boolean } {
  return { startedAt: iso, publishedAt: iso, isCurrentMaintenance };
}

describe('compareScheduledMaintenance', () => {
  it('orders upcoming windows soonest first', () => {
    const items = [
      window('2026-11-11T05:00:00.000Z'),
      window('2026-11-04T20:00:00.000Z'),
      window('2026-11-04T22:00:00.000Z'),
      window('2026-11-09T05:00:00.000Z'),
    ];
    const ordered = [...items].sort(compareScheduledMaintenance).map((item) => item.startedAt);
    expect(ordered).toEqual([
      '2026-11-04T20:00:00.000Z',
      '2026-11-04T22:00:00.000Z',
      '2026-11-09T05:00:00.000Z',
      '2026-11-11T05:00:00.000Z',
    ]);
  });

  it('keeps an in-progress window above later scheduled windows', () => {
    const items = [window('2026-11-11T05:00:00.000Z'), window('2026-11-02T15:00:00.000Z', true)];
    const ordered = [...items].sort(compareScheduledMaintenance);
    expect(ordered[0]?.isCurrentMaintenance).toBe(true);
    expect(ordered[1]?.startedAt).toBe('2026-11-11T05:00:00.000Z');
  });

  it('falls back to publishedAt when the window start is missing', () => {
    const earlier = {
      startedAt: null,
      publishedAt: '2026-11-04T16:00:00.000Z',
      isCurrentMaintenance: false,
    };
    const later = window('2026-11-05T06:00:00.000Z');
    expect(compareScheduledMaintenance(earlier, later)).toBeLessThan(0);
  });
});

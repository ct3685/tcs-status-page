import { beforeEach, describe, expect, it, vi } from 'vitest';

const refreshStatusSnapshot = vi.hoisted(() => vi.fn());
const snapshotAgeSeconds = vi.hoisted(() => vi.fn(() => 4));

vi.mock('@/lib/status/cache', () => ({
  refreshStatusSnapshot,
  snapshotAgeSeconds,
}));

import handler from '../../../netlify/functions/update-status';

describe('scheduled status update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the refreshed snapshot summary', async () => {
    refreshStatusSnapshot.mockResolvedValue({
      generatedAt: '2026-01-01T12:00:00.000Z',
      services: [{ slug: 'netlify' }, { slug: 'github' }],
      errors: [],
    });

    const res = await handler();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      generatedAt: '2026-01-01T12:00:00.000Z',
      ageSeconds: 4,
      services: 2,
      errors: 0,
    });
    expect(refreshStatusSnapshot).toHaveBeenCalledWith('scheduled');
  });

  it('returns 500 when the refresh fails', async () => {
    refreshStatusSnapshot.mockRejectedValue(new Error('blob write failed'));

    const res = await handler();
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'blob write failed' });
  });
});

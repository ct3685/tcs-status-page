import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/env', () => ({ serverEnv: vi.fn() }));
vi.mock('@/lib/status/cache', () => ({
  getStatusSnapshot: vi.fn(),
  refreshStatusSnapshot: vi.fn(),
  snapshotAgeSeconds: vi.fn(() => 42),
}));

import { serverEnv } from '@/lib/env';
import { getStatusSnapshot, refreshStatusSnapshot } from '@/lib/status/cache';
import { GET } from '../../../app/api/status/route';
import { POST } from '../../../app/api/revalidate/route';

const serverEnvMock = vi.mocked(serverEnv);
const getStatusSnapshotMock = vi.mocked(getStatusSnapshot);
const refreshMock = vi.mocked(refreshStatusSnapshot);

type ServerEnv = ReturnType<typeof serverEnv>;
const withSecret = (secret?: string) => ({ SANITY_REVALIDATE_SECRET: secret }) as ServerEnv;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/status', () => {
  it('returns the snapshot with health headers', async () => {
    getStatusSnapshotMock.mockResolvedValue({
      generatedAt: '2026-01-01T00:00:00.000Z',
      stale: false,
    } as Awaited<ReturnType<typeof getStatusSnapshot>>);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Snapshot-Stale')).toBe('false');
    expect(res.headers.get('X-Snapshot-Age-Seconds')).toBe('42');
    expect(res.headers.get('X-Snapshot-Generated-At')).toBe('2026-01-01T00:00:00.000Z');
    const body = await res.json();
    expect(body.generatedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('returns 503 when the snapshot cannot be produced', async () => {
    getStatusSnapshotMock.mockRejectedValue(new Error('boom'));
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });
});

describe('POST /api/revalidate', () => {
  function post(opts: { headerSecret?: string; querySecret?: string } = {}) {
    const url = opts.querySecret
      ? `https://status.test/api/revalidate?secret=${opts.querySecret}`
      : 'https://status.test/api/revalidate';
    const headers = new Headers();
    if (opts.headerSecret) headers.set('x-revalidate-secret', opts.headerSecret);
    return POST(new Request(url, { method: 'POST', headers }));
  }

  it('returns 503 when no secret is configured', async () => {
    serverEnvMock.mockReturnValue(withSecret(undefined));
    expect((await post({ headerSecret: 'anything' })).status).toBe(503);
  });

  it('returns 401 for a wrong header secret', async () => {
    serverEnvMock.mockReturnValue(withSecret('topsecret'));
    expect((await post({ headerSecret: 'nope' })).status).toBe(401);
  });

  it('ignores a secret supplied via query string', async () => {
    serverEnvMock.mockReturnValue(withSecret('topsecret'));
    const res = await post({ querySecret: 'topsecret' });
    expect(res.status).toBe(401);
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('refreshes on a correct header secret', async () => {
    serverEnvMock.mockReturnValue(withSecret('topsecret'));
    refreshMock.mockResolvedValue(
      {} as Awaited<ReturnType<typeof refreshStatusSnapshot>>,
    );
    const res = await post({ headerSecret: 'topsecret' });
    expect(res.status).toBe(200);
    expect(refreshMock).toHaveBeenCalledWith('on-demand');
  });

  it('returns 500 when the refresh fails', async () => {
    serverEnvMock.mockReturnValue(withSecret('topsecret'));
    refreshMock.mockRejectedValue(new Error('blob down'));
    const res = await post({ headerSecret: 'topsecret' });
    expect(res.status).toBe(500);
  });
});

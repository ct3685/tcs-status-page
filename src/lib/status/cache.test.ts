import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StatusSnapshot } from './types';

const store = vi.hoisted(() => ({
  get: vi.fn(),
  setJSON: vi.fn(),
}));

const loaders = vi.hoisted(() => ({
  loadServiceConfigs: vi.fn(async () => []),
  loadManualIncidents: vi.fn(async () => ({})),
}));

vi.mock('@netlify/blobs', () => ({
  getStore: () => store,
}));

vi.mock('./source', () => loaders);

import {
  getStatusSnapshot,
  isSnapshotStale,
  readSnapshotBlob,
  refreshStatusSnapshot,
  snapshotAgeSeconds,
} from './cache';

function snapshot(partial: Partial<StatusSnapshot> = {}): StatusSnapshot {
  return {
    generatedAt: '2026-01-01T12:00:00.000Z',
    source: 'scheduled',
    stale: false,
    nextRefreshAt: '2026-01-01T12:03:00.000Z',
    services: [],
    summary: {
      total: 0,
      operational: 0,
      degraded: 0,
      outage: 0,
      maintenance: 0,
      unknown: 0,
      hasActiveProblems: false,
      activeIncidentCount: 0,
      scheduledMaintenanceCount: 0,
    },
    errors: [],
    ...partial,
  };
}

const GENERATED = Date.parse('2026-01-01T12:00:00.000Z');

describe('snapshot freshness', () => {
  it('is stale only after nextRefreshAt', () => {
    const cached = snapshot();
    expect(isSnapshotStale(cached, Date.parse(cached.nextRefreshAt))).toBe(false);
    expect(isSnapshotStale(cached, Date.parse(cached.nextRefreshAt) + 1)).toBe(true);
  });

  it('reports age in whole seconds and never negative', () => {
    const cached = snapshot();
    expect(snapshotAgeSeconds(cached, GENERATED + 10_500)).toBe(10);
    expect(snapshotAgeSeconds(cached, GENERATED - 5_000)).toBe(0);
  });
});

describe('blob snapshot access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads a json snapshot from the status store', async () => {
    const cached = snapshot();
    store.get.mockResolvedValue(cached);

    await expect(readSnapshotBlob()).resolves.toBe(cached);
    expect(store.get).toHaveBeenCalledWith('snapshot.json', { type: 'json' });
  });

  it('returns null when the blob read throws', async () => {
    store.get.mockRejectedValue(new Error('blob down'));
    await expect(readSnapshotBlob()).resolves.toBeNull();
  });

  it('serves a fresh cached snapshot without recomputing', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(GENERATED);
    store.get.mockResolvedValue(snapshot());

    const result = await getStatusSnapshot();
    expect(result.stale).toBe(false);
    expect(result.source).toBe('scheduled');
    expect(loaders.loadServiceConfigs).not.toHaveBeenCalled();
    expect(store.setJSON).not.toHaveBeenCalled();
  });

  it('marks an expired cached snapshot stale and still serves it', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-01-01T13:00:00.000Z'));
    store.get.mockResolvedValue(snapshot());

    const result = await getStatusSnapshot();
    expect(result.stale).toBe(true);
    expect(loaders.loadServiceConfigs).not.toHaveBeenCalled();
  });

  it('computes and persists a fallback snapshot when no blob exists', async () => {
    store.get.mockResolvedValue(null);

    const result = await getStatusSnapshot();
    expect(result.source).toBe('fallback');
    expect(result.services).toEqual([]);
    expect(store.setJSON).toHaveBeenCalledWith('snapshot.json', result);
  });

  it('still returns the fallback snapshot when the blob write fails', async () => {
    store.get.mockResolvedValue(null);
    store.setJSON.mockRejectedValue(new Error('write failed'));

    const result = await getStatusSnapshot();
    expect(result.source).toBe('fallback');
  });

  it('propagates a write failure from an explicit refresh', async () => {
    store.setJSON.mockRejectedValue(new Error('write failed'));
    await expect(refreshStatusSnapshot('scheduled')).rejects.toThrow('write failed');
  });
});

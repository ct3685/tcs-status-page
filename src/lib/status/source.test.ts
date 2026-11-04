import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServiceConfig } from './types';

const fetchSanityServices = vi.hoisted(() => vi.fn());
const fetchSanityManualIncidents = vi.hoisted(() => vi.fn());

vi.mock('../sanity/queries', () => ({
  fetchSanityServices,
  fetchSanityManualIncidents,
}));

const sanityConfigured = vi.hoisted(() => ({ value: false }));

vi.mock('../env', () => ({
  get isSanityConfigured() {
    return sanityConfigured.value;
  },
}));

import { SEED_SERVICES } from './config';
import { loadManualIncidents, loadServiceConfigs } from './source';

const sanityService = {
  id: 'sanity-netlify',
  slug: 'netlify',
  name: 'Netlify',
  feedType: 'rss',
  enabled: true,
  hidden: false,
  pinned: false,
  criticality: 'high',
  order: 1,
  tags: [],
  ignoreTitlePatterns: [],
  maintenanceKeywords: [],
  incidentKeywords: [],
  noIncidentPatterns: [],
} satisfies ServiceConfig;

describe('status source fallbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sanityConfigured.value = false;
  });

  it('uses the seed list and no manual incidents when Sanity is unconfigured', async () => {
    await expect(loadServiceConfigs()).resolves.toBe(SEED_SERVICES);
    await expect(loadManualIncidents()).resolves.toEqual({});
    expect(fetchSanityServices).not.toHaveBeenCalled();
    expect(fetchSanityManualIncidents).not.toHaveBeenCalled();
  });

  it('uses Sanity services when the project returns some', async () => {
    sanityConfigured.value = true;
    fetchSanityServices.mockResolvedValue([sanityService]);

    await expect(loadServiceConfigs()).resolves.toEqual([sanityService]);
  });

  it('falls back to the seed list when Sanity returns no services', async () => {
    sanityConfigured.value = true;
    fetchSanityServices.mockResolvedValue([]);

    await expect(loadServiceConfigs()).resolves.toBe(SEED_SERVICES);
  });

  it('falls back to the seed list when Sanity services throw', async () => {
    sanityConfigured.value = true;
    fetchSanityServices.mockRejectedValue(new Error('sanity down'));

    await expect(loadServiceConfigs()).resolves.toBe(SEED_SERVICES);
  });

  it('returns an empty incident map when Sanity incidents throw', async () => {
    sanityConfigured.value = true;
    fetchSanityManualIncidents.mockRejectedValue(new Error('sanity down'));

    await expect(loadManualIncidents()).resolves.toEqual({});
  });
});

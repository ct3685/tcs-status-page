import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchSanitySettings = vi.hoisted(() => vi.fn());
const sanityConfigured = vi.hoisted(() => ({ value: false }));

vi.mock('../sanity/queries', () => ({ fetchSanitySettings }));
vi.mock('../env', () => ({
  get isSanityConfigured() {
    return sanityConfigured.value;
  },
}));

import { DEFAULT_SETTINGS, loadSettings } from './settings';

describe('loadSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sanityConfigured.value = false;
  });

  it('returns defaults when Sanity is unconfigured', async () => {
    await expect(loadSettings()).resolves.toBe(DEFAULT_SETTINGS);
    expect(fetchSanitySettings).not.toHaveBeenCalled();
  });

  it('returns defaults when Sanity has no settings document', async () => {
    sanityConfigured.value = true;
    fetchSanitySettings.mockResolvedValue(null);

    await expect(loadSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it('overlays published settings and ignores null fields', async () => {
    sanityConfigured.value = true;
    fetchSanitySettings.mockResolvedValue({
      title: 'Custom status',
      subtitle: null,
      announcement: { enabled: true, message: 'Maintenance tonight', tone: 'warning' },
    });

    const settings = await loadSettings();
    expect(settings.title).toBe('Custom status');
    expect(settings.subtitle).toBe(DEFAULT_SETTINGS.subtitle);
    expect(settings.announcement).toEqual({
      enabled: true,
      message: 'Maintenance tonight',
      tone: 'warning',
    });
    expect(settings.indexable).toBe(true);
  });

  it('returns defaults when Sanity throws', async () => {
    sanityConfigured.value = true;
    fetchSanitySettings.mockRejectedValue(new Error('sanity down'));

    await expect(loadSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });
});

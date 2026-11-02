import { isSanityConfigured } from '../env';
import { fetchSanitySettings, type StatusPageSettings } from '../sanity/queries';

export const DEFAULT_SETTINGS = {
  title: 'TCS Repair Services Status',
  subtitle: 'A consolidated, real-time view of the services TCS Repair relies on.',
  seoTitle: 'TCS Repair Services Status',
  seoDescription:
    'A consolidated, real-time status view of the third-party services TCS Repair relies on — operational, degraded, outage, and maintenance states at a glance.',
  ogImage: null,
  indexable: true,
  displayMode: 'grid',
  announcement: null,
  supportCtaLabel: null,
  supportCtaUrl: null,
} satisfies StatusPageSettings;

/** Load page settings from Sanity, falling back to defaults on any failure. */
export async function loadSettings(): Promise<StatusPageSettings> {
  if (!isSanityConfigured) return DEFAULT_SETTINGS;
  try {
    const settings = await fetchSanitySettings();
    if (!settings) return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...Object.fromEntries(Object.entries(settings).filter(([, v]) => v != null)),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

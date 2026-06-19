import { isSanityConfigured } from '../env';
import { fetchSanitySettings, type StatusPageSettings } from '../sanity/queries';

export const DEFAULT_SETTINGS = {
  title: 'Last Rev Services Status',
  subtitle: 'A consolidated, real-time view of the various services the Last Rev team relies on.',
  seoTitle: 'Last Rev Services Status',
  seoDescription:
    'A consolidated, real-time status view of the various third-party services the Last Rev team relies on — operational, degraded, outage, and maintenance states at a glance.',
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

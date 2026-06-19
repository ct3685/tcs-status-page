import { SEED_SERVICES } from './config';
import type { ManualIncidentInput } from './fetchers/manual';
import type { ServiceConfig } from './types';
import { isSanityConfigured } from '../env';
import { fetchSanityManualIncidents, fetchSanityServices } from '../sanity/queries';

function logError(scope: string, err: unknown): void {
  console.warn(`[status:${scope}] ${err instanceof Error ? err.message : 'unknown error'}`);
}

/**
 * Load service configuration from Sanity when configured. Falls back to the
 * migrated seed list when Sanity is unconfigured, errors, or has no services
 * yet, so the page always renders.
 */
export async function loadServiceConfigs(): Promise<ServiceConfig[]> {
  if (!isSanityConfigured) return SEED_SERVICES;
  try {
    const services = await fetchSanityServices();
    return services.length > 0 ? services : SEED_SERVICES;
  } catch (err) {
    logError('sanity-services', err);
    return SEED_SERVICES;
  }
}

/** Published manual incidents/maintenance grouped by service slug. */
export async function loadManualIncidents(): Promise<Record<string, ManualIncidentInput[]>> {
  if (!isSanityConfigured) return {};
  try {
    return await fetchSanityManualIncidents();
  } catch (err) {
    logError('sanity-incidents', err);
    return {};
  }
}

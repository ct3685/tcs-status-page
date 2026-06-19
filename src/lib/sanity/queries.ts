import { sanityClient } from './client';
import type { ManualIncidentInput } from '../status/fetchers/manual';
import type {
  Criticality,
  FeedType,
  IncidentSeverity,
  IncidentStatus,
  ServiceConfig,
  ServiceStatusLevel,
} from '../status/types';

const SERVICES_QUERY = `*[_type == "statusService"]{
  _id,
  name,
  "slug": slug.current,
  shortDescription,
  "category": category->{name, "slug": slug.current},
  "logo": logo.asset->url,
  externalStatusPageUrl,
  feedType,
  feedUrl,
  enabled,
  hidden,
  pinned,
  criticality,
  order,
  tags,
  owner,
  fallbackStatus,
  timeoutMs,
  ignoreTitlePatterns,
  maintenanceKeywords,
  incidentKeywords,
  noIncidentPatterns,
  manualStatusOverride,
  manualOverrideExpiry
}`;

const SETTINGS_QUERY = `*[_type == "statusPageSettings"][0]{
  title,
  subtitle,
  seoTitle,
  seoDescription,
  "ogImage": ogImage.asset->url,
  indexable,
  displayMode,
  announcement,
  supportCtaLabel,
  supportCtaUrl
}`;

const MANUAL_INCIDENTS_QUERY = `*[_type == "manualIncident" && published == true]{
  _id,
  title,
  status,
  severity,
  startTime,
  endTime,
  scheduledStart,
  scheduledEnd,
  "bodyText": pt::text(body),
  externalLink,
  "serviceSlugs": affectedServices[]->slug.current
}`;

interface RawService {
  _id: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  category?: { name?: string; slug?: string } | null;
  logo?: string | null;
  externalStatusPageUrl?: string;
  feedType?: FeedType;
  feedUrl?: string;
  enabled?: boolean;
  hidden?: boolean;
  pinned?: boolean;
  criticality?: Criticality;
  order?: number;
  tags?: string[];
  owner?: string;
  fallbackStatus?: ServiceStatusLevel;
  timeoutMs?: number;
  ignoreTitlePatterns?: string[];
  maintenanceKeywords?: string[];
  incidentKeywords?: string[];
  noIncidentPatterns?: string[];
  manualStatusOverride?: ServiceStatusLevel;
  manualOverrideExpiry?: string;
}

interface RawManualIncident {
  _id: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startTime?: string;
  endTime?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  bodyText?: string;
  externalLink?: string;
  serviceSlugs?: string[];
}

function mapService(raw: RawService): ServiceConfig | null {
  if (!raw.slug || !raw.name) return null;
  return {
    id: raw._id,
    slug: raw.slug,
    name: raw.name,
    description: raw.shortDescription,
    category: raw.category?.name && raw.category.slug
      ? { name: raw.category.name, slug: raw.category.slug }
      : undefined,
    logo: raw.logo ?? undefined,
    externalStatusPageUrl: raw.externalStatusPageUrl,
    feedUrl: raw.feedUrl,
    feedType: raw.feedType ?? 'manualOnly',
    enabled: raw.enabled ?? true,
    hidden: raw.hidden ?? false,
    pinned: raw.pinned ?? false,
    criticality: raw.criticality ?? 'normal',
    order: raw.order ?? 100,
    tags: raw.tags ?? [],
    owner: raw.owner,
    fallbackStatus: raw.fallbackStatus,
    timeoutMs: raw.timeoutMs,
    ignoreTitlePatterns: raw.ignoreTitlePatterns ?? [],
    maintenanceKeywords: raw.maintenanceKeywords ?? [],
    incidentKeywords: raw.incidentKeywords ?? [],
    noIncidentPatterns: raw.noIncidentPatterns ?? [],
    manualStatusOverride: raw.manualStatusOverride,
    manualOverrideExpiry: raw.manualOverrideExpiry,
  };
}

export interface StatusPageSettings {
  title: string;
  subtitle: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  indexable: boolean;
  displayMode: 'grid' | 'compact';
  announcement: { enabled?: boolean; message?: string; tone?: 'info' | 'warning' | 'critical' } | null;
  supportCtaLabel: string | null;
  supportCtaUrl: string | null;
}

export async function fetchSanitySettings(): Promise<StatusPageSettings | null> {
  return sanityClient.fetch<StatusPageSettings | null>(SETTINGS_QUERY);
}

export async function fetchSanityServices(): Promise<ServiceConfig[]> {
  const raw = await sanityClient.fetch<RawService[]>(SERVICES_QUERY);
  return raw.map(mapService).filter((s): s is ServiceConfig => s !== null);
}

export async function fetchSanityManualIncidents(): Promise<Record<string, ManualIncidentInput[]>> {
  const raw = await sanityClient.fetch<RawManualIncident[]>(MANUAL_INCIDENTS_QUERY);
  const bySlug: Record<string, ManualIncidentInput[]> = {};
  for (const incident of raw) {
    const input: ManualIncidentInput = {
      id: incident._id,
      title: incident.title,
      status: incident.status,
      severity: incident.severity,
      startTime: incident.startTime ?? null,
      endTime: incident.endTime ?? null,
      scheduledStart: incident.scheduledStart ?? null,
      scheduledEnd: incident.scheduledEnd ?? null,
      bodyHtml: incident.bodyText ?? null,
      externalLink: incident.externalLink ?? null,
    };
    for (const slug of incident.serviceSlugs ?? []) {
      (bySlug[slug] ??= []).push(input);
    }
  }
  return bySlug;
}

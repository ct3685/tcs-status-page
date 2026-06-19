import { z } from 'zod';
import type { RawFeedItem } from './rss';

const herokuUpdate = z.object({
  contents: z.string().optional(),
  update_type: z.string().optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
});

const herokuIncident = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  status: z.string().optional(),
  full_url: z.string().optional(),
  updates: z.array(herokuUpdate).optional(),
});

// The endpoint may return a bare array or an { incidents: [] } envelope.
const herokuPayload = z.union([
  z.array(herokuIncident),
  z.object({ incidents: z.array(herokuIncident) }),
]);

export class HerokuParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HerokuParseError';
  }
}

export function parseHerokuIncidents(jsonText: string): RawFeedItem[] {
  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch (err) {
    throw new HerokuParseError(err instanceof Error ? err.message : 'Invalid Heroku JSON');
  }

  const parsed = herokuPayload.safeParse(data);
  if (!parsed.success) {
    throw new HerokuParseError('Unexpected Heroku API shape');
  }
  const incidents = Array.isArray(parsed.data) ? parsed.data : parsed.data.incidents;

  return incidents.map((incident) => {
    const updates = incident.updates ?? [];
    const contentHtml = updates
      .map((u) => {
        const label = u.update_type ?? u.status ?? 'update';
        return `<p><strong>${label}</strong> ${u.contents ?? ''}</p>`;
      })
      .join('');
    return {
      sourceId: String(incident.id),
      title: incident.title ?? 'Heroku incident',
      link: incident.full_url ?? null,
      contentHtml: contentHtml || `<p>${incident.status ?? ''}</p>`,
      publishedAt: incident.created_at ?? null,
      updatedAt: incident.updated_at ?? null,
    } satisfies RawFeedItem;
  });
}

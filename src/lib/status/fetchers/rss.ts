import { XMLParser } from 'fast-xml-parser';

export interface RawFeedItem {
  sourceId: string;
  title: string;
  link: string | null;
  contentHtml: string;
  publishedAt: string | null;
  updatedAt: string | null;
}

export interface ParsedFeed {
  items: RawFeedItem[];
}

export class FeedParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeedParseError';
  }
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
  // Keep item/entry as arrays even when a single element is present.
  // (Atom <link> handled via asArray so RSS string links stay intact.)
  isArray: (name) => name === 'item' || name === 'entry',
});

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** Extract text from a node that may be a string, number, or { #text, @_* } object. */
function text(node: unknown): string {
  if (node === undefined || node === null) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    if ('#text' in obj) return text(obj['#text']);
    if ('@_href' in obj) return text(obj['@_href']);
  }
  return '';
}

/** Atom links can be an array with rel attributes; prefer the alternate/self html link. */
function atomLink(links: unknown): string | null {
  const arr = asArray(links as Record<string, unknown>);
  if (arr.length === 0) return null;
  const preferred =
    arr.find((l) => (l as Record<string, unknown>)['@_rel'] === 'alternate') ??
    arr.find((l) => !(l as Record<string, unknown>)['@_rel']) ??
    arr[0];
  const href = text(preferred);
  return href || null;
}

export function parseRssFeed(xml: string): ParsedFeed {
  if (!xml || !xml.trim()) {
    throw new FeedParseError('Empty feed body');
  }

  let doc: Record<string, unknown>;
  try {
    doc = parser.parse(xml) as Record<string, unknown>;
  } catch (err) {
    throw new FeedParseError(err instanceof Error ? err.message : 'Unable to parse feed XML');
  }

  const rss = doc.rss as Record<string, unknown> | undefined;
  const channel = rss?.channel as Record<string, unknown> | undefined;
  const feed = doc.feed as Record<string, unknown> | undefined;

  if (!channel && !feed) {
    throw new FeedParseError('Feed is neither RSS channel nor Atom feed');
  }

  const items: RawFeedItem[] = [];

  // RSS 2.0
  for (const raw of asArray(channel?.item as unknown)) {
    const item = raw as Record<string, unknown>;
    const title = text(item.title) || 'Untitled';
    const link = text(item.link) || null;
    const guid = text(item.guid) || link || `${title}-${text(item.pubDate)}`;
    const contentHtml =
      text(item['content:encoded']) || text(item.description) || text(item.summary) || '';
    items.push({
      sourceId: guid,
      title,
      link,
      contentHtml,
      publishedAt: text(item.pubDate) || text(item.published) || null,
      updatedAt: text(item.updated) || null,
    });
  }

  // Atom
  for (const raw of asArray(feed?.entry as unknown)) {
    const entry = raw as Record<string, unknown>;
    const title = text(entry.title) || 'Untitled';
    const link = atomLink(entry.link);
    const id = text(entry.id) || link || `${title}-${text(entry.updated)}`;
    const contentHtml = text(entry.content) || text(entry.summary) || '';
    items.push({
      sourceId: id,
      title,
      link,
      contentHtml,
      publishedAt: text(entry.published) || text(entry.updated) || null,
      updatedAt: text(entry.updated) || null,
    });
  }

  return { items };
}

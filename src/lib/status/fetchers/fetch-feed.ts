import { FEED_HOST_ALLOWLIST, thresholds } from '../config';
import { serverEnv } from '../../env';

export class FeedFetchError extends Error {
  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'FeedFetchError';
  }
}

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

function isIpLiteral(hostname: string): boolean {
  // IPv6 literals arrive bracketed; bare IPv4 matches the regex.
  return hostname.includes(':') || IPV4.test(hostname);
}

function allowedHosts(): Set<string> {
  const extra = (serverEnv().ALLOWED_FEED_HOSTNAMES ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...FEED_HOST_ALLOWLIST.map((h) => h.toLowerCase()), ...extra]);
}

/**
 * Validate a feed URL before fetching. Defends against SSRF: HTTPS only, no IP
 * literals / localhost, and the hostname must be on the allowlist.
 */
export function validateFeedUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new FeedFetchError(`Invalid feed URL: ${rawUrl}`);
  }
  if (url.protocol !== 'https:') {
    throw new FeedFetchError(`Feed URL must be HTTPS: ${rawUrl}`);
  }
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new FeedFetchError(`Blocked hostname: ${host}`);
  }
  if (isIpLiteral(host)) {
    throw new FeedFetchError(`IP-literal feed URLs are not allowed: ${host}`);
  }
  if (!allowedHosts().has(host)) {
    throw new FeedFetchError(`Hostname not in feed allowlist: ${host}`);
  }
  return url;
}

export interface FetchTextOptions {
  timeoutMs?: number;
  maxBytes?: number;
  accept?: string;
}

/** Fetch text with an abort timeout and a hard response-size cap. */
export async function fetchFeedText(
  rawUrl: string,
  options: FetchTextOptions = {},
): Promise<string> {
  const url = validateFeedUrl(rawUrl);
  const timeoutMs = options.timeoutMs ?? thresholds.defaultTimeoutMs;
  const maxBytes = options.maxBytes ?? thresholds.maxResponseBytes;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        accept:
          options.accept ??
          'application/rss+xml, application/atom+xml, application/xml, text/xml, application/json;q=0.9, */*;q=0.5',
        'user-agent': 'LastRevStatusBot/2.0 (+https://status.lastrev.com)',
      },
    });

    if (!res.ok) {
      throw new FeedFetchError(`Upstream responded ${res.status}`);
    }
    if (!res.body) {
      const text = await res.text();
      if (text.length > maxBytes) throw new FeedFetchError('Response exceeded size limit');
      return text;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let total = 0;
    let out = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new FeedFetchError('Response exceeded size limit');
      }
      out += decoder.decode(value, { stream: true });
    }
    out += decoder.decode();
    return out;
  } catch (err) {
    if (err instanceof FeedFetchError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new FeedFetchError(`Feed request timed out after ${timeoutMs}ms`, err);
    }
    throw new FeedFetchError(err instanceof Error ? err.message : 'Unknown fetch error', err);
  } finally {
    clearTimeout(timer);
  }
}

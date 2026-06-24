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

function isNumericLabel(label: string): boolean {
  // Decimal (127, 2130706433), hex (0x7f), or octal (0177) octet forms.
  return /^0x[0-9a-f]+$/i.test(label) || /^[0-9]+$/.test(label);
}

function isIpLiteral(hostname: string): boolean {
  // IPv6 literals contain a colon; canonical dotted-quad IPv4 matches the regex.
  if (hostname.includes(':') || IPV4.test(hostname)) return true;
  // Reject obfuscated IPv4 forms that resolve to an address but dodge the regex:
  // decimal (2130706433), hex (0x7f000001), octal (0177.0.0.1), and short
  // (127.1) notations. A legitimate DNS hostname has at least one label that
  // is not purely numeric/hex, so an all-numeric host is treated as an IP.
  const labels = hostname.split('.');
  return labels.every((label) => label.length > 0 && isNumericLabel(label));
}

const MAX_REDIRECTS = 3;

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

/** Read a response body as text, aborting once it exceeds maxBytes. */
async function readCappedText(res: Response, maxBytes: number): Promise<string> {
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
}

/**
 * Fetch text with an abort timeout and a hard response-size cap.
 *
 * Redirects are followed manually (redirect: 'manual') so each hop's target is
 * re-validated through validateFeedUrl. Without this, an allowlisted host could
 * 302 to a private/metadata address (e.g. 169.254.169.254) and bypass SSRF
 * controls that only ran against the original URL.
 */
export async function fetchFeedText(
  rawUrl: string,
  options: FetchTextOptions = {},
): Promise<string> {
  const timeoutMs = options.timeoutMs ?? thresholds.defaultTimeoutMs;
  const maxBytes = options.maxBytes ?? thresholds.maxResponseBytes;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let url = validateFeedUrl(rawUrl);
    let redirects = 0;

    for (;;) {
      const res = await fetch(url, {
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          accept:
            options.accept ??
            'application/rss+xml, application/atom+xml, application/xml, text/xml, application/json;q=0.9, */*;q=0.5',
          'user-agent': 'LastRevStatusBot/2.0 (+https://status.lastrev.com)',
        },
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (!location) {
          throw new FeedFetchError(`Redirect (${res.status}) without a Location header`);
        }
        if (redirects >= MAX_REDIRECTS) {
          throw new FeedFetchError(`Too many redirects (> ${MAX_REDIRECTS})`);
        }
        redirects += 1;
        // Resolve relative redirects against the current URL, then re-validate.
        const next = new URL(location, url).toString();
        url = validateFeedUrl(next);
        continue;
      }

      if (!res.ok) {
        throw new FeedFetchError(`Upstream responded ${res.status}`);
      }
      return await readCappedText(res, maxBytes);
    }
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

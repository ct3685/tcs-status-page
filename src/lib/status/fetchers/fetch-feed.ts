import { lookup } from 'node:dns/promises';
import type { LookupAddress } from 'node:dns';
import { thresholds } from '../config';

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
  // (127.1) notations. A legitimate DNS hostname has at least one label that is
  // not purely numeric/hex, so an all-numeric host is treated as an IP.
  const labels = hostname.split('.');
  return labels.every((label) => label.length > 0 && isNumericLabel(label));
}

/** True for an IPv4 address in any private, loopback, link-local, or reserved range. */
function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true; // malformed -> treat as unsafe
  }
  const [a, b] = parts as [number, number, number, number];
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking 198.18.0.0/15
  if (a >= 224) return true; // multicast + reserved
  return false;
}

/** True for an IP (v4 or v6) that must not be fetched (SSRF defense). */
function isPrivateAddress(ip: string): boolean {
  const addr = ip.toLowerCase();
  if (addr.includes(':')) {
    if (addr === '::1' || addr === '::') return true; // loopback / unspecified
    if (/^fe[89ab]/.test(addr)) return true; // link-local fe80::/10
    if (/^f[cd]/.test(addr)) return true; // unique-local fc00::/7
    if (addr.startsWith('ff')) return true; // multicast
    const mapped = addr.match(/(?:::ffff:)(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped?.[1]) return isPrivateIpv4(mapped[1]);
    return false;
  }
  return isPrivateIpv4(addr);
}

/**
 * Validate a feed URL before fetching. Feed URLs are configured by trusted admins
 * in Sanity, so there is no host allowlist to babysit; instead we block the
 * targets that actually matter for SSRF: non-HTTP(S) schemes, localhost/internal
 * hostnames, IP-literal URLs, and any hostname that resolves to a private,
 * loopback, link-local, or cloud-metadata address.
 */
export async function validateFeedUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new FeedFetchError(`Invalid feed URL: ${rawUrl}`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new FeedFetchError(`Feed URL must be http(s): ${rawUrl}`);
  }
  const host = url.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.localhost') ||
    host.endsWith('.internal')
  ) {
    throw new FeedFetchError(`Blocked hostname: ${host}`);
  }
  if (isIpLiteral(host)) {
    throw new FeedFetchError(`IP-literal feed URLs are not allowed: ${host}`);
  }

  // Resolve and reject if any address is private/reserved. This replaces the
  // static allowlist while still preventing access to internal/metadata hosts.
  let addresses: LookupAddress[];
  try {
    addresses = await lookup(host, { all: true });
  } catch {
    throw new FeedFetchError(`Could not resolve feed hostname: ${host}`);
  }
  if (addresses.length === 0) {
    throw new FeedFetchError(`Feed hostname did not resolve: ${host}`);
  }
  for (const { address } of addresses) {
    if (isPrivateAddress(address)) {
      throw new FeedFetchError(`Feed hostname resolves to a blocked address: ${host}`);
    }
  }
  return url;
}

const MAX_REDIRECTS = 5;

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
 * re-validated through validateFeedUrl. Without this, a host could 30x to a
 * private/metadata address and bypass the SSRF controls that ran on the
 * original URL. Providers commonly redirect through an http:// hop or to a new
 * hostname, so both are tolerated as long as each hop passes validation.
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
    let url = await validateFeedUrl(rawUrl);
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
        url = await validateFeedUrl(next);
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

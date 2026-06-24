import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedFetchError, fetchFeedText, validateFeedUrl } from './fetch-feed';

// An allowlisted host from FEED_HOST_ALLOWLIST, used as a safe origin in tests.
const ALLOWED = 'https://www.githubstatus.com/history.rss';
const ALLOWED2 = 'https://status.sentry.io/history.rss';

describe('validateFeedUrl', () => {
  it('requires HTTPS', () => {
    expect(() => validateFeedUrl('http://www.githubstatus.com/x')).toThrow(FeedFetchError);
  });

  it('rejects localhost and internal suffixes', () => {
    expect(() => validateFeedUrl('https://localhost/x')).toThrow(/Blocked hostname/);
    expect(() => validateFeedUrl('https://foo.local/x')).toThrow(/Blocked hostname/);
    expect(() => validateFeedUrl('https://foo.internal/x')).toThrow(/Blocked hostname/);
  });

  it('rejects dotted-quad and IPv6 literals', () => {
    expect(() => validateFeedUrl('https://1.2.3.4/x')).toThrow(/IP-literal|allowlist/);
    expect(() => validateFeedUrl('https://[::1]/x')).toThrow(FeedFetchError);
  });

  it('rejects obfuscated IPv4 forms (decimal, hex, short)', () => {
    // The WHATWG URL parser normalizes these to 127.0.0.1; either the IP-literal
    // guard or the allowlist must reject them — never allow them through.
    for (const url of [
      'https://2130706433/x', // decimal
      'https://0x7f000001/x', // hex
      'https://127.1/x', // short
    ]) {
      expect(() => validateFeedUrl(url)).toThrow(FeedFetchError);
    }
  });

  it('rejects hosts not on the allowlist', () => {
    expect(() => validateFeedUrl('https://evil.example.com/x')).toThrow(/allowlist/);
  });

  it('accepts an allowlisted HTTPS host', () => {
    expect(validateFeedUrl(ALLOWED).hostname).toBe('www.githubstatus.com');
  });
});

describe('fetchFeedText', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function redirect(location: string, status = 302): Response {
    return new Response(null, { status, headers: { location } });
  }

  it('returns the body for a 200 response', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<rss>ok</rss>', { status: 200 }));
    await expect(fetchFeedText(ALLOWED)).resolves.toContain('<rss>ok</rss>');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('uses manual redirect handling (does not delegate to fetch follow)', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<rss/>', { status: 200 }));
    await fetchFeedText(ALLOWED);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ redirect: 'manual' });
  });

  it('follows a redirect to another allowlisted host', async () => {
    fetchMock
      .mockResolvedValueOnce(redirect(ALLOWED2))
      .mockResolvedValueOnce(new Response('<rss>after</rss>', { status: 200 }));
    await expect(fetchFeedText(ALLOWED)).resolves.toContain('after');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('blocks a redirect to a private/metadata IP (SSRF)', async () => {
    fetchMock.mockResolvedValueOnce(redirect('https://169.254.169.254/latest/meta-data'));
    await expect(fetchFeedText(ALLOWED)).rejects.toThrow(FeedFetchError);
    // The metadata host is never actually fetched.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('blocks a redirect to a non-allowlisted host', async () => {
    fetchMock.mockResolvedValueOnce(redirect('https://evil.example.com/'));
    await expect(fetchFeedText(ALLOWED)).rejects.toThrow(/allowlist/);
  });

  it('rejects a redirect without a Location header', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 302 }));
    await expect(fetchFeedText(ALLOWED)).rejects.toThrow(/without a Location/);
  });

  it('caps the number of redirects', async () => {
    // Always redirect to an allowlisted host so only the hop count trips.
    fetchMock.mockImplementation(async () => redirect(ALLOWED2));
    await expect(fetchFeedText(ALLOWED)).rejects.toThrow(/Too many redirects/);
  });

  it('enforces the response size cap', async () => {
    const big = 'x'.repeat(5000);
    fetchMock.mockResolvedValueOnce(new Response(big, { status: 200 }));
    await expect(fetchFeedText(ALLOWED, { maxBytes: 1000 })).rejects.toThrow(/size limit/);
  });

  it('maps a non-OK upstream response to a FeedFetchError', async () => {
    fetchMock.mockResolvedValueOnce(new Response('nope', { status: 503 }));
    await expect(fetchFeedText(ALLOWED)).rejects.toThrow(/Upstream responded 503/);
  });

  it('maps an abort to a timeout error', async () => {
    fetchMock.mockImplementationOnce(async () => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      throw err;
    });
    await expect(fetchFeedText(ALLOWED, { timeoutMs: 5 })).rejects.toThrow(/timed out/);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:dns/promises', () => {
  const lookup = vi.fn();
  return { lookup, default: { lookup } };
});

import { lookup } from 'node:dns/promises';
import { FeedFetchError, fetchFeedText, validateFeedUrl } from './fetch-feed';

const lookupMock = vi.mocked(lookup);
const PUBLIC = [{ address: '93.184.216.34', family: 4 }];

beforeEach(() => {
  lookupMock.mockReset();
  // Default: hostnames resolve to a public address.
  lookupMock.mockResolvedValue(PUBLIC as never);
});

describe('validateFeedUrl', () => {
  it('rejects non-http(s) schemes', async () => {
    await expect(validateFeedUrl('ftp://example.com/x')).rejects.toThrow(/http\(s\)/);
  });

  it('allows both http and https public hosts', async () => {
    expect((await validateFeedUrl('https://status.example.com/x')).protocol).toBe('https:');
    expect((await validateFeedUrl('http://status.example.com/x')).protocol).toBe('http:');
  });

  it('rejects localhost and internal suffixes (before DNS)', async () => {
    await expect(validateFeedUrl('https://localhost/x')).rejects.toThrow(/Blocked hostname/);
    await expect(validateFeedUrl('https://foo.local/x')).rejects.toThrow(/Blocked hostname/);
    await expect(validateFeedUrl('https://foo.internal/x')).rejects.toThrow(/Blocked hostname/);
    expect(lookupMock).not.toHaveBeenCalled();
  });

  it('rejects IP-literal URLs including obfuscated IPv4 and IPv6', async () => {
    for (const url of [
      'https://1.2.3.4/x',
      'https://[::1]/x',
      'https://2130706433/x', // decimal -> 127.0.0.1
      'https://0x7f000001/x', // hex
      'https://127.1/x', // short
    ]) {
      await expect(validateFeedUrl(url)).rejects.toThrow(FeedFetchError);
    }
  });

  it('blocks hostnames that resolve to a private IPv4', async () => {
    lookupMock.mockResolvedValue([{ address: '10.0.0.5', family: 4 }] as never);
    await expect(validateFeedUrl('https://sneaky.example.com/x')).rejects.toThrow(
      /blocked address/,
    );
  });

  it('blocks hostnames that resolve to the cloud-metadata IP', async () => {
    lookupMock.mockResolvedValue([{ address: '169.254.169.254', family: 4 }] as never);
    await expect(validateFeedUrl('https://rebind.example.com/x')).rejects.toThrow(
      /blocked address/,
    );
  });

  it('blocks hostnames that resolve to private IPv6 (loopback/ULA/link-local)', async () => {
    for (const address of ['::1', 'fc00::1', 'fe80::1']) {
      lookupMock.mockResolvedValue([{ address, family: 6 }] as never);
      await expect(validateFeedUrl('https://v6.example.com/x')).rejects.toThrow(/blocked address/);
    }
  });

  it('blocks when any resolved address is private (multi-record)', async () => {
    lookupMock.mockResolvedValue([
      { address: '93.184.216.34', family: 4 },
      { address: '127.0.0.1', family: 4 },
    ] as never);
    await expect(validateFeedUrl('https://mixed.example.com/x')).rejects.toThrow(/blocked address/);
  });

  it('rejects an unresolvable hostname', async () => {
    lookupMock.mockRejectedValue(new Error('ENOTFOUND'));
    await expect(validateFeedUrl('https://does-not-exist.example/x')).rejects.toThrow(
      /Could not resolve/,
    );
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
    await expect(fetchFeedText('https://status.example.com/feed')).resolves.toContain(
      '<rss>ok</rss>',
    );
  });

  it('uses manual redirect handling', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<rss/>', { status: 200 }));
    await fetchFeedText('https://status.example.com/feed');
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ redirect: 'manual' });
  });

  it('follows a redirect through an http hop to a public host', async () => {
    fetchMock
      .mockResolvedValueOnce(redirect('http://www.example-status.com/feed'))
      .mockResolvedValueOnce(new Response('<rss>after</rss>', { status: 200 }));
    await expect(fetchFeedText('https://status.example.com/feed')).resolves.toContain('after');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('blocks a redirect to a private/metadata IP literal (SSRF)', async () => {
    fetchMock.mockResolvedValueOnce(redirect('https://169.254.169.254/latest/meta-data'));
    await expect(fetchFeedText('https://status.example.com/feed')).rejects.toThrow(FeedFetchError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('blocks a redirect to a host that resolves to a private IP', async () => {
    lookupMock
      .mockResolvedValueOnce(PUBLIC as never) // initial host
      .mockResolvedValueOnce([{ address: '10.1.2.3', family: 4 }] as never); // redirect target
    fetchMock.mockResolvedValueOnce(redirect('https://internal.example.com/feed'));
    await expect(fetchFeedText('https://status.example.com/feed')).rejects.toThrow(
      /blocked address/,
    );
  });

  it('rejects a redirect without a Location header', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 302 }));
    await expect(fetchFeedText('https://status.example.com/feed')).rejects.toThrow(
      /without a Location/,
    );
  });

  it('caps the number of redirects', async () => {
    fetchMock.mockImplementation(async () => redirect('https://status.example.com/loop'));
    await expect(fetchFeedText('https://status.example.com/feed')).rejects.toThrow(
      /Too many redirects/,
    );
  });

  it('enforces the response size cap', async () => {
    fetchMock.mockResolvedValueOnce(new Response('x'.repeat(5000), { status: 200 }));
    await expect(
      fetchFeedText('https://status.example.com/feed', { maxBytes: 1000 }),
    ).rejects.toThrow(/size limit/);
  });

  it('maps a non-OK upstream response to a FeedFetchError', async () => {
    fetchMock.mockResolvedValueOnce(new Response('nope', { status: 503 }));
    await expect(fetchFeedText('https://status.example.com/feed')).rejects.toThrow(
      /Upstream responded 503/,
    );
  });

  it('maps an abort to a timeout error', async () => {
    fetchMock.mockImplementationOnce(async () => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      throw err;
    });
    await expect(
      fetchFeedText('https://status.example.com/feed', { timeoutMs: 5 }),
    ).rejects.toThrow(/timed out/);
  });
});

import { describe, expect, it } from 'vitest';
import { FeedParseError, parseRssFeed } from './rss';

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Example Status</title>
  <item>
    <title>Investigating API errors</title>
    <link>https://status.example.com/incidents/abc</link>
    <guid>abc</guid>
    <pubDate>Mon, 01 Dec 2025 10:00:00 +0000</pubDate>
    <description><![CDATA[<p>We are investigating elevated errors.</p>]]></description>
  </item>
  <item>
    <title>No incidents reported</title>
    <guid>def</guid>
    <pubDate>Sun, 30 Nov 2025 10:00:00 +0000</pubDate>
    <description>All good</description>
  </item>
</channel></rss>`;

const ATOM = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Status</title>
  <entry>
    <title>Scheduled maintenance</title>
    <id>urn:1</id>
    <link rel="alternate" href="https://status.example.com/maint/1"/>
    <updated>2025-12-01T09:00:00Z</updated>
    <published>2025-12-01T08:00:00Z</published>
    <content type="html">&lt;p&gt;Maintenance window&lt;/p&gt;</content>
  </entry>
</feed>`;

describe('parseRssFeed', () => {
  it('parses RSS 2.0 items', () => {
    const { items } = parseRssFeed(RSS);
    expect(items).toHaveLength(2);
    expect(items[0]?.title).toBe('Investigating API errors');
    expect(items[0]?.sourceId).toBe('abc');
    expect(items[0]?.link).toBe('https://status.example.com/incidents/abc');
    expect(items[0]?.contentHtml).toContain('investigating');
  });

  it('parses Atom entries and resolves alternate link', () => {
    const { items } = parseRssFeed(ATOM);
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('Scheduled maintenance');
    expect(items[0]?.link).toBe('https://status.example.com/maint/1');
    expect(items[0]?.publishedAt).toBe('2025-12-01T08:00:00Z');
  });

  it('throws on empty body', () => {
    expect(() => parseRssFeed('')).toThrow(FeedParseError);
  });

  it('throws on non-feed XML', () => {
    expect(() => parseRssFeed('<html><body>nope</body></html>')).toThrow(FeedParseError);
  });

  it('handles recoverable malformed XML gracefully (no crash)', () => {
    // Lenient parsing: unclosed tags recover into a best-effort item rather than throwing.
    const { items } = parseRssFeed('<rss><channel><item><title>oops</title></item></channel></rss>');
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('oops');
  });
});

import { describe, expect, it } from 'vitest';
import { sanitizeFeedHtml, toPlainTextSummary } from './sanitize';

describe('sanitizeFeedHtml', () => {
  it('returns empty string for nullish input', () => {
    expect(sanitizeFeedHtml(null)).toBe('');
    expect(sanitizeFeedHtml(undefined)).toBe('');
    expect(sanitizeFeedHtml('')).toBe('');
  });

  it('strips script tags and their content', () => {
    const out = sanitizeFeedHtml('<p>ok</p><script>alert(1)</script>');
    expect(out).toContain('<p>ok</p>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('alert(1)');
  });

  it('removes event-handler attributes', () => {
    const out = sanitizeFeedHtml('<p onclick="steal()">hi</p>');
    expect(out).not.toContain('onclick');
  });

  it('drops javascript: links but keeps https links', () => {
    expect(sanitizeFeedHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:');
    expect(sanitizeFeedHtml('<a href="https://example.com">x</a>')).toContain(
      'href="https://example.com"',
    );
  });

  it('forces safe target and rel on links', () => {
    const out = sanitizeFeedHtml('<a href="https://example.com">x</a>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });

  it('keeps allowed formatting tags but strips disallowed ones', () => {
    const out = sanitizeFeedHtml('<strong>bold</strong><img src="x"><iframe></iframe>');
    expect(out).toContain('<strong>bold</strong>');
    expect(out).not.toContain('<img');
    expect(out).not.toContain('<iframe');
  });
});

describe('toPlainTextSummary', () => {
  it('strips all markup to plain text', () => {
    expect(toPlainTextSummary('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('collapses whitespace', () => {
    expect(toPlainTextSummary('<p>a   b\n\nc</p>')).toBe('a b c');
  });

  it('truncates with an ellipsis past the max length', () => {
    const out = toPlainTextSummary('a'.repeat(500), 10);
    expect(out).toHaveLength(10);
    expect(out.endsWith('\u2026')).toBe(true);
  });

  it('returns empty string for nullish input', () => {
    expect(toPlainTextSummary(null)).toBe('');
    expect(toPlainTextSummary(undefined)).toBe('');
  });
});

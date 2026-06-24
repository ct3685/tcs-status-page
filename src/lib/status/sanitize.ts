import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'span',
  'small',
  'code',
  'pre',
  'blockquote',
  'h3',
  'h4',
  'h5',
  'h6',
];

/**
 * Sanitize untrusted RSS/feed HTML before it is ever rendered. Links are
 * forced to safe, noopener targets; everything else is stripped.
 */
export function sanitizeFeedHtml(input: string | null | undefined): string {
  if (!input) return '';
  return sanitizeHtml(input, {
    allowedTags: ALLOWED_TAGS,
    // target/rel must be allowed for the transformTags additions below to
    // survive sanitization; otherwise the noopener hardening is silently dropped.
    allowedAttributes: { a: ['href', 'title', 'target', 'rel'] },
    allowedSchemes: ['https', 'mailto'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
      }),
    },
  }).trim();
}

/** Plain-text summary derived from HTML, collapsed and truncated. */
export function toPlainTextSummary(input: string | null | undefined, maxLength = 280): string {
  if (!input) return '';
  const text = sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}\u2026`;
}

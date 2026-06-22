/**
 * Raw SVG-string builders for the Bracket Forge `</r>` mark.
 *
 * The React <LogoMark> component is great for the DOM, but favicons, app icons,
 * and OG images need plain SVG strings (served statically or embedded as data
 * URIs inside next/og <ImageResponse>). Geometry here mirrors LogoMark.tsx.
 *
 * No 'use client' — importable from server routes (icon/apple-icon/og/manifest).
 */

export type MarkVariant = 'gold' | 'white' | 'black';

const GOLD_STOPS =
  '<stop offset="0%" stop-color="#F0E2C0"/>' +
  '<stop offset="38%" stop-color="#D9BD7E"/>' +
  '<stop offset="72%" stop-color="#C6A564"/>' +
  '<stop offset="100%" stop-color="#9C7A3C"/>';

function paint(variant: MarkVariant, gradId: string): string {
  if (variant === 'gold') return `url(#${gradId})`;
  if (variant === 'white') return '#F6F6F4';
  return '#0A0A0A';
}

/** The mark glyph (no outer <svg>), sized to a 0 0 342 184 viewBox. */
function glyph(variant: MarkVariant, idSuffix: string): string {
  const gradId = `bf-${idSuffix}`;
  const fill = paint(variant, gradId);
  const defs =
    variant === 'gold'
      ? `<defs><linearGradient id="${gradId}" x1="0.12" y1="0" x2="0.04" y2="1">${GOLD_STOPS}</linearGradient></defs>`
      : '';
  return (
    defs +
    `<g fill="none" stroke="${fill}" stroke-width="30" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="6">` +
    '<polyline points="84,52 44,92 84,132"/>' +
    '<polyline points="108,136 148,48"/>' +
    '<polyline points="258,52 298,92 258,132"/>' +
    '</g>' +
    `<path d="M162,72 L214,58 L234,78 L208,96 L192,96 L192,132 L162,132 Z" fill="${fill}"/>`
  );
}

/** Standalone mark on a transparent canvas (342x184). */
export function markStandaloneSvg(variant: MarkVariant = 'gold'): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="342" height="184" viewBox="0 0 342 184">' +
    glyph(variant, 'std') +
    '</svg>'
  );
}

/** Rounded-square app icon: mark centered on an obsidian tile (512x512). */
export function appIconSvg(
  variant: MarkVariant = 'gold',
  opts: { bg?: string; radius?: number } = {},
): string {
  const { bg = '#0A0A0A', radius = 112 } = opts;
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">' +
    `<rect width="512" height="512" rx="${radius}" fill="${bg}"/>` +
    '<svg x="56" y="149" width="400" height="215" viewBox="0 0 342 184">' +
    glyph(variant, 'icon') +
    '</svg>' +
    '</svg>'
  );
}

/** Runtime-agnostic data URI (no Buffer dependency; works on edge + node). */
export function toDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

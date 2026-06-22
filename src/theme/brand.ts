/**
 * Bracket Forge — Last Rev brand tokens.
 *
 * Single source of truth for the premium identity system. Kept free of the
 * 'use client' directive so both Server and Client Components can import it.
 * The functional status colors live separately in ./tokens.ts and are NOT
 * overridden here — operational/degraded/outage/maintenance keep their meaning.
 */
export const brand = {
  // Core surfaces
  obsidian: '#0A0A0A',
  charcoal: '#1B1B1B',
  shadow: '#050505',
  // Ink
  ivory: '#F6F6F4',
  graphite: '#9A9A9A',
  // Champagne gold accents
  gold: '#C8A96A',
  goldSoft: '#D8BE84',
  goldDeep: '#9C7A3C',
  // Lines
  divider: 'rgba(246, 246, 244, 0.12)',
  dividerSoft: 'rgba(246, 246, 244, 0.08)',
  goldLine: 'rgba(200, 169, 106, 0.55)',
  goldWash: 'rgba(200, 169, 106, 0.06)',
} as const;

/** Premium sans stack for body copy. Söhne is referenced for licensed envs. */
export const fontSans =
  'var(--font-inter), "Söhne", "Space Grotesk", "Helvetica Neue", Arial, sans-serif';

/** Geometric display stack for headings and eyebrow labels. */
export const fontDisplay =
  'var(--font-space-grotesk), var(--font-inter), "Söhne", "Helvetica Neue", Arial, sans-serif';

/** Layered obsidian surface with soft gold lighting — used on <body>. */
export const surfaceBackground =
  'radial-gradient(120% 90% at 12% -10%, rgba(200,169,106,0.06), transparent 46%),' +
  'radial-gradient(120% 120% at 100% 110%, rgba(200,169,106,0.04), transparent 50%),' +
  'linear-gradient(165deg, #0C0C0C 0%, #080808 60%, #050505 100%)';

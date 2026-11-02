/**
 * TCS Repair brand tokens for the status dashboard (dark surfaces).
 *
 * Functional status colors live separately in ./tokens.ts and are NOT
 * overridden here — operational/degraded/outage/maintenance keep their meaning.
 */
export const brand = {
  // Core surfaces (TCS ink family)
  obsidian: '#07111f',
  charcoal: '#111f2f',
  shadow: '#050d16',
  // Ink
  ivory: '#f6fbff',
  graphite: '#aebdca',
  // Brand cyan accents (kept as gold* keys for theme compatibility)
  gold: '#00aeef',
  goldSoft: '#43d5ff',
  goldDeep: '#007eae',
  // Lines
  divider: 'rgba(246, 251, 255, 0.12)',
  dividerSoft: 'rgba(246, 251, 255, 0.08)',
  goldLine: 'rgba(0, 174, 239, 0.55)',
  goldWash: 'rgba(0, 174, 239, 0.08)',
} as const;

/** Premium sans stack for body copy. */
export const fontSans =
  'var(--font-inter), "Söhne", "Space Grotesk", "Helvetica Neue", Arial, sans-serif';

/** Geometric display stack for headings and eyebrow labels. */
export const fontDisplay =
  'var(--font-space-grotesk), var(--font-inter), "Söhne", "Helvetica Neue", Arial, sans-serif';

/** Layered ink surface with soft cyan lighting — used on <body>. */
export const surfaceBackground =
  'radial-gradient(120% 90% at 12% -10%, rgba(0,174,239,0.08), transparent 46%),' +
  'radial-gradient(120% 120% at 100% 110%, rgba(0,174,239,0.05), transparent 50%),' +
  'linear-gradient(165deg, #0f1d2d 0%, #07111f 60%, #050d16 100%)';

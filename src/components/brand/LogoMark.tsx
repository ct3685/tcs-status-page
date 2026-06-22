'use client';

import { useId } from 'react';

/**
 * LogoMark — the custom "Bracket Forge" `</r>` brand mark for Last Rev.
 *
 * The glyph is drawn entirely from SVG geometry (stroked polylines with
 * beveled joins + butt caps for the sharp, chamfered, engineered look). It is
 * NOT a text glyph, so it renders identically across platforms and stays crisp
 * at favicon size.
 *
 * Structure inside the 324x184 viewBox:
 *   <  left angle bracket   — chevron pointing left
 *   /  forward slash        — forward-leaning parallelogram
 *   r  lowercase r          — vertical stem + angular hooked shoulder
 *   >  right angle bracket   — chevron pointing right
 *
 * Stroke width is uniform across every element for a balanced, technical feel.
 *
 * ---------------------------------------------------------------------------
 * EXPORTING STATIC ASSETS
 * ---------------------------------------------------------------------------
 * Each variant is a self-contained <svg>. To export a standalone file, render
 * the desired variant and copy the resulting markup, or save one of:
 *
 *   Gold mark   -> <LogoMark variant="gold" />   (champagne gradient version)
 *   White mark  -> <LogoMark variant="white" />  (one-color, dark backgrounds)
 *   Black mark  -> <LogoMark variant="black" />  (one-color, light backgrounds)
 *
 * Favicon / app icon:
 *   1. Render <LogoMark variant="gold" size={64} /> centered on a #0A0A0A
 *      rounded square (see <AppIcon />) and export at 512x512, 192x192, 32x32.
 *   2. For an .ico, drop a <LogoMark variant="gold" /> into a 32x32 / 16x16
 *      square — the bold strokes survive down to 16px.
 *
 * Drop the white/black single-color SVGs straight into the public/ folder for
 * favicons or use them inline anywhere a one-color mark is required.
 * ---------------------------------------------------------------------------
 */

export type LogoVariant = 'gold' | 'white' | 'black';

export interface LogoMarkProps {
  variant?: LogoVariant;
  /** Rendered height. Number = px, string = any CSS length. Width auto-scales. */
  size?: number | string;
  /** Adds a soft drop shadow for depth. The flat version works without it. */
  showDepth?: boolean;
  title?: string;
  className?: string;
}

const STROKE = 30;

// Centerline geometry — shared by every variant for visual consistency.
const LEFT_BRACKET = '84,52 44,92 84,132';
const SLASH = '108,136 148,48';
// Lowercase r: vertical stem + hooked, chamfered shoulder with an open counter.
const R_PATH = 'M162,72 L214,58 L234,78 L208,96 L192,96 L192,132 L162,132 Z';
const RIGHT_BRACKET = '258,52 298,92 258,132';

export default function LogoMark({
  variant = 'gold',
  size = 120,
  showDepth = false,
  title,
  className,
}: LogoMarkProps) {
  const uid = useId().replace(/:/g, '');
  const goldId = `lm-gold-${uid}`;
  const shadowId = `lm-shadow-${uid}`;

  const height = typeof size === 'number' ? `${size}px` : size;

  const solid = variant === 'white' ? '#F6F6F4' : variant === 'black' ? '#0A0A0A' : undefined;
  const strokeColor = variant === 'gold' ? `url(#${goldId})` : solid;

  const strokeProps = {
    fill: 'none',
    stroke: strokeColor,
    strokeWidth: STROKE,
    strokeLinecap: 'butt' as const,
    strokeLinejoin: 'miter' as const,
    strokeMiterlimit: 6,
  };

  return (
    <svg
      className={className}
      viewBox="0 0 342 184"
      role="img"
      aria-label={title ?? 'Last Rev'}
      style={{ height, width: 'auto', display: 'block', overflow: 'visible' }}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        {variant === 'gold' && (
          /* Clean champagne gold — subtle vertical gradient, ivory highlight at
             the top fading to a warm bronze base. No metallic banding. */
          <linearGradient id={goldId} x1="0.12" y1="0" x2="0.04" y2="1">
            <stop offset="0%" stopColor="#F0E2C0" />
            <stop offset="38%" stopColor="#D9BD7E" />
            <stop offset="72%" stopColor="#C6A564" />
            <stop offset="100%" stopColor="#9C7A3C" />
          </linearGradient>
        )}
        {showDepth && (
          <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="9" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        )}
      </defs>

      <g filter={showDepth ? `url(#${shadowId})` : undefined}>
        <polyline points={LEFT_BRACKET} {...strokeProps} />
        <polyline points={SLASH} {...strokeProps} />
        <path d={R_PATH} fill={strokeColor} stroke="none" />
        <polyline points={RIGHT_BRACKET} {...strokeProps} />
      </g>
    </svg>
  );
}

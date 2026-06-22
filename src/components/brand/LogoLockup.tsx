'use client';

import LogoMark, { type LogoVariant } from './LogoMark';

export interface LogoLockupProps {
  variant?: LogoVariant;
  /** Mark height in px; the wordmark scales relative to it. */
  size?: number;
  /** Show the LAST REV wordmark beside the mark. */
  showWordmark?: boolean;
  /** Surface the lockup sits on — controls the "LAST" ink color. */
  surface?: 'dark' | 'light';
  className?: string;
}

/**
 * Horizontal brand lockup: the `</r>` mark followed by the LAST REV wordmark.
 * Self-contained (no CSS module dependency) so it can be dropped into the
 * header, footer, or any surface.
 */
export default function LogoLockup({
  variant = 'gold',
  size = 26,
  showWordmark = true,
  surface = 'dark',
  className,
}: LogoLockupProps) {
  const lastColor = surface === 'light' ? '#0A0A0A' : '#F6F6F4';
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.42 }}
    >
      <LogoMark variant={variant} size={size} title="Last Rev" />
      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-space-grotesk), var(--font-inter), sans-serif',
            fontWeight: 600,
            fontSize: size * 0.62,
            letterSpacing: '0.22em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: lastColor }}>LAST</span>
          <span style={{ color: '#C8A96A', marginLeft: '0.32em' }}>REV</span>
        </span>
      )}
    </span>
  );
}

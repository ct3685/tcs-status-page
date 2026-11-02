'use client';

import LogoMark, { type LogoVariant } from './LogoMark';

export interface LogoLockupProps {
  variant?: LogoVariant;
  /** Mark height in px; the wordmark scales relative to it. */
  size?: number;
  /** Show the TCS REPAIR wordmark beside the mark. */
  showWordmark?: boolean;
  /** Surface the lockup sits on — controls the primary word color. */
  surface?: 'dark' | 'light';
  className?: string;
}

/** Horizontal brand lockup: TCS monogram + TCS REPAIR wordmark. */
export default function LogoLockup({
  variant = 'gold',
  size = 26,
  showWordmark = true,
  surface = 'dark',
  className,
}: LogoLockupProps) {
  const primary = surface === 'light' ? '#07111f' : '#f6fbff';
  const accent = variant === 'black' ? '#07111f' : '#00aeef';
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.42 }}
    >
      <LogoMark variant={variant} size={size} title="TCS Repair" />
      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-space-grotesk), var(--font-inter), sans-serif',
            fontWeight: 600,
            fontSize: size * 0.62,
            letterSpacing: '0.18em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: primary }}>TCS</span>
          <span style={{ color: accent, marginLeft: '0.32em' }}>REPAIR</span>
        </span>
      )}
    </span>
  );
}

'use client';

import styles from './brand.module.css';

export interface WordmarkProps {
  /** "dark" = on dark surfaces (LAST in ivory). "light" = on light surfaces (LAST in black). */
  surface?: 'dark' | 'light';
  /** Render the tagline beneath the wordmark. */
  tagline?: boolean;
  /** Font size of the wordmark. Number = px, string = any CSS length. */
  size?: number | string;
  className?: string;
}

export default function Wordmark({
  surface = 'dark',
  tagline = false,
  size = 34,
  className,
}: WordmarkProps) {
  const fontSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`${styles.wordmark} ${className ?? ''}`}
      data-surface={surface}
      style={{ fontSize }}
    >
      <div className={styles.wordmarkRow}>
        <span className={styles.wordmarkLast}>LAST</span>
        <span className={styles.wordmarkRev}>REV</span>
      </div>
      {tagline && <div className={styles.tagline}>BUILD. AUTOMATE. ACCELERATE.</div>}
    </div>
  );
}

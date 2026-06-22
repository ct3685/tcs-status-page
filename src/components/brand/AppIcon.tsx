'use client';

import LogoMark from './LogoMark';
import styles from './brand.module.css';

export interface AppIconProps {
  /** "obsidian" = black tile + gold mark. "ivory" = ivory tile + black mark. */
  tone?: 'obsidian' | 'ivory';
  /** Tile size in px. */
  size?: number;
  className?: string;
}

export default function AppIcon({ tone = 'obsidian', size = 96, className }: AppIconProps) {
  const isObsidian = tone === 'obsidian';
  return (
    <div
      className={`${styles.appIcon} ${className ?? ''}`}
      data-tone={tone}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
    >
      <LogoMark variant={isObsidian ? 'gold' : 'black'} size={size * 0.46} />
    </div>
  );
}

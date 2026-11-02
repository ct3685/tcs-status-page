'use client';

import LogoMark from './LogoMark';
import Wordmark from './Wordmark';
import styles from './brand.module.css';

export interface BusinessCardProps {
  /** "obsidian" = dark card. "ivory" = light card with URL. */
  tone?: 'obsidian' | 'ivory';
  className?: string;
}

export default function BusinessCard({ tone = 'obsidian', className }: BusinessCardProps) {
  if (tone === 'ivory') {
    return (
      <div className={`${styles.card} ${styles.cardIvory} ${className ?? ''}`}>
        <LogoMark variant="black" size={26} />
        <span className={styles.cardUrl}>TCS.REPAIR</span>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.cardObsidian} ${className ?? ''}`}>
      <div className={styles.cardTop}>
        <LogoMark variant="gold" size={30} showDepth />
      </div>
      <div className={styles.cardBottom}>
        <Wordmark surface="dark" size={18} />
        <div className={styles.cardTagline}>WEBSITES. IT. TECHNOLOGY SUPPORT.</div>
      </div>
    </div>
  );
}

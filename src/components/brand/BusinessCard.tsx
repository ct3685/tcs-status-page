'use client';

import LogoMark from './LogoMark';
import Wordmark from './Wordmark';
import styles from './brand.module.css';

export interface BusinessCardProps {
  /** "obsidian" = black card, gold mark + wordmark + tagline. "ivory" = ivory card with URL. */
  tone?: 'obsidian' | 'ivory';
  className?: string;
}

export default function BusinessCard({ tone = 'obsidian', className }: BusinessCardProps) {
  if (tone === 'ivory') {
    return (
      <div className={`${styles.card} ${styles.cardIvory} ${className ?? ''}`}>
        <LogoMark variant="black" size={26} />
        <span className={styles.cardUrl}>LASTREV.COM</span>
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
        <div className={styles.cardTagline}>BUILD. AUTOMATE. ACCELERATE.</div>
      </div>
    </div>
  );
}

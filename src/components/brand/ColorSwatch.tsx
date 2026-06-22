'use client';

import styles from './brand.module.css';

export interface ColorSwatchProps {
  hex: string;
  name?: string;
  className?: string;
}

export default function ColorSwatch({ hex, name, className }: ColorSwatchProps) {
  return (
    <div className={`${styles.swatch} ${className ?? ''}`}>
      <span className={styles.swatchChip} style={{ backgroundColor: hex }} aria-hidden />
      <span className={styles.swatchMeta}>
        {name && <span className={styles.swatchName}>{name}</span>}
        <span className={styles.swatchHex}>{hex.toUpperCase()}</span>
      </span>
    </div>
  );
}

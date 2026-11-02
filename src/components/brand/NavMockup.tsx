'use client';

import LogoMark from './LogoMark';
import styles from './brand.module.css';

const NAV_ITEMS = ['WORK', 'SERVICES', 'ABOUT', 'CONTACT'];

export default function NavMockup({ className }: { className?: string }) {
  return (
    <div className={`${styles.nav} ${className ?? ''}`}>
      <div className={styles.navLeft}>
        <LogoMark variant="gold" size={24} />
        <span className={styles.navWord}>
          TCS<span className={styles.navWordRev}>REPAIR</span>
        </span>
      </div>
      <nav className={styles.navItems}>
        {NAV_ITEMS.map((item) => (
          <span key={item} className={styles.navItem}>
            {item}
          </span>
        ))}
        <span className={styles.navSlash}>/</span>
      </nav>
    </div>
  );
}

'use client';

import LogoMark from './LogoMark';
import Wordmark from './Wordmark';
import AppIcon from './AppIcon';
import BusinessCard from './BusinessCard';
import NavMockup from './NavMockup';
import ColorSwatch from './ColorSwatch';
import styles from './brand.module.css';

const PALETTE: { hex: string; name: string }[] = [
  { hex: '#0A0A0A', name: 'Obsidian' },
  { hex: '#1B1B1B', name: 'Charcoal' },
  { hex: '#F6F6F4', name: 'Ivory' },
  { hex: '#C8A96A', name: 'Champagne' },
  { hex: '#9A9A9A', name: 'Graphite' },
];

function PanelLabel({ children }: { children: React.ReactNode }) {
  return <span className={styles.panelLabel}>{children}</span>;
}

export default function BrandBoard() {
  return (
    <div className={styles.stage}>
      <div className={styles.board}>
        <header className={styles.boardHeader}>
          <div className={styles.boardHeaderLeft}>
            <LogoMark variant="gold" size={26} />
            <span className={styles.boardKicker}>LAST REV — BRAND IDENTITY</span>
          </div>
          <span className={styles.boardHeaderRight}>BRACKET FORGE · CONCEPT 03</span>
        </header>

        <div className={styles.grid}>
          {/* 1 — HERO ----------------------------------------------------- */}
          <section className={`${styles.panel} ${styles.hero}`}>
            <div className={styles.heroLabel}>
              <PanelLabel>CONCEPT 3</PanelLabel>
              <h1 className={styles.heroTitle}>BRACKET FORGE</h1>
              <span className={styles.goldLine} aria-hidden />
            </div>
            <div className={styles.heroCenter}>
              <div className={styles.heroMark}>
                <LogoMark variant="gold" size={104} showDepth />
              </div>
              <Wordmark surface="dark" size={32} tagline />
            </div>
          </section>

          {/* 2 — MARK ONLY ------------------------------------------------ */}
          <section className={`${styles.panel} ${styles.markOnly}`}>
            <PanelLabel>MARK ONLY</PanelLabel>
            <div className={styles.markRow}>
              <LogoMark variant="gold" size={84} />
            </div>
            <span className={styles.divider} aria-hidden />
            <PanelLabel>ONE COLOR</PanelLabel>
            <div className={styles.markRow}>
              <LogoMark variant="white" size={72} />
            </div>
          </section>

          {/* 3 — LIGHT BACKGROUND ---------------------------------------- */}
          <section className={`${styles.panel} ${styles.light}`}>
            <PanelLabel data-on="light">LIGHT BACKGROUND</PanelLabel>
            <div className={styles.lightMark}>
              <LogoMark variant="black" size={96} />
            </div>
            <Wordmark surface="light" size={28} tagline />
          </section>

          {/* 4 — APP ICON / FAVICON -------------------------------------- */}
          <section className={`${styles.panel} ${styles.icons}`}>
            <PanelLabel>APP ICON / FAVICON</PanelLabel>
            <div className={styles.iconRow}>
              <AppIcon tone="obsidian" size={104} />
              <AppIcon tone="ivory" size={104} />
            </div>
          </section>

          {/* 5 — BRAND APPLICATIONS -------------------------------------- */}
          <section className={`${styles.panel} ${styles.apps}`}>
            <PanelLabel>BRAND APPLICATIONS</PanelLabel>
            <NavMockup />
            <div className={styles.cardStage}>
              <BusinessCard tone="ivory" className={styles.cardBehind} />
              <BusinessCard tone="obsidian" className={styles.cardFront} />
            </div>
          </section>

          {/* 6 — FOOTER SYSTEM ROW --------------------------------------- */}
          <section className={`${styles.panel} ${styles.system}`}>
            <div className={styles.systemCol}>
              <PanelLabel>COLOR PALETTE</PanelLabel>
              <div className={styles.swatches}>
                {PALETTE.map((c) => (
                  <ColorSwatch key={c.hex} hex={c.hex} name={c.name} />
                ))}
              </div>
            </div>
            <span className={styles.systemDivider} aria-hidden />
            <div className={styles.systemCol}>
              <PanelLabel>TYPOGRAPHY</PanelLabel>
              <div className={styles.typeRow}>
                <span className={styles.typeAa}>Aa</span>
                <div className={styles.typeMeta}>
                  <span className={styles.typeStack}>Söhne / Inter / Space Grotesk</span>
                  <span className={styles.typeSub}>Modern. Technical. Confident.</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import BrandBoard from '@/components/brand/BrandBoard';

export const metadata: Metadata = {
  title: 'Bracket Forge — Last Rev Brand Identity',
  description:
    'Ultra-premium brand identity board for Last Rev. The Bracket Forge `</r>` mark, wordmark, palette, and application mockups.',
  robots: { index: false, follow: false },
};

export default function BrandPage() {
  return (
    <main id="main-content">
      <BrandBoard />
    </main>
  );
}

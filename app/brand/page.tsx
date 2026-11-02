import type { Metadata } from 'next';
import BrandBoard from '@/components/brand/BrandBoard';

export const metadata: Metadata = {
  title: 'TCS Repair Brand Identity',
  description:
    'Brand identity board for TCS Repair — monogram, wordmark, palette, and application mockups.',
  robots: { index: false, follow: false },
};

export default function BrandPage() {
  return <BrandBoard />;
}

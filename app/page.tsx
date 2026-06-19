import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import StatusHero from '@/components/status/StatusHero';
import StatusDashboard from '@/components/status/StatusDashboard';
import { getStatusSnapshot } from '@/lib/status/cache';
import { DEFAULT_SETTINGS, loadSettings } from '@/lib/status/settings';
import { publicEnv } from '@/lib/env';

// Reads the cached Blob snapshot at request time; never prerendered at build.
export const dynamic = 'force-dynamic';

const FALLBACK_OG = '/images/status_page_logo_optimized_1200x630.png';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadSettings();
  const title = settings.seoTitle ?? settings.title;
  const description = settings.seoDescription ?? undefined;
  const url = publicEnv.NEXT_PUBLIC_SITE_URL;
  const image = settings.ogImage ?? FALLBACK_OG;

  return {
    title,
    description,
    alternates: { canonical: '/' },
    robots: settings.indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: 'website',
      url,
      siteName: 'Last Rev Status',
      title,
      description,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

const toneToSeverity = { info: 'info', warning: 'warning', critical: 'error' } as const;

export default async function HomePage() {
  const [snapshot, settings] = await Promise.all([getStatusSnapshot(), loadSettings()]);
  const announcement = settings.announcement;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.title,
    url: publicEnv.NEXT_PUBLIC_SITE_URL,
    publisher: { '@type': 'Organization', name: 'Last Rev', url: 'https://www.lastrev.com' },
  };

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AppHeader />
      <Container
        component="main"
        id="main-content"
        maxWidth="lg"
        sx={{ py: { xs: 3, md: 5 }, flexGrow: 1 }}
      >
        <Stack spacing={4}>
          {announcement?.enabled && announcement.message && (
            <Alert severity={toneToSeverity[announcement.tone ?? 'info']} variant="outlined">
              {announcement.message}
            </Alert>
          )}
          <StatusHero
            snapshot={snapshot}
            subtitle={settings.subtitle ?? DEFAULT_SETTINGS.subtitle}
          />
          <StatusDashboard snapshot={snapshot} />
        </Stack>
      </Container>
      <AppFooter snapshot={snapshot} />
    </Box>
  );
}

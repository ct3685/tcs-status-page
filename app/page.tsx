import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import StatusHero from '@/components/status/StatusHero';
import StatusDashboard from '@/components/status/StatusDashboard';
import AutoRefresh from '@/components/status/AutoRefresh';
import { getStatusSnapshot } from '@/lib/status/cache';
import { DEFAULT_SETTINGS, loadSettings } from '@/lib/status/settings';
import { publicEnv } from '@/lib/env';

// Reads the cached Blob snapshot at request time; never prerendered at build.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadSettings();
  const title = settings.seoTitle ?? settings.title;
  const description = settings.seoDescription ?? undefined;
  const url = publicEnv.NEXT_PUBLIC_SITE_URL;
  // When Sanity provides an OG image, use it; otherwise fall back to the
  // branded app/opengraph-image.tsx file convention (omit images here).
  const imageOverride = settings.ogImage ? { images: [settings.ogImage] } : {};

  return {
    title,
    description,
    alternates: { canonical: '/' },
    robots: settings.indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: 'website',
      url,
      siteName: 'TCS Status',
      title,
      description,
      ...imageOverride,
    },
    twitter: { card: 'summary_large_image', title, description, ...imageOverride },
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
    publisher: { '@type': 'Organization', name: 'TCS Repair', url: 'https://tcs.repair' },
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
          {snapshot.errors.length > 0 && (
            <Alert severity="warning" variant="outlined">
              {snapshot.errors.length === 1
                ? `Couldn't reach the status feed for ${snapshot.errors[0]?.serviceName}. Its status may be stale.`
                : `Couldn't reach ${snapshot.errors.length} status feeds (${snapshot.errors
                    .map((e) => e.serviceName)
                    .join(', ')}). Their status may be stale.`}
            </Alert>
          )}
          <StatusHero
            snapshot={snapshot}
            subtitle={settings.subtitle ?? DEFAULT_SETTINGS.subtitle}
          />
          <StatusDashboard services={snapshot.services} summary={snapshot.summary} />
        </Stack>
      </Container>
      <AppFooter snapshot={snapshot} />
      <AutoRefresh nextRefreshAt={snapshot.nextRefreshAt} />
    </Box>
  );
}

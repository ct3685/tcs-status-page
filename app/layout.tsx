import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { publicEnv } from '@/lib/env';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  applicationName: 'Last Rev Status',
  title: {
    default: 'Last Rev Services Status',
    template: '%s | Last Rev Status',
  },
  description:
    'A consolidated, real-time status view of the various third-party services the Last Rev team relies on — operational, degraded, outage, and maintenance states at a glance.',
  appleWebApp: {
    capable: true,
    title: 'LR Status',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeRegistry>
          <Box
            component="a"
            href="#main-content"
            sx={{
              position: 'absolute',
              left: -9999,
              top: 0,
              zIndex: 2000,
              p: 2,
              borderRadius: 1,
              bgcolor: 'background.paper',
              color: 'text.primary',
              '&:focus': { left: 8, top: 8 },
            }}
          >
            Skip to content
          </Box>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}

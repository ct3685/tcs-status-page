import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { publicEnv } from '@/lib/env';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'Last Rev Services Status',
    template: '%s | Last Rev Status',
  },
  description:
    'A consolidated, real-time status view of the various third-party services the Last Rev team relies on — operational, degraded, outage, and maintenance states at a glance.',
};

export const viewport: Viewport = {
  themeColor: '#0a0d14',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
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

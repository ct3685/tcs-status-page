'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import type { ReactNode } from 'react';
import theme from './theme';
import { surfaceBackground } from './brand';

// Layered obsidian surface + a fine noise-like overlay for a premium, textured
// dark canvas. The overlay is fixed and non-interactive.
const globalStyles = (
  <GlobalStyles
    styles={{
      html: { backgroundColor: '#050505' },
      body: {
        minHeight: '100dvh',
        background: surfaceBackground,
        backgroundRepeat: 'no-repeat',
      },
      'body::before': {
        content: '""',
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.5,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)',
        backgroundSize: '3px 3px',
        mixBlendMode: 'screen',
      },
      'body > *': { position: 'relative', zIndex: 1 },
    }}
  />
);

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui', enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {globalStyles}
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

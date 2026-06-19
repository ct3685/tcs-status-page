'use client';

import { createTheme } from '@mui/material/styles';
import { statusTokens } from './tokens';

// Dark, high-contrast theme. Dark-first by design; light mode can be layered
// in later via colorSchemes if needed.
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    background: { default: '#0a0d14', paper: '#11151f' },
    primary: { main: '#6366f1' },
    success: { main: statusTokens.operational.main },
    warning: { main: statusTokens.degraded.main },
    error: { main: statusTokens.outage.main },
    info: { main: statusTokens.maintenance.main },
    divider: 'rgba(148,163,184,0.14)',
    text: { primary: '#e6edf6', secondary: '#9aa7b8' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'var(--font-inter), system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none', border: '1px solid var(--mui-palette-divider)' },
      },
    },
  },
});

export default theme;

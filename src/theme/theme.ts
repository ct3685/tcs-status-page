'use client';

import { createTheme } from '@mui/material/styles';
import { statusTokens } from './tokens';
import { brand, fontSans, fontDisplay } from './brand';

// TCS Repair dark theme. Functional status colors (success/warning/error/info)
// are preserved for semantic meaning; chrome uses ink surfaces and cyan accents.
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    background: { default: brand.obsidian, paper: brand.charcoal },
    primary: { main: brand.gold, light: brand.goldSoft, dark: brand.goldDeep, contrastText: brand.obsidian },
    secondary: { main: brand.ivory, contrastText: brand.obsidian },
    success: { main: statusTokens.operational.main },
    warning: { main: statusTokens.degraded.main },
    error: { main: statusTokens.outage.main },
    info: { main: statusTokens.maintenance.main },
    divider: brand.divider,
    text: { primary: brand.ivory, secondary: brand.graphite },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: fontSans,
    h1: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: '-0.01em' },
    h2: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: '-0.005em' },
    h3: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: '-0.005em' },
    h4: { fontFamily: fontDisplay, fontWeight: 600 },
    h5: { fontFamily: fontDisplay, fontWeight: 600 },
    h6: { fontFamily: fontDisplay, fontWeight: 600 },
    overline: {
      fontFamily: fontDisplay,
      fontWeight: 600,
      fontSize: '0.68rem',
      letterSpacing: '0.28em',
      lineHeight: 2,
      color: brand.graphite,
    },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.015em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Respect users who prefer reduced motion: neutralize the hover lifts,
        // collapse animations, and icon rotations used across the dashboard.
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: brand.charcoal,
          border: `1px solid ${brand.dividerSoft}`,
          boxShadow: '0 18px 44px -30px rgba(0,0,0,0.95)',
          transition: 'border-color .2s ease, transform .2s ease, box-shadow .2s ease',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ ownerState }) => ({
          borderRadius: 9,
          paddingInline: 18,
          paddingBlock: 8,
          ...(ownerState.variant === 'contained' &&
            ownerState.color === 'primary' && {
              color: brand.obsidian,
              background: `linear-gradient(180deg, ${brand.goldSoft}, ${brand.gold})`,
              boxShadow: '0 12px 26px -14px rgba(0,174,239,0.45)',
              '&:hover': {
                background: `linear-gradient(180deg, #6adfff, ${brand.goldSoft})`,
                transform: 'translateY(-1px)',
              },
            }),
          ...(ownerState.variant === 'outlined' && {
            borderColor: brand.divider,
            color: brand.ivory,
            '&:hover': { borderColor: brand.goldLine, backgroundColor: brand.goldWash },
          }),
          ...(ownerState.variant === 'text' && {
            color: brand.ivory,
            '&:hover': { color: brand.gold, backgroundColor: 'transparent' },
          }),
        }),
      },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: { root: { color: brand.gold, textUnderlineOffset: 3 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, letterSpacing: '0.01em' } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: brand.divider },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brand.goldLine },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: brand.gold },
        },
      },
    },
  },
});

export default theme;

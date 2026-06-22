import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoLockup from '@/components/brand/LogoLockup';

export default function AppHeader() {
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(14px)',
        backgroundColor:
          'color-mix(in srgb, var(--mui-palette-background-default) 72%, transparent)',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{ py: 1.75, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
        >
          <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center' }}>
            <LogoLockup variant="gold" size={26} />
            <Box
              aria-hidden
              sx={{
                width: '1px',
                height: 22,
                bgcolor: 'divider',
                display: { xs: 'none', sm: 'block' },
              }}
            />
            <Typography
              variant="overline"
              sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1 }}
            >
              System Status
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
            <Link
              href="https://www.lastrev.com"
              target="_blank"
              rel="noopener"
              sx={{
                fontFamily: 'var(--font-space-grotesk), var(--font-inter), sans-serif',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              LastRev.com
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

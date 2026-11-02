import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoLockup from '@/components/brand/LogoLockup';
import LastUpdated from '@/components/status/LastUpdated';
import type { StatusSnapshot } from '@/lib/status/types';

export default function AppFooter({ snapshot }: { snapshot: StatusSnapshot }) {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'color-mix(in srgb, #050505 60%, transparent)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-start' } }}
        >
          <Stack spacing={1.5} sx={{ maxWidth: 420 }}>
            <LogoLockup variant="gold" size={24} />
            <Box
              aria-hidden
              sx={{ width: 44, height: 2, bgcolor: 'primary.main', opacity: 0.7, borderRadius: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Status is aggregated from each provider&apos;s public status feed and refreshed
              automatically. Some data may be delayed.
            </Typography>
            <LastUpdated generatedAt={snapshot.generatedAt} stale={snapshot.stale} />
          </Stack>

          <Stack direction="row" spacing={6}>
            <Stack spacing={1.25}>
              <Typography variant="overline">Resources</Typography>
              <Link href="https://tcs.repair" target="_blank" rel="noopener" variant="body2">
                TCS Repair
              </Link>
              <Link href="/api/status" variant="body2" color="text.secondary">
                Status API
              </Link>
            </Stack>
          </Stack>
        </Stack>

        <Box sx={{ mt: 4, pt: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.04em' }}>
            © {new Date().getFullYear()} TCS Repair
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

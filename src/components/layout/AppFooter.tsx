import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LastUpdated from '@/components/status/LastUpdated';
import type { StatusSnapshot } from '@/lib/status/types';

export default function AppFooter({ snapshot }: { snapshot: StatusSnapshot }) {
  return (
    <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 6 }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Stack spacing={0.5}>
            <LastUpdated generatedAt={snapshot.generatedAt} stale={snapshot.stale} />
            <Typography variant="caption" color="text.secondary">
              Status is aggregated from each provider&apos;s public status feed and refreshed
              automatically. Some data may be delayed.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Link href="https://www.lastrev.com" target="_blank" rel="noopener" variant="body2">
              Last Rev
            </Link>
            <Link href="/api/status" variant="body2" color="text.secondary">
              Status API
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

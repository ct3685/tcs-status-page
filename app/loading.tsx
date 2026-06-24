import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import AppHeader from '@/components/layout/AppHeader';

// Shown while the server component streams the snapshot. Mirrors the dashboard
// layout (hero + summary tiles + service grid) so the page doesn't jump.
export default function Loading() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, flexGrow: 1 }}>
        <Stack spacing={4} aria-busy="true" aria-label="Loading status">
          <Skeleton variant="rounded" height={132} />
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={110} height={88} />
            ))}
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={148} />
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

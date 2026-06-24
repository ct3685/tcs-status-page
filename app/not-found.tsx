import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AppHeader from '@/components/layout/AppHeader';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Container
        component="main"
        maxWidth="sm"
        sx={{ flexGrow: 1, display: 'grid', placeItems: 'center', py: 8 }}
      >
        <Stack spacing={2.5} sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Typography
            variant="overline"
            color="primary.main"
            sx={{ letterSpacing: '0.3em' }}
          >
            404
          </Typography>
          <Typography variant="h4" component="h1">
            Page not found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The page you&apos;re looking for doesn&apos;t exist. Head back to the status dashboard.
          </Typography>
          <Button href="/" variant="contained">
            Go to status
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

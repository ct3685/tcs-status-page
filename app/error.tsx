'use client';

import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AppHeader from '@/components/layout/AppHeader';

// Route-level error boundary for the status page. Must be a client component.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in the browser console / monitoring; details aren't shown to users.
    console.error('[status-page] render error:', error);
  }, [error]);

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Container
        component="main"
        maxWidth="sm"
        sx={{ flexGrow: 1, display: 'grid', placeItems: 'center', py: 8 }}
      >
        <Stack spacing={2.5} sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Status temporarily unavailable
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We hit a problem loading the service status. This is usually transient — please try
            again in a moment.
          </Typography>
          <Button variant="contained" startIcon={<RefreshRoundedIcon />} onClick={() => reset()}>
            Try again
          </Button>
          {error.digest && (
            <Typography variant="caption" color="text.secondary">
              Reference: {error.digest}
            </Typography>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

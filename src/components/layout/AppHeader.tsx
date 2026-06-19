import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
        backdropFilter: 'blur(12px)',
        backgroundColor:
          'color-mix(in srgb, var(--mui-palette-background-default) 78%, transparent)',
      }}
    >
      <Container maxWidth="lg">
        <Stack direction="row" spacing={1.5} sx={{ py: 1.5, alignItems: 'center' }}>
          <Box
            component="img"
            src="/images/lastrev_status_page_logo.png"
            alt="Last Rev"
            sx={{ height: 32, width: 'auto' }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Status
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ServiceCard from './ServiceCard';
import type { ServiceStatus } from '@/lib/status/types';

export default function ServiceGrid({ services }: { services: ServiceStatus[] }) {
  if (services.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Typography variant="h6">No services match your filters</Typography>
        <Typography variant="body2" color="text.secondary">
          Try clearing the search or selecting a different status.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
      }}
    >
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </Box>
  );
}

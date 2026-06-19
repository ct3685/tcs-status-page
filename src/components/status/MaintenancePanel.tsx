'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { LocalTime } from './Time';
import { toneVisual } from './statusVisuals';
import type { ServiceStatus } from '@/lib/status/types';

export default function MaintenancePanel({ services }: { services: ServiceStatus[] }) {
  const MAX_VISIBLE = 8;
  const items = services.flatMap((service) =>
    service.scheduledMaintenance.map((incident) => ({ service, incident })),
  );
  const hasCurrent = items.some(({ incident }) => incident.isCurrentMaintenance);
  const [open, setOpen] = useState(hasCurrent);

  if (items.length === 0) return null;
  const tone = toneVisual('maintenance');
  const visible = items.slice(0, MAX_VISIBLE);
  const extra = items.length - visible.length;

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor: `${tone.main}55`, bgcolor: tone.soft, overflow: 'hidden' }}
    >
      <Box
        component="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="maintenance-list"
        sx={{
          width: '100%',
          border: 0,
          bgcolor: 'transparent',
          cursor: 'pointer',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: 'inherit',
          textAlign: 'left',
        }}
      >
        <BuildRoundedIcon sx={{ color: tone.main }} aria-hidden />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Scheduled maintenance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {items.length} upcoming or in-progress {items.length === 1 ? 'window' : 'windows'}
          </Typography>
        </Box>
        <IconButton component="span" size="small" aria-hidden tabIndex={-1}>
          <ExpandMoreRoundedIcon
            sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </IconButton>
      </Box>
      <Collapse in={open} unmountOnExit>
        <Box id="maintenance-list" sx={{ px: 2, pb: 2 }}>
          <Stack spacing={1.5}>
            {visible.map(({ service, incident }) => (
              <Box
                key={incident.id}
                sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {service.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {incident.isCurrentMaintenance ? 'In progress' : 'Scheduled'}
                    {' · '}
                    <LocalTime iso={incident.startedAt ?? incident.publishedAt} />
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {incident.title}
                </Typography>
              </Box>
            ))}
            {extra > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ pt: 1 }}>
                +{extra} more maintenance {extra === 1 ? 'window' : 'windows'}
              </Typography>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}

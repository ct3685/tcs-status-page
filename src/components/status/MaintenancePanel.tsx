'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { LocalTime } from './Time';
import { toneVisual } from './statusVisuals';
import { compareScheduledMaintenance } from '@/lib/status/maintenance-order';
import type { ServiceStatus } from '@/lib/status/types';

export default function MaintenancePanel({ services }: { services: ServiceStatus[] }) {
  const MAX_VISIBLE = 8;
  const items = services
    .flatMap((service) => service.scheduledMaintenance.map((incident) => ({ service, incident })))
    .sort((a, b) => compareScheduledMaintenance(a.incident, b.incident));
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (items.length === 0) return null;
  const tone = toneVisual('maintenance');
  const visible = showAll ? items : items.slice(0, MAX_VISIBLE);
  const hidden = items.length - visible.length;

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor: `${tone.main}55`, bgcolor: tone.soft, overflow: 'hidden' }}
    >
      <Box
        component="button"
        onClick={() =>
          setOpen((current) => {
            if (current) setShowAll(false);
            return !current;
          })
        }
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
        <Box component="span" sx={{ display: 'inline-flex', color: 'text.secondary' }} aria-hidden>
          <ExpandMoreRoundedIcon
            sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </Box>
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
            {hidden > 0 && (
              <Button
                size="small"
                onClick={() => setShowAll(true)}
                sx={{ alignSelf: 'flex-start', color: 'text.secondary', px: 0, pt: 1 }}
              >
                +{hidden} more maintenance {hidden === 1 ? 'window' : 'windows'}
              </Button>
            )}
            {showAll && items.length > MAX_VISIBLE && (
              <Button
                size="small"
                onClick={() => setShowAll(false)}
                sx={{ alignSelf: 'flex-start', color: 'text.secondary', px: 0, pt: 1 }}
              >
                Show fewer
              </Button>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}

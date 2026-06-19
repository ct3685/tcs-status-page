'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import StatusBadge from './StatusBadge';
import IncidentTimeline from './IncidentTimeline';
import { TimeAgo } from './Time';
import { toneVisual } from './statusVisuals';
import type { ServiceStatus } from '@/lib/status/types';

export default function ServiceCard({ service }: { service: ServiceStatus }) {
  const [open, setOpen] = useState(false);
  const v = toneVisual(service.statusTone);

  const detailIncidents = [
    ...service.activeIncidents,
    ...service.scheduledMaintenance,
    ...service.recentIncidents,
  ];
  const hasDetail = detailIncidents.length > 0;
  const activeCount = service.activeIncidents.length;
  const recentCount = service.recentIncidents.length;
  const maintenanceCount = service.scheduledMaintenance.length;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `3px solid ${v.main}`,
        transition: 'border-color 0.2s ease, transform 0.2s ease',
        '&:hover': { boxShadow: `0 0 0 1px ${v.main}33, 0 8px 30px -12px ${v.glow}` },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 1.5,
              // Light chip so logos designed for light backgrounds stay legible on dark.
              bgcolor: '#fff',
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
            }}
          >
            {service.logo ? (
              <Box
                component="img"
                src={service.logo}
                alt=""
                loading="lazy"
                sx={{ width: 30, height: 30, objectFit: 'contain' }}
              />
            ) : (
              <Typography sx={{ fontWeight: 700, color: '#0a0d14' }}>
                {service.name.charAt(0)}
              </Typography>
            )}
          </Box>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                {service.name}
              </Typography>
              {service.pinned && (
                <PushPinRoundedIcon
                  sx={{ fontSize: 14, color: 'text.secondary' }}
                  aria-label="Pinned"
                />
              )}
            </Stack>
            {service.category && (
              <Typography variant="caption" color="text.secondary">
                {service.category.name}
              </Typography>
            )}
          </Box>
          <StatusBadge tone={service.statusTone} label={service.statusLabel} />
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ flexWrap: 'wrap', alignItems: 'center' }}
        >
          {activeCount > 0 && (
            <Chip size="small" color="error" variant="outlined" label={`${activeCount} active`} />
          )}
          {maintenanceCount > 0 && (
            <Chip
              size="small"
              color="info"
              variant="outlined"
              label={`${maintenanceCount} maintenance`}
            />
          )}
          {recentCount > 0 && (
            <Chip size="small" color="warning" variant="outlined" label={`${recentCount} recent`} />
          )}
          {service.isFetchError && (
            <Chip size="small" variant="outlined" label="Status unavailable" />
          )}
        </Stack>

        <Typography variant="caption" color="text.secondary">
          {service.isFetchError ? (
            'Could not reach status feed'
          ) : service.lastIncidentAt ? (
            <>
              Last incident <TimeAgo iso={service.lastIncidentAt} />
            </>
          ) : (
            'No recent incidents'
          )}
        </Typography>
      </Box>

      <Box
        sx={{
          px: 2,
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {hasDetail ? (
          <Button
            size="small"
            onClick={() => setOpen((o) => !o)}
            endIcon={
              <ExpandMoreRoundedIcon
                sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            }
            aria-expanded={open}
            aria-controls={`detail-${service.slug}`}
          >
            {open ? 'Hide details' : 'View details'}
          </Button>
        ) : (
          <Box />
        )}
        {service.externalStatusPageUrl && (
          <Link
            href={service.externalStatusPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            Status page <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
          </Link>
        )}
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box id={`detail-${service.slug}`} sx={{ px: 2, pb: 2 }}>
          <IncidentTimeline incidents={detailIncidents} />
        </Box>
      </Collapse>
    </Card>
  );
}

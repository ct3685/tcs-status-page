'use client';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import StatusBadge from './StatusBadge';
import { LocalTime, TimeAgo } from './Time';
import { severityToLevel, toneFromLevel } from '@/lib/status/classify';
import type { Incident } from '@/lib/status/types';

function lifecycleLabel(incident: Incident): string {
  if (incident.isFutureMaintenance) return 'Scheduled';
  if (incident.isCurrentMaintenance) return 'In progress';
  if (incident.isActive) return 'Active';
  if (incident.isResolved) return 'Resolved';
  return 'Update';
}

export default function IncidentTimeline({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        No incidents to display.
      </Typography>
    );
  }

  return (
    <Box>
      {incidents.map((incident) => {
        const tone = toneFromLevel(severityToLevel(incident.severity));
        return (
          <Accordion
            key={incident.id}
            disableGutters
            elevation={0}
            sx={{
              bgcolor: 'transparent',
              borderTop: '1px solid',
              borderColor: 'divider',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon />}
              aria-label={`Details for ${incident.title}`}
            >
              <Stack spacing={0.75} sx={{ pr: 1, width: '100%' }}>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ flexWrap: 'wrap', alignItems: 'center' }}
                >
                  <StatusBadge tone={tone} label={lifecycleLabel(incident)} />
                  <Typography variant="body2" color="text.secondary">
                    <LocalTime iso={incident.publishedAt} /> &middot;{' '}
                    <TimeAgo iso={incident.publishedAt} />
                  </Typography>
                </Stack>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {incident.title}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              {incident.contentHtmlSanitized ? (
                // Content is sanitized server-side in lib/status/sanitize.
                <Box
                  sx={{ '& p': { mt: 0, mb: 1 }, fontSize: 14, color: 'text.secondary' }}
                  dangerouslySetInnerHTML={{ __html: incident.contentHtmlSanitized }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {incident.summary || 'No additional details provided.'}
                </Typography>
              )}
              {incident.url && (
                <Link
                  href={incident.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 1,
                    fontSize: 14,
                  }}
                >
                  View on status page <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
                </Link>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}

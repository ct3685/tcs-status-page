import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LastUpdated from './LastUpdated';
import { toneVisual } from './statusVisuals';
import type { StatusSnapshot, StatusTone } from '@/lib/status/types';

function heroTone(summary: StatusSnapshot['summary']): StatusTone {
  if (summary.outage > 0) return 'outage';
  if (summary.degraded > 0) return 'degraded';
  if (summary.unknown > 0) return 'unknown';
  if (summary.maintenance > 0) return 'maintenance';
  return 'operational';
}

export default function StatusHero({
  snapshot,
  subtitle,
}: {
  snapshot: StatusSnapshot;
  subtitle: string;
}) {
  const { summary } = snapshot;
  const tone = heroTone(summary);
  const v = toneVisual(tone);
  const needAttention = summary.outage + summary.degraded + summary.unknown;

  const headline =
    needAttention === 0
      ? 'All systems operational'
      : `${needAttention} ${needAttention === 1 ? 'service needs' : 'services need'} attention`;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        p: { xs: 3, md: 5 },
        border: '1px solid',
        borderColor: 'divider',
        background: `radial-gradient(120% 140% at 0% 0%, ${v.glow} 0%, transparent 55%), var(--mui-palette-background-paper)`,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: { xs: 56, md: 72 },
              height: { xs: 56, md: 72 },
              borderRadius: '50%',
              bgcolor: v.soft,
              boxShadow: `0 0 40px -8px ${v.glow}`,
            }}
          >
            <Box
              component={v.Icon}
              aria-hidden
              sx={{ fontSize: { xs: 32, md: 42 }, color: v.main }}
            />
          </Box>
          <Box>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.6rem', md: '2.4rem' } }}>
              {headline}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
        >
          <LastUpdated generatedAt={snapshot.generatedAt} stale={snapshot.stale} showRefresh />
          {summary.maintenance > 0 && (
            <Typography variant="body2" sx={{ color: toneVisual('maintenance').main }}>
              {summary.maintenance} under maintenance
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

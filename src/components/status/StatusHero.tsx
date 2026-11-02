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
        background: `radial-gradient(120% 140% at 0% 0%, ${v.glow} 0%, transparent 50%), radial-gradient(90% 120% at 100% 100%, rgba(0,174,239,0.06), transparent 55%), linear-gradient(160deg, #0f1d2d 0%, #0a1624 60%, #07111f 100%)`,
      }}
    >
      <Stack spacing={2.25}>
        <Stack spacing={1}>
          <Typography variant="overline">System Status</Typography>
          <Box aria-hidden sx={{ width: 44, height: 2, bgcolor: 'primary.main', opacity: 0.75, borderRadius: 1 }} />
        </Stack>
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
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
            <Typography variant="h1" sx={{ fontSize: { xs: '1.7rem', md: '2.5rem' } }}>
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

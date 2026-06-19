'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import { TimeAgo } from './Time';
import RefreshButton from './RefreshButton';

export default function LastUpdated({
  generatedAt,
  stale,
  showRefresh = false,
}: {
  generatedAt: string;
  stale: boolean;
  showRefresh?: boolean;
}) {
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <FiberManualRecordRoundedIcon
        sx={{ fontSize: 10, color: stale ? 'warning.main' : 'success.main' }}
        aria-hidden
      />
      <Typography variant="body2" color="text.secondary">
        {stale ? 'Data may be stale · updated' : 'Updated'} <TimeAgo iso={generatedAt} />
      </Typography>
      {showRefresh && <RefreshButton stale={stale} />}
    </Stack>
  );
}

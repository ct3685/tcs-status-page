'use client';

import { useTransition } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { refreshStatus } from '@/lib/actions';

export default function RefreshButton({ stale }: { stale?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="small"
      variant={stale ? 'contained' : 'outlined'}
      color={stale ? 'warning' : 'inherit'}
      disabled={pending}
      onClick={() => startTransition(async () => { await refreshStatus(); })}
      startIcon={
        pending ? <CircularProgress size={14} color="inherit" /> : <RefreshRoundedIcon />
      }
      aria-label="Refresh status now"
      sx={{ py: 0.25 }}
    >
      {pending ? 'Refreshing…' : 'Refresh now'}
    </Button>
  );
}

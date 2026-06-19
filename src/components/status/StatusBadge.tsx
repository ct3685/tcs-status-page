import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { toneVisual } from './statusVisuals';
import type { StatusTone } from '@/lib/status/types';

interface StatusBadgeProps {
  tone: StatusTone;
  label: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'soft';
}

/**
 * Status pill that always pairs color with an icon and text (never color alone),
 * satisfying the accessibility requirement.
 */
export default function StatusBadge({
  tone,
  label,
  size = 'small',
  variant = 'soft',
}: StatusBadgeProps) {
  const v = toneVisual(tone);
  const filled = variant === 'filled';
  return (
    <Chip
      size={size}
      icon={
        <Box
          component={v.Icon}
          aria-hidden
          sx={{ color: `${filled ? '#0a0d14' : v.main} !important` }}
        />
      }
      label={label}
      sx={{
        fontWeight: 600,
        color: filled ? '#0a0d14' : v.main,
        bgcolor: filled ? v.main : v.soft,
        border: `1px solid ${filled ? v.main : 'transparent'}`,
        '& .MuiChip-icon': { fontSize: size === 'small' ? 16 : 20 },
      }}
    />
  );
}

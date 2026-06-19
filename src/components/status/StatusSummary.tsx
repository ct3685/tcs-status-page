'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { toneVisual } from './statusVisuals';
import type { StatusSummary as Summary, StatusTone } from '@/lib/status/types';

export type ToneFilter = StatusTone | 'all';

const ORDER: { key: StatusTone; label: string }[] = [
  { key: 'outage', label: 'Outage' },
  { key: 'degraded', label: 'Degraded' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'operational', label: 'Operational' },
  { key: 'unknown', label: 'Unknown' },
];

interface Props {
  summary: Summary;
  active: ToneFilter;
  onSelect: (filter: ToneFilter) => void;
}

function Tile({
  label,
  count,
  color,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        flex: '0 1 150px',
        minWidth: 110,
        p: 1.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: selected ? color : 'divider',
        bgcolor: selected ? `${color}1f` : 'background.paper',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 0.5,
        transition: 'all 0.15s ease',
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, color }}>
        {count}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </ButtonBase>
  );
}

export default function StatusSummary({ summary, active, onSelect }: Props) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
      <Tile
        label="All services"
        count={summary.total}
        color="var(--mui-palette-text-primary)"
        selected={active === 'all'}
        onClick={() => onSelect('all')}
      />
      {ORDER.map(({ key, label }) => (
        <Tile
          key={key}
          label={label}
          count={summary[key]}
          color={toneVisual(key).main}
          selected={active === key}
          onClick={() => onSelect(active === key ? 'all' : key)}
        />
      ))}
    </Box>
  );
}

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import type { SvgIconComponent } from '@mui/icons-material';
import { statusTokens } from '@/theme/tokens';
import type { StatusTone } from '@/lib/status/types';

export interface ToneVisual {
  label: string;
  Icon: SvgIconComponent;
  main: string;
  glow: string;
  soft: string;
}

export const toneVisuals: Record<StatusTone, ToneVisual> = {
  operational: { label: 'Operational', Icon: CheckCircleRoundedIcon, ...statusTokens.operational },
  degraded: { label: 'Degraded', Icon: WarningRoundedIcon, ...statusTokens.degraded },
  outage: { label: 'Outage', Icon: ErrorRoundedIcon, ...statusTokens.outage },
  maintenance: { label: 'Maintenance', Icon: BuildRoundedIcon, ...statusTokens.maintenance },
  unknown: { label: 'Unknown', Icon: HelpRoundedIcon, ...statusTokens.unknown },
};

export function toneVisual(tone: StatusTone): ToneVisual {
  return toneVisuals[tone];
}

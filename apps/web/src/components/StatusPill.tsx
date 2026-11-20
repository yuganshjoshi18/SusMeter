import type { Indicator, Signal } from '@susmeter/shared';
import { IndicatorBadge } from './IndicatorBadge';

export type StatusLevel = Indicator | Signal;

type BaseProps = {
  label?: string;
  compact?: boolean;
};

/**
 * Accepts either a direct green/yellow/red indicator or a qualitative
 * low/moderate/strong signal level and renders the shared indicator styling.
 */
export type StatusPillProps = BaseProps &
  (
    | { indicator: Indicator; level?: never }
    | { level: StatusLevel; indicator?: never }
  );

const levelToIndicator: Record<StatusLevel, Indicator> = {
  green: 'green',
  yellow: 'yellow',
  red: 'red',
  low: 'green',
  moderate: 'yellow',
  strong: 'red',
};

export function StatusPill(props: StatusPillProps) {
  const indicator = props.indicator ?? levelToIndicator[props.level ?? 'low'];
  return <IndicatorBadge indicator={indicator} label={props.label} compact={props.compact} />;
}

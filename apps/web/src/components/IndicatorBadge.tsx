import type { Indicator } from '@susmeter/shared';
import { indicatorStyles } from '@/lib/indicators';

interface IndicatorBadgeProps {
  indicator: Indicator;
  compact?: boolean;
  label?: string;
}

export function IndicatorBadge({ indicator, compact = false, label }: IndicatorBadgeProps) {
  const style = indicatorStyles[indicator];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-semibold ${style.bg} ${style.border} ${style.text} ${
        compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {label || style.label}
    </span>
  );
}

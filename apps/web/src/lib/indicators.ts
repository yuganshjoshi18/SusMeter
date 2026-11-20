import type { Indicator } from '@susmeter/shared';

export interface IndicatorStyle {
  label: string;
  text: string;
  bg: string;
  border: string;
  dot: string;
  ring: string;
}

export const indicatorStyles: Record<Indicator, IndicatorStyle> = {
  green: {
    label: 'Green flag',
    text: 'text-healthy',
    bg: 'bg-healthy/10',
    border: 'border-healthy/25',
    dot: 'bg-healthy',
    ring: 'ring-healthy/20',
  },
  yellow: {
    label: 'Yellow flag',
    text: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/25',
    dot: 'bg-warning',
    ring: 'ring-warning/20',
  },
  red: {
    label: 'Red flag',
    text: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/25',
    dot: 'bg-accent',
    ring: 'ring-accent/20',
  },
};

export const overallCopy: Record<Indicator, { title: string; body: string }> = {
  green: {
    title: 'Mostly steady ground',
    body: 'Nothing in this sample crossed a stronger threshold. That is useful information, not proof that everything is fine.',
  },
  yellow: {
    title: 'Some mixed signals',
    body: 'A few reported behaviours need context. Look for patterns across time, not one example.',
  },
  red: {
    title: 'Worth a closer look',
    body: 'Several reported behaviours crossed a stronger threshold. Not every red flag is a dealbreaker, but this deserves attention.',
  },
};

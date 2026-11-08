import { cn } from './cn';

export type StarCountSize = 'sm' | 'md' | 'lg';

export interface StarCountProps {
  /** Number of stars to show. */
  value: number;
  size?: StarCountSize;
  /** Override the trailing label. Defaults to "stars"/"star" for screen readers. */
  label?: string;
  className?: string;
}

const SIZE_CLASSES: Record<StarCountSize, string> = {
  sm: 'text-sm gap-0.5',
  md: 'text-base gap-1',
  lg: 'text-2xl gap-1.5',
};

/** Shows a ⭐ followed by a number — the universal "stars" readout. */
export function StarCount({ value, size = 'md', label, className }: StarCountProps) {
  const a11yLabel = label ?? `${value} ${value === 1 ? 'star' : 'stars'}`;
  return (
    <span
      className={cn(
        'inline-flex items-center font-extrabold text-amber-500 tabular-nums',
        SIZE_CLASSES[size],
        className,
      )}
      role="img"
      aria-label={a11yLabel}
    >
      <span aria-hidden>⭐</span>
      <span aria-hidden>{value}</span>
    </span>
  );
}

import type { ReactNode } from 'react';
import { cn } from './cn';

export interface ProgressRingProps {
  /** Completed count (clamped to 0..total). */
  value: number;
  /** Total count. When 0, the ring shows empty. */
  total: number;
  /** Diameter in px. */
  size?: number;
  /** Stroke thickness in px. */
  thickness?: number;
  /** Ring color (progress arc). */
  color?: string;
  /** Track color (unfilled). */
  trackColor?: string;
  /** Custom center content. Defaults to "value/total". */
  children?: ReactNode;
  /** Hide the center label entirely. */
  hideLabel?: boolean;
  className?: string;
}

/**
 * Circular percent-complete indicator (e.g. today's tasks done).
 * Accessible as a progressbar with value text.
 */
export function ProgressRing({
  value,
  total,
  size = 96,
  thickness = 10,
  color = '#6366f1',
  trackColor = '#e2e8f0',
  children,
  hideLabel = false,
  className,
}: ProgressRingProps) {
  const safeTotal = Math.max(0, total);
  const safeValue = Math.min(Math.max(0, value), safeTotal);
  const pct = safeTotal === 0 ? 0 : safeValue / safeTotal;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);
  const center = size / 2;
  const percentText = Math.round(pct * 100);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={safeValue}
      aria-valuetext={`${safeValue} of ${safeTotal} complete (${percentText}%)`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 400ms ease' }}
        />
      </svg>
      {!hideLabel && (
        <span className="absolute inset-0 flex items-center justify-center font-extrabold text-slate-700">
          {children ?? (
            <span className="tabular-nums text-lg">
              {safeValue}
              <span className="text-slate-400">/{safeTotal}</span>
            </span>
          )}
        </span>
      )}
    </div>
  );
}

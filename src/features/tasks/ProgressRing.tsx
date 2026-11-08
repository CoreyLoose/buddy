interface ProgressRingProps {
  /** Number of completed items. */
  done: number;
  /** Total number of items. */
  total: number;
  /** Diameter in pixels. */
  size?: number;
  /** Stroke thickness in pixels. */
  stroke?: number;
  /** Accent color for the progress arc. */
  color?: string;
}

/**
 * A circular progress ring showing percent complete. Pure/presentational —
 * reads nothing from the store. Shows "n/total" and a big percentage.
 */
export function ProgressRing({
  done,
  total,
  size = 120,
  stroke = 12,
  color = '#22c55e',
}: ProgressRingProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const complete = total > 0 && done >= total;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pct}% complete, ${done} of ${total} tasks done`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {complete ? (
          <span className="text-2xl" aria-hidden>
            🎉
          </span>
        ) : (
          <span className="text-2xl font-bold text-slate-800">{pct}%</span>
        )}
        <span className="text-xs font-medium text-slate-500">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

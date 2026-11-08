import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional accent color — rendered as a thick top border (e.g. a kid's color). */
  accent?: string;
  /** Adds hover elevation + pointer affordance (for clickable cards). */
  interactive?: boolean;
  /** Inner padding preset. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

/** Big, soft, rounded surface — the base container of the design system. */
export function Card({
  accent,
  interactive = false,
  padding = 'md',
  className,
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-white border border-slate-200 shadow-sm',
        PADDING[padding],
        interactive &&
          'transition-shadow transition-transform hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        className,
      )}
      style={{
        ...(accent ? { borderTopColor: accent, borderTopWidth: 6 } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

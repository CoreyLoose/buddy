import type { ReactNode } from 'react';
import { cn } from './cn';

export type IconBadgeSize = 'sm' | 'md' | 'lg' | 'xl';

export interface IconBadgeProps {
  /** Emoji or short content to display. */
  icon: ReactNode;
  size?: IconBadgeSize;
  /** Background accent color (defaults to a soft slate). */
  color?: string;
  /** Render as a circle instead of a rounded square. */
  circle?: boolean;
  /** Accessible label; when omitted the badge is decorative (aria-hidden). */
  label?: string;
  className?: string;
}

const SIZE_CLASSES: Record<IconBadgeSize, string> = {
  sm: 'w-9 h-9 text-xl',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-3xl',
  xl: 'w-24 h-24 text-6xl',
};

/** A colored tile/circle that frames an emoji or icon (avatars, task icons, rewards). */
export function IconBadge({
  icon,
  size = 'md',
  color,
  circle = false,
  label,
  className,
}: IconBadgeProps) {
  // Tint the background from the accent color at low opacity for a soft look.
  const style = color ? { backgroundColor: `${color}22` } : undefined;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center shrink-0 leading-none',
        circle ? 'rounded-full' : 'rounded-2xl',
        !color && 'bg-slate-100',
        SIZE_CLASSES[size],
        className,
      )}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {icon}
    </span>
  );
}

import type { ReactNode } from 'react';
import { cn } from './cn';
import { IconBadge } from './IconBadge';

export interface EmptyStateProps {
  /** Big friendly emoji/illustration. */
  icon?: ReactNode;
  title: string;
  /** Optional supporting line. */
  description?: ReactNode;
  /** Optional call-to-action (usually a <Button/>). */
  action?: ReactNode;
  className?: string;
}

/** Friendly placeholder shown when a list/section has nothing yet. */
export function EmptyState({
  icon = '🌱',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-10 px-6 gap-3',
        className,
      )}
    >
      <IconBadge icon={icon} size="xl" circle />
      <h3 className="text-xl font-extrabold text-slate-800">{title}</h3>
      {description != null && (
        <p className="text-slate-500 max-w-xs">{description}</p>
      )}
      {action != null && <div className="mt-2">{action}</div>}
    </div>
  );
}

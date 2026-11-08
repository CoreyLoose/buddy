import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  /** Optional leading element (emoji/icon). */
  leadingIcon?: ReactNode;
  children?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 active:bg-indigo-800 focus-visible:ring-indigo-400',
  secondary:
    'bg-white text-slate-800 border-2 border-slate-200 shadow-sm hover:border-slate-300 active:bg-slate-50 focus-visible:ring-slate-400',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
  danger:
    'bg-rose-600 text-white shadow-md hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-400',
};

// Sizes keep a minimum 44px touch target (WCAG 2.5.5) — big and finger-friendly.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-[44px] px-5 py-2.5 text-base gap-2',
  lg: 'min-h-[56px] px-7 py-3.5 text-lg gap-2.5',
};

/**
 * Big, rounded, kid-friendly button with generous touch targets.
 * Forwards refs and all native button attributes.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    leadingIcon,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl font-bold',
        'transition-colors select-none',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {leadingIcon != null && (
        <span aria-hidden className="text-[1.2em] leading-none">
          {leadingIcon}
        </span>
      )}
      {children}
    </button>
  );
});

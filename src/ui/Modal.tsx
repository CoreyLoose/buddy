import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from './cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  /** Optional footer region (e.g. action buttons). */
  footer?: ReactNode;
  /** Hide the default "×" close control in the header. */
  hideCloseButton?: boolean;
  /** Clicking the backdrop closes the modal (default true). */
  closeOnBackdrop?: boolean;
  className?: string;
}

/**
 * Accessible modal dialog: role="dialog", aria-modal, Escape to close,
 * focus moves in on open and restores on close, backdrop click to dismiss.
 * Renders nothing when `open` is false.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  hideCloseButton = false,
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // Move focus into the dialog.
    panelRef.current?.focus();

    // Lock background scroll while open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'w-full max-w-md max-h-[90vh] overflow-auto outline-none',
          'rounded-3xl bg-white shadow-2xl',
          className,
        )}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
            {title ? (
              <h2 id={titleId} className="text-xl font-extrabold text-slate-800">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 w-11 h-11 -mr-2 inline-flex items-center justify-center rounded-full text-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
              >
                <span aria-hidden>×</span>
              </button>
            )}
          </div>
        )}
        <div className="px-6 pb-5">{children}</div>
        {footer != null && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

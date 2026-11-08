import type { ReactNode } from 'react';
import { cn } from './cn';
import { useUiStore } from './uiStore';
import { ViewSwitcher } from './ViewSwitcher';

export interface AppShellProps {
  /** Brand/title shown top-left. Defaults to the app name. */
  title?: ReactNode;
  /** Content rendered when the Family (two-kid dashboard) view is active. */
  familyView?: ReactNode;
  /** Content rendered when the Kid view is active. */
  kidView: ReactNode;
  /** Content rendered when the Grown-up / Manage view is active. */
  manageView: ReactNode;
  /** Optional extra controls in the header (e.g. a kid selector). */
  headerRight?: ReactNode;
  /** Hide the built-in view switcher (if a track supplies its own). */
  hideSwitcher?: boolean;
  className?: string;
}

/**
 * Top-level layout: sticky playful header with branding + Kid/Grown-up switcher,
 * and a centered content area that renders the active view's slot.
 *
 * View state comes from the SEPARATE UI store (`useUiStore`), never the data store.
 * This shell only owns layout + switching — feature screens are injected as slots.
 */
export function AppShell({
  title = '⭐ Family Routines',
  familyView,
  kidView,
  manageView,
  headerRight,
  hideSwitcher = false,
  className,
}: AppShellProps) {
  const view = useUiStore((s) => s.view);

  // The family dashboard needs more room for two side-by-side panels.
  const maxWidth = view === 'family' ? 'max-w-6xl' : 'max-w-4xl';
  const content = view === 'family' ? familyView : view === 'kid' ? kidView : manageView;

  return (
    <div className={cn('min-h-screen bg-slate-50 text-slate-900', className)}>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className={cn('mx-auto px-4 py-3 flex items-center justify-between gap-3', maxWidth)}>
          <div className="text-2xl font-black tracking-tight">{title}</div>
          <div className="flex items-center gap-3">
            {!hideSwitcher && <ViewSwitcher />}
            {headerRight}
          </div>
        </div>
      </header>

      <main className={cn('mx-auto px-4 py-6', maxWidth)}>{content}</main>
    </div>
  );
}

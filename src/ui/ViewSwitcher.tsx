import { cn } from './cn';
import { useUiStore } from './uiStore';
import type { AppView } from './uiStore';

export interface ViewSwitcherProps {
  className?: string;
  /** Controlled value — defaults to the shared UI store. */
  value?: AppView;
  /** Controlled handler — defaults to the shared UI store's setView. */
  onChange?: (view: AppView) => void;
}

const OPTIONS: { value: AppView; label: string; icon: string }[] = [
  { value: 'kid', label: 'Kid', icon: '🧒' },
  { value: 'manage', label: 'Grown-up', icon: '🧑‍💼' },
];

/**
 * Segmented control toggling Kid view ↔ Grown-up/Manage view.
 * Uncontrolled by default (reads/writes the shared UI store); can be controlled
 * via `value`/`onChange`.
 */
export function ViewSwitcher({ className, value, onChange }: ViewSwitcherProps) {
  const storeView = useUiStore((s) => s.view);
  const setView = useUiStore((s) => s.setView);

  const active = value ?? storeView;
  const handle = onChange ?? setView;

  return (
    <div
      role="tablist"
      aria-label="Choose view"
      className={cn(
        'inline-flex p-1 rounded-full bg-slate-100 border border-slate-200',
        className,
      )}
    >
      {OPTIONS.map((opt) => {
        const selected = opt.value === active;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => handle(opt.value)}
            className={cn(
              'inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full font-bold',
              'transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300',
              selected
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            <span aria-hidden>{opt.icon}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

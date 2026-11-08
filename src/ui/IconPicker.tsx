import { cn } from './cn';
import { ICON_GROUPS } from './tokens';
import type { IconGroup } from './tokens';

export interface IconPickerProps {
  /** Currently selected icon (emoji string), if any. */
  value?: string;
  onChange: (icon: string) => void;
  /** Override the groups shown (defaults to the preset ICON_GROUPS). */
  groups?: IconGroup[];
  /** Accessible label for the radio group. */
  label?: string;
  className?: string;
}

/**
 * Grid picker of preset task/reward icons, grouped by theme.
 * Reusable by the tasks and rewards tracks. Behaves as a radiogroup.
 */
export function IconPicker({
  value,
  onChange,
  groups = ICON_GROUPS,
  label = 'Choose an icon',
  className,
}: IconPickerProps) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex flex-col gap-4', className)}>
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
            {group.label}
          </p>
          <div className="grid grid-cols-6 gap-2">
            {group.icons.map((icon) => {
              const selected = icon === value;
              return (
                <button
                  key={icon}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={icon}
                  onClick={() => onChange(icon)}
                  className={cn(
                    'aspect-square min-h-[44px] w-full inline-flex items-center justify-center',
                    'rounded-2xl text-2xl transition-colors',
                    'focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300',
                    selected
                      ? 'bg-indigo-100 ring-2 ring-indigo-500'
                      : 'bg-slate-50 hover:bg-slate-100',
                  )}
                >
                  <span aria-hidden>{icon}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

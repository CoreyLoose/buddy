import { cn } from './cn';
import { AVATAR_PRESETS } from './tokens';

export interface AvatarPickerProps {
  /** Currently selected avatar emoji. */
  value?: string;
  onChange: (avatar: string) => void;
  /** Override the preset emoji list. */
  options?: string[];
  /** Optional accent color applied to the selected ring. */
  accent?: string;
  label?: string;
  className?: string;
}

/**
 * Grid picker of preset avatar emoji for kid profiles.
 * Reusable by the profiles track. Behaves as a radiogroup.
 */
export function AvatarPicker({
  value,
  onChange,
  options = AVATAR_PRESETS,
  accent,
  label = 'Choose an avatar',
  className,
}: AvatarPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('grid grid-cols-6 gap-2', className)}
    >
      {options.map((avatar) => {
        const selected = avatar === value;
        return (
          <button
            key={avatar}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={avatar}
            onClick={() => onChange(avatar)}
            className={cn(
              'aspect-square min-h-[44px] w-full inline-flex items-center justify-center',
              'rounded-full text-3xl transition-colors',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300',
              selected ? 'ring-2' : 'bg-slate-50 hover:bg-slate-100',
            )}
            style={
              selected
                ? {
                    backgroundColor: `${accent ?? '#6366f1'}22`,
                    boxShadow: `0 0 0 2px ${accent ?? '#6366f1'}`,
                  }
                : undefined
            }
          >
            <span aria-hidden>{avatar}</span>
          </button>
        );
      })}
    </div>
  );
}

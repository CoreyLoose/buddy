import { cn } from './cn';
import { ACCENT_COLORS } from './tokens';
import type { AccentColor } from './tokens';

export interface ColorPickerProps {
  /** Currently selected color (hex). */
  value?: string;
  onChange: (hex: string) => void;
  /** Override the preset accent palette. */
  options?: AccentColor[];
  label?: string;
  className?: string;
}

/**
 * Swatch picker over the kid-friendly accent palette (stores a hex string).
 * Reusable by the profiles track for a kid's theme color. Behaves as a radiogroup.
 */
export function ColorPicker({
  value,
  onChange,
  options = ACCENT_COLORS,
  label = 'Choose a color',
  className,
}: ColorPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex flex-wrap gap-3', className)}
    >
      {options.map((color) => {
        const selected = color.hex.toLowerCase() === value?.toLowerCase();
        return (
          <button
            key={color.key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color.label}
            title={color.label}
            onClick={() => onChange(color.hex)}
            className={cn(
              'w-11 h-11 rounded-full transition-transform',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-slate-400',
              selected ? 'scale-110 ring-2 ring-offset-2 ring-slate-700' : 'hover:scale-105',
            )}
            style={{ backgroundColor: color.hex }}
          >
            {selected && (
              <span aria-hidden className="text-white text-lg font-black drop-shadow">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

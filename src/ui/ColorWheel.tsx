import { useRef } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { cn } from './cn';

export interface ColorWheelProps {
  /** Currently selected color (#rrggbb). */
  value: string;
  onChange: (hex: string) => void;
  /** Diameter in px. */
  size?: number;
  label?: string;
  className?: string;
}

/** Lowest saturation the wheel yields, so a pick is never near-white (unreadable). */
const MIN_SAT = 0.25;

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { h: 0, s: 1, v: 1 };
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${to(f(5))}${to(f(3))}${to(f(1))}`;
}

/**
 * Hue/saturation color wheel. Drag (or tap) anywhere on the wheel to pick a
 * color; arrow keys nudge hue (left/right) and saturation (up/down). Emits #rrggbb.
 */
export function ColorWheel({
  value,
  onChange,
  size = 240,
  label = 'Color wheel',
  className,
}: ColorWheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { h, s } = hexToHsv(value);
  const V = 0.95;

  function pick(e: PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const radius = rect.width / 2;
    const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const sat = Math.min(1, Math.hypot(dx, dy) / radius);
    onChange(hsvToHex(hue, Math.max(MIN_SAT, sat), V));
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 15 : 5;
    let nh = h;
    let ns = s;
    if (e.key === 'ArrowRight') nh = (h + step) % 360;
    else if (e.key === 'ArrowLeft') nh = (h - step + 360) % 360;
    else if (e.key === 'ArrowUp') ns = Math.min(1, s + 0.05);
    else if (e.key === 'ArrowDown') ns = Math.max(MIN_SAT, s - 0.05);
    else return;
    e.preventDefault();
    onChange(hsvToHex(nh, Math.max(MIN_SAT, ns), V));
  }

  // Thumb position: angle = hue, distance from center = saturation.
  const rad = (h * Math.PI) / 180;
  const r = (size / 2) * s;
  const thumb = 32;

  return (
    <div
      ref={ref}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={Math.round(h)}
      aria-valuetext={value}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        pick(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons > 0) pick(e);
      }}
      className={cn(
        'relative touch-none select-none rounded-full shadow-inner cursor-pointer',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-slate-400',
        className,
      )}
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle closest-side, rgba(255,255,255,0.75), rgba(255,255,255,0) 100%), conic-gradient(from 90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-full border-4 border-white shadow-lg"
        style={{
          width: thumb,
          height: thumb,
          left: size / 2 + Math.cos(rad) * r - thumb / 2,
          top: size / 2 + Math.sin(rad) * r - thumb / 2,
          backgroundColor: value,
        }}
      />
    </div>
  );
}

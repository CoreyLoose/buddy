// Design tokens & preset data for the kid-friendly design system.
// Pure data (no React) so any track can import without pulling in components.

/** Kid-friendly accent palette. Each has an AA-contrast-safe text pairing on white. */
export interface AccentColor {
  /** Stable key used when storing a choice (e.g. Kid.color can hold the hex). */
  key: string;
  /** Human label (for pickers / a11y). */
  label: string;
  /** Hex value — also what the store expects for `Kid.color`. */
  hex: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  { key: 'pink', label: 'Bubblegum', hex: '#ec4899' },
  { key: 'purple', label: 'Grape', hex: '#8b5cf6' },
  { key: 'blue', label: 'Sky', hex: '#3b82f6' },
  { key: 'teal', label: 'Mint', hex: '#14b8a6' },
  { key: 'green', label: 'Clover', hex: '#22c55e' },
  { key: 'amber', label: 'Sunshine', hex: '#f59e0b' },
  { key: 'orange', label: 'Tangerine', hex: '#f97316' },
  { key: 'red', label: 'Cherry', hex: '#ef4444' },
];

export const DEFAULT_ACCENT = ACCENT_COLORS[2].hex; // Sky blue

/**
 * Avatar presets — emoji that read well at large sizes for kids.
 * `Kid.avatar` stores one of these emoji strings (or any other emoji a picker yields).
 */
export const AVATAR_PRESETS: string[] = [
  '🦄', '🚀', '🐯', '🦊', '🐼', '🐸', '🦖', '🐙',
  '🦁', '🐶', '🐱', '🐵', '🐧', '🦉', '🐝', '🦋',
  '🌟', '🌈', '🍀', '🚁', '🏆', '🎸', '⚽', '🎨',
];

export const DEFAULT_AVATAR = AVATAR_PRESETS[0];

/**
 * Icon presets grouped by theme, for tasks and rewards.
 * Stored as the emoji string on `Task.icon` / `Reward.icon`.
 */
export interface IconGroup {
  label: string;
  icons: string[];
}

export const ICON_GROUPS: IconGroup[] = [
  {
    label: 'Chores',
    icons: ['🧹', '🧺', '🛏️', '🍽️', '🗑️', '🧼', '🪣', '🧽', '🚿', '🪥'],
  },
  {
    label: 'School',
    icons: ['📚', '✏️', '📝', '🎒', '🔢', '🧮', '🖍️', '📖'],
  },
  {
    label: 'Play & Care',
    icons: ['🧸', '🎨', '⚽', '🚲', '🐶', '🌱', '🎹', '🧩'],
  },
  {
    label: 'Rewards',
    icons: ['📺', '🍦', '🎬', '🍕', '🎮', '🍭', '🎁', '🎡', '🏅', '⭐'],
  },
];

/** Flat list of every preset icon (handy default for pickers). */
export const ALL_ICONS: string[] = ICON_GROUPS.flatMap((g) => g.icons);

export const DEFAULT_ICON = '⭐';

/** Shared size scale for touch targets (px). Minimum interactive size is 44px (WCAG). */
export const TOUCH = {
  /** Comfortable minimum for any tappable control. */
  min: 44,
  /** Default big button height. */
  md: 56,
  /** Extra-large hero button. */
  lg: 72,
} as const;

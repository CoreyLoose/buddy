/** Preset emoji avatars offered in the profile form. */
export const AVATAR_PRESETS = [
  '🦄', '🚀', '🐱', '🐶', '🦖', '🐯', '🦊', '🐼',
  '🐸', '🐙', '🦋', '🌟', '🌈', '⚽', '🎨', '🎸',
] as const;

/** Preset accent colors (hex) offered in the profile form. */
export const COLOR_PRESETS = [
  '#f472b6', // pink
  '#60a5fa', // blue
  '#34d399', // green
  '#fbbf24', // amber
  '#a78bfa', // violet
  '#fb7185', // rose
  '#22d3ee', // cyan
  '#f97316', // orange
] as const;

export const DEFAULT_AVATAR = AVATAR_PRESETS[0];
export const DEFAULT_COLOR = COLOR_PRESETS[0];

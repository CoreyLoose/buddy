import type { PartOfDay } from '@/store';

/** Days of week, index = store day number (0=Sun..6=Sat). */
export const WEEKDAYS: { value: number; short: string; label: string }[] = [
  { value: 0, short: 'Sun', label: 'Sunday' },
  { value: 1, short: 'Mon', label: 'Monday' },
  { value: 2, short: 'Tue', label: 'Tuesday' },
  { value: 3, short: 'Wed', label: 'Wednesday' },
  { value: 4, short: 'Thu', label: 'Thursday' },
  { value: 5, short: 'Fri', label: 'Friday' },
  { value: 6, short: 'Sat', label: 'Saturday' },
];

/** Part-of-day sections, in display order. Tasks with no partOfDay fall into "anytime". */
export const PART_OF_DAY_ORDER: PartOfDay[] = ['morning', 'afternoon', 'evening'];

export const PART_OF_DAY_META: Record<
  PartOfDay | 'anytime',
  { label: string; icon: string }
> = {
  morning: { label: 'Morning', icon: '🌅' },
  afternoon: { label: 'Afternoon', icon: '☀️' },
  evening: { label: 'Evening', icon: '🌙' },
  anytime: { label: 'Anytime', icon: '⭐' },
};

/** A small emoji palette for the icon picker. */
export const ICON_CHOICES = [
  '🪥', '🛏️', '📚', '🧸', '🧹', '🍽️', '🚿', '👕', '🐕', '🌱',
  '🧺', '🗑️', '🪣', '🎒', '✏️', '🎹', '⚽', '🧴', '🥣', '💧',
];

export const DEFAULT_ICON = ICON_CHOICES[0];

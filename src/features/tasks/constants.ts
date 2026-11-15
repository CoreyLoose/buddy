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

export interface TaskIcon {
  /** Emoji shown to the kid. A pair (e.g. "🧦👟") is allowed for compound ideas. */
  emoji: string;
  /** Plain-words name — tooltip / screen-reader text for grown-ups. */
  name: string;
}

export interface TaskIconGroup {
  label: string;
  icons: TaskIcon[];
}

const i = (emoji: string, name: string): TaskIcon => ({ emoji, name });

/** Icon palette for tasks, grouped by theme (80 icons). */
export const TASK_ICON_GROUPS: TaskIconGroup[] = [
  {
    label: 'Getting ready',
    icons: [
      i('🪥', 'Brush teeth'),
      i('👕🌙', 'Put on pajamas'),
      i('🧦👟', 'Socks & shoes'),
      i('👕', 'Get dressed'),
      i('🧥', 'Put on coat'),
      i('🧢', 'Hat'),
      i('🚿', 'Shower'),
      i('🛁', 'Bath'),
      i('🧼', 'Wash hands'),
      i('🚽', 'Potty'),
      i('🧴', 'Lotion / sunscreen'),
      i('🥣', 'Breakfast'),
      i('🍎', 'Snack'),
      i('🥛', 'Drink milk'),
      i('💧', 'Drink water'),
      i('🛏️', 'Make bed'),
      i('🛌', 'Go to bed'),
      i('⏰', 'Wake up'),
      i('📖', 'Bedtime story'),
      i('🎒', 'Pack backpack'),
    ],
  },
  {
    label: 'Chores',
    icons: [
      i('🧹', 'Sweep'),
      i('🧺', 'Laundry'),
      i('👚', 'Fold clothes'),
      i('🧽', 'Scrub'),
      i('🪣', 'Mop'),
      i('🗑️', 'Take out trash'),
      i('♻️', 'Recycling'),
      i('🍽️', 'Set the table'),
      i('🍴', 'Dinner'),
      i('🧸', 'Tidy toys'),
      i('📦', 'Put things away'),
      i('🛋️', 'Tidy living room'),
      i('🪟', 'Wipe windows'),
      i('🐕', 'Walk the dog'),
      i('🐈', 'Feed the cat'),
      i('🐟', 'Feed the fish'),
      i('🌱', 'Water plants'),
      i('🌻', 'Garden'),
      i('🛒', 'Groceries'),
      i('🚗', 'Car ride'),
    ],
  },
  {
    label: 'School & learning',
    icons: [
      i('📚', 'Read books'),
      i('✏️', 'Homework'),
      i('📝', 'Write'),
      i('🏫', 'School'),
      i('🔢', 'Numbers'),
      i('🧮', 'Math'),
      i('🔤', 'Letters'),
      i('🖍️', 'Color'),
      i('✂️', 'Cut & craft'),
      i('📐', 'Shapes'),
      i('🔬', 'Science'),
      i('🌍', 'Geography'),
      i('💻', 'Computer'),
      i('🧠', 'Think'),
      i('🎹', 'Piano'),
      i('🎻', 'Violin'),
      i('🎸', 'Guitar'),
      i('🥁', 'Drums'),
      i('🎤', 'Sing'),
      i('🎭', 'Drama'),
    ],
  },
  {
    label: 'Play & outdoors',
    icons: [
      i('⚽', 'Soccer'),
      i('🏀', 'Basketball'),
      i('⚾', 'Baseball'),
      i('🚲', 'Bike'),
      i('🛴', 'Scooter'),
      i('🏊', 'Swim'),
      i('🏃', 'Run'),
      i('🤸', 'Gymnastics'),
      i('🧘', 'Calm down'),
      i('🎨', 'Art'),
      i('🧩', 'Puzzle'),
      i('🎲', 'Board game'),
      i('🧱', 'Blocks'),
      i('🚂', 'Trains'),
      i('🪁', 'Kite'),
      i('🌳', 'Go outside'),
      i('🥾', 'Hike'),
      i('⛺', 'Camp'),
      i('❤️', 'Be kind'),
      i('⭐', 'Special'),
    ],
  },
];

/** Flat list of every task icon emoji. */
export const ICON_CHOICES: string[] = TASK_ICON_GROUPS.flatMap((g) =>
  g.icons.map((x) => x.emoji),
);

export const DEFAULT_ICON = ICON_CHOICES[0];

/** True when an icon string holds two or more emoji (e.g. "🧦👟"), so it needs a smaller font to fit. */
export function isIconPair(icon: string): boolean {
  const Segmenter = (Intl as unknown as {
    Segmenter?: new (l?: string, o?: { granularity: 'grapheme' }) => {
      segment(s: string): Iterable<unknown>;
    };
  }).Segmenter;
  if (Segmenter) {
    return [...new Segmenter(undefined, { granularity: 'grapheme' }).segment(icon)].length > 1;
  }
  // Fallback: count code points that aren't variation selectors / joiners.
  return [...icon].filter((c) => c !== '\uFE0F' && c !== '\u200D').length > 1;
}

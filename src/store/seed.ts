import type { AppData } from './types';

/** Demo/first-run data so the app is never empty on first load. */
export function createSeedData(): AppData {
  const ozzyId = 'kid_ozzy';
  const orenId = 'kid_oren';

  return {
    kids: [
      { id: ozzyId, name: 'Ozzy', avatar: '🦖', color: '#22c55e' },
      { id: orenId, name: 'Oren', avatar: '🦉', color: '#3b82f6' },
    ],
    tasks: [
      {
        id: 'task_brush_am',
        title: 'Brush teeth',
        icon: '🪥',
        type: 'routine',
        assignedTo: [ozzyId, orenId],
        schedule: { days: [], partOfDay: 'morning' },
        starValue: 1,
        order: 0,
      },
      {
        id: 'task_bed',
        title: 'Make the bed',
        icon: '🛏️',
        type: 'chore',
        assignedTo: [ozzyId, orenId],
        schedule: { days: [], partOfDay: 'morning' },
        starValue: 2,
        order: 1,
      },
      {
        id: 'task_homework',
        title: 'Do homework',
        icon: '📚',
        type: 'chore',
        assignedTo: [ozzyId],
        schedule: { days: [1, 2, 3, 4, 5], partOfDay: 'afternoon' },
        starValue: 3,
        order: 2,
      },
      {
        id: 'task_pajamas',
        title: 'Put on pajamas',
        icon: '🧸',
        type: 'routine',
        assignedTo: [ozzyId, orenId],
        schedule: { days: [], partOfDay: 'evening' },
        starValue: 1,
        order: 3,
      },
    ],
    completions: [],
    rewards: [
      { id: 'reward_screen', title: '30 min screen time', icon: '📺', cost: 5, active: true },
      { id: 'reward_icecream', title: 'Ice cream treat', icon: '🍦', cost: 10, active: true },
      { id: 'reward_movie', title: 'Family movie pick', icon: '🎬', cost: 15, active: true },
    ],
    redemptions: [],
  };
}

/** Empty state (used when the user chooses to start fresh). */
export function emptyData(): AppData {
  return { kids: [], tasks: [], completions: [], rewards: [], redemptions: [] };
}

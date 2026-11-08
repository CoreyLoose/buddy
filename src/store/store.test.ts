import { beforeEach, describe, expect, it } from 'vitest';
import {
  useStore,
  STORAGE_KEY,
  selectStarBalance,
  selectStarsEarned,
  selectTasksForDate,
  selectIsTaskDone,
} from './store';
import { emptyData, createSeedData } from './seed';

function resetStore() {
  localStorage.clear();
  useStore.setState({ ...emptyData() });
}

beforeEach(() => {
  resetStore();
});

describe('kids', () => {
  it('adds, updates, and removes a kid', () => {
    const id = useStore.getState().addKid({ name: 'Mia', avatar: '🐱', color: '#000' });
    expect(useStore.getState().kids).toHaveLength(1);

    useStore.getState().updateKid(id, { name: 'Mia B.' });
    expect(useStore.getState().kids[0].name).toBe('Mia B.');

    useStore.getState().removeKid(id);
    expect(useStore.getState().kids).toHaveLength(0);
  });

  it('removing a kid cleans up their completions, redemptions, and task assignments', () => {
    const kidId = useStore.getState().addKid({ name: 'Mia', avatar: '🐱', color: '#000' });
    const taskId = useStore.getState().addTask({
      title: 'Feed cat',
      icon: '🐱',
      type: 'chore',
      assignedTo: [kidId],
      schedule: { days: [] },
      starValue: 2,
    });
    useStore.getState().toggleCompletion(taskId, kidId, '2026-01-01');

    useStore.getState().removeKid(kidId);
    expect(useStore.getState().completions).toHaveLength(0);
    expect(useStore.getState().tasks[0].assignedTo).not.toContain(kidId);
  });
});

describe('completions and stars', () => {
  let kidId: string;
  let taskId: string;

  beforeEach(() => {
    kidId = useStore.getState().addKid({ name: 'Mia', avatar: '🐱', color: '#000' });
    taskId = useStore.getState().addTask({
      title: 'Brush teeth',
      icon: '🪥',
      type: 'routine',
      assignedTo: [kidId],
      schedule: { days: [] },
      starValue: 3,
    });
  });

  it('awards stars when a task is completed and removes them when undone', () => {
    useStore.getState().toggleCompletion(taskId, kidId, '2026-01-01');
    expect(selectStarsEarned(useStore.getState(), kidId)).toBe(3);
    expect(selectIsTaskDone(useStore.getState(), taskId, kidId, '2026-01-01')).toBe(true);

    useStore.getState().toggleCompletion(taskId, kidId, '2026-01-01');
    expect(selectStarsEarned(useStore.getState(), kidId)).toBe(0);
    expect(selectIsTaskDone(useStore.getState(), taskId, kidId, '2026-01-01')).toBe(false);
  });

  it('tracks completions per day independently', () => {
    useStore.getState().toggleCompletion(taskId, kidId, '2026-01-01');
    useStore.getState().toggleCompletion(taskId, kidId, '2026-01-02');
    expect(useStore.getState().completions).toHaveLength(2);
    expect(selectStarBalance(useStore.getState(), kidId)).toBe(6);
  });
});

describe('scheduling', () => {
  it('returns only tasks assigned and scheduled for the date', () => {
    const kidId = useStore.getState().addKid({ name: 'Mia', avatar: '🐱', color: '#000' });
    // Everyday task
    useStore.getState().addTask({
      title: 'Daily',
      icon: '🌞',
      type: 'routine',
      assignedTo: [kidId],
      schedule: { days: [] },
      starValue: 1,
    });
    // Weekday-only task (Mon-Fri). 2026-01-01 is a Thursday (day 4).
    useStore.getState().addTask({
      title: 'School',
      icon: '📚',
      type: 'chore',
      assignedTo: [kidId],
      schedule: { days: [1, 2, 3, 4, 5] },
      starValue: 2,
    });

    const thursday = selectTasksForDate(useStore.getState(), kidId, '2026-01-01');
    expect(thursday.map((t) => t.title)).toEqual(['Daily', 'School']);

    // 2026-01-03 is a Saturday (day 6)
    const saturday = selectTasksForDate(useStore.getState(), kidId, '2026-01-03');
    expect(saturday.map((t) => t.title)).toEqual(['Daily']);
  });
});

describe('rewards and redemptions', () => {
  let kidId: string;
  let rewardId: string;

  beforeEach(() => {
    kidId = useStore.getState().addKid({ name: 'Mia', avatar: '🐱', color: '#000' });
    rewardId = useStore.getState().addReward({
      title: 'Ice cream',
      icon: '🍦',
      cost: 5,
      active: true,
    });
  });

  it('blocks redemption when the kid cannot afford it', () => {
    const result = useStore.getState().redeemReward(rewardId, kidId);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Not enough stars');
    expect(useStore.getState().redemptions).toHaveLength(0);
  });

  it('redeems and deducts stars when affordable', () => {
    const taskId = useStore.getState().addTask({
      title: 'Chore',
      icon: '🧹',
      type: 'chore',
      assignedTo: [kidId],
      schedule: { days: [] },
      starValue: 5,
    });
    useStore.getState().toggleCompletion(taskId, kidId, '2026-01-01');
    expect(selectStarBalance(useStore.getState(), kidId)).toBe(5);

    const result = useStore.getState().redeemReward(rewardId, kidId);
    expect(result.ok).toBe(true);
    expect(selectStarBalance(useStore.getState(), kidId)).toBe(0);
    expect(useStore.getState().redemptions).toHaveLength(1);
  });

  it('refuses to redeem an inactive reward', () => {
    useStore.getState().updateReward(rewardId, { active: false });
    const result = useStore.getState().redeemReward(rewardId, kidId);
    expect(result.ok).toBe(false);
  });
});

describe('persistence', () => {
  it('writes state to localStorage under the versioned key', () => {
    useStore.getState().addKid({ name: 'Persisted', avatar: '💾', color: '#000' });
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe(1);
    expect(parsed.state.kids.some((k: { name: string }) => k.name === 'Persisted')).toBe(true);
  });

  it('exportData returns a plain data snapshot without action functions', () => {
    useStore.setState({ ...createSeedData() });
    const snapshot = useStore.getState().exportData();
    expect(Object.keys(snapshot).sort()).toEqual([
      'completions',
      'kids',
      'redemptions',
      'rewards',
      'tasks',
    ]);
    expect('addKid' in snapshot).toBe(false);
  });
});

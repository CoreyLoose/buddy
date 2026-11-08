import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppData,
  Completion,
  ID,
  Kid,
  Redemption,
  Reward,
  Task,
} from './types';
import { createId, dayOfWeek, toLocalDateString } from './utils';
import { createSeedData, emptyData } from './seed';

export const STORAGE_KEY = 'chore-stars/app';
export const SCHEMA_VERSION = 1;

export interface StoreActions {
  // Kids
  addKid: (data: Omit<Kid, 'id'>) => ID;
  updateKid: (id: ID, patch: Partial<Omit<Kid, 'id'>>) => void;
  removeKid: (id: ID) => void;

  // Tasks
  addTask: (data: Omit<Task, 'id' | 'order'> & { order?: number }) => ID;
  updateTask: (id: ID, patch: Partial<Omit<Task, 'id'>>) => void;
  removeTask: (id: ID) => void;
  reorderTasks: (orderedIds: ID[]) => void;

  // Completions (earning stars)
  /** Toggle a task done/undone for a kid on a date (defaults to today). */
  toggleCompletion: (taskId: ID, kidId: ID, date?: string) => void;

  // Rewards
  addReward: (data: Omit<Reward, 'id'>) => ID;
  updateReward: (id: ID, patch: Partial<Omit<Reward, 'id'>>) => void;
  removeReward: (id: ID) => void;

  // Redemptions (spending stars)
  redeemReward: (rewardId: ID, kidId: ID) => { ok: boolean; reason?: string };

  // Data management
  resetToSeed: () => void;
  resetAll: () => void;
  importData: (data: AppData) => void;
  exportData: () => AppData;
}

export type StoreState = AppData & StoreActions;

function findTask(tasks: Task[], id: ID): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createSeedData(),

      // ---- Kids ----
      addKid: (data) => {
        const id = createId();
        set((s) => ({ kids: [...s.kids, { ...data, id }] }));
        return id;
      },
      updateKid: (id, patch) =>
        set((s) => ({
          kids: s.kids.map((k) => (k.id === id ? { ...k, ...patch } : k)),
        })),
      removeKid: (id) =>
        set((s) => ({
          kids: s.kids.filter((k) => k.id !== id),
          // Clean up references so no orphaned history lingers.
          tasks: s.tasks.map((t) => ({
            ...t,
            assignedTo: t.assignedTo.filter((kid) => kid !== id),
          })),
          completions: s.completions.filter((c) => c.kidId !== id),
          redemptions: s.redemptions.filter((r) => r.kidId !== id),
        })),

      // ---- Tasks ----
      addTask: (data) => {
        const id = createId();
        set((s) => {
          const order = data.order ?? s.tasks.length;
          return { tasks: [...s.tasks, { ...data, id, order }] };
        });
        return id;
      },
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          completions: s.completions.filter((c) => c.taskId !== id),
        })),
      reorderTasks: (orderedIds) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            const idx = orderedIds.indexOf(t.id);
            return idx === -1 ? t : { ...t, order: idx };
          }),
        })),

      // ---- Completions ----
      toggleCompletion: (taskId, kidId, date = toLocalDateString()) =>
        set((s) => {
          const existing = s.completions.find(
            (c) => c.taskId === taskId && c.kidId === kidId && c.date === date,
          );
          if (existing) {
            // Undo completion.
            return { completions: s.completions.filter((c) => c.id !== existing.id) };
          }
          const task = findTask(s.tasks, taskId);
          if (!task) return {};
          const completion: Completion = {
            id: createId(),
            taskId,
            kidId,
            date,
            status: 'done',
            starsAwarded: task.starValue,
          };
          return { completions: [...s.completions, completion] };
        }),

      // ---- Rewards ----
      addReward: (data) => {
        const id = createId();
        set((s) => ({ rewards: [...s.rewards, { ...data, id }] }));
        return id;
      },
      updateReward: (id, patch) =>
        set((s) => ({
          rewards: s.rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      removeReward: (id) =>
        set((s) => ({ rewards: s.rewards.filter((r) => r.id !== id) })),

      // ---- Redemptions ----
      redeemReward: (rewardId, kidId) => {
        const s = get();
        const reward = s.rewards.find((r) => r.id === rewardId);
        if (!reward) return { ok: false, reason: 'Reward not found' };
        if (!reward.active) return { ok: false, reason: 'Reward is not available' };
        const balance = selectStarBalance(s, kidId);
        if (balance < reward.cost) return { ok: false, reason: 'Not enough stars' };
        const redemption: Redemption = {
          id: createId(),
          rewardId,
          kidId,
          date: toLocalDateString(),
          cost: reward.cost,
        };
        set((prev) => ({ redemptions: [...prev.redemptions, redemption] }));
        return { ok: true };
      },

      // ---- Data management ----
      resetToSeed: () => set(() => ({ ...createSeedData() })),
      resetAll: () => set(() => ({ ...emptyData() })),
      importData: (data) => set(() => ({ ...data })),
      exportData: () => {
        const { kids, tasks, completions, rewards, redemptions } = get();
        return { kids, tasks, completions, rewards, redemptions };
      },
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Only persist data, never action functions.
      partialize: (s) => ({
        kids: s.kids,
        tasks: s.tasks,
        completions: s.completions,
        rewards: s.rewards,
        redemptions: s.redemptions,
      }),
      migrate: (persisted, fromVersion) => {
        // Future schema migrations go here, e.g.:
        // if (fromVersion < 2) { ...transform persisted... }
        void fromVersion;
        return persisted as AppData;
      },
    },
  ),
);

// ---- Pure selectors (usable in components and tests) ----

export function selectStarsEarned(data: AppData, kidId: ID): number {
  return data.completions
    .filter((c) => c.kidId === kidId && c.status === 'done')
    .reduce((sum, c) => sum + c.starsAwarded, 0);
}

export function selectStarsSpent(data: AppData, kidId: ID): number {
  return data.redemptions
    .filter((r) => r.kidId === kidId)
    .reduce((sum, r) => sum + r.cost, 0);
}

export function selectStarBalance(data: AppData, kidId: ID): number {
  return selectStarsEarned(data, kidId) - selectStarsSpent(data, kidId);
}

/** Tasks assigned to a kid that are scheduled for the given date. */
export function selectTasksForDate(
  data: AppData,
  kidId: ID,
  date: string = toLocalDateString(),
): Task[] {
  const dow = dayOfWeek(date);
  return data.tasks
    .filter((t) => t.assignedTo.includes(kidId))
    .filter((t) => t.schedule.days.length === 0 || t.schedule.days.includes(dow))
    .sort((a, b) => a.order - b.order);
}

export function selectIsTaskDone(
  data: AppData,
  taskId: ID,
  kidId: ID,
  date: string = toLocalDateString(),
): boolean {
  return data.completions.some(
    (c) => c.taskId === taskId && c.kidId === kidId && c.date === date && c.status === 'done',
  );
}

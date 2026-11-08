import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ID } from '@/store';

/**
 * Remembers which kid is pinned to each side of the Family dashboard.
 *
 * Unlike the single-kid session selection (which is intentionally ephemeral),
 * the family layout IS persisted — the dashboard is meant to be left open and
 * reopen to the same two kids. Stored under its own localStorage key, separate
 * from the app data store.
 */
export interface FamilyState {
  leftKidId: ID | null;
  rightKidId: ID | null;
  setLeftKid: (id: ID | null) => void;
  setRightKid: (id: ID | null) => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set) => ({
      leftKidId: null,
      rightKidId: null,
      setLeftKid: (id) => set({ leftKidId: id }),
      setRightKid: (id) => set({ rightKidId: id }),
    }),
    {
      name: 'chore-stars/family',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

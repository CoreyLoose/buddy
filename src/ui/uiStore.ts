import { create } from 'zustand';

/**
 * Small, SEPARATE UI-only store for ephemeral shell state (which view is active).
 * This is intentionally NOT persisted and NOT the data store — it never touches
 * localStorage or the chore/reward domain. Feature tracks read `view` to know
 * whether the kid or grown-up UI is showing.
 */
export type AppView = 'kid' | 'manage';

export interface UiState {
  view: AppView;
  setView: (view: AppView) => void;
  toggleView: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  view: 'kid',
  setView: (view) => set({ view }),
  toggleView: () => set((s) => ({ view: s.view === 'kid' ? 'manage' : 'kid' })),
}));

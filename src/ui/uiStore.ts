import { create } from 'zustand';

/**
 * Small, SEPARATE UI-only store for ephemeral shell state (which view is active).
 * This is intentionally NOT persisted and NOT the data store — it never touches
 * localStorage or the chore/reward domain. Feature tracks read `view` to know
 * which UI is showing.
 *
 * Views:
 *  - 'family' : the two-kid at-a-glance dashboard (default home)
 *  - 'kid'    : a single kid's full daily view
 *  - 'manage' : the grown-up management view
 */
export type AppView = 'family' | 'kid' | 'manage';

const ORDER: AppView[] = ['family', 'kid', 'manage'];

export interface UiState {
  view: AppView;
  setView: (view: AppView) => void;
  /** Advance to the next view in order (family → kid → manage → family). */
  toggleView: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  view: 'family',
  setView: (view) => set({ view }),
  toggleView: () =>
    set((s) => ({ view: ORDER[(ORDER.indexOf(s.view) + 1) % ORDER.length] })),
}));

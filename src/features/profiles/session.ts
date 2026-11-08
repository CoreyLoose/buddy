import { create } from 'zustand';
import { useStore } from '@/store';
import type { ID, Kid } from '@/store';

/**
 * Tiny, in-memory "session" store for Track A (Profiles).
 *
 * It holds only UI/session state — *which* kid is currently active — and is
 * intentionally NOT persisted to localStorage. The authoritative app data
 * (the kids themselves, tasks, stars, …) lives in `@/store`; this store just
 * remembers the current selection for the lifetime of the page.
 *
 * Other tracks (tasks, rewards) should read the active kid from here:
 *
 *   import { useSession, useActiveKid } from '@/features/profiles';
 *
 *   const activeKidId = useSession((s) => s.activeKidId);   // raw id (or null)
 *   const activeKid = useActiveKid();                        // resolved Kid (or null)
 *   useSession.getState().setActiveKid(id);                 // imperative set
 */
export interface SessionState {
  /** The currently selected kid, or `null` when none is chosen. */
  activeKidId: ID | null;
  /** Select a kid as active (pass `null` to clear). */
  setActiveKid: (kidId: ID | null) => void;
  /** Clear the active selection (back to the "who's using the app?" screen). */
  clearActiveKid: () => void;
}

export const useSession = create<SessionState>((set) => ({
  activeKidId: null,
  setActiveKid: (kidId) => set({ activeKidId: kidId }),
  clearActiveKid: () => set({ activeKidId: null }),
}));

/** Pure selector: resolve the active Kid from a kids list + active id. */
export function selectActiveKid(kids: Kid[], activeKidId: ID | null): Kid | null {
  if (!activeKidId) return null;
  return kids.find((k) => k.id === activeKidId) ?? null;
}

/**
 * Convenience hook: the resolved active `Kid` object (or `null`).
 *
 * Reads both the session store (for the id) and the data store (for the kid),
 * so it stays correct if the active kid is edited or deleted elsewhere.
 */
export function useActiveKid(): Kid | null {
  const activeKidId = useSession((s) => s.activeKidId);
  const kids = useStore((s) => s.kids);
  return selectActiveKid(kids, activeKidId);
}

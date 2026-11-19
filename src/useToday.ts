import { useSyncExternalStore } from 'react';
import { toLocalDateString } from '@/store';

/** Fallback poll. Timers are throttled/frozen on sleeping tablets and in
 *  background tabs, so we never rely solely on the midnight timeout. */
const POLL_MS = 30_000;

/** Milliseconds until the next local midnight (DST-safe via Date arithmetic). */
export function msUntilNextMidnight(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return next.getTime() - now.getTime();
}

/**
 * Subscribe to "the calendar day may have changed" signals. The snapshot is
 * always recomputed from the clock, so a signal that fires late (or spuriously)
 * is harmless — React only re-renders if the date string actually differs.
 *
 * Signals: a timer aimed at the next midnight, a slow poll, and the page
 * coming back to the foreground (tablet woken up, tab refocused).
 */
function subscribe(onChange: () => void): () => void {
  let midnightTimer: ReturnType<typeof setTimeout>;

  const scheduleMidnight = () => {
    // +50ms so we land just *after* midnight, never a hair before it.
    midnightTimer = setTimeout(() => {
      onChange();
      scheduleMidnight();
    }, msUntilNextMidnight() + 50);
  };
  scheduleMidnight();

  const poll = setInterval(onChange, POLL_MS);
  const onVisible = () => {
    if (document.visibilityState === 'visible') onChange();
  };

  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onChange);
  window.addEventListener('pageshow', onChange);

  return () => {
    clearTimeout(midnightTimer);
    clearInterval(poll);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', onChange);
    window.removeEventListener('pageshow', onChange);
  };
}

/**
 * The current local date (YYYY-MM-DD). Re-renders the caller when the calendar
 * day rolls over, so an app left open overnight is fresh for the next morning.
 */
export function useToday(): string {
  return useSyncExternalStore(subscribe, toLocalDateString, toLocalDateString);
}

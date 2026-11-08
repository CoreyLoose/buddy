import { useEffect } from 'react';

/**
 * Keep the screen awake while the app is open, using the Screen Wake Lock API.
 *
 * Intended for an always-on, plugged-in tablet (e.g. Chrome on Android). The
 * browser automatically releases a screen wake lock whenever the tab/page is
 * hidden (switched away, screen turned off via power button), so we re-acquire
 * it when the page becomes visible again. No-ops gracefully where the API is
 * unavailable (e.g. older browsers, non-secure contexts) or the request is
 * rejected.
 */
export function useWakeLock(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (cancelled || sentinel || document.visibilityState !== 'visible') return;
      try {
        sentinel = await navigator.wakeLock.request('screen');
        sentinel.addEventListener('release', () => {
          sentinel = null;
        });
      } catch {
        // Request can reject (not allowed, tab not visible, battery saver) —
        // ignore and try again on the next visibility change.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      void sentinel?.release().catch(() => {});
    };
  }, [enabled]);
}

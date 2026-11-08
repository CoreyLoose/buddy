import type { AppData, ID } from '@/store';
import { selectStarBalance, selectStarsEarned, selectStarsSpent } from '@/store';

/** A single dated entry in a kid's star ledger — either earned (from a completion) or spent (from a redemption). */
export interface LedgerEntry {
  id: ID;
  kind: 'earn' | 'spend';
  date: string; // YYYY-MM-DD (local)
  /** Signed star delta: positive for earn, negative for spend. */
  delta: number;
  title: string;
  icon: string;
}

/** Summary numbers for a kid, derived from the store selectors. */
export interface LedgerSummary {
  balance: number;
  earned: number;
  spent: number;
}

export function ledgerSummary(data: AppData, kidId: ID): LedgerSummary {
  return {
    balance: selectStarBalance(data, kidId),
    earned: selectStarsEarned(data, kidId),
    spent: selectStarsSpent(data, kidId),
  };
}

/**
 * Combine a kid's completions (earned) and redemptions (spent) into a single
 * timeline, most recent first. Pure function so the math is easy to unit-test.
 */
export function buildLedger(data: AppData, kidId: ID): LedgerEntry[] {
  const earns: LedgerEntry[] = data.completions
    .filter((c) => c.kidId === kidId && c.status === 'done')
    .map((c) => {
      const task = data.tasks.find((t) => t.id === c.taskId);
      return {
        id: c.id,
        kind: 'earn' as const,
        date: c.date,
        delta: c.starsAwarded,
        title: task?.title ?? 'Completed task',
        icon: task?.icon ?? '⭐',
      };
    });

  const spends: LedgerEntry[] = data.redemptions
    .filter((r) => r.kidId === kidId)
    .map((r) => {
      const reward = data.rewards.find((rw) => rw.id === r.rewardId);
      return {
        id: r.id,
        kind: 'spend' as const,
        date: r.date,
        delta: -r.cost,
        title: reward?.title ?? 'Redeemed reward',
        icon: reward?.icon ?? '🎁',
      };
    });

  // Most recent date first; stable within a date (earns before spends as listed).
  return [...earns, ...spends].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

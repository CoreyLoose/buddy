import { useStore } from '@/store';
import { buildLedger, ledgerSummary } from './ledger';

export interface StarLedgerProps {
  /** The kid whose balance and history to show. */
  kidId: string;
  /** Optional heading label (e.g. the kid's name). */
  title?: string;
  className?: string;
}

function formatDate(date: string): string {
  // date is YYYY-MM-DD (local). Build a local Date to avoid UTC shifting.
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * C1 — Star balance / ledger. Shows a kid's current balance plus a dated
 * earn/spend timeline (completions + redemptions combined).
 */
export default function StarLedger({ kidId, title, className }: StarLedgerProps) {
  // Subscribe to the raw collections so the ledger re-renders on any change.
  const state = useStore();
  const summary = ledgerSummary(state, kidId);
  const entries = buildLedger(state, kidId);

  return (
    <section
      className={`rounded-2xl bg-white shadow-sm border border-slate-200 p-5 ${className ?? ''}`}
      aria-label="Star ledger"
    >
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title ?? 'Stars'}</h2>
        <span className="font-bold text-amber-500 text-lg" aria-label="Current balance">
          ⭐ {summary.balance}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center">
          <div className="text-xs uppercase tracking-wide text-green-700">Earned</div>
          <div className="text-lg font-bold text-green-700">+{summary.earned}</div>
        </div>
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-center">
          <div className="text-xs uppercase tracking-wide text-rose-700">Spent</div>
          <div className="text-lg font-bold text-rose-700">-{summary.spent}</div>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">No star activity yet.</p>
      ) : (
        <ul className="space-y-2" aria-label="Star history">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <span className="text-xl" aria-hidden="true">
                {entry.icon}
              </span>
              <span className="flex-1">
                <span className="block font-medium text-slate-800">{entry.title}</span>
                <span className="block text-xs text-slate-400">{formatDate(entry.date)}</span>
              </span>
              <span
                className={`font-bold ${entry.kind === 'earn' ? 'text-green-600' : 'text-rose-600'}`}
              >
                {entry.delta > 0 ? `+${entry.delta}` : entry.delta} ⭐
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

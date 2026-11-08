import { useStore, selectStarBalance } from '@/store';
import type { Kid } from '@/store';

export interface KidCardProps {
  kid: Kid;
  /** Highlight the card as the active selection. */
  active?: boolean;
  /** Primary action — usually "select this kid". */
  onSelect?: (kid: Kid) => void;
  /** Optional edit affordance (shown as a small button). */
  onEdit?: (kid: Kid) => void;
  /** Optional delete affordance (shown as a small button). */
  onDelete?: (kid: Kid) => void;
}

/**
 * A big, friendly card for one kid: avatar, name, and live star balance.
 * Used on the "Who's using the app?" home screen.
 */
export function KidCard({ kid, active = false, onSelect, onEdit, onDelete }: KidCardProps) {
  const balance = useStore((s) => selectStarBalance(s, kid.id));

  return (
    <div
      className={`group relative flex flex-col items-center rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md ${
        active ? '' : 'ring-1 ring-slate-200'
      }`}
      style={active ? { boxShadow: `0 0 0 4px ${kid.color}` } : undefined}
    >
      <button
        type="button"
        onClick={() => onSelect?.(kid)}
        aria-label={`Select ${kid.name}`}
        aria-pressed={active}
        className="flex flex-col items-center focus:outline-none"
      >
        <span
          className="mb-3 flex h-24 w-24 items-center justify-center rounded-full text-5xl"
          style={{ backgroundColor: kid.color + '33', border: `4px solid ${kid.color}` }}
          aria-hidden="true"
        >
          {kid.avatar}
        </span>
        <span className="text-xl font-bold text-slate-900">{kid.name}</span>
        <span className="mt-1 text-sm font-semibold text-amber-500">
          ⭐ {balance} {balance === 1 ? 'star' : 'stars'}
        </span>
      </button>

      {(onEdit || onDelete) && (
        <div className="mt-4 flex gap-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(kid)}
              aria-label={`Edit ${kid.name}`}
              className="rounded-lg px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(kid)}
              aria-label={`Delete ${kid.name}`}
              className="rounded-lg px-3 py-1 text-sm font-semibold text-rose-500 hover:bg-rose-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

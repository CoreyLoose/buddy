import { useStore } from '@/store';
import { useSession } from './session';

export interface KidSwitcherProps {
  /** Optional: show a "+ Add" affordance that triggers this callback. */
  onAdd?: () => void;
}

/**
 * Compact horizontal switcher to pick the active kid. Suitable for a top bar
 * once a kid is in context. Reads/writes the active kid via the session store.
 */
export function KidSwitcher({ onAdd }: KidSwitcherProps) {
  const kids = useStore((s) => s.kids);
  const activeKidId = useSession((s) => s.activeKidId);
  const setActiveKid = useSession((s) => s.setActiveKid);

  if (kids.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>No kids yet.</span>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-slate-900 px-3 py-1 font-semibold text-white"
          >
            + Add a kid
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choose kid">
      {kids.map((kid) => {
        const active = kid.id === activeKidId;
        return (
          <button
            key={kid.id}
            type="button"
            onClick={() => setActiveKid(kid.id)}
            aria-pressed={active}
            aria-label={`Switch to ${kid.name}`}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              active ? 'text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            style={active ? { backgroundColor: kid.color } : undefined}
          >
            <span className="text-lg" aria-hidden="true">
              {kid.avatar}
            </span>
            {kid.name}
          </button>
        );
      })}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add a kid"
          className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          +
        </button>
      )}
    </div>
  );
}

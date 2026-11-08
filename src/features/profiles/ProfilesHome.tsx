import { useState } from 'react';
import { useStore } from '@/store';
import type { Kid } from '@/store';
import { KidCard } from './KidCard';
import { KidForm } from './KidForm';
import { useSession } from './session';

export interface ProfilesHomeProps {
  /**
   * Called when a kid is chosen (in addition to setting the active kid in the
   * session store). Lets the host app navigate into the kid's view.
   */
  onKidSelected?: (kid: Kid) => void;
}

type Editing = { mode: 'add' } | { mode: 'edit'; kid: Kid } | null;

/**
 * The "Who's using the app?" landing screen: every kid as a big friendly card,
 * plus add / edit / delete. Selecting a card sets the active kid in the session
 * store and invokes `onKidSelected`.
 */
export function ProfilesHome({ onKidSelected }: ProfilesHomeProps) {
  const kids = useStore((s) => s.kids);
  const removeKid = useStore((s) => s.removeKid);
  const setActiveKid = useSession((s) => s.setActiveKid);
  const activeKidId = useSession((s) => s.activeKidId);

  const [editing, setEditing] = useState<Editing>(null);
  const [confirmDelete, setConfirmDelete] = useState<Kid | null>(null);

  function handleSelect(kid: Kid) {
    setActiveKid(kid.id);
    onKidSelected?.(kid);
  }

  function handleDelete(kid: Kid) {
    removeKid(kid.id);
    if (activeKidId === kid.id) setActiveKid(null);
    setConfirmDelete(null);
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Who&apos;s using the app?
        </h1>
        <p className="mt-2 text-slate-500">Tap your picture to get started.</p>
      </header>

      {kids.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center">
          <p className="mb-4 text-lg text-slate-500">No profiles yet.</p>
          <button
            type="button"
            onClick={() => setEditing({ mode: 'add' })}
            className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white"
          >
            + Add your first kid
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {kids.map((kid) => (
            <KidCard
              key={kid.id}
              kid={kid}
              active={kid.id === activeKidId}
              onSelect={handleSelect}
              onEdit={(k) => setEditing({ mode: 'edit', kid: k })}
              onDelete={(k) => setConfirmDelete(k)}
            />
          ))}

          {/* Add tile */}
          <button
            type="button"
            onClick={() => setEditing({ mode: 'add' })}
            aria-label="Add a kid"
            className="flex min-h-[200px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 p-6 text-slate-400 transition hover:border-slate-400 hover:text-slate-600"
          >
            <span className="text-4xl">＋</span>
            <span className="mt-2 font-semibold">Add a kid</span>
          </button>
        </div>
      )}

      {/* Add / edit modal */}
      {editing && (
        <KidForm
          kid={editing.mode === 'edit' ? editing.kid : null}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Delete ${confirmDelete.name}`}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl"
          >
            <p className="mb-2 text-5xl" aria-hidden="true">
              {confirmDelete.avatar}
            </p>
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Delete {confirmDelete.name}?
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              This removes their profile and history. This can&apos;t be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                className="rounded-xl bg-rose-500 px-5 py-2 font-semibold text-white hover:bg-rose-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

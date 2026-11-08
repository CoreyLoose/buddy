import { useState } from 'react';
import { useStore } from '@/store';
import type { ID, Reward } from '@/store';

export interface RewardCatalogProps {
  className?: string;
}

interface DraftState {
  title: string;
  icon: string;
  cost: string; // kept as string for a controlled number input
}

const EMPTY_DRAFT: DraftState = { title: '', icon: '🎁', cost: '5' };

/**
 * C2 — Reward catalog (grown-up). Create, edit, toggle active, and delete
 * rewards. All writes go through store actions.
 */
export default function RewardCatalog({ className }: RewardCatalogProps) {
  const rewards = useStore((s) => s.rewards);
  const addReward = useStore((s) => s.addReward);
  const updateReward = useStore((s) => s.updateReward);
  const removeReward = useStore((s) => s.removeReward);

  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<ID | null>(null);

  const cost = Number.parseInt(draft.cost, 10);
  const canSave = draft.title.trim().length > 0 && Number.isFinite(cost) && cost >= 0;

  function resetForm() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    const payload = {
      title: draft.title.trim(),
      icon: draft.icon.trim() || '🎁',
      cost,
    };
    if (editingId) {
      updateReward(editingId, payload);
    } else {
      addReward({ ...payload, active: true });
    }
    resetForm();
  }

  function startEdit(reward: Reward) {
    setEditingId(reward.id);
    setDraft({ title: reward.title, icon: reward.icon, cost: String(reward.cost) });
  }

  return (
    <section
      className={`rounded-2xl bg-white shadow-sm border border-slate-200 p-5 ${className ?? ''}`}
      aria-label="Reward catalog"
    >
      <h2 className="text-xl font-semibold mb-4">Reward Catalog</h2>

      <form onSubmit={handleSubmit} className="grid gap-3 mb-6" aria-label="Reward form">
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-600">Title</span>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="Ice cream treat"
            className="rounded-xl border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-600">Icon (emoji)</span>
            <input
              type="text"
              value={draft.icon}
              onChange={(e) => setDraft((d) => ({ ...d, icon: e.target.value }))}
              maxLength={4}
              className="rounded-xl border border-slate-300 px-3 py-2 text-center text-lg"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-600">Cost (stars)</span>
            <input
              type="number"
              min={0}
              value={draft.cost}
              onChange={(e) => setDraft((d) => ({ ...d, cost: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-xl bg-amber-500 px-4 py-2 font-semibold text-white disabled:opacity-40"
          >
            {editingId ? 'Save changes' : 'Add reward'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {rewards.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">No rewards yet. Add one above.</p>
      ) : (
        <ul className="space-y-2" aria-label="Rewards">
          {rewards.map((reward) => (
            <li
              key={reward.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
            >
              <span className="text-2xl" aria-hidden="true">
                {reward.icon}
              </span>
              <span className="flex-1">
                <span className="block font-medium text-slate-800">{reward.title}</span>
                <span className="block text-xs text-slate-400">{reward.cost} ⭐</span>
              </span>

              <label className="flex items-center gap-1 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={reward.active}
                  onChange={(e) => updateReward(reward.id, { active: e.target.checked })}
                  aria-label={`Active: ${reward.title}`}
                />
                Active
              </label>

              <button
                type="button"
                onClick={() => startEdit(reward)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                aria-label={`Edit ${reward.title}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  removeReward(reward.id);
                  if (editingId === reward.id) resetForm();
                }}
                className="rounded-lg border border-rose-300 px-2 py-1 text-sm text-rose-600"
                aria-label={`Delete ${reward.title}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

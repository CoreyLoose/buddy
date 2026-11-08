import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useStore } from '@/store';
import type { Kid } from '@/store';
import { AVATAR_PRESETS, COLOR_PRESETS, DEFAULT_AVATAR, DEFAULT_COLOR } from './constants';

export interface KidFormProps {
  /** When provided, the form edits this kid; otherwise it creates a new one. */
  kid?: Kid | null;
  /** Called after a successful add/save, and on cancel. */
  onClose: () => void;
}

/**
 * Add / edit modal for a kid profile (name, emoji avatar, accent color).
 * Writes exclusively through store actions (`addKid` / `updateKid`).
 */
export function KidForm({ kid, onClose }: KidFormProps) {
  const addKid = useStore((s) => s.addKid);
  const updateKid = useStore((s) => s.updateKid);
  const isEditing = Boolean(kid);

  const [name, setName] = useState(kid?.name ?? '');
  const [avatar, setAvatar] = useState(kid?.avatar ?? DEFAULT_AVATAR);
  const [color, setColor] = useState(kid?.color ?? DEFAULT_COLOR);

  // Keep local form state in sync if the target kid changes while mounted.
  useEffect(() => {
    setName(kid?.name ?? '');
    setAvatar(kid?.avatar ?? DEFAULT_AVATAR);
    setColor(kid?.color ?? DEFAULT_COLOR);
  }, [kid]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    if (kid) {
      updateKid(kid.id, { name: trimmed, avatar, color });
    } else {
      addKid({ name: trimmed, avatar, color });
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Edit profile' : 'Add profile'}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-5 text-2xl font-bold text-slate-900">
          {isEditing ? 'Edit profile' : 'Add a kid'}
        </h2>

        {/* Live preview */}
        <div className="mb-5 flex items-center gap-3">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{ backgroundColor: color + '33', border: `3px solid ${color}` }}
            aria-hidden="true"
          >
            {avatar}
          </span>
          <span className="text-lg font-semibold text-slate-700">
            {trimmed || 'New kid'}
          </span>
        </div>

        {/* Name */}
        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="kid-name">
          Name
        </label>
        <input
          id="kid-name"
          type="text"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ava"
          className="mb-5 w-full rounded-xl border border-slate-300 px-3 py-2 text-lg outline-none focus:border-slate-500"
        />

        {/* Avatar picker */}
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-semibold text-slate-700">Avatar</legend>
          <div className="grid grid-cols-8 gap-2">
            {AVATAR_PRESETS.map((emoji) => {
              const selected = emoji === avatar;
              return (
                <button
                  key={emoji}
                  type="button"
                  aria-label={`Avatar ${emoji}`}
                  aria-pressed={selected}
                  onClick={() => setAvatar(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
                    selected
                      ? 'bg-slate-900 ring-2 ring-slate-900'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Color picker */}
        <fieldset className="mb-6">
          <legend className="mb-2 text-sm font-semibold text-slate-700">Accent color</legend>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((hex) => {
              const selected = hex === color;
              return (
                <button
                  key={hex}
                  type="button"
                  aria-label={`Color ${hex}`}
                  aria-pressed={selected}
                  onClick={() => setColor(hex)}
                  className={`h-9 w-9 rounded-full transition ${
                    selected ? 'ring-2 ring-slate-900 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: hex }}
                />
              );
            })}
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white disabled:opacity-40"
          >
            {isEditing ? 'Save' : 'Add kid'}
          </button>
        </div>
      </form>
    </div>
  );
}

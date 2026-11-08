import { useState } from 'react';
import { useStore } from '@/store';
import type { PartOfDay, Task, TaskType } from '@/store';
import {
  DEFAULT_ICON,
  ICON_CHOICES,
  PART_OF_DAY_META,
  PART_OF_DAY_ORDER,
  WEEKDAYS,
} from './constants';

export interface TaskFormProps {
  /** When provided, the form edits this task; otherwise it creates a new one. */
  task?: Task | null;
  /** Called after a successful save or when the user cancels. */
  onDone?: () => void;
}

type PartChoice = PartOfDay | 'anytime';

/**
 * Create/edit form for a task (grown-up management). Writes through store
 * actions only (addTask / updateTask).
 */
export function TaskForm({ task, onDone }: TaskFormProps) {
  const kids = useStore((s) => s.kids);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);

  const [title, setTitle] = useState(task?.title ?? '');
  const [icon, setIcon] = useState(task?.icon ?? DEFAULT_ICON);
  const [type, setType] = useState<TaskType>(task?.type ?? 'chore');
  const [assignedTo, setAssignedTo] = useState<string[]>(task?.assignedTo ?? []);
  const [everyDay, setEveryDay] = useState(
    task ? task.schedule.days.length === 0 : true,
  );
  const [days, setDays] = useState<number[]>(task?.schedule.days ?? []);
  const [part, setPart] = useState<PartChoice>(task?.schedule.partOfDay ?? 'anytime');
  const [starValue, setStarValue] = useState<number>(task?.starValue ?? 1);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(task);

  function toggleKid(id: string) {
    setAssignedTo((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
    );
  }

  function toggleDay(value: number) {
    setDays((prev) =>
      prev.includes(value)
        ? prev.filter((d) => d !== value)
        : [...prev, value].sort((a, b) => a - b),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a title.');
      return;
    }
    if (assignedTo.length === 0) {
      setError('Assign this to at least one kid.');
      return;
    }

    const schedule = {
      days: everyDay ? [] : days,
      ...(part !== 'anytime' ? { partOfDay: part } : {}),
    };

    if (isEdit && task) {
      updateTask(task.id, {
        title: trimmed,
        icon,
        type,
        assignedTo,
        schedule,
        starValue,
      });
    } else {
      addTask({
        title: trimmed,
        icon,
        type,
        assignedTo,
        schedule,
        starValue,
      });
    }
    onDone?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5"
      aria-label={isEdit ? 'Edit task' : 'New task'}
    >
      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="task-title">
          Title
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Brush teeth"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">Icon</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {ICON_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              aria-label={`icon ${choice}`}
              aria-pressed={icon === choice}
              onClick={() => setIcon(choice)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition ${
                icon === choice
                  ? 'border-slate-800 bg-slate-100'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">Type</legend>
        <div className="mt-2 flex gap-2">
          {(['chore', 'routine'] as TaskType[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => setType(t)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition ${
                type === t
                  ? 'border-slate-800 bg-slate-800 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">Assign to</legend>
        {kids.length === 0 ? (
          <p className="mt-1 text-sm text-slate-400">No kids yet.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {kids.map((kid) => (
              <button
                key={kid.id}
                type="button"
                aria-pressed={assignedTo.includes(kid.id)}
                onClick={() => toggleKid(kid.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  assignedTo.includes(kid.id)
                    ? 'border-slate-800 bg-slate-100'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                <span aria-hidden>{kid.avatar}</span>
                {kid.name}
              </button>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">Schedule</legend>
        <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={everyDay}
            onChange={(e) => setEveryDay(e.target.checked)}
          />
          Every day
        </label>
        {!everyDay && (
          <div className="mt-2 flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button
                key={d.value}
                type="button"
                aria-label={d.label}
                aria-pressed={days.includes(d.value)}
                onClick={() => toggleDay(d.value)}
                className={`h-9 w-11 rounded-lg border text-xs font-medium transition ${
                  days.includes(d.value)
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {d.short}
              </button>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">Part of day</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(['anytime', ...PART_OF_DAY_ORDER] as PartChoice[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={part === p}
              onClick={() => setPart(p)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                part === p
                  ? 'border-slate-800 bg-slate-100'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              <span aria-hidden className="mr-1">
                {PART_OF_DAY_META[p].icon}
              </span>
              {PART_OF_DAY_META[p].label}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="task-stars">
          Star value
        </label>
        <input
          id="task-stars"
          type="number"
          min={0}
          max={99}
          value={starValue}
          onChange={(e) => setStarValue(Math.max(0, Number(e.target.value) || 0))}
          className="mt-1 w-24 rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-xl bg-slate-800 px-5 py-2 font-semibold text-white hover:bg-slate-700"
        >
          {isEdit ? 'Save changes' : 'Add task'}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-xl border border-slate-300 px-5 py-2 font-medium text-slate-600 hover:border-slate-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

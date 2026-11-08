import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import type { Task } from '@/store';
import { TaskForm } from './TaskForm';
import { PART_OF_DAY_META, WEEKDAYS } from './constants';

function scheduleSummary(task: Task): string {
  const { days, partOfDay } = task.schedule;
  const dayText =
    days.length === 0
      ? 'Every day'
      : days
          .slice()
          .sort((a, b) => a - b)
          .map((d) => WEEKDAYS[d]?.short ?? d)
          .join(', ');
  const partText = partOfDay ? ` · ${PART_OF_DAY_META[partOfDay].label}` : '';
  return `${dayText}${partText}`;
}

/**
 * Grown-up task management: create, edit, delete, and reorder tasks.
 * Reordering uses move up/down buttons wired to `reorderTasks`.
 * Self-contained — reads/writes everything through the store.
 */
export function TaskManager() {
  const tasks = useStore((s) => s.tasks);
  const kids = useStore((s) => s.kids);
  const removeTask = useStore((s) => s.removeTask);
  const reorderTasks = useStore((s) => s.reorderTasks);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const ordered = useMemo(
    () => tasks.slice().sort((a, b) => a.order - b.order),
    [tasks],
  );

  const kidName = (id: string) => kids.find((k) => k.id === id)?.name ?? '?';

  function move(index: number, delta: number) {
    const next = index + delta;
    if (next < 0 || next >= ordered.length) return;
    const ids = ordered.map((t) => t.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    reorderTasks(ids);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Manage tasks</h2>
        {!creating && !editingId && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-xl bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700"
          >
            + New task
          </button>
        )}
      </div>

      {creating && (
        <TaskForm onDone={() => setCreating(false)} />
      )}

      {ordered.length === 0 && !creating ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
          No tasks yet. Create one to get started.
        </p>
      ) : (
        <ul className="space-y-3">
          {ordered.map((task, index) =>
            editingId === task.id ? (
              <li key={task.id}>
                <TaskForm task={task} onDone={() => setEditingId(null)} />
              </li>
            ) : (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col">
                  <button
                    aria-label={`Move ${task.title} up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="text-slate-400 enabled:hover:text-slate-800 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    aria-label={`Move ${task.title} down`}
                    disabled={index === ordered.length - 1}
                    onClick={() => move(index, 1)}
                    className="text-slate-400 enabled:hover:text-slate-800 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                <span className="text-2xl" aria-hidden>
                  {task.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{task.title}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-500">
                      {task.type}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">{scheduleSummary(task)}</div>
                  <div className="text-xs text-slate-400">
                    {task.assignedTo.length
                      ? task.assignedTo.map(kidName).join(', ')
                      : 'Unassigned'}
                  </div>
                </div>

                <span className="whitespace-nowrap font-semibold text-amber-500">
                  +{task.starValue}⭐
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(task.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-slate-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                    className="rounded-lg border border-rose-200 px-3 py-1 text-sm text-rose-600 hover:border-rose-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

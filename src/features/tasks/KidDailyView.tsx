import { useEffect, useMemo, useState } from 'react';
import {
  useStore,
  selectTasksForDate,
  selectIsTaskDone,
  toLocalDateString,
} from '@/store';
import type { PartOfDay, Task } from '@/store';
import { ProgressRing } from '@/ui';
import { PART_OF_DAY_META, PART_OF_DAY_ORDER, isIconPair } from './constants';

export interface KidDailyViewProps {
  /** Which kid's day to show. Passed in by a parent — this view does not
   *  depend on the profiles track. */
  kidId: string;
  /** Date to show (YYYY-MM-DD, local). Defaults to today. Because completions
   *  are date-stamped, the list naturally resets each calendar day. */
  date?: string;
}

/** How long a just-completed task takes to fade out of the list. */
export const FADE_OUT_MS = 10_000;

type GroupKey = PartOfDay | 'anytime';

const GROUP_ORDER: GroupKey[] = [...PART_OF_DAY_ORDER, 'anytime'];

/**
 * Kid-facing daily view. Shows today's tasks grouped by part of day, a progress
 * ring, and lets the kid tap a task to complete it (fires toggleCompletion).
 */
export function KidDailyView({ kidId, date }: KidDailyViewProps) {
  // Subscribe to the full state so completions/tasks changes re-render the view.
  const state = useStore();
  const resolvedDate = date ?? toLocalDateString();

  // Tasks completed during this visit that are still fading out. Anything done
  // that isn't in here (finished earlier, or already faded) is hidden from the
  // list so only the remaining tasks show.
  const [fading, setFading] = useState<ReadonlySet<string>>(() => new Set());
  const [showDone, setShowDone] = useState(false);
  const stopFading = (id: string) =>
    setFading((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const kid = state.kids.find((k) => k.id === kidId);
  const tasks = useMemo(
    () => selectTasksForDate(state, kidId, resolvedDate),
    [state, kidId, resolvedDate],
  );

  const groups = useMemo(() => {
    const map: Record<GroupKey, Task[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      anytime: [],
    };
    for (const task of tasks) {
      const key: GroupKey = task.schedule.partOfDay ?? 'anytime';
      map[key].push(task);
    }
    return map;
  }, [tasks]);

  const doneCount = tasks.filter((t) =>
    selectIsTaskDone(state, t.id, kidId, resolvedDate),
  ).length;

  const isDone = (t: Task) => selectIsTaskDone(state, t.id, kidId, resolvedDate);
  const isVisible = (t: Task) => !isDone(t) || fading.has(t.id) || showDone;
  const hiddenDoneCount = tasks.filter((t) => isDone(t) && !isVisible(t)).length;

  const accent = kid?.color ?? '#22c55e';
  const pct = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);
  const complete = tasks.length > 0 && doneCount >= tasks.length;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <ProgressRing value={doneCount} total={tasks.length} size={120} thickness={12} color={accent}>
          <span className="flex flex-col items-center text-center">
            {complete ? (
              <span className="text-2xl" aria-hidden>
                🎉
              </span>
            ) : (
              <span className="text-2xl font-bold text-slate-800">{pct}%</span>
            )}
            <span className="text-xs font-medium text-slate-500">
              {doneCount}/{tasks.length}
            </span>
          </span>
        </ProgressRing>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {kid ? (
              <>
                <span className="mr-2" aria-hidden>
                  {kid.avatar}
                </span>
                {kid.name}&rsquo;s day
              </>
            ) : (
              "Today's tasks"
            )}
          </h2>
          <p className="text-slate-500">
            {tasks.length === 0
              ? 'Nothing scheduled today — enjoy!'
              : doneCount === tasks.length
                ? 'All done — amazing! 🎉'
                : `${doneCount} of ${tasks.length} done. Keep going!`}
          </p>
        </div>
      </header>

      {GROUP_ORDER.map((key) => {
        const groupTasks = groups[key].filter(isVisible);
        if (groupTasks.length === 0) return null;
        const meta = PART_OF_DAY_META[key];
        return (
          <section key={key} aria-label={meta.label}>
            <h3 className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold uppercase tracking-wide text-slate-500 shadow-sm">
              <span aria-hidden>{meta.icon}</span>
              {meta.label}
            </h3>
            <ul className="space-y-3">
              {groupTasks.map((task) => {
                const done = isDone(task);
                return (
                  <TaskRow
                    key={task.id}
                    task={task}
                    done={done}
                    fadingOut={done && fading.has(task.id)}
                    onFaded={() => stopFading(task.id)}
                    onToggle={() => {
                      // Completing starts the fade; un-completing cancels it.
                      if (done) stopFading(task.id);
                      else setFading((prev) => new Set(prev).add(task.id));
                      state.toggleCompletion(task.id, kidId, resolvedDate);
                    }}
                  />
                );
              })}
            </ul>
          </section>
        );
      })}

      {(hiddenDoneCount > 0 || showDone) && (
        <button
          type="button"
          onClick={() => setShowDone((v) => !v)}
          aria-pressed={showDone}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm"
        >
          {showDone ? 'Hide finished tasks' : `✅ Show ${hiddenDoneCount} finished`}
        </button>
      )}
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  done: boolean;
  /** Completed this visit and currently fading out. */
  fadingOut: boolean;
  onToggle: () => void;
  /** Called once the fade has finished and the row should leave the list. */
  onFaded: () => void;
}

function TaskRow({ task, done, fadingOut, onToggle, onFaded }: TaskRowProps) {
  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(onFaded, FADE_OUT_MS);
    return () => clearTimeout(timer);
    // onFaded is a fresh closure each render; only (re)start when fading toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fadingOut]);

  return (
    <li
      data-fading={fadingOut || undefined}
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? `opacity ${FADE_OUT_MS}ms linear` : 'none',
      }}
    >
      <button
        onClick={onToggle}
        aria-pressed={done}
        className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition ${
          done
            ? 'border-green-300 bg-green-50'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <span
          className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full leading-none transition ${
            done
              ? 'bg-green-500 text-5xl text-white'
              : `bg-slate-100 ${isIconPair(task.icon) ? 'text-4xl' : 'text-6xl'}`
          }`}
          aria-hidden
        >
          {done ? '✓' : task.icon}
        </span>
        <span
          className={`flex-1 text-xl font-semibold ${
            done ? 'text-slate-400 line-through' : 'text-slate-800'
          }`}
        >
          {task.title}
        </span>
        <span className="shrink-0 text-sm font-semibold text-amber-500">
          +{task.starValue}⭐
        </span>
      </button>
    </li>
  );
}

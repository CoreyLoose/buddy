import { useMemo } from 'react';
import {
  useStore,
  selectTasksForDate,
  selectIsTaskDone,
  toLocalDateString,
} from '@/store';
import type { PartOfDay, Task } from '@/store';
import { ProgressRing } from './ProgressRing';
import { PART_OF_DAY_META, PART_OF_DAY_ORDER } from './constants';

export interface KidDailyViewProps {
  /** Which kid's day to show. Passed in by a parent — this view does not
   *  depend on the profiles track. */
  kidId: string;
  /** Date to show (YYYY-MM-DD, local). Defaults to today. Because completions
   *  are date-stamped, the list naturally resets each calendar day. */
  date?: string;
}

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

  const accent = kid?.color ?? '#22c55e';

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <ProgressRing done={doneCount} total={tasks.length} color={accent} />
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
        const groupTasks = groups[key];
        if (groupTasks.length === 0) return null;
        const meta = PART_OF_DAY_META[key];
        return (
          <section key={key} aria-label={meta.label}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
              <span aria-hidden>{meta.icon}</span>
              {meta.label}
            </h3>
            <ul className="space-y-2">
              {groupTasks.map((task) => {
                const done = selectIsTaskDone(state, task.id, kidId, resolvedDate);
                return (
                  <li key={task.id}>
                    <button
                      onClick={() =>
                        state.toggleCompletion(task.id, kidId, resolvedDate)
                      }
                      aria-pressed={done}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                        done
                          ? 'border-green-300 bg-green-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition ${
                          done ? 'bg-green-500 text-white' : 'bg-slate-100'
                        }`}
                        aria-hidden
                      >
                        {done ? '✓' : task.icon}
                      </span>
                      <span
                        className={`flex-1 text-lg font-medium ${
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
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

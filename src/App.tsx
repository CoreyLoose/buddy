import { useStore, selectStarBalance, selectTasksForDate, selectIsTaskDone } from './store';

/**
 * M0 foundation smoke screen. This is intentionally minimal — it exists to prove
 * the store + localStorage persistence works end-to-end. M1 (design system / shell)
 * and the feature tracks will replace this UI.
 */
export default function App() {
  const state = useStore();
  const { kids, toggleCompletion } = state;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">⭐ Chore Stars</h1>
        <p className="text-slate-500">
          M0 foundation — data persists to localStorage. Reload to confirm state is retained.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {kids.map((kid) => {
          const balance = selectStarBalance(state, kid.id);
          const tasks = selectTasksForDate(state, kid.id);
          return (
            <section
              key={kid.id}
              className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5"
              style={{ borderTopColor: kid.color, borderTopWidth: 4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  <span className="text-2xl mr-2">{kid.avatar}</span>
                  {kid.name}
                </h2>
                <span className="font-bold text-amber-500">⭐ {balance}</span>
              </div>
              <ul className="space-y-2">
                {tasks.map((task) => {
                  const done = selectIsTaskDone(state, task.id, kid.id);
                  return (
                    <li key={task.id}>
                      <button
                        onClick={() => toggleCompletion(task.id, kid.id)}
                        className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                          done
                            ? 'bg-green-50 border-green-300 line-through text-slate-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xl">{task.icon}</span>
                        <span className="flex-1">{task.title}</span>
                        <span className="text-amber-500 text-sm">+{task.starValue}⭐</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <button
        onClick={() => useStore.getState().resetToSeed()}
        className="mt-8 text-sm text-slate-400 underline"
      >
        Reset demo data
      </button>
    </div>
  );
}

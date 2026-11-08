import { useState } from 'react';
import {
  useStore,
  selectStarBalance,
  selectTasksForDate,
  selectIsTaskDone,
} from './store';
import {
  AppShell,
  Card,
  Button,
  StarCount,
  ProgressRing,
  IconBadge,
  Modal,
  EmptyState,
  IconPicker,
} from './ui';

/**
 * M1 demo shell. This wires the design system against existing seed data to show
 * the Kid view ↔ Grown-up view switch and the reusable components. The real
 * feature screens (profiles, tasks, rewards) are owned by other tracks and will
 * replace these placeholder slots.
 */
export default function App() {
  return <AppShell kidView={<KidViewDemo />} manageView={<ManageViewDemo />} />;
}

function KidViewDemo() {
  const state = useStore();
  const { kids } = state;

  if (kids.length === 0) {
    return (
      <EmptyState
        icon="🧒"
        title="No kids yet"
        description="Add a kid in the Grown-up view to get started."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {kids.map((kid) => {
        const tasks = selectTasksForDate(state, kid.id);
        const doneCount = tasks.filter((t) =>
          selectIsTaskDone(state, t.id, kid.id),
        ).length;
        const balance = selectStarBalance(state, kid.id);

        return (
          <Card key={kid.id} accent={kid.color}>
            <div className="flex items-center gap-4 mb-4">
              <IconBadge icon={kid.avatar} size="lg" color={kid.color} circle />
              <div className="flex-1">
                <h2 className="text-xl font-extrabold">{kid.name}</h2>
                <StarCount value={balance} size="md" />
              </div>
              <ProgressRing
                value={doneCount}
                total={tasks.length}
                size={64}
                color={kid.color}
              />
            </div>

            <ul className="space-y-2">
              {tasks.map((task) => {
                const done = selectIsTaskDone(state, task.id, kid.id);
                return (
                  <li key={task.id}>
                    <button
                      onClick={() => state.toggleCompletion(task.id, kid.id)}
                      className={`w-full min-h-[44px] flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
                        done
                          ? 'bg-green-50 border-green-300 text-slate-400 line-through'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <IconBadge icon={task.icon} size="sm" />
                      <span className="flex-1 font-semibold">{task.title}</span>
                      <StarCount value={task.starValue} size="sm" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}

function ManageViewDemo() {
  const resetToSeed = useStore((s) => s.resetToSeed);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [icon, setIcon] = useState('⭐');

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-extrabold mb-1">Grown-up tools</h2>
        <p className="text-slate-500 mb-4">
          Feature tracks (profiles, chores, rewards) plug their management screens
          in here. This is a design-system demo slot.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button leadingIcon={icon} onClick={() => setPickerOpen(true)}>
            Pick an icon
          </Button>
          <Button variant="secondary" onClick={resetToSeed}>
            Reset demo data
          </Button>
        </div>
      </Card>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Choose an icon"
        footer={<Button onClick={() => setPickerOpen(false)}>Done</Button>}
      >
        <IconPicker value={icon} onChange={setIcon} />
      </Modal>
    </div>
  );
}

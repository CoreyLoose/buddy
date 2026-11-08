import { useState } from 'react';
import { AppShell } from '@/ui';
import {
  ProfilesHome,
  KidSwitcher,
  KidForm,
  useSession,
  useActiveKid,
} from '@/features/profiles';
import { KidDailyView, TaskManager } from '@/features/tasks';
import { RewardStore, RewardCatalog, StarLedger } from '@/features/rewards';

/**
 * M2 composition root. Wires the four tracks together — this layer holds no
 * business logic, only routing of the active kid + view into the feature screens.
 *
 * Flow:
 *   no active kid        -> ProfilesHome ("who's using the app?")
 *   active kid, Kid view -> today's chores/routines + reward store
 *   active kid, Manage   -> task manager + reward catalog + star ledger
 * The active kid comes from the profiles session store; the active view from
 * the UI shell store. All app data persists via the localStorage-backed store.
 */
export default function App() {
  const activeKid = useActiveKid();
  const setActiveKid = useSession((s) => s.setActiveKid);
  const [addOpen, setAddOpen] = useState(false);

  // No kid chosen yet (or the active kid was deleted) -> landing screen.
  if (!activeKid) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ProfilesHome onKidSelected={(kid) => setActiveKid(kid.id)} />
        {addOpen && <KidForm onClose={() => setAddOpen(false)} />}
      </div>
    );
  }

  return (
    <>
      <AppShell
        headerRight={<KidSwitcher onAdd={() => setAddOpen(true)} />}
        kidView={
          <div className="space-y-6">
            <KidDailyView kidId={activeKid.id} />
            <RewardStore kidId={activeKid.id} />
          </div>
        }
        manageView={
          <div className="space-y-6">
            <TaskManager />
            <RewardCatalog />
            <StarLedger kidId={activeKid.id} title={`${activeKid.name}'s stars`} />
          </div>
        }
      />
      {addOpen && <KidForm onClose={() => setAddOpen(false)} />}
    </>
  );
}

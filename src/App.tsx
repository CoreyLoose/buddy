import { useState } from 'react';
import { AppShell, useUiStore, EmptyState } from '@/ui';
import { useStore } from '@/store';
import {
  ProfilesHome,
  KidSwitcher,
  KidForm,
  useSession,
  useActiveKid,
} from '@/features/profiles';
import { KidDailyView, TaskManager } from '@/features/tasks';
import { RewardStore, RewardCatalog, StarLedger } from '@/features/rewards';
import { FamilyBoard } from '@/features/family';
import { useWakeLock } from './useWakeLock';

/**
 * M2 composition root. Wires the tracks together — this layer holds no business
 * logic, only routing of the active kid + view into the feature screens.
 *
 * Views (via the shell switcher):
 *   family (default) -> two-kid at-a-glance dashboard (FamilyBoard)
 *   kid              -> one kid's full day + reward store
 *   manage           -> task manager + reward catalog + star ledger
 * The family dashboard remembers its own two kids (persisted); the single Kid
 * view uses the ephemeral session selection. All app data persists via the
 * localStorage-backed store.
 */
export default function App() {
  const hasKids = useStore((s) => s.kids.length > 0);
  const [addOpen, setAddOpen] = useState(false);

  // Keep the screen awake — intended for an always-on, plugged-in tablet.
  useWakeLock();

  // First run: no kids yet -> onboarding to add the first kid.
  if (!hasKids) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ProfilesHome />
      </div>
    );
  }

  return (
    <>
      <AppShell
        headerRight={<HeaderControls onAddKid={() => setAddOpen(true)} />}
        familyView={<FamilyBoard />}
        kidView={<SingleKidView />}
        manageView={
          <div className="space-y-6">
            <TaskManager />
            <RewardCatalog />
            <ActiveKidLedger />
          </div>
        }
      />
      {addOpen && <KidForm onClose={() => setAddOpen(false)} />}
    </>
  );
}

/** Header controls: the kid switcher is only relevant to the single Kid view. */
function HeaderControls({ onAddKid }: { onAddKid: () => void }) {
  const view = useUiStore((s) => s.view);
  if (view !== 'kid') return null;
  return <KidSwitcher onAdd={onAddKid} />;
}

/** The single-kid view; prompts for a selection if none is active yet. */
function SingleKidView() {
  const activeKid = useActiveKid();
  const setActiveKid = useSession((s) => s.setActiveKid);

  if (!activeKid) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon="👆"
          title="Pick a kid"
          description="Choose a kid above (or tap one below) to see their full day."
        />
        <ProfilesHome onKidSelected={(kid) => setActiveKid(kid.id)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <KidDailyView kidId={activeKid.id} />
      <RewardStore kidId={activeKid.id} />
    </div>
  );
}

/** Star ledger in the manage view; defaults to the active kid, else the first. */
function ActiveKidLedger() {
  const activeKid = useActiveKid();
  const firstKid = useStore((s) => s.kids[0] ?? null);
  const kid = activeKid ?? firstKid;
  if (!kid) return null;
  return <StarLedger kidId={kid.id} title={`${kid.name}'s stars`} />;
}

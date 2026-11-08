# M2 — Integration Plan

This branch stitches the four parallel tracks into one working app and verifies the
end-to-end loop. It owns the **composition layer only** — it does not re-implement any
feature; it imports each track's barrel and wires them together.

## Inputs (branches to merge, in order)
Merge in dependency-friendly order so conflicts are minimal (tracks touch disjoint folders,
so conflicts should be near-zero except where each lightly edits `src/App.tsx`):

1. **M1** → `src/ui/` (design system + app shell, view switching)
2. **Track A** → `src/features/profiles/` (kid CRUD + active-kid session store)
3. **Track B** → `src/features/tasks/` (task CRUD/scheduling + kid daily view)
4. **Track C** → `src/features/rewards/` (ledger + reward catalog + redeem flow)

> Expected conflict hot-spot: `src/App.tsx`. Each track may have lightly wired itself in for
> demo purposes. M2 **replaces `src/App.tsx` wholesale** with the real composition below, so
> resolve those conflicts by taking the M2 version of `App.tsx`.

## Data flow
```
profiles session store  ──(activeKidId)──┐
                                         ├─> Tasks kid daily view   (prop: kidId)
                                         ├─> Rewards store / ledger  (prop: kidId)
                                         └─> StarCount in header     (selectStarBalance)

app shell (M1)  ──(activeView: 'kid' | 'manage')──> renders Kid view or Manage view
```
- **Active kid** comes from Track A's session store (`activeKidId` / `setActiveKid`).
- **Active view** (Kid vs Grown-up/Manage) comes from M1's shell UI store.
- Feature screens receive `kidId` as a prop (tracks were built to accept it, not to import
  each other) — M2 is the single place that feeds the active kid id into tasks + rewards.

## Target composition (fill in real barrel names after merge)
This is the shape `src/App.tsx` will take. Names in `/* from ... */` are the expected exports
from each track's `index.ts` barrel; confirm/adjust against the actual reported APIs.

```tsx
import { AppShell /* from '@/ui' */ } from '@/ui';
import { WhoScreen, KidSwitcher, useSession /* from '@/features/profiles' */ } from '@/features/profiles';
import { KidDailyView, TaskManager /* from '@/features/tasks' */ } from '@/features/tasks';
import { RewardStore, StarLedger, RewardCatalog /* from '@/features/rewards' */ } from '@/features/rewards';

export default function App() {
  const activeKidId = useSession((s) => s.activeKidId);

  // No kid chosen yet → landing screen
  if (!activeKidId) return <WhoScreen />;

  return (
    <AppShell
      switcher={<KidSwitcher />}
      kidView={
        <>
          <KidDailyView kidId={activeKidId} />
          <RewardStore kidId={activeKidId} />
        </>
      }
      manageView={
        <>
          <TaskManager />
          <RewardCatalog />
          <StarLedger kidId={activeKidId} />
        </>
      }
    />
  );
}
```

## Integration edge cases to verify
- Delete the active kid → app falls back to the "who's using the app" screen (no crash).
- Delete a task/reward that has history → store already cascades; confirm UI doesn't error.
- Date rollover → daily view resets (completions are date-stamped); yesterday's stars persist.
- Insufficient stars → redeem is blocked with a clear message (store returns `{ok:false,reason}`).
- First run (fresh localStorage) → seed data shows; "reset all" gives a clean empty state.

## End-to-end verification checklist (the M2 exit criteria)
- [ ] All four branches merged; `npm run typecheck`, `npm test`, `npm run build` all green.
- [ ] Pick a kid → see today's chores/routines grouped by part of day.
- [ ] Complete tasks → stars awarded → header balance + ledger update live.
- [ ] Open reward store → affordable rewards enabled, others show "needs N more ⭐".
- [ ] Redeem an affordable reward → balance drops → redemption appears in ledger.
- [ ] Switch to Grown-up/Manage view → add/edit a kid, task, and reward → reflected in kid view.
- [ ] **Reload the page → every bit of state persists (localStorage).**
- [ ] Switch between kids → each kid shows their own tasks + balance independently.

## Notes
- Keep the composition layer thin: no business logic here, only wiring + prop passing.
- If a track's barrel API differs from the sketch above, adjust `App.tsx` imports — do NOT
  edit inside the feature folders during integration unless fixing a genuine bug.

# Kids Chore & Routine Tracker — Implementation Plan

A fully-local, no-backend web app where kids follow daily chores/routines on their own
and earn stars they can spend on rewards. All state lives in `localStorage` and survives reloads.

## Goals
- **Chores & Routines** — daily tasks kids can see and complete independently.
- **Rewards** — star-powered incentives that motivate task completion.
- **Fully local** — no server, no auth, no network. State persists in `localStorage`.

## Tech stack
- **Vite + React + TypeScript** — fast, zero-config SPA, no backend.
- **Tailwind CSS** — quick, kid-friendly styling with a consistent design system.
- **Zustand + `persist` middleware** — simple global store that auto-syncs to `localStorage`
  (single source of truth; avoids hand-rolling persistence everywhere).
- **Vitest + React Testing Library** — unit/component tests.
- No router needed initially (tab/view state in store); add `react-router` only if deep links matter.

## Data model (the contract every track builds against)
```ts
type ID = string;

interface Kid {
  id: ID;
  name: string;
  avatar: string;        // emoji or preset key
  color: string;         // theme accent
  starBalance: number;   // derived cache, but stored for simplicity
}

interface Task {
  id: ID;
  title: string;
  icon: string;
  type: 'chore' | 'routine';
  assignedTo: ID[];              // kid ids
  schedule: {
    days: number[];             // 0-6; empty = every day
    partOfDay?: 'morning' | 'afternoon' | 'evening';
  };
  starValue: number;
  order: number;
}

// One record per (task, kid, date) when completed/attempted
interface Completion {
  id: ID;
  taskId: ID;
  kidId: ID;
  date: string;                 // YYYY-MM-DD (local)
  status: 'done' | 'skipped';
  starsAwarded: number;
}

interface Reward {
  id: ID;
  title: string;
  icon: string;
  cost: number;                 // stars
  active: boolean;
}

interface Redemption {
  id: ID;
  rewardId: ID;
  kidId: ID;
  date: string;
  cost: number;
}

interface AppState {
  kids: Kid[];
  tasks: Task[];
  completions: Completion[];
  rewards: Reward[];
  redemptions: Redemption[];
  schemaVersion: number;        // for migrations
}
```
Stars are earned when a `Completion` with `status: 'done'` is created and spent via `Redemption`.
`starBalance = sum(earned) - sum(redeemed)`.

---

## Milestones & parallelization

Legend: **[S]** serial gate (blocks others) · **[P]** can run in parallel.

### M0 — Foundation [S] — *blocks everything*
Scaffold Vite+React+TS, Tailwind, Vitest. Define the TypeScript data model above.
Build the **persistence layer**: Zustand store with `persist` middleware, a versioned
schema + migration hook, and seed/demo data. Export typed store actions as stubs
(`addKid`, `addTask`, `toggleCompletion`, `addReward`, `redeemReward`, selectors like
`starBalanceFor(kidId)`, `tasksForToday(kidId)`).
**Exit criteria:** app boots, store round-trips through a reload, actions typed & unit-tested.

> Once M0 lands, M1 / A / B / C run in parallel against the stable store contract.

### M1 — Design system & shell [P] — *after M0*
Kid-friendly visual language: colors, big touch targets, fun typography, icon/emoji picker,
avatar set, reusable components (Card, Button, StarCount, ProgressRing, Modal), app layout
with view switching (Kid view ↔ Grown-up/manage view). Works with placeholder data.

### Track A — Profiles [P] — *after M0*
Create/edit/delete kids (name, avatar, color). Kid selector / switcher.
"Who's using the app" home screen. Thin and independent.

### Track B — Chores & Routines [P] — *after M0*
- **B1 Management (grown-up):** CRUD tasks, assign to kids, set schedule (days + part of day),
  star value, drag-to-reorder.
- **B2 Kid daily view:** today's tasks for the selected kid, grouped by morning/afternoon/evening,
  tap to complete → fires `toggleCompletion`, celebratory animation, daily progress ring,
  auto-resets per calendar day (completions are date-stamped).

### Track C — Rewards & Stars [P] — *after M0*
- **C1 Star balance/ledger:** live balance per kid, earn history.
- **C2 Reward catalog (grown-up):** CRUD rewards (title, icon, cost, active).
- **C3 Redeem flow (kid):** reward store, "can I afford it?" states, redeem →
  deduct stars, confirmation, redemption history.

### M2 — Integration & polish [S] — *after A, B, C, M1*
Wire real store data through the shell, connect kid view ↔ profiles ↔ tasks ↔ stars ↔ rewards.
End-to-end flow: pick kid → complete chores → earn stars → redeem reward → balance updates →
reload → everything persists. Empty states, first-run onboarding/seed, edge cases
(delete a kid/task with history, date rollover, insufficient stars).

### M3 — Nice-to-haves [P] — *after M2, optional, independently shippable*
Streaks & weekly summary · sound/haptic/confetti on completion · PIN-gate for grown-up view ·
export/import JSON (backup since it's local-only) · PWA/installable + offline · light/dark theme ·
reset-day / reset-all tools.

---

## Dependency graph
```
M0 (foundation)  ── gate ──┐
                           ├─> M1  (design/shell)  ─┐
                           ├─> A   (profiles)       ├─> M2 (integration) ─> M3 (extras, optional)
                           ├─> B   (chores/routines)┤
                           └─> C   (rewards/stars)  ─┘
```
**Critical path:** M0 → (B is the longest of the parallel tracks) → M2 → M3.
M1, A, and C run alongside B and should finish no later than it.

## Suggested execution with parallel agents
1. One agent does **M0** solo (serial gate).
2. After M0 merges, fan out: Agent-1 → **M1**, Agent-2 → **A**, Agent-3 → **B**, Agent-4 → **C**.
   They only touch their own feature folders + call existing store actions, minimizing conflicts.
3. Reconvene for **M2** integration (single agent), then optionally **M3**.

## Conventions to keep tracks conflict-free
- Feature-folder structure: `src/features/{profiles,tasks,rewards}`, `src/store`, `src/ui`.
- All state changes go **only** through store actions (no component writes to `localStorage`).
- Each track owns its folder + tests; shared types live in `src/store/types.ts` (set in M0).

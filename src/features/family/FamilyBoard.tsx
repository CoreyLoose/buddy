import { useState } from 'react';
import { useStore, selectStarBalance } from '@/store';
import type { ID, Kid } from '@/store';
import { Card, Modal, EmptyState, StarCount } from '@/ui';
import { KidDailyView } from '@/features/tasks';
import { RewardStore } from '@/features/rewards';
import { useFamilyStore } from './familyStore';

/**
 * Two-kid at-a-glance dashboard. Each half shows a kid (pickable per side, the
 * choice is remembered) and their daily chore/routine list. Tapping a kid's star
 * count opens that single kid's reward store in a modal over the dashboard.
 */
export function FamilyBoard() {
  const kids = useStore((s) => s.kids);
  const leftKidId = useFamilyStore((s) => s.leftKidId);
  const rightKidId = useFamilyStore((s) => s.rightKidId);
  const setLeftKid = useFamilyStore((s) => s.setLeftKid);
  const setRightKid = useFamilyStore((s) => s.setRightKid);

  const [storeKidId, setStoreKidId] = useState<ID | null>(null);

  const left = resolveKid(kids, leftKidId, 0);
  const right = resolveKid(kids, rightKidId, 1);
  const storeKid = kids.find((k) => k.id === storeKidId) ?? null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <KidPanel
        side="Left"
        kids={kids}
        kid={left}
        onPick={setLeftKid}
        onOpenStore={setStoreKidId}
      />
      <KidPanel
        side="Right"
        kids={kids}
        kid={right}
        onPick={setRightKid}
        onOpenStore={setStoreKidId}
      />

      <Modal
        open={!!storeKid}
        onClose={() => setStoreKidId(null)}
        title={storeKid ? `${storeKid.name}'s rewards` : ''}
      >
        {storeKid && <RewardStore kidId={storeKid.id} />}
      </Modal>
    </div>
  );
}

/** Resolve a stored id to a live kid, falling back to a positional default. */
function resolveKid(kids: Kid[], id: ID | null, fallbackIndex: number): Kid | null {
  if (id) {
    const found = kids.find((k) => k.id === id);
    if (found) return found;
  }
  return kids[fallbackIndex] ?? null;
}

interface KidPanelProps {
  side: 'Left' | 'Right';
  kids: Kid[];
  kid: Kid | null;
  onPick: (id: ID | null) => void;
  onOpenStore: (id: ID) => void;
}

function KidPanel({ side, kids, kid, onPick, onOpenStore }: KidPanelProps) {
  // Called unconditionally; returns 0 when no kid is pinned to this side.
  const balance = useStore((s) => (kid ? selectStarBalance(s, kid.id) : 0));

  return (
    <Card
      accent={kid?.color}
      className="flex flex-col gap-4"
      data-testid={`panel-${side.toLowerCase()}`}
    >
      <div className="flex items-center justify-between gap-2">
        <select
          value={kid?.id ?? ''}
          onChange={(e) => onPick(e.target.value || null)}
          aria-label={`${side} panel kid`}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-800"
        >
          {kids.length === 0 && <option value="">No kids yet</option>}
          {kids.map((k) => (
            <option key={k.id} value={k.id}>
              {k.avatar} {k.name}
            </option>
          ))}
        </select>

        {kid && (
          <button
            type="button"
            onClick={() => onOpenStore(kid.id)}
            aria-label={`Open ${kid.name}'s reward store`}
            className="rounded-full border-2 border-amber-200 bg-amber-50 px-4 py-2 transition hover:border-amber-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
          >
            <StarCount value={balance} size="md" />
          </button>
        )}
      </div>

      {kid ? (
        <KidDailyView kidId={kid.id} />
      ) : (
        <EmptyState
          icon="➕"
          title="Pick a second kid"
          description="Add another kid in the Grown-up view to use both sides of the dashboard."
        />
      )}
    </Card>
  );
}

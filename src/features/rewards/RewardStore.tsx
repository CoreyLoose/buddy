import { useState } from 'react';
import { useStore, selectStarBalance } from '@/store';
import type { ID } from '@/store';

export interface RewardStoreProps {
  /** The kid who is shopping / redeeming. */
  kidId: string;
  className?: string;
}

interface Feedback {
  rewardId: ID;
  ok: boolean;
  message: string;
}

/**
 * C3 — Redeem flow (kid). A reward "store" for one kid: each active reward shows
 * an affordable / not-affordable state, redeem calls `redeemReward`, and the
 * result (success or failure reason) is shown inline. Balance reflects updates.
 */
export default function RewardStore({ kidId, className }: RewardStoreProps) {
  const state = useStore();
  const rewards = useStore((s) => s.rewards);
  const redeemReward = useStore((s) => s.redeemReward);
  const balance = selectStarBalance(state, kidId);

  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const available = rewards.filter((r) => r.active);

  function handleRedeem(rewardId: ID, title: string) {
    const result = redeemReward(rewardId, kidId);
    setFeedback({
      rewardId,
      ok: result.ok,
      message: result.ok ? `Redeemed ${title}! 🎉` : (result.reason ?? 'Could not redeem'),
    });
  }

  return (
    <section
      className={`rounded-2xl bg-white shadow-sm border border-slate-200 p-5 ${className ?? ''}`}
      aria-label="Reward store"
    >
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Reward Store</h2>
        <span className="font-bold text-amber-500 text-lg" aria-label="Current balance">
          ⭐ {balance}
        </span>
      </header>

      {available.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">No rewards available right now.</p>
      ) : (
        <ul className="space-y-3" aria-label="Available rewards">
          {available.map((reward) => {
            const affordable = balance >= reward.cost;
            const shortBy = reward.cost - balance;
            const showFeedback = feedback?.rewardId === reward.id;
            return (
              <li
                key={reward.id}
                className={`rounded-xl border p-3 ${
                  affordable ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {reward.icon}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium text-slate-800">{reward.title}</span>
                    <span className="block text-xs text-slate-500">{reward.cost} ⭐</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRedeem(reward.id, reward.title)}
                    disabled={!affordable}
                    className="rounded-xl bg-amber-500 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Redeem ${reward.title}`}
                  >
                    Redeem
                  </button>
                </div>

                {!affordable && (
                  <p className="mt-2 text-xs text-slate-500">
                    Need {shortBy} more ⭐ to redeem this.
                  </p>
                )}

                {showFeedback && (
                  <p
                    role="status"
                    className={`mt-2 text-sm font-medium ${
                      feedback.ok ? 'text-green-600' : 'text-rose-600'
                    }`}
                  >
                    {feedback.message}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

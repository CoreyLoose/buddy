import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useStore, emptyData, selectStarBalance } from '@/store';
import type { ID } from '@/store';
import { buildLedger, ledgerSummary } from './ledger';
import StarLedger from './StarLedger';
import RewardCatalog from './RewardCatalog';
import RewardStore from './RewardStore';

function resetStore() {
  localStorage.clear();
  useStore.setState({ ...emptyData() });
}

/** Seed a kid with `stars` earnable stars via a single completed task. */
function seedKidWithStars(stars: number): ID {
  const kidId = useStore.getState().addKid({ name: 'Mia', avatar: '🐱', color: '#000' });
  if (stars > 0) {
    const taskId = useStore.getState().addTask({
      title: 'Big chore',
      icon: '🧹',
      type: 'chore',
      assignedTo: [kidId],
      schedule: { days: [] },
      starValue: stars,
    });
    useStore.getState().toggleCompletion(taskId, kidId, '2026-01-01');
  }
  return kidId;
}

beforeEach(() => {
  resetStore();
});

describe('ledger math', () => {
  it('summarizes earned, spent, and balance', () => {
    const kidId = seedKidWithStars(10);
    const rewardId = useStore
      .getState()
      .addReward({ title: 'Ice cream', icon: '🍦', cost: 4, active: true });
    useStore.getState().redeemReward(rewardId, kidId);

    const summary = ledgerSummary(useStore.getState(), kidId);
    expect(summary.earned).toBe(10);
    expect(summary.spent).toBe(4);
    expect(summary.balance).toBe(6);
  });

  it('combines completions and redemptions into a dated timeline, most recent first', () => {
    const kidId = useStore.getState().addKid({ name: 'Mia', avatar: '🐱', color: '#000' });
    const taskId = useStore.getState().addTask({
      title: 'Brush teeth',
      icon: '🪥',
      type: 'routine',
      assignedTo: [kidId],
      schedule: { days: [] },
      starValue: 5,
    });
    useStore.getState().toggleCompletion(taskId, kidId, '2026-01-01');
    const rewardId = useStore
      .getState()
      .addReward({ title: 'Movie', icon: '🎬', cost: 3, active: true });
    // Redemption is stamped "today", which sorts after the 2026-01-01 earn.
    useStore.getState().redeemReward(rewardId, kidId);

    const entries = buildLedger(useStore.getState(), kidId);
    expect(entries).toHaveLength(2);
    // Most recent (the redemption) first.
    expect(entries[0]).toMatchObject({ kind: 'spend', title: 'Movie', delta: -3 });
    expect(entries[1]).toMatchObject({ kind: 'earn', title: 'Brush teeth', delta: 5 });
  });

  it('ignores other kids and skipped completions', () => {
    const kidId = seedKidWithStars(7);
    const otherId = seedKidWithStars(99);
    const entries = buildLedger(useStore.getState(), kidId);
    expect(entries).toHaveLength(1);
    expect(ledgerSummary(useStore.getState(), otherId).earned).toBe(99);
  });
});

describe('StarLedger component', () => {
  it('renders the balance and history entries', () => {
    const kidId = seedKidWithStars(8);
    render(<StarLedger kidId={kidId} title="Mia" />);
    expect(screen.getByLabelText('Current balance')).toHaveTextContent('8');
    expect(screen.getByText('Big chore')).toBeInTheDocument();
  });

  it('shows an empty state with no activity', () => {
    const kidId = useStore.getState().addKid({ name: 'Mia', avatar: '🐱', color: '#000' });
    render(<StarLedger kidId={kidId} />);
    expect(screen.getByText(/no star activity/i)).toBeInTheDocument();
  });
});

describe('RewardCatalog CRUD', () => {
  it('adds a reward through the form', () => {
    render(<RewardCatalog />);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Ice cream treat' } });
    fireEvent.change(screen.getByLabelText('Cost (stars)'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add reward' }));

    const rewards = useStore.getState().rewards;
    expect(rewards).toHaveLength(1);
    expect(rewards[0]).toMatchObject({ title: 'Ice cream treat', cost: 12, active: true });
  });

  it('edits an existing reward', () => {
    useStore.getState().addReward({ title: 'Old', icon: '🎁', cost: 5, active: true });
    render(<RewardCatalog />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit Old' }));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New name' } });
    fireEvent.change(screen.getByLabelText('Cost (stars)'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    const rewards = useStore.getState().rewards;
    expect(rewards).toHaveLength(1);
    expect(rewards[0]).toMatchObject({ title: 'New name', cost: 9 });
  });

  it('toggles active state', () => {
    const id = useStore.getState().addReward({ title: 'Toy', icon: '🧸', cost: 5, active: true });
    render(<RewardCatalog />);
    fireEvent.click(screen.getByLabelText('Active: Toy'));
    expect(useStore.getState().rewards.find((r) => r.id === id)?.active).toBe(false);
  });

  it('deletes a reward', () => {
    useStore.getState().addReward({ title: 'Gone', icon: '🗑️', cost: 5, active: true });
    render(<RewardCatalog />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete Gone' }));
    expect(useStore.getState().rewards).toHaveLength(0);
  });

  it('requires a title before saving', () => {
    render(<RewardCatalog />);
    const submit = screen.getByRole('button', { name: 'Add reward' });
    expect(submit).toBeDisabled();
  });
});

describe('RewardStore redeem flow', () => {
  it('redeems a reward when affordable and updates the balance', () => {
    const kidId = seedKidWithStars(10);
    useStore.getState().addReward({ title: 'Ice cream', icon: '🍦', cost: 4, active: true });
    render(<RewardStore kidId={kidId} />);

    expect(screen.getByLabelText('Current balance')).toHaveTextContent('10');
    fireEvent.click(screen.getByRole('button', { name: 'Redeem Ice cream' }));

    expect(selectStarBalance(useStore.getState(), kidId)).toBe(6);
    expect(screen.getByRole('status')).toHaveTextContent(/redeemed/i);
    expect(screen.getByLabelText('Current balance')).toHaveTextContent('6');
  });

  it('blocks redemption when the kid cannot afford it and shows how many more stars are needed', () => {
    const kidId = seedKidWithStars(2);
    useStore.getState().addReward({ title: 'Big toy', icon: '🧸', cost: 10, active: true });
    render(<RewardStore kidId={kidId} />);

    const item = screen.getByRole('listitem');
    const button = within(item).getByRole('button', { name: 'Redeem Big toy' });
    expect(button).toBeDisabled();
    expect(within(item).getByText(/need 8 more/i)).toBeInTheDocument();
    expect(useStore.getState().redemptions).toHaveLength(0);
  });

  it('hides inactive rewards from the store', () => {
    const kidId = seedKidWithStars(10);
    useStore.getState().addReward({ title: 'Hidden', icon: '🙈', cost: 1, active: false });
    render(<RewardStore kidId={kidId} />);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(screen.getByText(/no rewards available/i)).toBeInTheDocument();
  });
});

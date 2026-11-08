import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { FamilyBoard } from './FamilyBoard';
import { useFamilyStore } from './familyStore';
import { useStore } from '@/store';
import { emptyData } from '@/store';

function seedTwoKids() {
  useStore.setState({ ...emptyData() });
  const ava = useStore.getState().addKid({ name: 'Ava', avatar: '🦄', color: '#f472b6' });
  const noah = useStore.getState().addKid({ name: 'Noah', avatar: '🚀', color: '#60a5fa' });
  return { ava, noah };
}

beforeEach(() => {
  localStorage.clear();
  useFamilyStore.setState({ leftKidId: null, rightKidId: null });
});

describe('FamilyBoard', () => {
  it('shows the first two kids by default, one per side', () => {
    seedTwoKids();
    render(<FamilyBoard />);

    const left = screen.getByLabelText('Left panel kid') as HTMLSelectElement;
    const right = screen.getByLabelText('Right panel kid') as HTMLSelectElement;
    expect(left.selectedOptions[0].textContent).toContain('Ava');
    expect(right.selectedOptions[0].textContent).toContain('Noah');
  });

  it('lets you change who is pinned to a side and remembers it', () => {
    const { noah } = seedTwoKids();
    render(<FamilyBoard />);

    const left = screen.getByLabelText('Left panel kid') as HTMLSelectElement;
    fireEvent.change(left, { target: { value: noah } });

    expect(useFamilyStore.getState().leftKidId).toBe(noah);
    expect((screen.getByLabelText('Left panel kid') as HTMLSelectElement).value).toBe(noah);
  });

  it('opens a single kid’s reward store in a modal when tapping their stars', () => {
    seedTwoKids();
    useStore.getState().addReward({ title: 'Ice cream', icon: '🍦', cost: 5, active: true });
    render(<FamilyBoard />);

    fireEvent.click(screen.getByRole('button', { name: "Open Ava's reward store" }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText("Ava's rewards")).toBeInTheDocument();
    expect(within(dialog).getByText('Ice cream')).toBeInTheDocument();
  });

  it('shows an empty state on the second side when there is only one kid', () => {
    useStore.setState({ ...emptyData() });
    useStore.getState().addKid({ name: 'Solo', avatar: '🐱', color: '#000' });
    render(<FamilyBoard />);

    expect(screen.getByText('Pick a second kid')).toBeInTheDocument();
  });
});

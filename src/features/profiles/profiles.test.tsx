import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { useStore, emptyData } from '@/store';
import { ProfilesHome } from './ProfilesHome';
import { KidSwitcher } from './KidSwitcher';
import { useSession, selectActiveKid } from './session';

function resetState() {
  localStorage.clear();
  useStore.setState({ ...emptyData() });
  useSession.setState({ activeKidId: null });
}

beforeEach(() => {
  resetState();
});

function seedKid(name = 'Mia', avatar = '🐱', color = '#34d399') {
  return useStore.getState().addKid({ name, avatar, color });
}

describe('ProfilesHome — create', () => {
  it('adds a kid through the form', () => {
    render(<ProfilesHome />);

    // Open the add form (empty state button).
    fireEvent.click(screen.getByRole('button', { name: /add your first kid/i }));

    const dialog = screen.getByRole('dialog', { name: /add profile/i });
    fireEvent.change(within(dialog).getByLabelText(/name/i), {
      target: { value: 'Ravi' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avatar 🚀' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add kid' }));

    const kids = useStore.getState().kids;
    expect(kids).toHaveLength(1);
    expect(kids[0]).toMatchObject({ name: 'Ravi', avatar: '🚀' });
    expect(screen.getByText('Ravi')).toBeInTheDocument();
  });

  it('disables save until a name is entered', () => {
    render(<ProfilesHome />);
    fireEvent.click(screen.getByRole('button', { name: /add your first kid/i }));
    const dialog = screen.getByRole('dialog', { name: /add profile/i });
    expect(within(dialog).getByRole('button', { name: 'Add kid' })).toBeDisabled();
  });
});

describe('ProfilesHome — edit', () => {
  it('edits an existing kid', () => {
    seedKid('Mia');
    render(<ProfilesHome />);

    fireEvent.click(screen.getByRole('button', { name: /edit mia/i }));
    const dialog = screen.getByRole('dialog', { name: /edit profile/i });
    const input = within(dialog).getByLabelText(/name/i) as HTMLInputElement;
    expect(input.value).toBe('Mia');

    fireEvent.change(input, { target: { value: 'Mia B.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(useStore.getState().kids[0].name).toBe('Mia B.');
    expect(screen.getByText('Mia B.')).toBeInTheDocument();
  });
});

describe('ProfilesHome — delete', () => {
  it('deletes a kid after confirmation and clears active selection', () => {
    const id = seedKid('Mia');
    useSession.getState().setActiveKid(id);
    render(<ProfilesHome />);

    fireEvent.click(screen.getByRole('button', { name: /delete mia/i }));
    const dialog = screen.getByRole('dialog', { name: /delete mia/i });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(useStore.getState().kids).toHaveLength(0);
    expect(useSession.getState().activeKidId).toBeNull();
  });

  it('keeps the kid when the delete is dismissed', () => {
    seedKid('Mia');
    render(<ProfilesHome />);

    fireEvent.click(screen.getByRole('button', { name: /delete mia/i }));
    const dialog = screen.getByRole('dialog', { name: /delete mia/i });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Keep' }));

    expect(useStore.getState().kids).toHaveLength(1);
  });
});

describe('ProfilesHome — select', () => {
  it('sets the active kid and fires onKidSelected', () => {
    const id = seedKid('Mia');
    let selectedId: string | null = null;
    render(<ProfilesHome onKidSelected={(k) => (selectedId = k.id)} />);

    fireEvent.click(screen.getByRole('button', { name: /select mia/i }));

    expect(useSession.getState().activeKidId).toBe(id);
    expect(selectedId).toBe(id);
  });
});

describe('KidSwitcher', () => {
  it('switches the active kid in the session store', () => {
    const aId = seedKid('Ava', '🦄', '#f472b6');
    const bId = seedKid('Noah', '🚀', '#60a5fa');
    render(<KidSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: /switch to ava/i }));
    expect(useSession.getState().activeKidId).toBe(aId);

    fireEvent.click(screen.getByRole('button', { name: /switch to noah/i }));
    expect(useSession.getState().activeKidId).toBe(bId);

    const active = screen.getByRole('button', { name: /switch to noah/i });
    expect(active).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows an empty state with no kids', () => {
    render(<KidSwitcher />);
    expect(screen.getByText(/no kids yet/i)).toBeInTheDocument();
  });
});

describe('session selectors', () => {
  it('selectActiveKid resolves the kid or null', () => {
    const kids = useStore.getState().kids;
    expect(selectActiveKid(kids, null)).toBeNull();

    const id = seedKid('Mia');
    const updated = useStore.getState().kids;
    expect(selectActiveKid(updated, id)?.name).toBe('Mia');
    expect(selectActiveKid(updated, 'missing')).toBeNull();
  });
});

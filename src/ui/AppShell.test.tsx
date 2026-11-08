import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppShell } from './AppShell';
import { useUiStore } from './uiStore';

beforeEach(() => {
  useUiStore.setState({ view: 'kid' });
});

describe('uiStore', () => {
  it('toggles and sets the view without touching localStorage', () => {
    expect(useUiStore.getState().view).toBe('kid');
    useUiStore.getState().toggleView();
    expect(useUiStore.getState().view).toBe('manage');
    useUiStore.getState().setView('kid');
    expect(useUiStore.getState().view).toBe('kid');
    // UI store is ephemeral — it must not persist.
    expect(localStorage.getItem('chore-stars/app')).toBeNull();
  });
});

describe('AppShell', () => {
  it('shows the kid slot by default and switches to the manage slot', () => {
    render(
      <AppShell kidView={<div>KID SLOT</div>} manageView={<div>MANAGE SLOT</div>} />,
    );

    expect(screen.getByText('KID SLOT')).toBeInTheDocument();
    expect(screen.queryByText('MANAGE SLOT')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Grown-up/ }));

    expect(screen.getByText('MANAGE SLOT')).toBeInTheDocument();
    expect(screen.queryByText('KID SLOT')).not.toBeInTheDocument();
  });

  it('renders custom header content', () => {
    render(
      <AppShell
        kidView={<div />}
        manageView={<div />}
        headerRight={<span>HEADER EXTRA</span>}
      />,
    );
    expect(screen.getByText('HEADER EXTRA')).toBeInTheDocument();
  });
});

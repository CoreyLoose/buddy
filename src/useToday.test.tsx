import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { msUntilNextMidnight, useToday } from './useToday';
import App from './App';
import { useStore, emptyData } from '@/store';
import { KidDailyView } from '@/features/tasks';
import { useUiStore } from '@/ui';

function Today() {
  return <div data-testid="today">{useToday()}</div>;
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('msUntilNextMidnight', () => {
  it('counts down to the next local midnight', () => {
    expect(msUntilNextMidnight(new Date(2026, 10, 18, 23, 59, 0))).toBe(60_000);
    expect(msUntilNextMidnight(new Date(2026, 10, 18, 0, 0, 0))).toBe(24 * 3600_000);
  });
});

describe('useToday', () => {
  it('rolls over at midnight without any user interaction', () => {
    vi.setSystemTime(new Date(2026, 10, 18, 23, 59, 30));
    render(<Today />);
    expect(screen.getByTestId('today')).toHaveTextContent('2026-11-18');

    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(screen.getByTestId('today')).toHaveTextContent('2026-11-19');
  });

  it('catches up when the tablet wakes after timers were frozen', () => {
    vi.setSystemTime(new Date(2026, 10, 18, 22, 0, 0));
    render(<Today />);

    // Simulate a sleeping device: the clock jumps, no timers run.
    vi.setSystemTime(new Date(2026, 10, 19, 7, 0, 0));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(screen.getByTestId('today')).toHaveTextContent('2026-11-19');
  });
});

describe('App day rollover', () => {
  it('resets completions view and returns to the family screen on a new day', () => {
    vi.setSystemTime(new Date(2026, 10, 18, 23, 59, 50));
    render(<App />);
    const { kids, tasks } = useStore.getState();
    const task = tasks.find((t) => t.assignedTo.includes(kids[0].id))!;

    // Today's completion is recorded, then a grown-up leaves the Manage view open.
    act(() => {
      useStore.getState().toggleCompletion(task.id, kids[0].id);
      useUiStore.getState().setView('manage');
    });
    expect(useUiStore.getState().view).toBe('manage');

    act(() => {
      vi.advanceTimersByTime(11_000);
    });

    expect(useUiStore.getState().view).toBe('family');
    // History is kept (yesterday's completion), but nothing is done "today".
    const day = useStore.getState().completions;
    expect(day.some((c) => c.date === '2026-11-18')).toBe(true);
    expect(day.some((c) => c.date === '2026-11-19')).toBe(false);
  });
});

describe('KidDailyView overnight', () => {
  it('shows yesterday\'s checked task as not done after midnight', () => {
    vi.setSystemTime(new Date(2026, 10, 18, 23, 59, 50));
    useStore.setState({ ...emptyData() });
    const kid = useStore.getState().addKid({ name: 'Ozzy', avatar: '🦖', color: '#60a5fa' });
    const task = useStore.getState().addTask({
      title: 'Brush teeth',
      icon: '🪥',
      type: 'routine',
      assignedTo: [kid],
      schedule: { days: [] },
      starValue: 1,
    });
    render(<KidDailyView kidId={kid} />);

    act(() => {
      useStore.getState().toggleCompletion(task, kid);
    });
    expect(screen.getByRole('button', { name: /Brush teeth/ })).toHaveAttribute('aria-pressed', 'true');

    act(() => {
      vi.advanceTimersByTime(11_000);
    });
    expect(screen.getByRole('button', { name: /Brush teeth/ })).toHaveAttribute('aria-pressed', 'false');
    // Yesterday's record (and its stars) is preserved.
    expect(useStore.getState().completions).toHaveLength(1);
  });
});

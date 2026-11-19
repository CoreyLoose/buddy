import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { useStore, selectIsTaskDone, selectTasksForDate } from '@/store';
import { emptyData } from '@/store';
import { TaskForm } from './TaskForm';
import { TaskManager } from './TaskManager';
import { KidDailyView, FADE_OUT_MS } from './KidDailyView';

const AVA = 'kid_ava';
const NOAH = 'kid_noah';

function seedKids() {
  useStore.setState({
    ...emptyData(),
    kids: [
      { id: AVA, name: 'Ava', avatar: '🦄', color: '#f472b6' },
      { id: NOAH, name: 'Noah', avatar: '🚀', color: '#60a5fa' },
    ],
  });
}

beforeEach(() => {
  localStorage.clear();
  seedKids();
});

describe('TaskForm (B1 management)', () => {
  it('creates a task with assignment and a specific schedule', () => {
    render(<TaskForm />);

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Walk the dog' },
    });
    // Assign to Ava
    fireEvent.click(screen.getByRole('button', { name: /Ava/ }));
    // Switch off "every day" and pick Mon + Wed
    fireEvent.click(screen.getByLabelText('Every day'));
    fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wednesday' }));
    // Part of day: evening
    fireEvent.click(screen.getByRole('button', { name: /Evening/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

    const tasks = useStore.getState().tasks;
    expect(tasks).toHaveLength(1);
    const task = tasks[0];
    expect(task.title).toBe('Walk the dog');
    expect(task.assignedTo).toEqual([AVA]);
    expect(task.schedule.days).toEqual([1, 3]);
    expect(task.schedule.partOfDay).toBe('evening');
  });

  it('requires a title and at least one assignee', () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    expect(useStore.getState().tasks).toHaveLength(0);
    expect(screen.getByText(/enter a title/i)).toBeInTheDocument();
  });

  it('edits an existing task through updateTask', () => {
    const id = useStore.getState().addTask({
      title: 'Old title',
      icon: '🧹',
      type: 'chore',
      assignedTo: [AVA],
      schedule: { days: [] },
      starValue: 1,
    });
    const task = useStore.getState().tasks.find((t) => t.id === id)!;
    render(<TaskForm task={task} />);

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New title' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(useStore.getState().tasks.find((t) => t.id === id)!.title).toBe('New title');
  });

  it('lets the star value be cleared, but refuses to save it blank', () => {
    const id = useStore.getState().addTask({
      title: 'Task',
      icon: '🧹',
      type: 'chore',
      assignedTo: [AVA],
      schedule: { days: [] },
      starValue: 0,
    });
    const task = useStore.getState().tasks.find((t) => t.id === id)!;
    render(<TaskForm task={task} />);

    const stars = screen.getByLabelText('Star value') as HTMLInputElement;
    fireEvent.change(stars, { target: { value: '' } });
    expect(stars.value).toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByText(/enter a star value/i)).toBeInTheDocument();
    expect(useStore.getState().tasks.find((t) => t.id === id)!.starValue).toBe(0);

    fireEvent.change(stars, { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(useStore.getState().tasks.find((t) => t.id === id)!.starValue).toBe(1);
  });
});

describe('TaskManager reordering', () => {
  it('moves a task down via reorderTasks', () => {
    useStore.getState().addTask({
      title: 'First',
      icon: '1️⃣',
      type: 'chore',
      assignedTo: [AVA],
      schedule: { days: [] },
      starValue: 1,
    });
    useStore.getState().addTask({
      title: 'Second',
      icon: '2️⃣',
      type: 'chore',
      assignedTo: [AVA],
      schedule: { days: [] },
      starValue: 1,
    });

    render(<TaskManager />);
    fireEvent.click(screen.getByRole('button', { name: 'Move First down' }));

    const ordered = useStore
      .getState()
      .tasks.slice()
      .sort((a, b) => a.order - b.order)
      .map((t) => t.title);
    expect(ordered).toEqual(['Second', 'First']);
  });
});

describe('KidDailyView (B2)', () => {
  function seedDayTasks() {
    useStore.getState().addTask({
      title: 'Brush teeth',
      icon: '🪥',
      type: 'routine',
      assignedTo: [AVA],
      schedule: { days: [], partOfDay: 'morning' },
      starValue: 1,
    });
    useStore.getState().addTask({
      title: 'Homework',
      icon: '📚',
      type: 'chore',
      assignedTo: [AVA],
      schedule: { days: [], partOfDay: 'afternoon' },
      starValue: 3,
    });
    useStore.getState().addTask({
      title: 'Pajamas',
      icon: '🧸',
      type: 'routine',
      assignedTo: [AVA],
      schedule: { days: [], partOfDay: 'evening' },
      starValue: 1,
    });
  }

  describe('fading out completed tasks', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('fades a completed task over 10s, then removes it from the list', () => {
      seedDayTasks();
      render(<KidDailyView kidId={AVA} date="2026-11-08" />);

      fireEvent.click(screen.getByRole('button', { name: /Brush teeth/ }));
      const row = screen.getByRole('button', { name: /Brush teeth/ }).closest('li')!;
      expect(row).toHaveStyle({ opacity: '0' });
      expect(row.style.transition).toContain(`${FADE_OUT_MS}ms`);

      act(() => {
        vi.advanceTimersByTime(FADE_OUT_MS - 1);
      });
      expect(screen.getByText('Brush teeth')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.queryByText('Brush teeth')).not.toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Morning' })).not.toBeInTheDocument();
      // Remaining tasks are untouched, and progress still counts the finished one.
      expect(screen.getByText('Homework')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    });

    it('tapping a fading task again undoes it and keeps it in the list', () => {
      seedDayTasks();
      render(<KidDailyView kidId={AVA} date="2026-11-08" />);

      fireEvent.click(screen.getByRole('button', { name: /Brush teeth/ }));
      fireEvent.click(screen.getByRole('button', { name: /Brush teeth/ }));
      act(() => {
        vi.advanceTimersByTime(FADE_OUT_MS * 2);
      });

      const btn = screen.getByRole('button', { name: /Brush teeth/ });
      expect(btn).toHaveAttribute('aria-pressed', 'false');
      expect(btn.closest('li')).toHaveStyle({ opacity: '1' });
    });

    it('hides already-finished tasks right away, with a toggle to show them', () => {
      seedDayTasks();
      const [brush] = selectTasksForDate(useStore.getState(), AVA, '2026-11-08');
      useStore.getState().toggleCompletion(brush.id, AVA, '2026-11-08');
      render(<KidDailyView kidId={AVA} date="2026-11-08" />);

      expect(screen.queryByText('Brush teeth')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Show 1 finished/ }));
      expect(screen.getByText('Brush teeth')).toBeInTheDocument();
    });
  });

  it('groups tasks by part of day', () => {
    seedDayTasks();
    render(<KidDailyView kidId={AVA} date="2026-11-08" />);

    const morning = screen.getByRole('region', { name: 'Morning' });
    expect(within(morning).getByText('Brush teeth')).toBeInTheDocument();
    const afternoon = screen.getByRole('region', { name: 'Afternoon' });
    expect(within(afternoon).getByText('Homework')).toBeInTheDocument();
    const evening = screen.getByRole('region', { name: 'Evening' });
    expect(within(evening).getByText('Pajamas')).toBeInTheDocument();
  });

  it('completing a task updates progress and store completions', () => {
    seedDayTasks();
    const date = '2026-11-08';
    render(<KidDailyView kidId={AVA} date={date} />);

    // 3 tasks, 0 done
    const ring = screen.getByRole('progressbar');
    expect(ring).toHaveAttribute('aria-valuenow', '0');
    expect(ring).toHaveAttribute('aria-valuemax', '3');

    fireEvent.click(screen.getByRole('button', { name: /Brush teeth/ }));

    const brush = useStore
      .getState()
      .tasks.find((t) => t.title === 'Brush teeth')!;
    expect(selectIsTaskDone(useStore.getState(), brush.id, AVA, date)).toBe(true);
    // 1 of 3 done
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  });

  it('only shows tasks scheduled for the given weekday', () => {
    // Weekday-only task (weekdays Mon-Fri). 2026-11-08 is a Sunday.
    useStore.getState().addTask({
      title: 'School run',
      icon: '🎒',
      type: 'chore',
      assignedTo: [AVA],
      schedule: { days: [1, 2, 3, 4, 5], partOfDay: 'morning' },
      starValue: 1,
    });
    render(<KidDailyView kidId={AVA} date="2026-11-08" />);
    expect(screen.queryByText('School run')).not.toBeInTheDocument();
    expect(screen.getByText(/Nothing scheduled/)).toBeInTheDocument();
  });

  it('resets per calendar day because completions are date-stamped', () => {
    seedDayTasks();
    const brush = useStore.getState().tasks.find((t) => t.title === 'Brush teeth')!;
    // Mark done yesterday
    useStore.getState().toggleCompletion(brush.id, AVA, '2026-11-07');

    // Today it is not done
    expect(selectIsTaskDone(useStore.getState(), brush.id, AVA, '2026-11-08')).toBe(false);
    const todays = selectTasksForDate(useStore.getState(), AVA, '2026-11-08');
    expect(todays).toHaveLength(3);
  });
});

describe('task icon palette', () => {
  it('offers 80 unique icons including pajamas and socks & shoes', async () => {
    const { ICON_CHOICES, TASK_ICON_GROUPS, isIconPair } = await import('./constants');
    expect(ICON_CHOICES).toHaveLength(80);
    expect(new Set(ICON_CHOICES).size).toBe(80);
    const names = TASK_ICON_GROUPS.flatMap((g) => g.icons.map((x) => x.name));
    expect(names).toContain('Put on pajamas');
    expect(names).toContain('Socks & shoes');
    expect(isIconPair('🧦👟')).toBe(true);
    expect(isIconPair('🛏️')).toBe(false);
  });
});

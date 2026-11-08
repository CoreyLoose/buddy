import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { useStore, selectIsTaskDone, selectTasksForDate } from '@/store';
import { emptyData } from '@/store';
import { TaskForm } from './TaskForm';
import { TaskManager } from './TaskManager';
import { KidDailyView } from './KidDailyView';

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

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';
import { IconBadge } from './IconBadge';
import { EmptyState } from './EmptyState';
import { Button } from './Button';

describe('Card', () => {
  it('renders children and applies an accent top border', () => {
    render(
      <Card accent="#ff0000" data-testid="card">
        inside
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveTextContent('inside');
    expect(card.style.borderTopColor).toBe('rgb(255, 0, 0)');
  });
});

describe('IconBadge', () => {
  it('is decorative without a label', () => {
    render(<IconBadge icon="🦄" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('exposes a label when provided', () => {
    render(<IconBadge icon="🦄" label="Ava's avatar" />);
    expect(screen.getByRole('img', { name: "Ava's avatar" })).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title, description and an action', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="Nothing here"
        description="Add something"
        action={<Button onClick={onClick}>Add</Button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument();
    expect(screen.getByText('Add something')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

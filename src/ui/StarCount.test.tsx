import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StarCount } from './StarCount';

describe('StarCount', () => {
  it('shows the value and a star', () => {
    render(<StarCount value={7} />);
    const el = screen.getByRole('img', { name: '7 stars' });
    expect(el).toHaveTextContent('⭐');
    expect(el).toHaveTextContent('7');
  });

  it('uses singular label for 1 star', () => {
    render(<StarCount value={1} />);
    expect(screen.getByRole('img', { name: '1 star' })).toBeInTheDocument();
  });

  it('supports a custom label', () => {
    render(<StarCount value={3} label="3 stars earned today" />);
    expect(
      screen.getByRole('img', { name: '3 stars earned today' }),
    ).toBeInTheDocument();
  });
});

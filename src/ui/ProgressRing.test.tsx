import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  it('exposes progressbar semantics', () => {
    render(<ProgressRing value={3} total={4} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemax', '4');
    expect(bar).toHaveAttribute('aria-valuetext', '3 of 4 complete (75%)');
  });

  it('shows value/total label by default', () => {
    render(<ProgressRing value={2} total={5} />);
    expect(screen.getByText('/5')).toBeInTheDocument();
  });

  it('clamps value above total and handles zero total', () => {
    render(<ProgressRing value={10} total={0} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar).toHaveAttribute('aria-valuetext', '0 of 0 complete (0%)');
  });
});

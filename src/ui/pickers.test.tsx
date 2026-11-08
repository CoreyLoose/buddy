import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { IconPicker } from './IconPicker';
import { AvatarPicker } from './AvatarPicker';
import { ColorPicker } from './ColorPicker';
import { ACCENT_COLORS, AVATAR_PRESETS } from './tokens';

describe('IconPicker', () => {
  it('is a radiogroup and reports the chosen icon', () => {
    const onChange = vi.fn();
    render(<IconPicker value="🧹" onChange={onChange} />);
    const group = screen.getByRole('radiogroup', { name: 'Choose an icon' });
    const broom = within(group).getByRole('radio', { name: '🧹' });
    expect(broom).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(within(group).getByRole('radio', { name: '📚' }));
    expect(onChange).toHaveBeenCalledWith('📚');
  });
});

describe('AvatarPicker', () => {
  it('marks the selected avatar and emits changes', () => {
    const onChange = vi.fn();
    const [first, second] = AVATAR_PRESETS;
    render(<AvatarPicker value={first} onChange={onChange} />);
    expect(screen.getByRole('radio', { name: first })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    fireEvent.click(screen.getByRole('radio', { name: second }));
    expect(onChange).toHaveBeenCalledWith(second);
  });
});

describe('ColorPicker', () => {
  it('emits the hex of the clicked swatch', () => {
    const onChange = vi.fn();
    render(<ColorPicker value={ACCENT_COLORS[0].hex} onChange={onChange} />);
    const target = ACCENT_COLORS[1];
    fireEvent.click(screen.getByRole('radio', { name: target.label }));
    expect(onChange).toHaveBeenCalledWith(target.hex);
  });
});

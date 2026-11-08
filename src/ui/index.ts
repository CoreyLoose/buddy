// Public API of the M1 design system & app shell.
// Other tracks import UI from here: `import { Button, Card, ... } from '@/ui'`.

// Utilities & tokens
export { cn } from './cn';
export * from './tokens';

// UI-only store (view switching) — NOT the data store.
export { useUiStore } from './uiStore';
export type { AppView, UiState } from './uiStore';

// Core components
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Card } from './Card';
export type { CardProps } from './Card';

export { StarCount } from './StarCount';
export type { StarCountProps, StarCountSize } from './StarCount';

export { ProgressRing } from './ProgressRing';
export type { ProgressRingProps } from './ProgressRing';

export { IconBadge } from './IconBadge';
export type { IconBadgeProps, IconBadgeSize } from './IconBadge';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

// Pickers
export { IconPicker } from './IconPicker';
export type { IconPickerProps } from './IconPicker';

export { AvatarPicker } from './AvatarPicker';
export type { AvatarPickerProps } from './AvatarPicker';

export { ColorPicker } from './ColorPicker';
export type { ColorPickerProps } from './ColorPicker';

// Shell & navigation
export { AppShell } from './AppShell';
export type { AppShellProps } from './AppShell';

export { ViewSwitcher } from './ViewSwitcher';
export type { ViewSwitcherProps } from './ViewSwitcher';

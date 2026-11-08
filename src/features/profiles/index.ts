// Track A — Profiles. Public surface for other tracks / the app shell.

export { ProfilesHome } from './ProfilesHome';
export type { ProfilesHomeProps } from './ProfilesHome';

export { KidSwitcher } from './KidSwitcher';
export type { KidSwitcherProps } from './KidSwitcher';

export { KidCard } from './KidCard';
export type { KidCardProps } from './KidCard';

export { KidForm } from './KidForm';
export type { KidFormProps } from './KidForm';

// Session store: how other tracks read/set "the current kid".
export { useSession, useActiveKid, selectActiveKid } from './session';
export type { SessionState } from './session';

export { AVATAR_PRESETS, COLOR_PRESETS, DEFAULT_AVATAR, DEFAULT_COLOR } from './constants';

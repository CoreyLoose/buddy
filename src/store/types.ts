// Core data model for the Kids Chore & Routine Tracker.
// This is the contract every feature track (profiles, tasks, rewards) builds against.
// Keep changes here backward-compatible, or bump SCHEMA_VERSION and add a migration.

export type ID = string;

export type TaskType = 'chore' | 'routine';
export type PartOfDay = 'morning' | 'afternoon' | 'evening';
export type CompletionStatus = 'done' | 'skipped';

export interface Kid {
  id: ID;
  name: string;
  avatar: string; // emoji or preset key
  color: string; // theme accent (hex or token)
}

export interface TaskSchedule {
  /** Days of week this task applies to (0=Sun..6=Sat). Empty array = every day. */
  days: number[];
  partOfDay?: PartOfDay;
}

export interface Task {
  id: ID;
  title: string;
  icon: string;
  type: TaskType;
  assignedTo: ID[]; // kid ids
  schedule: TaskSchedule;
  starValue: number;
  order: number;
}

/** One record per (task, kid, date) interaction. */
export interface Completion {
  id: ID;
  taskId: ID;
  kidId: ID;
  date: string; // YYYY-MM-DD (local)
  status: CompletionStatus;
  starsAwarded: number;
}

export interface Reward {
  id: ID;
  title: string;
  icon: string;
  cost: number; // stars
  active: boolean;
}

export interface Redemption {
  id: ID;
  rewardId: ID;
  kidId: ID;
  date: string; // YYYY-MM-DD (local)
  cost: number;
}

/** The full persisted application state. */
export interface AppData {
  kids: Kid[];
  tasks: Task[];
  completions: Completion[];
  rewards: Reward[];
  redemptions: Redemption[];
}

// ─── Column IDs ──────────────────────────────────────────────────────────────
// These are the four stages a job can be in.
// Using a union type (|) means TypeScript will throw an error if you ever
// accidentally type "applyed" or "offerr" — it only accepts exactly these strings.
export type ColumnId = 'applied' | 'interview' | 'offer' | 'rejected';

// ─── Priority ─────────────────────────────────────────────────────────────────
// A job card can be tagged as urgent, normal, or low priority.
// Same idea — a union type that locks down the valid values.
export type Priority = 'urgent' | 'normal' | 'low';

// ─── Job ──────────────────────────────────────────────────────────────────────
// This is the main data shape. Every card on the board is one Job object.
export interface Job {
  id: string;             // Unique identifier. We use crypto.randomUUID() to generate this.
  company: string;        // e.g. "Google"
  role: string;           // e.g. "Frontend Engineer"
  dateApplied: string;    // ISO date string: "2025-05-17"
  salary?: string;        // Optional — the ? means this field can be missing
  notes?: string;         // Optional — user can add notes later
  interviewDate?: string; // Optional — set when they get an interview
  contactName?: string;   // Optional — recruiter or hiring manager name
  jobLink?: string;       // Optional — URL to the job posting
  priority: Priority;     // Required — must be one of the 3 priority values above
  columnId: ColumnId;     // Required — which column this card currently lives in
  order: number;          // Position within the column (0, 1, 2...) — used for sorting
}

// ─── Board State ──────────────────────────────────────────────────────────────
// This is the entire app's state in one object.
// Everything the UI needs to render is derived from this.
export interface BoardState {
  jobs: Job[];            // All job cards across all columns
  searchQuery: string;    // What the user has typed in the search bar
  darkMode: boolean;      // Whether dark mode is on
}

// ─── Reducer Actions ──────────────────────────────────────────────────────────
// These describe every possible change that can happen to the board.
// Think of them as "events" — the reducer decides how state changes in response.
// The discriminated union (type: '...') lets TypeScript know exactly which
// payload shape goes with which action.
export type BoardAction =
  | { type: 'ADD_JOB';     payload: Omit<Job, 'id' | 'order'> }
  // ADD_JOB: we provide all job fields EXCEPT id and order
  // (those are generated automatically inside the reducer)

  | { type: 'MOVE_JOB';    payload: { jobId: string; toColumn: ColumnId; toIndex: number } }
  // MOVE_JOB: used by drag-and-drop. We say "move card X to column Y at position Z"

  | { type: 'UPDATE_JOB';  payload: Partial<Job> & { id: string } }
  // UPDATE_JOB: Partial<Job> means any subset of Job fields.
  // We require id so we know which card to update. All other fields are optional.

  | { type: 'DELETE_JOB';  payload: string }
  // DELETE_JOB: payload is just the job's id string

  | { type: 'SET_SEARCH';  payload: string }
  // SET_SEARCH: payload is whatever the user typed

  | { type: 'TOGGLE_DARK_MODE' }
  // TOGGLE_DARK_MODE: no payload needed — we just flip the boolean

// ─── Column metadata ──────────────────────────────────────────────────────────
// Used to render the four columns. Keeps visual config in one place.
export interface ColumnConfig {
  id: ColumnId;
  label: string;
  color: string;
  icon: string;
  accentColor: string; // CSS variable reference for the column accent dot
}

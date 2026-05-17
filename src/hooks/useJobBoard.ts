import { useReducer, useEffect, Dispatch } from 'react';
import type { BoardState, BoardAction } from '../types';

// ─── The reducer function ─────────────────────────────────────────────────────
// A reducer is just a pure function: (currentState, action) => newState
// It never modifies existing state — it always returns a brand new object.
// That's what "pure" means: no side effects, same input always gives same output.
function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {

    case 'ADD_JOB': {
      // Find how many cards are already in the target column,
      // so we can put the new card at the end (highest order number).
      const columnJobs = state.jobs.filter(j => j.columnId === action.payload.columnId);
      const newJob = {
        ...action.payload,                    // spread all the fields the user filled in
        id: crypto.randomUUID(),              // generate a unique ID — built into modern browsers
        order: columnJobs.length,             // place it at the bottom of its column
      };
      return { ...state, jobs: [...state.jobs, newJob] };
      // ...state keeps darkMode and searchQuery unchanged
      // [...state.jobs, newJob] creates a NEW array with the new job appended
    }

    case 'MOVE_JOB': {
      const { jobId, toColumn, toIndex } = action.payload;

      // Remove the card from wherever it currently is
      const jobsWithoutMoved = state.jobs.filter(j => j.id !== jobId);
      const movedJob = state.jobs.find(j => j.id === jobId)!;
      // The ! at the end tells TypeScript "trust me, this will never be undefined"

      // Get all cards in the destination column (excluding the moving card)
      const destColumnJobs = jobsWithoutMoved
        .filter(j => j.columnId === toColumn)
        .sort((a, b) => a.order - b.order);

      // Insert the moved card at the target index
      destColumnJobs.splice(toIndex, 0, { ...movedJob, columnId: toColumn });

      // Rebuild the order numbers for the destination column (0, 1, 2, 3...)
      const reorderedDest = destColumnJobs.map((j, i) => ({ ...j, order: i }));

      // Recalculate order for the source column too (in case a gap was left)
      const sourceColumnJobs = jobsWithoutMoved
        .filter(j => j.columnId !== toColumn)
        .concat(jobsWithoutMoved.filter(j => j.columnId === movedJob.columnId && j.columnId !== toColumn));

      // Rebuild the full jobs array: cards NOT in destination + reordered destination
      const otherJobs = jobsWithoutMoved.filter(j => j.columnId !== toColumn);
      // Re-sort the source column to close the gap
      const sourceColId = movedJob.columnId;
      const reorderedOther = otherJobs.map(j => {
        if (j.columnId === sourceColId) return j; // will re-sort below
        return j;
      });
      // Fix order numbers in source column
      const sourceFixed = reorderedOther
        .filter(j => j.columnId === sourceColId)
        .sort((a, b) => a.order - b.order)
        .map((j, i) => ({ ...j, order: i }));
      const nonSourceNonDest = reorderedOther.filter(
        j => j.columnId !== sourceColId
      );

      return {
        ...state,
        jobs: [...nonSourceNonDest, ...sourceFixed, ...reorderedDest],
      };
    }

    case 'UPDATE_JOB': {
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job.id === action.payload.id
            ? { ...job, ...action.payload }  // merge the new fields into the existing job
            : job                            // leave all other jobs untouched
        ),
      };
    }

    case 'DELETE_JOB': {
      return {
        ...state,
        jobs: state.jobs.filter(job => job.id !== action.payload),
        // filter returns a new array with the deleted card removed
      };
    }

    case 'SET_SEARCH': {
      return { ...state, searchQuery: action.payload };
    }

    case 'TOGGLE_DARK_MODE': {
      return { ...state, darkMode: !state.darkMode };
    }

    default:
      return state;
  }
}

// ─── Initial state ────────────────────────────────────────────────────────────
// Sample data so the board isn't empty on first load.
const INITIAL_STATE: BoardState = {
  darkMode: true,
  searchQuery: '',
  jobs: [
    {
      id: '1', company: 'Google', role: 'Frontend Engineer',
      dateApplied: '2025-05-01', salary: '$140k–$180k',
      priority: 'urgent', columnId: 'applied', order: 0,
      jobLink: 'https://careers.google.com',
      notes: 'Referral from college friend. Applied through internal portal.',
    },
    {
      id: '2', company: 'Stripe', role: 'React Developer',
      dateApplied: '2025-05-05', salary: '$130k–$160k',
      priority: 'normal', columnId: 'applied', order: 1,
      notes: 'Cold applied via LinkedIn.',
    },
    {
      id: '3', company: 'Vercel', role: 'UI Engineer',
      dateApplied: '2025-04-28', salary: '$120k–$150k',
      priority: 'normal', columnId: 'interview', order: 0,
      interviewDate: '2025-05-20',
      contactName: 'Sarah Chen',
      notes: 'Technical screen scheduled. Prep system design.',
    },
    {
      id: '4', company: 'Shopify', role: 'Software Engineer',
      dateApplied: '2025-04-20', salary: '$110k–$140k',
      priority: 'low', columnId: 'offer', order: 0,
      notes: 'Offer received! Deadline to respond: May 25.',
    },
    {
      id: '5', company: 'Meta', role: 'Product Engineer',
      dateApplied: '2025-04-15', salary: '$160k–$200k',
      priority: 'urgent', columnId: 'rejected', order: 0,
      notes: 'Failed the system design round. Study distributed systems.',
    },
  ],
};

// ─── The hook itself ──────────────────────────────────────────────────────────
// This wraps useReducer and adds automatic localStorage persistence.
export function useJobBoard(): [BoardState, Dispatch<BoardAction>] {

  // Step 1: Try to load saved state from localStorage.
  // If nothing is saved yet, fall back to INITIAL_STATE.
  const loadState = (): BoardState => {
    try {
      const saved = localStorage.getItem('job-board-state');
      return saved ? (JSON.parse(saved) as BoardState) : INITIAL_STATE;
    } catch {
      // If parsing fails (corrupted data), start fresh
      return INITIAL_STATE;
    }
  };

  // Step 2: Create the reducer. useReducer is like useState but for complex state.
  // It takes (reducerFunction, initialValue) and returns [currentState, dispatch].
  // dispatch is the function you call to trigger actions: dispatch({ type: 'ADD_JOB', payload: ... })
  const [state, dispatch] = useReducer(boardReducer, undefined, loadState);

  // Step 3: Every time state changes, save it to localStorage.
  // useEffect runs after every render where `state` changed.
  useEffect(() => {
    localStorage.setItem('job-board-state', JSON.stringify(state));
  }, [state]); // ← the [state] is the "dependency array" — only re-run when state changes

  // Step 4: Apply or remove the 'dark' class on <html> to enable Tailwind dark mode.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  // Return state and dispatch so any component can use them
  return [state, dispatch];
}

import { useState } from 'react';
import {
  DndContext, DragOverlay,
  PointerSensor, KeyboardSensor, TouchSensor,
  useSensor, useSensors, closestCorners,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Job, ColumnId, ColumnConfig, BoardAction } from '../../types';
import { Column } from './Column';
import { JobCard } from './JobCard';
import type { Dispatch } from 'react';

export const COLUMNS: ColumnConfig[] = [
  { id: 'applied',   label: 'Applied',   color: 'text-indigo-400',  icon: '📨', accentColor: 'var(--col-applied)'   },
  { id: 'interview', label: 'Interview', color: 'text-emerald-400', icon: '🎙️', accentColor: 'var(--col-interview)' },
  { id: 'offer',     label: 'Offer',     color: 'text-amber-400',   icon: '🎉', accentColor: 'var(--col-offer)'     },
  { id: 'rejected',  label: 'Rejected',  color: 'text-red-400',     icon: '❌', accentColor: 'var(--col-rejected)'  },
];

const COLUMN_IDS = COLUMNS.map(c => c.id);

interface BoardProps {
  jobs: Job[];
  onCardClick: (job: Job) => void;
  dispatch: Dispatch<BoardAction>;
}

export function Board({ jobs, onCardClick, dispatch }: BoardProps) {
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const job = jobs.find(j => j.id === event.active.id);
    if (job) setActiveJob(job);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveJob(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId   = over.id as string;
    if (activeId === overId) return;

    const activeJob = jobs.find(j => j.id === activeId);
    if (!activeJob) return;

    let toColumn: ColumnId;
    let toIndex: number;

    if ((COLUMN_IDS as string[]).includes(overId)) {
      // Dropped directly on a column (empty column or column gap)
      toColumn = overId as ColumnId;
      const colJobs = jobs.filter(j => j.columnId === toColumn && j.id !== activeId);
      toIndex = colJobs.length;
    } else {
      // Dropped on another card
      const overJob = jobs.find(j => j.id === overId);
      if (!overJob) return;

      toColumn = overJob.columnId;

      // Get destination column cards, excluding the card being moved
      const colJobs = jobs
        .filter(j => j.columnId === toColumn && j.id !== activeId)
        .sort((a, b) => a.order - b.order);

      toIndex = colJobs.findIndex(j => j.id === overId);
      if (toIndex === -1) toIndex = colJobs.length;

      // ── Bug fix: dragging DOWN within the same column ──────────────────
      // When we remove the active card and find the target's index,
      // dropping ON a card always puts the active card BEFORE it.
      // This is correct when dragging UP (card goes above the target).
      // But when dragging DOWN within the same column, the user expects
      // the card to land AFTER the target — so we add 1.
      const draggingDown =
        activeJob.columnId === toColumn &&
        activeJob.order < overJob.order;

      if (draggingDown) toIndex += 1;
    }

    dispatch({ type: 'MOVE_JOB', payload: { jobId: activeId, toColumn, toIndex } });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <main className="overflow-x-auto flex-1 p-6">
        <div className="flex gap-5 min-w-max h-full items-start">
          {COLUMNS.map(config => (
            <Column
              key={config.id}
              config={config}
              jobs={jobs.filter(j => j.columnId === config.id)}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </main>

      <DragOverlay dropAnimation={null}>
        {activeJob ? <JobCard job={activeJob} onClick={() => {}} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

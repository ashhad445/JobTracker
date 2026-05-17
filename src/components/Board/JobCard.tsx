import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { Job } from '../../types';

interface JobCardProps {
  job: Job;
  onClick: () => void;
  isDragOverlay?: boolean;
}

const PRIORITY = {
  urgent: { label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
  normal: { label: 'Normal', color: '#818cf8', bg: 'rgba(129,140,248,0.10)' },
  low:    { label: 'Low',    color: '#64748b', bg: 'rgba(100,116,139,0.10)' },
} as const;

const COL_ACCENT = {
  applied:   { color: 'var(--col-applied)',   glow: 'rgba(99,102,241,0.22)' },
  interview: { color: 'var(--col-interview)', glow: 'rgba(16,185,129,0.22)' },
  offer:     { color: 'var(--col-offer)',     glow: 'rgba(245,158,11,0.22)' },
  rejected:  { color: 'var(--col-rejected)', glow: 'rgba(239,68,68,0.22)'  },
} as const;

function formatDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(d + 'T12:00:00')
  );
}

export function JobCard({ job, onClick, isDragOverlay = false }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const accent = COL_ACCENT[job.columnId];
  const priority = PRIORITY[job.priority];

  return (
    // {...listeners} is on the outer div so the WHOLE card is draggable.
    // The activationConstraint: { distance: 8 } in Board.tsx means you must
    // move 8px before a drag starts — so normal clicks still open the modal.
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        onClick={onClick}
        whileHover={!isDragging && !isDragOverlay ? {
          y: -3,
          boxShadow: `var(--shadow-card), 0 8px 32px ${accent.glow}`,
        } : {}}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className={`
          group relative rounded-2xl p-4 select-none
          glass
          ${isDragging ? 'drag-ghost' : ''}
          ${isDragOverlay ? 'dragging-overlay' : ''}
        `}
        style={{
          border: `1px solid var(--border-strong)`,
          boxShadow: `var(--shadow-card), 0 4px 18px ${accent.glow}`,
        }}
      >
        {/* Subtle gradient tint from left border color */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(105deg, ${accent.glow} 0%, transparent 40%)`,
            opacity: 0.5,
          }}
        />

        {/* Drag handle — now just a visual indicator, not the drag target */}
        <div
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200 pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3.5" cy="3"  r="1.1"/><circle cx="8.5" cy="3"  r="1.1"/>
            <circle cx="3.5" cy="7"  r="1.1"/><circle cx="8.5" cy="7"  r="1.1"/>
            <circle cx="3.5" cy="11" r="1.1"/><circle cx="8.5" cy="11" r="1.1"/>
          </svg>
        </div>

        {/* Content — relative so it's above the gradient overlay */}
        <div className="relative">
          {/* Company + Role */}
          <div className="pr-6">
            <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
              {job.company}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {job.role}
            </p>
          </div>

          {/* Salary */}
          {job.salary && (
            <p className="text-xs mt-2.5 font-medium tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {job.salary}
            </p>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between mt-3 pt-2.5"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDate(job.dateApplied)}
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: priority.bg, color: priority.color }}
            >
              {priority.label}
            </span>
          </div>

          {/* Interview date chip */}
          {job.interviewDate && (
            <div
              className="mt-2.5 flex items-center gap-1.5 text-xs rounded-xl px-2.5 py-1.5 font-medium"
              style={{
                background: 'rgba(16,185,129,0.10)',
                color: 'var(--col-interview)',
                border: '1px solid rgba(16,185,129,0.18)',
              }}
            >
              📅 Interview {formatDate(job.interviewDate)}
            </div>
          )}

          {/* Notes */}
          {job.notes && (
            <p className="mt-2 text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {job.notes}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

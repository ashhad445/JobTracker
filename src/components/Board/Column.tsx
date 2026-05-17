import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import type { Job, ColumnConfig } from '../../types';
import { JobCard } from './JobCard';

interface ColumnProps {
  config: ColumnConfig;
  jobs: Job[];
  onCardClick: (job: Job) => void;
}

const cardVariants = {
  hidden:  { opacity: 0, y: 10, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring' as const, stiffness: 320, damping: 26 } },
  exit:    { opacity: 0, scale: 0.93, y: -6, transition: { duration: 0.16 } },
};

const listVariants = {
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export function Column({ config, jobs, onCardClick }: ColumnProps) {
  const sorted = [...jobs].sort((a, b) => a.order - b.order);
  const { setNodeRef, isOver } = useDroppable({ id: config.id });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="w-72 flex-shrink-0 flex flex-col"
    >
      {/* ── Column Header ── */}
      <div className="flex items-center justify-between mb-3 px-1">

        {/* Glowing pill chip */}
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: `${config.accentColor}18`,
            border: `1px solid ${config.accentColor}35`,
            color: config.accentColor,
            boxShadow: `0 0 12px ${config.accentColor}20`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full pulse-dot flex-shrink-0"
            style={{ background: config.accentColor, color: config.accentColor }}
          />
          {config.label}
        </div>

        {/* Count badge — animates when count changes */}
        <motion.span
          key={sorted.length}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="text-xs font-bold tabular-nums w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'var(--bg-surface-3)', color: 'var(--text-secondary)' }}
        >
          {sorted.length}
        </motion.span>
      </div>

      {/* ── Column Body ── */}
      <SortableContext items={sorted.map(j => j.id)} strategy={verticalListSortingStrategy}>
        <motion.div
          ref={setNodeRef}
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2.5 flex-1 min-h-48 rounded-2xl p-2.5 transition-all duration-200"
          style={{
            background: isOver
              ? `${config.accentColor}10`
              : 'rgba(255,255,255,0.025)',
            border: `1.5px dashed ${isOver ? config.accentColor + '60' : 'var(--border-strong)'}`,
            boxShadow: isOver ? `inset 0 0 24px ${config.accentColor}12` : 'none',
          }}
        >
          {/* Empty state */}
          <AnimatePresence>
            {sorted.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center h-36 gap-2 rounded-xl text-xs"
                style={{ color: isOver ? config.accentColor : 'var(--text-muted)' }}
              >
                <span className="text-3xl" style={{ opacity: isOver ? 0.8 : 0.3 }}>{config.icon}</span>
                <span>{isOver ? 'Release to drop' : 'No cards yet'}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cards */}
          <AnimatePresence initial={false}>
            {sorted.map(job => (
              <motion.div
                key={job.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <JobCard job={job} onClick={() => onCardClick(job)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </SortableContext>
    </motion.div>
  );
}

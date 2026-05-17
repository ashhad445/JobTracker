import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJobBoard } from './hooks/useJobBoard';
import { Board } from './components/Board/Board';
import { AddJobModal } from './components/Modals/AddJobModal';
import { JobDetailModal } from './components/Modals/JobDetailModal';
import { StatsBar } from './components/StatsBar/StatsBar';
import { exportToCSV } from './utils/exportCSV';
import type { Job } from './types';
import './index.css';

export default function App() {
  const [state, dispatch] = useJobBoard();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = state.jobs.filter(job => {
    if (!state.searchQuery) return true;
    const q = state.searchQuery.toLowerCase();
    return job.company.toLowerCase().includes(q) || job.role.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen flex flex-col bg-grid" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>

      {/* ── Animated background orbs ── */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Everything above the orbs */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <motion.header
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="glass flex items-center justify-between px-6 py-3 border-b sticky top-0"
          style={{ borderColor: 'var(--border)', zIndex: 40, boxShadow: '0 1px 24px rgba(0,0,0,0.06)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--accent), #a78bfa)', boxShadow: '0 4px 16px var(--accent-glow)' }}
            >
              JT
            </motion.div>
            <div>
              <h1 className="text-sm font-bold leading-none gradient-text">Job Tracker</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {state.jobs.length} {state.jobs.length === 1 ? 'application' : 'applications'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--text-muted)' }}>🔍</span>
              <input
                type="text"
                placeholder="Search jobs..."
                value={state.searchQuery}
                onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                className="header-search pl-7 pr-3 py-1.5 text-xs rounded-lg w-44 transition-all duration-200 outline-none"
                style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-strong)')}
              />
            </div>

            {/* CSV Export */}
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => exportToCSV(state.jobs)}
              className="header-export px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150"
              style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}
            >
              ↓ Export
            </motion.button>

            {/* Add Job */}
            <motion.button
              whileHover={{ scale: 1.04, y: -1, boxShadow: '0 6px 20px var(--accent-glow)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg"
              style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', boxShadow: '0 2px 12px var(--accent-glow)' }}
            >
              + Add Job
            </motion.button>

            {/* Dark mode */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-strong)' }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={state.darkMode ? 'sun' : 'moon'}
                  initial={{ rotate: -40, opacity: 0, scale: 0.4 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 40, opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.22, ease: 'backOut' }}
                >
                  {state.darkMode ? '☀️' : '🌙'}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.header>

        {/* ── Stats Bar ─────────────────────────────────────────────────── */}
        <StatsBar jobs={state.jobs} />

        {/* ── Board ─────────────────────────────────────────────────────── */}
        <Board
          jobs={filteredJobs}
          onCardClick={job => setSelectedJob(job)}
          dispatch={dispatch}
        />

        {/* ── Modals ────────────────────────────────────────────────────── */}
        <AddJobModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} dispatch={dispatch} />
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} dispatch={dispatch} />
      </div>
    </div>
  );
}

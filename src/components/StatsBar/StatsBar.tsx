import { motion } from 'framer-motion';
import type { Job } from '../../types';

interface StatsBarProps { jobs: Job[]; }

const STATS_CONFIG = [
  { key: 'total',      label: 'Total',         color: 'var(--accent)',        bg: 'var(--accent-soft)',              icon: '📋' },
  { key: 'applied',    label: 'Applied',        color: 'var(--col-applied)',   bg: 'rgba(99,102,241,0.08)',           icon: '📨' },
  { key: 'interviews', label: 'Interviews',     color: 'var(--col-interview)', bg: 'rgba(16,185,129,0.08)',           icon: '🎙️' },
  { key: 'offers',     label: 'Offers',         color: 'var(--col-offer)',     bg: 'rgba(245,158,11,0.08)',           icon: '🎉' },
  { key: 'rejected',   label: 'Rejected',       color: 'var(--col-rejected)',  bg: 'rgba(239,68,68,0.08)',            icon: '❌' },
  { key: 'rate',       label: 'Response Rate',  color: '#a78bfa',              bg: 'rgba(167,139,250,0.08)',          icon: '📈' },
] as const;

function StatCard({ icon, label, value, color, bg, index }: {
  icon: string; label: string; value: string | number;
  color: string; bg: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 320, damping: 28 }}
      whileHover={{ y: -2, boxShadow: `0 6px 20px ${color}25` }}
      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl cursor-default flex-shrink-0"
      style={{
        background: bg,
        border: `1px solid ${color}28`,
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
    >
      <span className="text-base leading-none">{icon}</span>
      <div>
        <p className="text-base font-bold tabular-nums leading-none" style={{ color }}>{value}</p>
        <p className="text-xs mt-0.5 leading-none" style={{ color: 'var(--text-muted)' }}>{label}</p>
      </div>
    </motion.div>
  );
}

export function StatsBar({ jobs }: StatsBarProps) {
  const total      = jobs.length;
  const applied    = jobs.filter(j => j.columnId === 'applied').length;
  const interviews = jobs.filter(j => j.columnId === 'interview').length;
  const offers     = jobs.filter(j => j.columnId === 'offer').length;
  const rejected   = jobs.filter(j => j.columnId === 'rejected').length;
  const responded  = interviews + offers + rejected;
  const rate       = total > 0 ? Math.round((responded / total) * 100) : 0;

  const values = { total, applied, interviews, offers, rejected, rate: `${rate}%` };

  return (
    <div
      className="flex items-center gap-2.5 px-6 py-3 border-b overflow-x-auto"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {STATS_CONFIG.map((s, i) => (
        <StatCard
          key={s.key}
          index={i}
          icon={s.icon}
          label={s.label}
          value={values[s.key]}
          color={s.color}
          bg={s.bg}
        />
      ))}
    </div>
  );
}

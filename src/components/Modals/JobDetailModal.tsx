import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Dispatch } from 'react';
import type { Job, BoardAction, ColumnId, Priority } from '../../types';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  dispatch: Dispatch<BoardAction>;
}

const iStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 10,
  background: 'var(--bg-surface-2)', border: '1px solid var(--border-strong)',
  color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};
const iDisabled: React.CSSProperties = { ...iStyle, opacity: 0.5, cursor: 'default' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {children}
    </div>
  );
}

export function JobDetailModal({ job, onClose, dispatch }: JobDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState<Job | null>(null);

  useEffect(() => {
    if (job) { setDraft({ ...job }); setIsEditing(false); setConfirmDelete(false); }
  }, [job]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (job) { document.addEventListener('keydown', fn); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [job, onClose]);

  function upd(f: keyof Job, v: string) { setDraft(p => p ? { ...p, [f]: v } : p); }
  function save() { if (draft) { dispatch({ type: 'UPDATE_JOB', payload: draft }); setIsEditing(false); } }
  function del() { if (job) { dispatch({ type: 'DELETE_JOB', payload: job.id }); onClose(); } }
  function cancel() { if (job) setDraft({ ...job }); setIsEditing(false); setConfirmDelete(false); }

  const overlayVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
  const panelVariants = {
    hidden:  { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 30 } },
    exit:    { opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.18 } },
  };

  const s = (e: boolean) => e ? iStyle : iDisabled;

  return createPortal(
    <AnimatePresence>
      {job && draft && (
        <motion.div
          variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
          transition={{ duration: 0.18 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            variants={panelVariants}
            onClick={e => e.stopPropagation()}
            className="modal-panel"
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditing
                    ? <input value={draft.company} onChange={e => upd('company', e.target.value)} style={{ ...iStyle, fontSize: 15, fontWeight: 700, padding: '4px 0', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-strong)', borderRadius: 0 }} />
                    : <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company}</h2>
                  }
                  {isEditing
                    ? <input value={draft.role} onChange={e => upd('role', e.target.value)} style={{ ...iStyle, fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, padding: '3px 0', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0 }} />
                    : <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{job.role}</p>
                  }
                </div>
                <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Date Applied"><input type="date" value={draft.dateApplied} onChange={e => upd('dateApplied', e.target.value)} disabled={!isEditing} style={s(isEditing)} /></Field>
                <Field label="Salary"><input value={draft.salary ?? ''} placeholder="—" onChange={e => upd('salary', e.target.value)} disabled={!isEditing} style={s(isEditing)} /></Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Priority">
                  <select value={draft.priority} onChange={e => upd('priority', e.target.value as Priority)} disabled={!isEditing} style={{ ...s(isEditing), cursor: isEditing ? 'pointer' : 'default' }}>
                    <option value="urgent">🔥 Urgent</option><option value="normal">• Normal</option><option value="low">↓ Low</option>
                  </select>
                </Field>
                <Field label="Column">
                  <select value={draft.columnId} onChange={e => upd('columnId', e.target.value as ColumnId)} disabled={!isEditing} style={{ ...s(isEditing), cursor: isEditing ? 'pointer' : 'default' }}>
                    <option value="applied">📨 Applied</option><option value="interview">🎙️ Interview</option><option value="offer">🎉 Offer</option><option value="rejected">❌ Rejected</option>
                  </select>
                </Field>
              </div>
              <Field label="Interview Date"><input type="date" value={draft.interviewDate ?? ''} onChange={e => upd('interviewDate', e.target.value)} disabled={!isEditing} style={s(isEditing)} /></Field>
              <Field label="Contact"><input value={draft.contactName ?? ''} placeholder="—" onChange={e => upd('contactName', e.target.value)} disabled={!isEditing} style={s(isEditing)} /></Field>
              <Field label="Job Link">
                {isEditing
                  ? <input type="url" value={draft.jobLink ?? ''} placeholder="https://..." onChange={e => upd('jobLink', e.target.value)} style={iStyle} />
                  : job.jobLink
                    ? <a href={job.jobLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{job.jobLink}</a>
                    : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>—</p>
                }
              </Field>
              <Field label="Notes"><textarea value={draft.notes ?? ''} placeholder="No notes yet..." onChange={e => upd('notes', e.target.value)} disabled={!isEditing} rows={4} style={{ ...s(isEditing), resize: 'none' }} /></Field>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <AnimatePresence mode="wait">
                {confirmDelete ? (
                  <motion.div key="confirm" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <p style={{ flex: 1, fontSize: 13, color: 'var(--col-rejected)', margin: 0 }}>Delete permanently?</p>
                    <button onClick={() => setConfirmDelete(false)} style={{ padding: '8px 14px', fontSize: 13, borderRadius: 10, background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={del} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 10, background: 'var(--col-rejected)', border: 'none', color: '#fff', cursor: 'pointer' }}>Delete</button>
                  </motion.div>
                ) : isEditing ? (
                  <motion.div key="edit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 10 }}>
                    <button onClick={cancel} style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 500, borderRadius: 10, background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                    <motion.button onClick={save} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 600, borderRadius: 10, background: 'var(--accent)', border: 'none', color: '#fff', cursor: 'pointer' }}>Save Changes</motion.button>
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button onClick={() => setConfirmDelete(true)} style={{ padding: '8px 14px', fontSize: 13, borderRadius: 10, background: 'transparent', border: '1px solid var(--border)', color: 'var(--col-rejected)', cursor: 'pointer' }}>🗑 Delete</button>
                    <div style={{ flex: 1 }} />
                    <motion.button onClick={() => setIsEditing(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, borderRadius: 10, background: 'var(--accent)', border: 'none', color: '#fff', cursor: 'pointer' }}>✏️ Edit</motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

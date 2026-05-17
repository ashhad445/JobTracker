import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Dispatch } from 'react';
import type { BoardAction, ColumnId, Priority } from '../../types';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatch: Dispatch<BoardAction>;
}

interface FormData {
  company: string; role: string; dateApplied: string;
  salary: string; jobLink: string; priority: Priority;
  columnId: ColumnId; notes: string;
}

function today() { return new Date().toISOString().split('T')[0]; }

const EMPTY: FormData = {
  company: '', role: '', dateApplied: today(),
  salary: '', jobLink: '', priority: 'normal',
  columnId: 'applied', notes: '',
};

const iStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '10px',
  background: 'var(--bg-surface-2)', border: '1px solid var(--border-strong)',
  color: 'var(--text-primary)', outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{required && <span style={{ color: 'var(--col-rejected)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export function AddJobModal({ isOpen, onClose, dispatch }: AddJobModalProps) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) { setForm(EMPTY); setErrors({}); setTimeout(() => firstRef.current?.focus(), 80); }
  }, [isOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) { document.addEventListener('keydown', fn); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  function update(f: keyof FormData, v: string) {
    setForm(p => ({ ...p, [f]: v }));
    if (errors[f]) setErrors(p => ({ ...p, [f]: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.company.trim()) e.company = 'Required';
    if (!form.role.trim())    e.role    = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    dispatch({ type: 'ADD_JOB', payload: {
      company: form.company.trim(), role: form.role.trim(), dateApplied: form.dateApplied,
      salary: form.salary.trim() || undefined, jobLink: form.jobLink.trim() || undefined,
      notes: form.notes.trim() || undefined, priority: form.priority, columnId: form.columnId,
    }});
    onClose();
  }

  const overlayVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
  const panelVariants = {
    hidden:  { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0,  scale: 1,  transition: { type: 'spring', stiffness: 380, damping: 30 } },
    exit:    { opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.18 } },
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="modal-overlay"
        >
          <motion.div
            variants={panelVariants}
            onClick={e => e.stopPropagation()}
            className="modal-panel"
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Add New Job</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>Track a new application</p>
              </div>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Form */}
            <form onSubmit={submit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Company" required>
                  <input ref={firstRef} value={form.company} onChange={e => update('company', e.target.value)}
                    placeholder="e.g. Google" style={{ ...iStyle, borderColor: errors.company ? 'var(--col-rejected)' : undefined }} />
                  {errors.company && <span style={{ fontSize: 11, color: 'var(--col-rejected)' }}>{errors.company}</span>}
                </Field>
                <Field label="Role" required>
                  <input value={form.role} onChange={e => update('role', e.target.value)}
                    placeholder="e.g. Frontend Eng." style={{ ...iStyle, borderColor: errors.role ? 'var(--col-rejected)' : undefined }} />
                  {errors.role && <span style={{ fontSize: 11, color: 'var(--col-rejected)' }}>{errors.role}</span>}
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Date Applied" required>
                  <input type="date" value={form.dateApplied} onChange={e => update('dateApplied', e.target.value)} style={iStyle} />
                </Field>
                <Field label="Salary Range">
                  <input value={form.salary} onChange={e => update('salary', e.target.value)} placeholder="$120k–$150k" style={iStyle} />
                </Field>
              </div>
              <Field label="Job Posting URL">
                <input type="url" value={form.jobLink} onChange={e => update('jobLink', e.target.value)} placeholder="https://..." style={iStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Priority">
                  <select value={form.priority} onChange={e => update('priority', e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                    <option value="urgent">🔥 Urgent</option>
                    <option value="normal">• Normal</option>
                    <option value="low">↓ Low</option>
                  </select>
                </Field>
                <Field label="Starting Column">
                  <select value={form.columnId} onChange={e => update('columnId', e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                    <option value="applied">📨 Applied</option>
                    <option value="interview">🎙️ Interview</option>
                    <option value="offer">🎉 Offer</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </Field>
              </div>
              <Field label="Notes">
                <textarea value={form.notes} onChange={e => update('notes', e.target.value)}
                  placeholder="Any notes..." rows={3}
                  style={{ ...iStyle, resize: 'none', fontFamily: 'inherit' }} />
              </Field>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={onClose}
                  style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 500, borderRadius: 10, background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 600, borderRadius: 10, background: 'var(--accent)', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  Add Job
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, Pencil, Check } from 'lucide-react';

// ── Status pill ───────────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  'Not Started': 'bg-neutral-400',
  'In Progress':  'bg-primary',
  'In Review':    'bg-warning',
  'Completed':    'bg-success',
  'On Hold':      'bg-neutral-400',
  'Blocked':      'bg-destructive',
  'Draft':        'bg-neutral-300',
  'Approved':     'bg-success',
  'Open':         'bg-primary',
  'Done':         'bg-success',
  'At Risk':      'bg-warning',
  'On track':     'bg-success',
  'Off track':    'bg-destructive',
  'Not tracked':  'bg-neutral-400',
};

export function StatusPill({ status, size = 'sm' }: { status: string; size?: 'sm' | 'xs' }) {
  const dot = STATUS_DOT[status] ?? 'bg-neutral-400';
  const sz  = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 ${sz} rounded-full border border-border bg-card text-foreground whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {status}
    </span>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

export function SectionCard({ title, icon, children, className = '', action }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode;
  className?: string; action?: React.ReactNode;
}) {
  return (
    <div className={`border border-border rounded bg-card overflow-hidden ${className}`}>
      <div className="px-5 py-3 border-b border-border bg-muted flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>{title}</span>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Field label ───────────────────────────────────────────────────────────────

export function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-xs text-muted-foreground uppercase tracking-widest">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

// ── Text input ────────────────────────────────────────────────────────────────

export function TInput({ value, onChange, placeholder, className = '', type = 'text', readOnly }: {
  value: string; onChange?: (v: string) => void;
  placeholder?: string; className?: string; type?: string; readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-border rounded bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${readOnly ? 'bg-muted cursor-default' : ''} ${className}`}
    />
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────

export function TArea({ value, onChange, placeholder, rows = 4, className = '' }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; className?: string;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-border rounded bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none ${className}`}
    />
  );
}

// ── Select ────────────────────────────────────────────────────────────────────

export function TSelect({ value, onChange, options, className = '' }: {
  value: string; onChange: (v: string) => void; options: string[]; className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none border border-border rounded bg-input-background px-3 py-2 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// ── Editable textarea (view → edit toggle) ────────────────────────────────────

export function EditableArea({ value, onChange, placeholder, rows = 4, emptyText, label }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; emptyText?: string; label?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="group">
        {label && <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">{label}</p>}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {value.trim() ? (
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{value}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">{emptyText || 'Click the pencil to add content.'}</p>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-all shrink-0 opacity-0 group-hover:opacity-100 mt-0.5"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">{label}</p>}
      <TArea value={value} onChange={onChange} placeholder={placeholder} rows={rows} />
      <button
        onClick={() => setEditing(false)}
        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded transition-opacity hover:opacity-90"
      >
        <Check size={12} /> Done editing
      </button>
    </div>
  );
}

// ── Editable single-line text (view → edit toggle) ────────────────────────────

export function EditableText({ value, onChange, placeholder, emptyText, label, className = '' }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; emptyText?: string; label?: string; className?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className={`group ${className}`}>
        {label && <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{label}</p>}
        <div className="flex items-center gap-2">
          <span className="flex-1 text-sm text-foreground">
            {value || <span className="text-muted-foreground italic">{emptyText || '—'}</span>}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100"
            title="Edit"
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{label}</p>}
      <div className="flex items-center gap-2">
        <TInput value={value} onChange={onChange} placeholder={placeholder} className="flex-1" />
        <button
          onClick={() => setEditing(false)}
          className="p-2 rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
          title="Done"
        >
          <Check size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Editable card section (toggle all fields inside at once) ──────────────────

export function EditableCard({ title, icon, children, editContent, className = '' }: {
  title: string; icon?: React.ReactNode;
  children: React.ReactNode; // view content
  editContent: React.ReactNode; // edit content
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <div className={`border border-border rounded bg-card overflow-hidden ${className}`}>
      <div className="px-5 py-3 border-b border-border bg-muted flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>{title}</span>
        </div>
        <button
          onClick={() => setEditing(e => !e)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${editing ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}
        >
          {editing ? <><Check size={11} /> Done</> : <><Pencil size={11} /> Edit</>}
        </button>
      </div>
      <div className="p-5">
        {editing ? editContent : children}
      </div>
    </div>
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────────

export function BtnPrimary({ onClick, children, disabled, className = '', type = 'button' }: {
  onClick?: () => void; children: React.ReactNode;
  disabled?: boolean; className?: string; type?: 'button' | 'submit';
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl transition-all
        bg-primary text-primary-foreground shadow-sm
        hover:bg-ocean-600 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{ fontWeight: 600 }}>
      {children}
    </button>
  );
}

export function BtnSecondary({ onClick, children, disabled, className = '' }: {
  onClick?: () => void; children: React.ReactNode; disabled?: boolean; className?: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl transition-colors
        bg-card text-primary border border-primary
        hover:bg-ocean-50 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{ fontWeight: 600 }}>
      {children}
    </button>
  );
}

export function BtnGhost({ onClick, children, className = '' }: {
  onClick?: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors ${className}`}>
      {children}
    </button>
  );
}

// ── Page header ───────────────────────────────────────────────────────────────

export function PageHeader({ number, title, description }: {
  number: string; title: string; description?: string;
}) {
  return (
    <div className="mb-7 pb-5 border-b border-border">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{number}</p>
      <h2 className="text-foreground mb-1">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

// ── Editable bullet list ──────────────────────────────────────────────────────

export function BulletList({ items, onChange, placeholder = 'Add item…', readOnly }: {
  items: { id: string; text: string }[];
  onChange: (items: { id: string; text: string }[]) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  const uid  = () => Math.random().toString(36).slice(2, 8);
  const upd  = (id: string, v: string) => onChange(items.map(i => i.id === id ? { ...i, text: v } : i));
  const rem  = (id: string) => onChange(items.filter(i => i.id !== id));
  const add  = () => onChange([...items, { id: uid(), text: '' }]);

  if (readOnly) {
    return (
      <ul className="space-y-1">
        {items.filter(i => i.text.trim()).map(item => (
          <li key={item.id} className="flex items-start gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
            {item.text}
          </li>
        ))}
        {items.filter(i => i.text.trim()).length === 0 && (
          <li className="text-sm text-muted-foreground italic">None listed.</li>
        )}
      </ul>
    );
  }

  return (
    <div className="space-y-1.5">
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-2 group">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
          <input type="text" value={item.text} onChange={e => upd(item.id, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-input-background" />
          <button onClick={() => rem(item.id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button onClick={add}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted">
        <Plus size={12} /> Add item
      </button>
    </div>
  );
}

// ── Editable data table ───────────────────────────────────────────────────────

export type ColDef = {
  key: string; label: string; width?: string;
  type?: 'text' | 'select'; options?: string[];
};

export function EditTable<R extends Record<string, string>>({
  columns, rows, onChange,
}: { columns: ColDef[]; rows: R[]; onChange: (rows: R[]) => void }) {
  const add  = () => { const e: Record<string, string> = {}; columns.forEach(c => (e[c.key] = c.options?.[0] ?? '')); onChange([...rows, e as R]); };
  const rem  = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const upd  = (i: number, k: string, v: string) => onChange(rows.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map(c => <th key={c.key} className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide" style={{ width: c.width }}>{c.label}</th>)}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border last:border-0 group hover:bg-muted/40">
              {columns.map(c => (
                <td key={c.key} className="px-2 py-1.5">
                  {c.type === 'select'
                    ? <select value={row[c.key]} onChange={e => upd(ri, c.key, e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-border focus:bg-input-background">
                        {(c.options ?? []).map(o => <option key={o}>{o}</option>)}
                      </select>
                    : <input type="text" value={row[c.key]} onChange={e => upd(ri, c.key, e.target.value)} placeholder="—"
                        className="w-full bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-input-background" />
                  }
                </td>
              ))}
              <td className="px-1 py-1.5">
                <button onClick={() => rem(ri)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"><Trash2 size={12} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={add} className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded hover:bg-muted">
        <Plus size={13} /> Add row
      </button>
    </div>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────

export function Modal({ title, onClose, children, width = 'max-w-lg' }: {
  title: string; onClose: () => void; children: React.ReactNode; width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-card border border-border rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h3>{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none transition-colors">×</button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ── Avatar initials ───────────────────────────────────────────────────────────

export function Avatar({ name, size = 7 }: { name: string; size?: number }) {
  const initials = name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('') || '?';
  return (
    <span style={{ width: `${size * 4}px`, height: `${size * 4}px`, fontWeight: 600 }}
      className="rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 ring-2 ring-ocean-100">
      {initials}
    </span>
  );
}

// ── SWT Logo ──────────────────────────────────────────────────────────────────

export function InfineonLogo({ collapsed = false, inverted = false }: { collapsed?: boolean; inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill={inverted ? 'white' : 'var(--primary)'} />
        <path d="M14 4L24 14L14 24L4 14L14 4Z" fill={inverted ? 'var(--primary)' : 'white'} fillOpacity="0.9" />
        <path d="M14 9L19 14L14 19L9 14L14 9Z" fill={inverted ? 'white' : 'var(--primary)'} />
        <circle cx="14" cy="14" r="2.5" fill={inverted ? 'var(--primary)' : 'white'} />
      </svg>
      {!collapsed && (
        <div>
          <p className={`text-[10px] uppercase tracking-[0.18em] leading-none mb-1 ${inverted ? 'text-white/70' : 'text-muted-foreground'}`}>BELEG</p>
          <p className={`text-sm leading-none ${inverted ? 'text-white' : 'text-foreground'}`} style={{ fontWeight: 650 }}>UX Project Hub</p>
        </div>
      )}
    </div>
  );
}

// ── Sub-tabs ──────────────────────────────────────────────────────────────────

export function SubTabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex border-b border-border mb-6">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
            active === t.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          style={{ fontWeight: active === t.id ? 600 : undefined }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

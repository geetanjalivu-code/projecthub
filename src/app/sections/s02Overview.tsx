import { useState } from 'react';
import { useStore } from '../store';
import { SectionCard, PageHeader, Avatar } from '../components/ui';
import { Plus, Trash2, ExternalLink, Pencil, Check } from 'lucide-react';
import { uid } from '../utils';
import { TeamMember, DocumentLink } from '../types';

const DOC_TYPES = ['Figma file','Confluence','Jira Epic','Miro board','Google Doc','Presentation','Research report','Other'];

export function S02Overview() {
  const { currentProject, updateSection } = useStore();
  if (!currentProject) return null;
  const s   = currentProject.sections.overview;
  const upd = (patch: Partial<typeof s>) => updateSection('overview', { ...s, ...patch });

  const [editingObjective, setEditingObjective] = useState(false);

  const addMember = () => upd({ teamMembers: [...s.teamMembers, { id: uid(), name: '', role: '', email: '' }] });
  const updMember = (i: number, k: keyof TeamMember, v: string) =>
    upd({ teamMembers: s.teamMembers.map((m, idx) => idx === i ? { ...m, [k]: v } : m) });
  const remMember = (i: number) => upd({ teamMembers: s.teamMembers.filter((_, idx) => idx !== i) });

  const addDoc = () => upd({ documents: [...s.documents, { id: uid(), type: DOC_TYPES[0], title: '', url: '' }] });
  const updDoc = (i: number, k: keyof DocumentLink, v: string) =>
    upd({ documents: s.documents.map((d, idx) => idx === i ? { ...d, [k]: v } : d) });
  const remDoc = (i: number) => upd({ documents: s.documents.filter((_, idx) => idx !== i) });

  return (
    <div>
      <PageHeader number="02" title="Project Overview"
        description="Define the project objective, team structure, and key reference documents." />

      {/* Objective — explicit Edit/Done toggle */}
      <SectionCard title="Project objective" className="mb-5"
        action={
          <button onClick={() => setEditingObjective(e => !e)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${editingObjective ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
            {editingObjective ? <><Check size={11} /> Done</> : <><Pencil size={11} /> Edit</>}
          </button>
        }>
        {editingObjective ? (
          <textarea
            rows={5}
            value={s.objective}
            onChange={e => upd({ objective: e.target.value })}
            autoFocus
            placeholder="Describe the core problem, the opportunity, and the expected outcome."
            className="w-full border border-border rounded bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        ) : (
          s.objective.trim()
            ? <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{s.objective}</p>
            : <p className="text-sm text-muted-foreground italic">No objective written yet. Click Edit to add one.</p>
        )}
      </SectionCard>

      {/* Team members — inline table, always editable */}
      <SectionCard title={`Team members (${s.teamMembers.length})`} className="mb-5">
        <table className="w-full text-sm mb-3">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide w-8"></th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide">Name</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide">Role</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide hidden md:table-cell">Email</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {s.teamMembers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">No team members added yet.</td>
              </tr>
            )}
            {s.teamMembers.map((m, i) => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 group">
                <td className="px-2 py-1.5">
                  <Avatar name={m.name || '?'} size={7} />
                </td>
                <td className="px-2 py-1.5">
                  <input type="text" value={m.name} onChange={e => updMember(i, 'name', e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                </td>
                <td className="px-2 py-1.5">
                  <input type="text" value={m.role} onChange={e => updMember(i, 'role', e.target.value)}
                    placeholder="Role / title"
                    className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                </td>
                <td className="px-2 py-1.5 hidden md:table-cell">
                  <input type="email" value={m.email} onChange={e => updMember(i, 'email', e.target.value)}
                    placeholder="email@company.com"
                    className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none" />
                </td>
                <td className="px-1 py-1.5">
                  <button onClick={() => remMember(i)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addMember}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded hover:bg-muted">
          <Plus size={13} /> Add team member
        </button>
      </SectionCard>

      {/* Documents — inline table, always editable */}
      <SectionCard title={`Related documents (${s.documents.length})`} className="mb-5">
        <table className="w-full text-sm mb-3">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide w-36">Type</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide">Title</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide hidden lg:table-cell">URL</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {s.documents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-sm text-muted-foreground">No documents linked yet.</td>
              </tr>
            )}
            {s.documents.map((d, i) => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/20 group">
                <td className="px-2 py-1.5">
                  <select value={d.type} onChange={e => updDoc(i, 'type', e.target.value)}
                    className="w-full border border-border rounded px-2 py-1.5 text-xs bg-input-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1.5">
                  <input type="text" value={d.title} onChange={e => updDoc(i, 'title', e.target.value)}
                    placeholder="Document title"
                    className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                </td>
                <td className="px-2 py-1.5 hidden lg:table-cell">
                  <input type="url" value={d.url} onChange={e => updDoc(i, 'url', e.target.value)}
                    placeholder="https://…"
                    className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1.5 text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none" />
                </td>
                <td className="px-1 py-1.5">
                  <div className="flex items-center gap-1">
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noreferrer"
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button onClick={() => remDoc(i)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addDoc}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded hover:bg-muted">
          <Plus size={13} /> Add document
        </button>
      </SectionCard>

      {/* Read-only project meta */}
      <SectionCard title="Project meta">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Start date', value: currentProject.startDate ? new Date(currentProject.startDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—' },
            { label: 'Deadline',   value: currentProject.deadline  ? new Date(currentProject.deadline).toLocaleDateString('en-GB',  { day:'2-digit', month:'short', year:'numeric' }) : '—' },
            { label: 'Version',    value: `v${currentProject.version.major}.${currentProject.version.minor}.${currentProject.version.patch}` },
            { label: 'Created',    value: new Date(currentProject.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
              <p className="text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

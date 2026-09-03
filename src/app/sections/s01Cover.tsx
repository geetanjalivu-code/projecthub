import { useState } from 'react';
import { useStore } from '../store';
import { TInput, TSelect, FieldLabel, SectionCard, StatusPill, PageHeader } from '../components/ui';
import { Pencil, Check } from 'lucide-react';

const STATUS_OPTIONS   = ['Not Started','In Progress','In Review','Completed','On Hold'];
const PHASE_OPTIONS    = ['Planning','Discovery','Research','IA & Flows','Wireframing','UI Design','Prototyping','Testing','Handoff'];
const TYPE_OPTIONS     = ['Product Redesign','New Feature','Mobile App','Web App','Design System','Research Study','UX Audit','Concept Exploration'];
const PLATFORM_OPTIONS = ['Web','Mobile iOS','Mobile Android','Desktop','Tablet','Cross-platform','Other'];

export function S01Cover() {
  const { currentProject, updateSection, updateMeta } = useStore();
  if (!currentProject) return null;

  const s   = currentProject.sections.cover;
  const upd = (key: string, val: string) => updateSection('cover', { ...s, [key]: val });

  const [editing, setEditing] = useState(false);

  const phaseIndex = PHASE_OPTIONS.indexOf(currentProject.phase);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="bg-primary text-primary-foreground px-8 md:px-16 py-14 relative overflow-hidden">
        <div className="hub-mesh absolute inset-0 opacity-30 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ opacity: 0.65 }}>
            Project
          </p>
          <h1 className="text-primary-foreground mb-3">{currentProject.name}</h1>
          {editing ? (
            <input
              value={s.tagline}
              onChange={e => upd('tagline', e.target.value)}
              placeholder="Add a project tagline…"
              className="bg-transparent border-b border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/40 w-full max-w-2xl focus:outline-none focus:border-primary-foreground pb-1"
              style={{ fontSize: '1.1rem' }}
            />
          ) : (
            <p
              className="border-b border-transparent w-full max-w-2xl pb-1"
              style={{ fontSize: '1.1rem', opacity: s.tagline ? 1 : 0.4, color: 'inherit' }}
            >
              {s.tagline || 'No tagline added.'}
            </p>
          )}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <StatusPill status={currentProject.status} />
            <span className="text-xs" style={{ opacity: 0.7 }}>{currentProject.phase}</span>
            <span className="text-xs" style={{ opacity: 0.7 }}>{currentProject.progress}% complete</span>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-80 h-80 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-52 h-52 bg-primary-foreground/5 rounded-full translate-y-1/3 pointer-events-none" />
      </div>

      {/* ── Phase progress ───────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card px-8 md:px-16 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {PHASE_OPTIONS.map((p, i) => (
              <div key={p} className="flex flex-col items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                  i < phaseIndex   ? 'bg-primary border-primary' :
                  i === phaseIndex ? 'bg-primary border-primary ring-2 ring-primary/30' :
                                     'bg-muted border-border'
                }`} />
                <span className="text-muted-foreground hidden md:block"
                  style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {p}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-1 bg-primary rounded-full transition-all"
              style={{ width: `${phaseIndex === 0 ? 0 : (phaseIndex / (PHASE_OPTIONS.length - 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="px-8 md:px-16 py-8 max-w-4xl mx-auto space-y-6">

        {/* Edit / Done button */}
        <div className="flex justify-end">
          <button
            onClick={() => setEditing(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
              editing
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-primary hover:bg-muted border border-border'
            }`}
          >
            {editing ? <><Check size={11} /> Done</> : <><Pencil size={11} /> Edit</>}
          </button>
        </div>

        {/* Status & Phase */}
        <SectionCard title="Project status">
          {editing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <FieldLabel label="Status" />
                <TSelect value={currentProject.status} onChange={v => updateMeta({ status: v as any })} options={STATUS_OPTIONS} />
              </div>
              <div>
                <FieldLabel label="Phase" />
                <TSelect value={currentProject.phase} onChange={v => updateMeta({ phase: v as any })} options={PHASE_OPTIONS} />
              </div>
              <div>
                <FieldLabel label="Project type" />
                <TSelect value={s.projectType || TYPE_OPTIONS[0]} onChange={v => upd('projectType', v)} options={TYPE_OPTIONS} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Status</p>
                <StatusPill status={currentProject.status} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Phase</p>
                <p className="text-sm text-foreground">{currentProject.phase || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Project type</p>
                <p className="text-sm text-foreground">{s.projectType || '—'}</p>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Project details */}
        <SectionCard title="Project details">
          {editing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <FieldLabel label="Owner" />
                <TInput value={s.owner} onChange={v => upd('owner', v)} placeholder="Designer name" />
              </div>
              <div>
                <FieldLabel label="Client / Stakeholder" />
                <TInput value={s.client} onChange={v => upd('client', v)} placeholder="Client or BU" />
              </div>
              <div>
                <FieldLabel label="Team" />
                <TInput value={s.team} onChange={v => upd('team', v)} placeholder="Team name" />
              </div>
              <div>
                <FieldLabel label="Platform" />
                <TSelect value={s.platform || PLATFORM_OPTIONS[0]} onChange={v => upd('platform', v)} options={PLATFORM_OPTIONS} />
              </div>
              <div>
                <FieldLabel label="Start date" />
                <TInput type="date" value={s.startDate} onChange={v => upd('startDate', v)} />
              </div>
              <div>
                <FieldLabel label="Target date" />
                <TInput type="date" value={s.targetDate} onChange={v => upd('targetDate', v)} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Owner</p>
                <p className="text-sm text-foreground">{s.owner || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Client / Stakeholder</p>
                <p className="text-sm text-foreground">{s.client || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Team</p>
                <p className="text-sm text-foreground">{s.team || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Platform</p>
                <p className="text-sm text-foreground">{s.platform || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Start date</p>
                <p className="text-sm text-foreground">{s.startDate || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Target date</p>
                <p className="text-sm text-foreground">{s.targetDate || '—'}</p>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Project links */}
        <SectionCard title="Project links">
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FieldLabel label="Figma file URL" />
                <TInput value={s.figmaLink} onChange={v => upd('figmaLink', v)} placeholder="https://figma.com/file/…" />
              </div>
              <div>
                <FieldLabel label="Jira / Ticket URL" />
                <TInput value={s.jiraLink} onChange={v => upd('jiraLink', v)} placeholder="https://jira.infineon.com/…" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Figma file</p>
                {s.figmaLink ? (
                  <a
                    href={s.figmaLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    Open in Figma →
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No link added. Click Edit to add.</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Jira / Ticket</p>
                {s.jiraLink ? (
                  <a
                    href={s.jiraLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    Open ticket →
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No link added. Click Edit to add.</p>
                )}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Project brief — always read-only */}
        {currentProject.description && (
          <SectionCard title="Project brief">
            <p className="text-sm text-foreground">{currentProject.description}</p>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useStore } from '../store';
import { PageHeader, SubTabs, SectionCard, TInput, EditableArea, FieldLabel, BulletList, BtnSecondary } from '../components/ui';
import { Plus, Trash2, Quote, Pencil, Check } from 'lucide-react';
import { uid } from '../utils';
import { Persona, ResearchFinding, PainPoint, JourneyMap } from '../types';

const TABS = [
  { id: 'personas',      label: 'Personas' },
  { id: 'findings',      label: 'Findings' },
  { id: 'journeymap',   label: 'Journey Maps' },
  { id: 'painpoints',   label: 'Pain Points' },
  { id: 'opportunities', label: 'Opportunities' },
];

const SEVERITY_COLORS: Record<string, string> = {
  High:   'bg-destructive/10 text-destructive border-destructive/30',
  Medium: 'bg-warning/10 text-warning border-warning/30',
  Low:    'bg-success/10 text-success border-success/30',
};

export function S05Research() {
  const { currentProject, updateSection } = useStore();
  if (!currentProject) return null;

  const s   = currentProject.sections.research;
  // Fallback for legacy data that might have old format
  const journeyMaps: JourneyMap[] = s.journeyMaps ?? [];
  const upd = (patch: Partial<typeof s>) => updateSection('research', { ...s, ...patch });
  const tab = s.activeTab || 'personas';

  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const [editingJourneyId, setEditingJourneyId] = useState<string | null>(null);

  // ── Personas ──────────────────────────────────────────────────────────
  const addPersona = () => {
    const p: Persona = { id: uid(), name: '', age: '', role: '', quote: '', goals: [{ id: uid(), text: '' }], painPoints: [{ id: uid(), text: '' }] };
    upd({ personas: [...s.personas, p] });
    setEditingPersonaId(p.id);
  };
  const updPersona = (i: number, patch: Partial<Persona>) =>
    upd({ personas: s.personas.map((p, idx) => idx === i ? { ...p, ...patch } : p) });
  const remPersona = (i: number) => upd({ personas: s.personas.filter((_, idx) => idx !== i) });

  // ── Findings ──────────────────────────────────────────────────────────
  const addFinding = () => upd({ findings: [...s.findings, { id: uid(), description: '', task: '', type: 'Usability', severity: 'Medium' }] });
  const updFinding = (i: number, k: keyof ResearchFinding, v: string) =>
    upd({ findings: s.findings.map((f, idx) => idx === i ? { ...f, [k]: v } : f) });
  const remFinding = (i: number) => upd({ findings: s.findings.filter((_, idx) => idx !== i) });

  // ── Journey maps ──────────────────────────────────────────────────────
  const addJourneyMap = () => {
    const jm: JourneyMap = { id: uid(), title: 'Journey Map', url: '', description: '' };
    upd({ journeyMaps: [...journeyMaps, jm] });
    setEditingJourneyId(jm.id);
  };
  const updJourneyMap = (id: string, patch: Partial<JourneyMap>) =>
    upd({ journeyMaps: journeyMaps.map(jm => jm.id === id ? { ...jm, ...patch } : jm) });
  const remJourneyMap = (id: string) => upd({ journeyMaps: journeyMaps.filter(jm => jm.id !== id) });

  // ── Pain points ───────────────────────────────────────────────────────
  const addPP = () => upd({ painPoints: [...s.painPoints, { id: uid(), text: '', severity: 'Medium' }] });
  const updPP = (i: number, k: keyof PainPoint, v: string) =>
    upd({ painPoints: s.painPoints.map((p, idx) => idx === i ? { ...p, [k]: v } : p) });
  const remPP = (i: number) => upd({ painPoints: s.painPoints.filter((_, idx) => idx !== i) });

  return (
    <div>
      <PageHeader number="05" title="Research & Insights"
        description="Document personas, findings, journey maps, pain points, and design opportunities." />

      <SubTabs tabs={TABS} active={tab} onChange={id => upd({ activeTab: id })} />

      {/* ── Personas ──────────────────────────────────────────────────── */}
      {tab === 'personas' && (
        <div className="space-y-5">
          {s.personas.length === 0 && (
            <div className="text-center py-12 bg-card border border-border rounded">
              <p className="text-muted-foreground mb-4">No personas created yet.</p>
              <BtnSecondary onClick={addPersona}><Plus size={14} /> Create persona</BtnSecondary>
            </div>
          )}
          {s.personas.map((p, i) => {
            const editing = editingPersonaId === p.id;
            return (
              <div key={p.id} className="bg-card border border-border rounded overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-muted flex items-center justify-between">
                  <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>{p.name || 'Unnamed persona'}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingPersonaId(editing ? null : p.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${editing ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
                      {editing ? <><Check size={11} /> Done</> : <><Pencil size={11} /> Edit</>}
                    </button>
                    <button onClick={() => remPersona(i)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  {editing ? (
                    // Edit mode
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div><FieldLabel label="Name" /><TInput value={p.name} onChange={v => updPersona(i, { name: v })} placeholder="Alex M." /></div>
                          <div><FieldLabel label="Age" /><TInput value={p.age} onChange={v => updPersona(i, { age: v })} placeholder="34" /></div>
                          <div><FieldLabel label="Role" /><TInput value={p.role} onChange={v => updPersona(i, { role: v })} placeholder="Engineer" /></div>
                        </div>
                        <div>
                          <FieldLabel label="Quote" />
                          <textarea rows={2} value={p.quote} onChange={e => updPersona(i, { quote: e.target.value })}
                            placeholder="A memorable quote…"
                            className="w-full border border-border rounded bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div><FieldLabel label="Goals" /><BulletList items={p.goals} onChange={items => updPersona(i, { goals: items })} placeholder="A goal…" /></div>
                        <div><FieldLabel label="Pain points" /><BulletList items={p.painPoints} onChange={items => updPersona(i, { painPoints: items })} placeholder="A frustration…" /></div>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary" style={{ fontWeight: 600 }}>
                            {p.name.split(' ').map(w => w[0]).slice(0, 2).join('') || '?'}
                          </div>
                          <div>
                            <p className="text-foreground" style={{ fontWeight: 600 }}>{p.name || '—'}</p>
                            <p className="text-sm text-muted-foreground">{[p.role, p.age ? `Age ${p.age}` : ''].filter(Boolean).join(' · ')}</p>
                          </div>
                        </div>
                        {p.quote && (
                          <div className="bg-muted/50 rounded p-3 border border-border flex items-start gap-2">
                            <Quote size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-sm text-foreground italic">"{p.quote}"</p>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Goals</p>
                          <BulletList items={p.goals} onChange={() => {}} readOnly />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Pain points</p>
                          <BulletList items={p.painPoints} onChange={() => {}} readOnly />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {s.personas.length > 0 && (
            <button onClick={addPersona}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors w-full justify-center">
              <Plus size={14} /> Add persona
            </button>
          )}
        </div>
      )}

      {/* ── Findings ──────────────────────────────────────────────────── */}
      {tab === 'findings' && (
        <div>
          {(['High','Medium','Low'] as const).map(sev => {
            const group = s.findings.filter(f => f.severity === sev);
            if (group.length === 0) return null;
            return (
              <div key={sev} className="mb-5">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs mb-3 ${SEVERITY_COLORS[sev]}`}>
                  {sev} severity — {group.length}
                </div>
                <div className="space-y-2">
                  {group.map((f) => {
                    const gi = s.findings.indexOf(f);
                    return (
                      <div key={f.id} className="bg-card border border-border rounded p-4 flex gap-3 group">
                        <div className={`w-1 rounded-full shrink-0 ${sev === 'High' ? 'bg-destructive' : sev === 'Medium' ? 'bg-warning' : 'bg-success'}`} />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-2"><TInput value={f.description} onChange={v => updFinding(gi, 'description', v)} placeholder="Describe the finding…" /></div>
                          <TInput value={f.task} onChange={v => updFinding(gi, 'task', v)} placeholder="Related task" />
                          <select value={f.severity} onChange={e => updFinding(gi, 'severity', e.target.value)}
                            className="border border-border rounded px-2 py-2 text-sm bg-input-background text-foreground focus:outline-none">
                            <option>High</option><option>Medium</option><option>Low</option>
                          </select>
                        </div>
                        <button onClick={() => remFinding(gi)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <button onClick={addFinding}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors w-full justify-center">
            <Plus size={14} /> Add finding
          </button>
        </div>
      )}

      {/* ── Journey Maps ──────────────────────────────────────────────── */}
      {tab === 'journeymap' && (
        <div className="space-y-5">
          {journeyMaps.length === 0 && (
            <div className="text-center py-12 bg-card border border-border rounded">
              <p className="text-muted-foreground mb-4">No journey maps added yet.</p>
              <BtnSecondary onClick={addJourneyMap}><Plus size={14} /> Add journey map</BtnSecondary>
            </div>
          )}

          {journeyMaps.map(jm => {
            const editing = editingJourneyId === jm.id;
            return (
              <div key={jm.id} className="bg-card border border-border rounded overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-muted flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>{jm.title || 'Untitled journey map'}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingJourneyId(editing ? null : jm.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${editing ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
                      {editing ? <><Check size={11} /> Done</> : <><Pencil size={11} /> Edit</>}
                    </button>
                    <button onClick={() => remJourneyMap(jm.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  {editing ? (
                    <div className="space-y-4">
                      <div><FieldLabel label="Title" /><TInput value={jm.title} onChange={v => updJourneyMap(jm.id, { title: v })} placeholder="e.g. Happy path — new user onboarding" /></div>
                      <div><FieldLabel label="Embed URL (Miro, FigJam, etc.)" /><TInput value={jm.url} onChange={v => updJourneyMap(jm.id, { url: v })} placeholder="https://miro.com/app/board/…" /></div>
                      <div>
                        <FieldLabel label="Description / notes" />
                        <textarea rows={3} value={jm.description} onChange={e => updJourneyMap(jm.id, { description: e.target.value })}
                          placeholder="Describe the journey stages, emotional arcs, and key moments…"
                          className="w-full border border-border rounded bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      {jm.description && <p className="text-sm text-foreground mb-4 leading-relaxed">{jm.description}</p>}
                      {!jm.description && <p className="text-sm text-muted-foreground italic mb-4">No description. Click Edit to add context.</p>}
                      {jm.url ? (
                        <div className="border border-border rounded overflow-hidden">
                          <iframe src={jm.url} className="w-full h-80 border-0" title={jm.title} />
                        </div>
                      ) : (
                        <div className="border border-dashed border-border rounded h-32 flex items-center justify-center text-muted-foreground text-sm bg-muted/30">
                          Click Edit to add an embed URL
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {journeyMaps.length > 0 && (
            <button onClick={addJourneyMap}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors w-full justify-center">
              <Plus size={14} /> Add journey map
            </button>
          )}
        </div>
      )}

      {/* ── Pain Points ───────────────────────────────────────────────── */}
      {tab === 'painpoints' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {s.painPoints.map((pp, i) => (
              <div key={pp.id} className={`flex items-center gap-2 px-3 py-2 rounded-full border group ${SEVERITY_COLORS[pp.severity]}`}>
                <input type="text" value={pp.text} onChange={e => updPP(i, 'text', e.target.value)}
                  placeholder="Pain point…"
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0 w-32" />
                <select value={pp.severity} onChange={e => updPP(i, 'severity', e.target.value)}
                  className="bg-transparent text-xs focus:outline-none cursor-pointer border-0">
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
                <button onClick={() => remPP(i)} className="text-current opacity-50 hover:opacity-100 transition-opacity">
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
          {s.painPoints.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-4">No pain points catalogued yet.</p>
          )}
          <button onClick={addPP}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors">
            <Plus size={14} /> Add pain point
          </button>
        </div>
      )}

      {/* ── Opportunities ─────────────────────────────────────────────── */}
      {tab === 'opportunities' && (
        <SectionCard title="Design opportunities">
          <p className="text-sm text-muted-foreground mb-4">List key opportunities surfaced from research — what should we design for?</p>
          <BulletList items={s.opportunities} onChange={items => upd({ opportunities: items })} placeholder="How might we…" />
        </SectionCard>
      )}
    </div>
  );
}

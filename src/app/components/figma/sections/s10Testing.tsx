import { useEffect } from 'react';
import { useStore } from '../store';
import { PageHeader, SubTabs, SectionCard, TInput, TArea, FieldLabel, TSelect, BtnSecondary } from '../components/ui';
import { Plus, Trash2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { uid, todayKey, todayLabel } from '../utils';
import { Participant, UTFinding, Recommendation, TestPlan } from '../types';

const TABS = [
  { id: 'plan',            label: 'Test Plan' },
  { id: 'participants',    label: 'Participants' },
  { id: 'findings',        label: 'Findings' },
  { id: 'recommendations', label: 'Recommendations' },
];

const QA_PLAN: { key: keyof TestPlan; q: string; hint: string; type?: string; options?: string[] }[] = [
  { key: 'whatTesting',        q: 'What are you testing?',             hint: 'Describe the specific product, feature, or flow under test.' },
  { key: 'researchQuestions',  q: 'What research questions guide this?',hint: 'e.g. Can users complete checkout in under 3 minutes?' },
  { key: 'participants',       q: 'Who are the participants?',          hint: 'Number, demographics, recruiting criteria.' },
  { key: 'tasks',              q: 'What tasks will participants complete?', hint: 'List scenario-based tasks in natural language.' },
  { key: 'measuring',          q: 'What will you measure?',             hint: 'Task completion rate, error rate, SUS score, time on task, etc.' },
  { key: 'format',             q: 'What is the session format?',        hint: 'Moderated / unmoderated.', type: 'select', options: ['Moderated','Unmoderated'] },
  { key: 'location',           q: 'Where will sessions take place?',    hint: 'Remote / lab / contextual.', type: 'select', options: ['Remote','Lab','Contextual','Hybrid'] },
  { key: 'duration',           q: 'How long is each session?',          hint: 'e.g. 60 minutes including debrief.' },
];

const SEV_COLORS: Record<string, string> = {
  Critical: 'bg-destructive/10 text-destructive border-destructive/30',
  High:     'bg-warning/10 text-warning border-warning/30',
  Medium:   'bg-primary/10 text-primary border-primary/30',
  Low:      'bg-success/10 text-success border-success/30',
};

export function S10Testing() {
  const { currentProject, updateSection } = useStore();
  if (!currentProject) return null;

  const s   = currentProject.sections.testing;
  const upd = (patch: Partial<typeof s>) => updateSection('testing', { ...s, ...patch });
  const tab = s.activeTab || 'plan';

  // Auto-add today's participant row once
  useEffect(() => {
    const today = todayKey();
    if (s.todayParticipantAdded !== today && s.testPlan.submitted) {
      const row: Participant = { id: uid(), name: '', date: today, format: 'Remote', profile: '', completed: 'Pending', notes: '' };
      upd({ participants: [...s.participants, row], todayParticipantAdded: today });
    }
  }, [tab]);

  // Test plan
  const updPlan = (k: keyof TestPlan, v: string | boolean | number) =>
    upd({ testPlan: { ...s.testPlan, [k]: v } });

  const qaStep = s.testPlan.qaStep ?? 0;
  const q = QA_PLAN[qaStep];
  const answeredCount = QA_PLAN.filter(x => String((s.testPlan as Record<string, unknown>)[x.key]).trim()).length;

  // Participants
  const addParticipant = () => upd({ participants: [...s.participants, {
    id: uid(), name: '', date: todayKey(), format: 'Remote', profile: '', completed: 'Pending', notes: '',
  }]});
  const updP = (i: number, k: keyof Participant, v: string) =>
    upd({ participants: s.participants.map((p, idx) => idx === i ? { ...p, [k]: v } : p) });
  const remP = (i: number) => upd({ participants: s.participants.filter((_, idx) => idx !== i) });

  // Findings
  const addFinding = () => upd({ findings: [...s.findings, {
    id: uid(), ref: `F${s.findings.length + 1}`, description: '', task: '', type: 'Usability', severity: 'Medium', screen: '',
  }]});
  const updF = (i: number, k: keyof UTFinding, v: string) =>
    upd({ findings: s.findings.map((f, idx) => idx === i ? { ...f, [k]: v } : f) });
  const remF = (i: number) => upd({ findings: s.findings.filter((_, idx) => idx !== i) });

  // Recommendations
  const addRec = () => upd({ recommendations: [...s.recommendations, {
    id: uid(), findingRef: '', recommendation: '', effort: 'Medium', impact: 'Medium', owner: '', status: 'Open',
  }]});
  const updR = (i: number, k: keyof Recommendation, v: string) =>
    upd({ recommendations: s.recommendations.map((r, idx) => idx === i ? { ...r, [k]: v } : r) });
  const remR = (i: number) => upd({ recommendations: s.recommendations.filter((_, idx) => idx !== i) });

  return (
    <div>
      <PageHeader number="10" title="Usability Testing"
        description="Plan sessions, log participants, document findings, and generate recommendations." />

      <SubTabs tabs={TABS} active={tab} onChange={id => upd({ activeTab: id })} />

      {/* ── Test Plan ─────────────────────────────────────────────────── */}
      {tab === 'plan' && (
        <div>
          {!s.testPlan.submitted ? (
            <div className="max-w-2xl">
              {/* Progress dots */}
              <div className="flex gap-1 mb-8">
                {QA_PLAN.map((x, i) => (
                  <button key={x.key} onClick={() => updPlan('qaStep', i as any)}
                    className={`h-1.5 rounded-full transition-all ${i === qaStep ? 'w-6 bg-primary' : String((s.testPlan as unknown as Record<string, unknown>)[x.key] ?? '').trim() ? 'w-2.5 bg-success' : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground'}`} />
                ))}
              </div>

              <div className="bg-card border border-border rounded p-7">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Question {qaStep + 1} of {QA_PLAN.length}</p>
                <h3 className="text-foreground mb-1">{q.q}</h3>
                <p className="text-sm text-muted-foreground mb-5">{q.hint}</p>
                {q.type === 'select' && q.options ? (
                  <TSelect value={String((s.testPlan as unknown as Record<string, unknown>)[q.key] ?? q.options[0])}
                    onChange={v => updPlan(q.key, v)} options={q.options} />
                ) : (
                  <TArea rows={5} value={String((s.testPlan as unknown as Record<string, unknown>)[q.key] ?? '')}
                    onChange={v => updPlan(q.key, v)} placeholder="Type your answer…" />
                )}
                {String((s.testPlan as unknown as Record<string, unknown>)[q.key] ?? '').trim() && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-success"><CheckCircle size={12} /> Answered</div>
                )}
              </div>

              <div className="flex items-center justify-between mt-5">
                <button onClick={() => updPlan('qaStep', Math.max(0, qaStep - 1))} disabled={qaStep === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors">
                  <ChevronLeft size={14} /> Previous
                </button>
                {qaStep < QA_PLAN.length - 1 ? (
                  <button onClick={() => updPlan('qaStep', qaStep + 1)}
                    className="flex items-center gap-2 px-4 py-2 rounded text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                    Next <ChevronRight size={14} />
                  </button>
                ) : (
                  <button onClick={() => updPlan('submitted', true)}
                    className="flex items-center gap-2 px-4 py-2 rounded text-sm bg-success text-primary-foreground hover:opacity-90 transition-opacity">
                    <CheckCircle size={14} /> Submit plan
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Submitted — show formatted summary
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-success"><CheckCircle size={16} /><span className="text-sm" style={{ fontWeight: 600 }}>Test plan complete</span></div>
                <button onClick={() => updPlan('submitted', false)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors">Edit plan</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QA_PLAN.map(x => (
                  <SectionCard key={x.key} title={x.q}>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{String((s.testPlan as unknown as Record<string, unknown>)[x.key] ?? '') || '—'}</p>
                  </SectionCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Participants ──────────────────────────────────────────────── */}
      {tab === 'participants' && (
        <SectionCard title={`Participant log (${s.participants.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Name','Date','Format','Profile','Completed','Notes',''].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.participants.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">No participants logged. Submit the test plan to auto-create today's row.</td></tr>
                )}
                {s.participants.map((p, i) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 group">
                    <td className="px-2 py-1.5">
                      <input type="text" value={p.name} onChange={e => updP(i, 'name', e.target.value)} placeholder="Participant name"
                        className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="date" value={p.date} onChange={e => updP(i, 'date', e.target.value)}
                        className="bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-xs text-foreground focus:outline-none" />
                    </td>
                    <td className="px-2 py-1.5">
                      <select value={p.format} onChange={e => updP(i, 'format', e.target.value)}
                        className="bg-transparent border border-transparent hover:border-border text-xs text-foreground focus:outline-none cursor-pointer rounded px-1 py-1">
                        <option>Remote</option><option>Lab</option><option>Contextual</option>
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="text" value={p.profile} onChange={e => updP(i, 'profile', e.target.value)} placeholder="User profile"
                        className="w-28 bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none" />
                    </td>
                    <td className="px-2 py-1.5">
                      <select value={p.completed} onChange={e => updP(i, 'completed', e.target.value)}
                        className={`bg-transparent border border-transparent hover:border-border text-xs focus:outline-none cursor-pointer rounded px-1 py-1 ${p.completed === 'Yes' ? 'text-success' : p.completed === 'Partial' ? 'text-warning' : 'text-muted-foreground'}`}>
                        <option>Pending</option><option>Yes</option><option>Partial</option><option>No-show</option>
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="text" value={p.notes} onChange={e => updP(i, 'notes', e.target.value)} placeholder="Notes…"
                        className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none" />
                    </td>
                    <td className="px-1 py-1.5">
                      <button onClick={() => remP(i)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addParticipant} className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded hover:bg-muted">
            <Plus size={13} /> Add participant
          </button>
        </SectionCard>
      )}

      {/* ── Findings ──────────────────────────────────────────────────── */}
      {tab === 'findings' && (
        <div>
          {(['Critical','High','Medium','Low'] as const).map(sev => {
            const group = s.findings.filter(f => f.severity === sev);
            if (group.length === 0) return null;
            return (
              <div key={sev} className="mb-5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs mb-3 ${SEV_COLORS[sev]}`}>
                  {sev} — {group.length}
                </span>
                <div className="space-y-2">
                  {group.map(f => {
                    const gi = s.findings.indexOf(f);
                    return (
                      <div key={f.id} className="bg-card border border-border rounded p-4 flex gap-3 group">
                        <div className={`w-1 rounded-full shrink-0 ${sev === 'Critical' || sev === 'High' ? 'bg-destructive' : sev === 'Medium' ? 'bg-warning' : 'bg-success'}`} />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                          <div className="md:col-span-2">
                            <TInput value={f.description} onChange={v => updF(gi, 'description', v)} placeholder="Finding description…" />
                          </div>
                          <TInput value={f.task}   onChange={v => updF(gi, 'task', v)}   placeholder="Task" />
                          <TInput value={f.screen} onChange={v => updF(gi, 'screen', v)} placeholder="Screen" />
                          <select value={f.severity} onChange={e => updF(gi, 'severity', e.target.value)}
                            className="border border-border rounded px-2 py-2 text-sm bg-input-background text-foreground focus:outline-none">
                            <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                          </select>
                        </div>
                        <button onClick={() => remF(gi)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0">
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

      {/* ── Recommendations ───────────────────────────────────────────── */}
      {tab === 'recommendations' && (
        <div>
          {/* Auto-cards from Critical/High */}
          {s.findings.filter(f => f.severity === 'Critical' || f.severity === 'High').length > 0 && (
            <SectionCard title="Priority recommendations (from Critical & High findings)" className="mb-5 border-destructive/20">
              {s.findings.filter(f => f.severity === 'Critical' || f.severity === 'High').map(f => (
                <div key={f.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${SEV_COLORS[f.severity]}`}>{f.severity}</span>
                  <span className="text-sm text-foreground flex-1">{f.description || 'Unnamed finding'}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{f.screen}</span>
                </div>
              ))}
            </SectionCard>
          )}

          <SectionCard title="All recommendations">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Finding ref','Recommendation','Effort','Impact','Owner','Status',''].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.recommendations.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">No recommendations yet.</td></tr>
                  )}
                  {s.recommendations.map((r, i) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 group">
                      {(['findingRef','recommendation'] as const).map(k => (
                        <td key={k} className="px-2 py-1.5">
                          <input type="text" value={r[k]} onChange={e => updR(i, k, e.target.value)} placeholder={k === 'findingRef' ? 'F1' : 'Recommendation…'}
                            className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                        </td>
                      ))}
                      {(['effort','impact'] as const).map(k => (
                        <td key={k} className="px-2 py-1.5">
                          <select value={r[k]} onChange={e => updR(i, k, e.target.value)}
                            className="bg-transparent border border-transparent hover:border-border text-xs text-foreground focus:outline-none cursor-pointer rounded px-1 py-1">
                            <option>Low</option><option>Medium</option><option>High</option>
                          </select>
                        </td>
                      ))}
                      <td className="px-2 py-1.5">
                        <input type="text" value={r.owner} onChange={e => updR(i, 'owner', e.target.value)} placeholder="Owner"
                          className="w-24 bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={r.status} onChange={e => updR(i, 'status', e.target.value)}
                          className={`bg-transparent border border-transparent hover:border-border text-xs focus:outline-none cursor-pointer rounded px-1 py-1 ${r.status === 'Done' ? 'text-success' : r.status === 'In Progress' ? 'text-primary' : 'text-muted-foreground'}`}>
                          <option>Open</option><option>In Progress</option><option>Done</option><option>Won\'t fix</option>
                        </select>
                      </td>
                      <td className="px-1 py-1.5">
                        <button onClick={() => remR(i)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addRec} className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded hover:bg-muted">
              <Plus size={13} /> Add recommendation
            </button>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

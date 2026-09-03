import { useState } from 'react';
import { useStore } from '../store';
import { PageHeader, SectionCard } from '../components/ui';
import { Pencil, Check } from 'lucide-react';

const HEURISTICS = [
  { id: 1,  title: 'Visibility of System Status',           desc: 'The system always keeps users informed about what is going on through appropriate feedback.' },
  { id: 2,  title: 'Match Between System and Real World',   desc: 'The system speaks the users\' language, using words and concepts familiar to the user.' },
  { id: 3,  title: 'User Control and Freedom',              desc: 'Users often choose system functions by mistake and need a clearly marked "emergency exit".' },
  { id: 4,  title: 'Consistency and Standards',             desc: 'Users should not have to wonder whether different words, situations, or actions mean the same thing.' },
  { id: 5,  title: 'Error Prevention',                      desc: 'Even better than good error messages is a careful design which prevents problems from occurring.' },
  { id: 6,  title: 'Recognition Rather Than Recall',        desc: 'Minimize the user\'s memory load by making objects, actions, and options visible.' },
  { id: 7,  title: 'Flexibility and Efficiency of Use',     desc: 'Accelerators may speed up the interaction for the expert user, while remaining invisible to the novice.' },
  { id: 8,  title: 'Aesthetic and Minimalist Design',       desc: 'Dialogues should not contain irrelevant or rarely needed information.' },
  { id: 9,  title: 'Help Users Recognize & Recover Errors', desc: 'Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.' },
  { id: 10, title: 'Help and Documentation',                desc: 'Even though it is better if the system can be used without documentation, it may be necessary to provide help.' },
];

const SEVERITY_LABELS = ['N/A', 'Cosmetic', 'Minor', 'Major', 'Critical'];
const SEVERITY_COLORS = [
  'text-muted-foreground',
  'text-success',
  'text-warning',
  'text-destructive',
  'text-destructive',
];

// Only indices 1–4 (Cosmetic, Minor, Major, Critical) — skip N/A (index 0)
const SEVERITY_SWATCHES = [
  { si: 1, idle: 'bg-success/10 border-success/30',   active: 'bg-success border-success' },
  { si: 2, idle: 'bg-warning/10 border-warning/30',   active: 'bg-warning border-warning' },
  { si: 3, idle: 'bg-destructive/10 border-destructive/30', active: 'bg-destructive border-destructive' },
  { si: 4, idle: 'bg-destructive/10 border-destructive/30', active: 'bg-destructive border-destructive' },
];

export function S07Heuristic() {
  const { currentProject, updateSection } = useStore();
  if (!currentProject) return null;

  const s = currentProject.sections.heuristic;
  const upd = (patch: Partial<typeof s>) => updateSection('heuristic', { ...s, ...patch });
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const updScore = (i: number, key: string, value: number | string) => {
    const scores = s.scores.map((sc, idx) => idx === i ? { ...sc, [key]: value } : sc);
    upd({ scores });
  };

  const avg = s.scores.reduce((sum, sc) => sum + sc.score, 0) / s.scores.length;
  const avgRounded = Math.round(avg * 10) / 10;
  const criticals = s.scores.filter(sc => sc.severity >= 3 && sc.issue.trim());
  const filled    = s.scores.filter(sc => sc.score > 0).length;

  const scoreColor = (score: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 4) return 'text-success';
    if (score >= 2) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div>
      <PageHeader number="07" title="Heuristic Audit"
        description="Score each of Nielsen's 10 usability heuristics, identify severity, and document issues." />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        {[
          { label: 'Average score',   value: avgRounded ? `${avgRounded}/5` : '—', cls: avgRounded >= 3.5 ? 'text-success' : avgRounded >= 2 ? 'text-warning' : 'text-destructive' },
          { label: 'Scored',          value: `${filled}/10`, cls: 'text-foreground' },
          { label: 'Critical issues', value: s.scores.filter(sc => sc.severity === 4 && sc.issue.trim()).length.toString(), cls: 'text-destructive' },
          { label: 'Major issues',    value: s.scores.filter(sc => sc.severity === 3 && sc.issue.trim()).length.toString(), cls: 'text-warning' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-card border border-border rounded p-4 text-center">
            <p className={`text-2xl ${cls}`} style={{ fontWeight: 600 }}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Priority fix list */}
      {criticals.length > 0 && (
        <SectionCard title="Priority fixes (severity ≥ Major)" className="mb-6 border-destructive/30">
          <div className="space-y-2">
            {criticals.map((sc, i) => {
              const realIdx = s.scores.indexOf(sc);
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    sc.severity === 4
                      ? 'bg-destructive/10 text-destructive border-destructive/30'
                      : 'bg-warning/10 text-warning border-warning/30'
                  }`}>
                    {SEVERITY_LABELS[sc.severity]}
                  </span>
                  <span className="text-xs text-muted-foreground w-5 shrink-0">H{realIdx + 1}</span>
                  <span className="text-sm text-foreground flex-1">{sc.issue}</span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Heuristic cards */}
      <div className="space-y-4">
        {HEURISTICS.map((h, i) => {
          const sc = s.scores[i] ?? { score: 0, severity: 0, issue: '', notes: '' };
          const editing = editingIdx === i;

          return (
            <div key={h.id} className="bg-card border border-border rounded overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted flex items-center justify-between gap-3 flex-wrap">
                {/* Title */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground w-5 shrink-0">H{h.id}</span>
                  <span className="text-sm text-foreground truncate" style={{ fontWeight: 600 }}>{h.title}</span>
                </div>

                <div className="flex items-center gap-5 shrink-0 flex-wrap">
                  {/* Score 1–5 */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mr-0.5">Score:</span>
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        onClick={() => updScore(i, 'score', sc.score === n ? 0 : n)}
                        className={`w-7 h-7 rounded border text-xs transition-all ${
                          sc.score >= n
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted text-muted-foreground border-border hover:border-primary'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <span className={`text-xs ml-1 ${scoreColor(sc.score)}`}>
                      {sc.score ? `${sc.score}/5` : '—'}
                    </span>
                  </div>

                  {/* Severity — 4 swatches only, single select */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mr-0.5">Severity:</span>
                    {SEVERITY_SWATCHES.map(({ si, idle, active }) => (
                      <button
                        key={si}
                        onClick={() => updScore(i, 'severity', sc.severity === si ? 0 : si)}
                        title={SEVERITY_LABELS[si]}
                        className={`w-6 h-6 rounded-sm border transition-all ${
                          sc.severity === si ? active : idle
                        }`}
                      />
                    ))}
                    <span className={`text-xs ml-1 ${SEVERITY_COLORS[sc.severity]}`}>
                      {SEVERITY_LABELS[sc.severity]}
                    </span>
                  </div>

                  {/* Edit / Done */}
                  <button
                    onClick={() => setEditingIdx(editing ? null : i)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
                      editing
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-primary hover:bg-muted'
                    }`}
                  >
                    {editing ? <><Check size={11} /> Done</> : <><Pencil size={11} /> Edit</>}
                  </button>
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-4">{h.desc}</p>
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">Issue identified</p>
                      <textarea
                        rows={3}
                        value={sc.issue}
                        onChange={e => updScore(i, 'issue', e.target.value)}
                        placeholder="Describe the specific usability issue…"
                        className="w-full border border-border rounded bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">Design notes / recommendations</p>
                      <textarea
                        rows={5}
                        value={sc.notes}
                        onChange={e => updScore(i, 'notes', e.target.value)}
                        placeholder="How could this be fixed? Reference examples, guidelines…"
                        className="w-full border border-border rounded bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">Issue identified</p>
                      {sc.issue ? (
                        <p className="text-sm text-foreground leading-relaxed">{sc.issue}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No issue documented. Click Edit to add.</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">Design notes / recommendations</p>
                      {sc.notes ? (
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{sc.notes}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No notes added. Click Edit to add recommendations.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
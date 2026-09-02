import { useStore } from '../store';
import { PageHeader, TInput, SectionCard, EditableArea } from '../components/ui';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { uid } from '../utils';
import { Competitor, CompRating } from '../types';

type Rating = 'strong' | 'partial' | 'missing' | '';

const RATING_CYCLE: Rating[] = ['', 'strong', 'partial', 'missing'];

const RATING_DISPLAY: Record<string, { icon: string; cls: string }> = {
  strong:  { icon: '✅', cls: 'bg-success/10 text-success border-success/30' },
  partial: { icon: '🟡', cls: 'bg-warning/10 text-warning border-warning/30' },
  missing: { icon: '❌', cls: 'bg-destructive/10 text-destructive border-destructive/30' },
  '':      { icon: '—',  cls: 'bg-muted text-muted-foreground border-border' },
};

export function S04Competitive() {
  const { currentProject, updateSection } = useStore();
  if (!currentProject) return null;

  const s   = currentProject.sections.competitive;
  const upd = (patch: Partial<typeof s>) => updateSection('competitive', { ...s, ...patch });

  const step = s.step ?? 1;
  const setStep = (n: 1 | 2 | 3) => upd({ step: n });

  // Competitors
  const addCompetitor = () => upd({ competitors: [...s.competitors, { id: uid(), name: '', url: '', description: '' }] });
  const updComp = (i: number, k: keyof Competitor, v: string) =>
    upd({ competitors: s.competitors.map((c, idx) => idx === i ? { ...c, [k]: v } : c) });
  const remComp = (i: number) => upd({ competitors: s.competitors.filter((_, idx) => idx !== i) });

  // Features
  const addFeature = () => upd({ features: [...s.features, { id: uid(), name: '' }] });
  const updFeat = (i: number, v: string) =>
    upd({ features: s.features.map((f, idx) => idx === i ? { ...f, name: v } : f) });
  const remFeat = (id: string) =>
    upd({ features: s.features.filter(f => f.id !== id), ratings: s.ratings.filter(r => r.featureId !== id) });

  // Ratings
  const getRating = (featureId: string, competitorId: string): Rating =>
    (s.ratings.find(r => r.featureId === featureId && r.competitorId === competitorId)?.rating ?? '') as Rating;

  const cycleRating = (featureId: string, competitorId: string) => {
    const cur = getRating(featureId, competitorId);
    const next = RATING_CYCLE[(RATING_CYCLE.indexOf(cur) + 1) % RATING_CYCLE.length];
    const existing = s.ratings.find(r => r.featureId === featureId && r.competitorId === competitorId);
    const ratings = existing
      ? s.ratings.map(r => r.featureId === featureId && r.competitorId === competitorId ? { ...r, rating: next } : r)
      : [...s.ratings, { featureId, competitorId, rating: next }];
    upd({ ratings });
  };

  // Insight generation
  const countRatings = (type: Rating) => s.ratings.filter(r => r.rating === type).length;
  const featureStrength = (fid: string) => ({
    strong:  s.ratings.filter(r => r.featureId === fid && r.rating === 'strong').length,
    partial: s.ratings.filter(r => r.featureId === fid && r.rating === 'partial').length,
    missing: s.ratings.filter(r => r.featureId === fid && r.rating === 'missing').length,
  });

  const tableStakes   = s.features.filter(f => featureStrength(f.id).strong >= Math.ceil(s.competitors.length * 0.6));
  const gaps          = s.features.filter(f => featureStrength(f.id).missing >= Math.ceil(s.competitors.length * 0.5));
  const ourProduct    = s.competitors.find(c => c.name.toLowerCase().includes('our') || c.name.toLowerCase().includes('we'));
  const ourGaps       = ourProduct
    ? s.features.filter(f => s.ratings.find(r => r.featureId === f.id && r.competitorId === ourProduct.id && r.rating === 'missing'))
    : [];

  return (
    <div>
      <PageHeader number="04" title="Competitive Analysis"
        description="Map competitors, rate features, surface insights, and define problems and opportunities." />

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {(['Add competitors', 'Rate features', 'Insights & Strategy'] as const).map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const active = step === n;
          const done   = step > n;
          return (
            <div key={label} className="flex items-center">
              <button onClick={() => setStep(n)}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${active ? 'text-primary border-b-2 border-primary' : done ? 'text-success' : 'text-muted-foreground hover:text-foreground'}`}>
                <span className={`w-5 h-5 rounded-full border text-xs flex items-center justify-center ${active ? 'bg-primary text-primary-foreground border-primary' : done ? 'bg-success text-primary-foreground border-success' : 'border-border text-muted-foreground'}`}>
                  {done ? '✓' : n}
                </span>
                {label}
              </button>
              {i < 2 && <ChevronRight size={14} className="text-border mx-1" />}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Add Competitors ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-3">
          {s.competitors.map((c, i) => (
            <div key={c.id} className="bg-card border border-border rounded p-4 group flex items-center gap-3">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <TInput value={c.name} onChange={v => updComp(i, 'name', v)} placeholder={i === 0 ? 'Our product (first entry)' : 'Competitor name'} />
                <TInput value={c.url}  onChange={v => updComp(i, 'url', v)}  placeholder="https://…" />
                <TInput value={c.description} onChange={v => updComp(i, 'description', v)} placeholder="Short description" />
              </div>
              <button onClick={() => remComp(i)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button onClick={addCompetitor}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors w-full justify-center">
            <Plus size={14} /> Add competitor
          </button>
          <div className="flex justify-end mt-4">
            <button onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 transition-opacity" style={{ fontWeight: 600 }}>
              Rate features <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Rate Features ───────────────────────────────────────── */}
      {step === 2 && (
        <div>
          <div className="flex flex-wrap gap-2 mb-5">
            {s.features.map((f, i) => (
              <div key={f.id} className="flex items-center gap-1 bg-card border border-border rounded px-2 py-1">
                <input type="text" value={f.name} onChange={e => updFeat(i, e.target.value)}
                  placeholder="Feature name"
                  className="bg-transparent text-sm text-foreground focus:outline-none min-w-0 w-28" />
                <button onClick={() => remFeat(f.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
            <button onClick={addFeature}
              className="flex items-center gap-1 bg-muted border border-border rounded px-2 py-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Plus size={11} /> Add feature
            </button>
          </div>

          {s.competitors.length > 0 && s.features.length > 0 && (
            <div className="overflow-x-auto mb-5">
              <table className="text-sm border-collapse w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2 text-xs text-muted-foreground uppercase tracking-wide w-40">Feature</th>
                    {s.competitors.map(c => (
                      <th key={c.id} className="px-3 py-2 text-center text-xs text-foreground" style={{ fontWeight: 600, minWidth: '100px' }}>{c.name || 'Unnamed'}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.features.map(f => (
                    <tr key={f.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-2 text-sm text-foreground">{f.name || '—'}</td>
                      {s.competitors.map(c => {
                        const r = getRating(f.id, c.id);
                        const d = RATING_DISPLAY[r];
                        return (
                          <td key={c.id} className="px-3 py-2 text-center">
                            <button onClick={() => cycleRating(f.id, c.id)}
                              className={`w-8 h-8 rounded border text-base transition-colors hover:scale-110 ${d.cls}`}
                              title="Click to cycle">
                              {d.icon}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={14} /> Back
            </button>
            <button onClick={() => setStep(3)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 transition-opacity" style={{ fontWeight: 600 }}>
              View insights <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Insights & Strategy ────────────────────────────────── */}
      {step === 3 && (
        <div>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Strong ratings', value: countRatings('strong'), cls: 'text-success' },
              { label: 'Partial ratings', value: countRatings('partial'), cls: 'text-warning' },
              { label: 'Missing ratings', value: countRatings('missing'), cls: 'text-destructive' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-card border border-border rounded p-4 text-center">
                <p className={`text-2xl ${cls}`} style={{ fontWeight: 600 }}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Auto-generated insight cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SectionCard title="Table stakes">
              <p className="text-xs text-muted-foreground mb-3">Most competitors already offer these</p>
              {tableStakes.length === 0
                ? <p className="text-xs text-muted-foreground italic">None identified yet</p>
                : tableStakes.map(f => <p key={f.id} className="text-sm text-foreground py-1 border-b border-border last:border-0">{f.name}</p>)
              }
            </SectionCard>
            <SectionCard title="Whitespace">
              <p className="text-xs text-muted-foreground mb-3">Features nobody does well</p>
              {gaps.length === 0
                ? <p className="text-xs text-muted-foreground italic">None identified yet</p>
                : gaps.map(f => <p key={f.id} className="text-sm text-foreground py-1 border-b border-border last:border-0">{f.name}</p>)
              }
            </SectionCard>
            <SectionCard title="Our gaps">
              <p className="text-xs text-muted-foreground mb-3">Missing for "Our product"</p>
              {ourGaps.length === 0
                ? <p className="text-xs text-muted-foreground italic">Mark "Our product" row first</p>
                : ourGaps.map(f => <p key={f.id} className="text-sm text-foreground py-1 border-b border-border last:border-0">{f.name}</p>)
              }
            </SectionCard>
          </div>

          {/* Problems & Opportunities — view/edit text blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <SectionCard title="Problems identified" className="border-destructive/20">
              <p className="text-xs text-muted-foreground mb-3">Key problems surfaced from the competitive landscape — gaps in the market or user pain that no competitor solves well.</p>
              <EditableArea
                value={s.problems ?? ''}
                onChange={v => upd({ problems: v })}
                rows={5}
                placeholder="e.g. No competitor provides real-time collaboration for hardware engineers…"
                emptyText="No problems documented yet. Hover and click the pencil to add."
              />
            </SectionCard>
            <SectionCard title="Opportunities" className="border-success/20">
              <p className="text-xs text-muted-foreground mb-3">Strategic opportunities for your product to differentiate, win users, or enter underserved areas.</p>
              <EditableArea
                value={s.opportunities ?? ''}
                onChange={v => upd({ opportunities: v })}
                rows={5}
                placeholder="e.g. First product to combine datasheets with interactive simulation tools…"
                emptyText="No opportunities documented yet. Hover and click the pencil to add."
              />
            </SectionCard>
          </div>

          {/* Full matrix */}
          {s.competitors.length > 0 && s.features.length > 0 && (
            <SectionCard title="Full comparison matrix">
              <div className="overflow-x-auto">
                <table className="text-sm w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground uppercase tracking-wide">Feature</th>
                      {s.competitors.map(c => <th key={c.id} className="px-3 py-2 text-center text-xs" style={{ fontWeight: 600 }}>{c.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {s.features.map(f => (
                      <tr key={f.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2 text-sm text-foreground">{f.name}</td>
                        {s.competitors.map(c => {
                          const r = getRating(f.id, c.id);
                          return <td key={c.id} className="px-3 py-2 text-center text-base">{RATING_DISPLAY[r].icon}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          <div className="flex justify-start mt-5">
            <button onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={14} /> Edit ratings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

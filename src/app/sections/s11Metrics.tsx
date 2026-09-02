import { useStore } from '../store';
import { PageHeader, SectionCard, EditableArea } from '../components/ui';
import { Plus, Trash2 } from 'lucide-react';
import { uid } from '../utils';
import { metricStatus } from '../utils';
import { MetricRow } from '../types';

const FREQUENCIES = ['Daily','Weekly','Monthly','Quarterly','Per release','Ad hoc'];

export function S11Metrics() {
  const { currentProject, updateSection } = useStore();
  if (!currentProject) return null;

  const s   = currentProject.sections.metrics;
  const upd = (patch: Partial<typeof s>) => updateSection('metrics', { ...s, ...patch });

  const addMetric = () => upd({ metrics: [...s.metrics, {
    id: uid(), feature: '', metric: '', frequency: FREQUENCIES[0],
    baseline: '', target: '', current: '', owner: '', lowerIsBetter: false,
  }]});

  const updMetric = (i: number, k: keyof MetricRow, v: string | boolean) =>
    upd({ metrics: s.metrics.map((m, idx) => idx === i ? { ...m, [k]: v } : m) });
  const remMetric = (i: number) => upd({ metrics: s.metrics.filter((_, idx) => idx !== i) });

  // Summary counts
  const statuses = s.metrics.map(m => metricStatus(m.target, m.current, m.lowerIsBetter).label);
  const onTrack  = statuses.filter(st => st === 'On track').length;
  const atRisk   = statuses.filter(st => st === 'At risk').length;
  const offTrack = statuses.filter(st => st === 'Off track').length;
  const notTrack = statuses.filter(st => st === 'Not tracked').length;

  return (
    <div>
      <PageHeader number="11" title="Feature Metrics"
        description="Track key metrics per feature, set targets, and monitor progress automatically." />

      {/* Stat cards */}
      {s.metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'On track',    value: onTrack,  cls: 'text-success' },
            { label: 'At risk',     value: atRisk,   cls: 'text-warning' },
            { label: 'Off track',   value: offTrack, cls: 'text-destructive' },
            { label: 'Not tracked', value: notTrack, cls: 'text-muted-foreground' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-card border border-border rounded p-4 text-center">
              <p className={`text-2xl ${cls}`} style={{ fontWeight: 600 }}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Metrics table */}
      <SectionCard title={`Metrics (${s.metrics.length})`} className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Feature','Metric','Frequency','Baseline','Target','Current','Status','Owner','↓ Better',''].map(h => (
                  <th key={h} className="text-left px-2 py-2 text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.metrics.length === 0 && (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">Add metrics to track feature performance.</td></tr>
              )}
              {s.metrics.map((m, i) => {
                const st = metricStatus(m.target, m.current, m.lowerIsBetter);
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 group">
                    <td className="px-2 py-1.5">
                      <input type="text" value={m.feature} onChange={e => updMetric(i, 'feature', e.target.value)} placeholder="Feature name"
                        className="w-28 bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="text" value={m.metric} onChange={e => updMetric(i, 'metric', e.target.value)} placeholder="Metric name"
                        className="w-36 bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                    </td>
                    <td className="px-2 py-1.5">
                      <select value={m.frequency} onChange={e => updMetric(i, 'frequency', e.target.value)}
                        className="bg-transparent border border-transparent hover:border-border text-xs text-foreground focus:outline-none cursor-pointer rounded px-1 py-1">
                        {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </td>
                    {(['baseline','target','current'] as const).map(k => (
                      <td key={k} className="px-2 py-1.5">
                        <input type="text" value={m[k]} onChange={e => updMetric(i, k, e.target.value)} placeholder="—"
                          className="w-20 bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                      </td>
                    ))}
                    {/* Status — wider column so pill never wraps */}
                    <td className="px-2 py-1.5" style={{ minWidth: '108px' }}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs whitespace-nowrap ${
                        st.label === 'On track'    ? 'bg-success/10 text-success border-success/30' :
                        st.label === 'At risk'     ? 'bg-warning/10 text-warning border-warning/30' :
                        st.label === 'Off track'   ? 'bg-destructive/10 text-destructive border-destructive/30' :
                                                     'bg-muted text-muted-foreground border-border'
                      }`}>{st.label}</span>
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="text" value={m.owner} onChange={e => updMetric(i, 'owner', e.target.value)} placeholder="Owner"
                        className="w-20 bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button onClick={() => updMetric(i, 'lowerIsBetter', !m.lowerIsBetter)}
                        className={`w-5 h-5 rounded border text-xs transition-colors ${m.lowerIsBetter ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border'}`}>
                        {m.lowerIsBetter ? '✓' : ''}
                      </button>
                    </td>
                    <td className="px-1 py-1.5">
                      <button onClick={() => remMetric(i)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button onClick={addMetric}
          className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded hover:bg-muted">
          <Plus size={13} /> Add metric
        </button>
      </SectionCard>

      <SectionCard title="Notes">
        <EditableArea
          value={s.notes}
          onChange={v => upd({ notes: v })}
          rows={4}
          placeholder="Context, methodology notes, data sources, collection cadence…"
          emptyText="No notes added yet. Hover and click the pencil to add context."
        />
      </SectionCard>
    </div>
  );
}

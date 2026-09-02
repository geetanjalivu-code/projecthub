import { useStore } from '../store';
import { PageHeader, SubTabs, SectionCard, TInput, FieldLabel, TSelect, EditableArea } from '../components/ui';
import { Plus, Trash2 } from 'lucide-react';
import { uid } from '../utils';
import { IAPage } from '../types';

const TABS = [
  { id: 'inventory', label: 'Page Inventory' },
  { id: 'embed',     label: 'IA Diagram / Sitemap' },
];

const IA_TYPES   = ['Sitemap','User Flow','Task Flow','Card Sort Results','Tree Test Results'];
const PRIORITIES = ['Must have','Should have','Could have','Won\'t have'];
const STATUSES   = ['To design','In progress','Ready for dev','Live'];

export function S06IA() {
  const { currentProject, updateSection } = useStore();
  if (!currentProject) return null;

  const s   = currentProject.sections.ia;
  const upd = (patch: Partial<typeof s>) => updateSection('ia', { ...s, ...patch });
  const tab = s.activeTab || 'inventory';

  const addPage = () => upd({ pages: [...s.pages, {
    id: uid(), pageName: '', url: '', parent: '', priority: PRIORITIES[0], status: STATUSES[0], notes: '',
  }]});
  const updPage = (i: number, k: keyof IAPage, v: string) =>
    upd({ pages: s.pages.map((p, idx) => idx === i ? { ...p, [k]: v } : p) });
  const remPage = (i: number) => upd({ pages: s.pages.filter((_, idx) => idx !== i) });

  const STATUS_COLORS: Record<string, string> = {
    'To design':       'text-muted-foreground',
    'In progress':     'text-primary',
    'Ready for dev':   'text-warning',
    'Live':            'text-success',
  };

  return (
    <div>
      <PageHeader number="06" title="Information Architecture"
        description="Map the page inventory and document the structural diagram or sitemap." />

      <SubTabs tabs={TABS} active={tab} onChange={id => upd({ activeTab: id })} />

      {/* ── Page Inventory ────────────────────────────────────────────── */}
      {tab === 'inventory' && (
        <SectionCard title={`Pages (${s.pages.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Page name', 'URL / Route', 'Parent', 'Priority', 'Status', 'Notes', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.pages.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">No pages added yet.</td></tr>
                )}
                {s.pages.map((p, i) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 group">
                    <td className="px-2 py-1.5">
                      <input type="text" value={p.pageName} onChange={e => updPage(i, 'pageName', e.target.value)}
                        placeholder="Home"
                        className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="text" value={p.url} onChange={e => updPage(i, 'url', e.target.value)}
                        placeholder="/home"
                        className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="text" value={p.parent} onChange={e => updPage(i, 'parent', e.target.value)}
                        placeholder="—"
                        className="w-24 bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                    </td>
                    <td className="px-2 py-1.5">
                      <select value={p.priority} onChange={e => updPage(i, 'priority', e.target.value)}
                        className="bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-xs text-foreground focus:outline-none cursor-pointer">
                        {PRIORITIES.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <select value={p.status} onChange={e => updPage(i, 'status', e.target.value)}
                        className={`bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-xs focus:outline-none cursor-pointer ${STATUS_COLORS[p.status]}`}>
                        {STATUSES.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="text" value={p.notes} onChange={e => updPage(i, 'notes', e.target.value)}
                        placeholder="Notes…"
                        className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none" />
                    </td>
                    <td className="px-1 py-1.5">
                      <button onClick={() => remPage(i)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addPage}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded hover:bg-muted">
            <Plus size={13} /> Add page
          </button>
        </SectionCard>
      )}

      {/* ── Embed ─────────────────────────────────────────────────────── */}
      {tab === 'embed' && (
        <div className="space-y-5">
          <SectionCard title="IA diagram settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <FieldLabel label="Diagram type" />
                <TSelect value={s.iaType || IA_TYPES[0]} onChange={v => upd({ iaType: v })} options={IA_TYPES} />
              </div>
              <div>
                <FieldLabel label="Embed URL (Figma, Miro, FigJam, etc.)" />
                <TInput value={s.embedUrl} onChange={v => upd({ embedUrl: v })} placeholder="https://figma.com/embed?…" />
              </div>
            </div>
            <div>
              <FieldLabel label="Description / methodology notes" />
              <EditableArea
                value={s.description}
                onChange={v => upd({ description: v })}
                rows={4}
                placeholder="Describe the IA approach, card sort methodology, or tree test results…"
                emptyText="No description added yet. Hover and click the pencil to add context."
              />
            </div>
          </SectionCard>
          {s.embedUrl ? (
            <div className="border border-border rounded overflow-hidden bg-card">
              <div className="px-5 py-3 border-b border-border bg-muted text-sm text-foreground" style={{ fontWeight: 600 }}>
                {s.iaType || 'IA Diagram'}
              </div>
              <iframe src={s.embedUrl} className="w-full h-[600px] border-0" title="IA diagram" />
            </div>
          ) : (
            <div className="border border-dashed border-border rounded h-48 flex items-center justify-center text-muted-foreground text-sm bg-card">
              Enter an embed URL above to preview the diagram
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useStore } from '../store';
import { PageHeader, TInput, FieldLabel, TSelect } from '../components/ui';
import { Plus, Trash2, ExternalLink, Pencil, Check } from 'lucide-react';
import { uid } from '../utils';
import { Prototype } from '../types';

const STATUSES = ['Draft','In Progress','Ready for review','Approved','Archived'];

const STATUS_COLORS: Record<string, string> = {
  'Draft':              'border-border text-muted-foreground',
  'In Progress':        'border-primary/50 text-primary',
  'Ready for review':   'border-warning/50 text-warning',
  'Approved':           'border-success/50 text-success',
  'Archived':           'border-border text-muted-foreground/50',
};

export function S09Prototypes() {
  const { currentProject, updateSection } = useStore();
  if (!currentProject) return null;

  const prototypes = currentProject.sections.prototypes;
  const upd = (protos: Prototype[]) => updateSection('prototypes', protos);

  const [editingId, setEditingId] = useState<string | null>(null);

  const addProto = () => {
    const p: Prototype = {
      id: uid(), name: '', version: 'v1', status: STATUSES[0],
      description: '', embedUrl: '', lastUpdated: new Date().toISOString().slice(0, 10),
    };
    upd([...prototypes, p]);
    setEditingId(p.id);
  };
  const updProto = (i: number, k: keyof Prototype, v: string) =>
    upd(prototypes.map((p, idx) => idx === i ? { ...p, [k]: v } : p));
  const remProto = (i: number) => upd(prototypes.filter((_, idx) => idx !== i));

  return (
    <div>
      <PageHeader number="09" title="Prototypes"
        description="Link and embed Figma prototypes for testing and stakeholder review." />

      {prototypes.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded mb-4">
          <p className="text-muted-foreground mb-4">No prototypes added yet.</p>
          <button onClick={addProto}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 transition-opacity mx-auto">
            <Plus size={14} /> Add prototype
          </button>
        </div>
      )}

      <div className="space-y-5">
        {prototypes.map((p, i) => {
          const editing = editingId === p.id;
          return (
            <div key={p.id} className="bg-card border border-border rounded overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status] || 'border-border text-muted-foreground'}`}>
                    {p.status}
                  </span>
                  <span className="text-sm text-foreground truncate" style={{ fontWeight: 600 }}>{p.name || 'Untitled prototype'}</span>
                  <span className="text-xs text-muted-foreground">{p.version}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setEditingId(editing ? null : p.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${editing ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
                    {editing ? <><Check size={11} /> Done</> : <><Pencil size={11} /> Edit</>}
                  </button>
                  <button onClick={() => remProto(i)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                {editing ? (
                  // Edit mode
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel label="Prototype name" />
                          <TInput value={p.name} onChange={v => updProto(i, 'name', v)} placeholder="MVP Flow" />
                        </div>
                        <div>
                          <FieldLabel label="Version" />
                          <TInput value={p.version} onChange={v => updProto(i, 'version', v)} placeholder="v1" />
                        </div>
                      </div>
                      <div>
                        <FieldLabel label="Status" />
                        <TSelect value={p.status} onChange={v => updProto(i, 'status', v)} options={STATUSES} />
                      </div>
                      <div>
                        <FieldLabel label="Last updated" />
                        <TInput type="date" value={p.lastUpdated} onChange={v => updProto(i, 'lastUpdated', v)} />
                      </div>
                      <div>
                        <FieldLabel label="Description" />
                        <textarea rows={3} value={p.description} onChange={e => updProto(i, 'description', e.target.value)}
                          placeholder="Describe the scope, flows covered, and what this prototype tests…"
                          className="w-full border border-border rounded bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel label="Figma prototype embed URL" />
                      <TInput value={p.embedUrl} onChange={v => updProto(i, 'embedUrl', v)} placeholder="https://www.figma.com/embed?embed_host=astra&url=…" />
                      {p.embedUrl && (
                        <a href={p.embedUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1">
                          <ExternalLink size={11} /> Open prototype
                        </a>
                      )}
                      {p.embedUrl ? (
                        <div className="mt-3 border border-border rounded overflow-hidden">
                          <iframe src={p.embedUrl} className="w-full h-64 border-0" title={p.name} allowFullScreen />
                        </div>
                      ) : (
                        <div className="mt-3 border border-dashed border-border rounded h-48 flex items-center justify-center text-muted-foreground text-sm bg-muted/30">
                          Add embed URL to preview
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Version</p>
                          <p className="text-sm text-foreground">{p.version || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Last updated</p>
                          <p className="text-sm text-foreground">{p.lastUpdated ? new Date(p.lastUpdated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">Description</p>
                        {p.description ? (
                          <p className="text-sm text-foreground leading-relaxed">{p.description}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No description. Click Edit to add one.</p>
                        )}
                      </div>
                      {p.embedUrl && (
                        <a href={p.embedUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-4">
                          <ExternalLink size={11} /> Open prototype
                        </a>
                      )}
                    </div>
                    <div>
                      {p.embedUrl ? (
                        <div className="border border-border rounded overflow-hidden">
                          <iframe src={p.embedUrl} className="w-full h-64 border-0" title={p.name} allowFullScreen />
                        </div>
                      ) : (
                        <div className="border border-dashed border-border rounded h-48 flex items-center justify-center text-muted-foreground text-sm bg-muted/30">
                          Click Edit to add an embed URL
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {prototypes.length > 0 && (
        <button onClick={addProto}
          className="mt-4 flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors w-full justify-center">
          <Plus size={14} /> Add prototype
        </button>
      )}
    </div>
  );
}

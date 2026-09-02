import { useState } from 'react';
import { useStore } from '../store';
import { PageHeader, SubTabs, SectionCard, TInput, TArea, FieldLabel, TSelect } from '../components/ui';
import { Plus, Trash2, X, MapPin, Pencil, Check } from 'lucide-react';
import { uid } from '../utils';
import { Mockup, Annotation, FlowStep } from '../types';

const TABS = [
  { id: 'mockups', label: 'Mockups & Screens' },
  { id: 'flows',   label: 'User Flows' },
];

const PLATFORMS = ['Web Desktop','Mobile iOS','Mobile Android','Tablet','Other'];
const STATUSES  = ['Draft','In Review','Approved','Ready for dev'];
const INTERACTION_TYPES = ['Click','Hover','Swipe','Scroll','Input','Long press','Drag'];

export function S08Screens() {
  const { currentProject, updateSection } = useStore();
  if (!currentProject) return null;

  const s   = currentProject.sections.screens;
  const upd = (patch: Partial<typeof s>) => updateSection('screens', { ...s, ...patch });
  const tab = s.activeTab || 'mockups';

  const [activeMockupId, setActiveMockupId] = useState<string | null>(null);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [editingDetails, setEditingDetails] = useState(false);

  // Mockup helpers
  const addMockup = () => {
    const m: Mockup = { id: uid(), name: '', platform: PLATFORMS[0], status: STATUSES[0], version: 'v1', figmaUrl: '', annotations: [], annotationMode: false };
    upd({ mockups: [...s.mockups, m] });
  };
  const updMockup = (id: string, k: keyof Mockup, v: unknown) =>
    upd({ mockups: s.mockups.map(m => m.id === id ? { ...m, [k]: v } : m) });
  const remMockup = (id: string) => {
    upd({ mockups: s.mockups.filter(m => m.id !== id) });
    if (activeMockupId === id) { setActiveMockupId(null); setActiveAnnotationId(null); }
  };

  // Annotation helpers
  const addAnnotation = (mockupId: string) => {
    const ann: Annotation = {
      id: uid(), x: 50, y: 50, element: '', behavior: '',
      interactionType: INTERACTION_TYPES[0], states: [], developerNotes: '', css: {},
    };
    const mockup = s.mockups.find(m => m.id === mockupId);
    if (!mockup) return;
    const updated = { ...mockup, annotations: [...mockup.annotations, ann] };
    upd({ mockups: s.mockups.map(m => m.id === mockupId ? updated : m) });
    setActiveAnnotationId(ann.id);
  };
  const updAnnotation = (mockupId: string, annId: string, k: keyof Annotation, v: unknown) => {
    upd({ mockups: s.mockups.map(m => m.id === mockupId ? {
      ...m, annotations: m.annotations.map(a => a.id === annId ? { ...a, [k]: v } : a)
    } : m)});
  };
  const remAnnotation = (mockupId: string, annId: string) => {
    upd({ mockups: s.mockups.map(m => m.id === mockupId ? {
      ...m, annotations: m.annotations.filter(a => a.id !== annId)
    } : m)});
    if (activeAnnotationId === annId) setActiveAnnotationId(null);
  };

  // Flow helpers
  const addFlowStep = () => upd({ flowSteps: [...s.flowSteps, {
    id: uid(), step: `${s.flowSteps.length + 1}`, screen: '', action: '', transition: '', destination: '', condition: '',
  }]});
  const updFlow = (i: number, k: keyof FlowStep, v: string) =>
    upd({ flowSteps: s.flowSteps.map((fs, idx) => idx === i ? { ...fs, [k]: v } : fs) });
  const remFlow = (i: number) => upd({ flowSteps: s.flowSteps.filter((_, idx) => idx !== i) });

  const activeMockup = s.mockups.find(m => m.id === activeMockupId);
  const activeAnnotation = activeMockup?.annotations.find(a => a.id === activeAnnotationId);

  return (
    <div>
      <PageHeader number="08" title="Screens & Flows"
        description="Document mockups with annotations and user flow diagrams." />

      <SubTabs tabs={TABS} active={tab} onChange={id => upd({ activeTab: id })} />

      {/* ── Mockups ───────────────────────────────────────────────────── */}
      {tab === 'mockups' && (
        <div>
          {!activeMockupId ? (
            // Mockup gallery
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {s.mockups.map(m => (
                  <div key={m.id} className="bg-card border border-border rounded overflow-hidden hover:border-primary transition-colors group">
                    {/* Thumbnail placeholder */}
                    <div className="h-36 bg-muted flex items-center justify-center cursor-pointer"
                      onClick={() => { setActiveMockupId(m.id); setEditingDetails(false); }}>
                      {m.figmaUrl ? (
                        <iframe src={m.figmaUrl} className="w-full h-full border-0 pointer-events-none" title={m.name} />
                      ) : (
                        <span className="text-muted-foreground text-sm">Click to open</span>
                      )}
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate" style={{ fontWeight: 600 }}>{m.name || 'Untitled screen'}</p>
                        <p className="text-xs text-muted-foreground">{m.platform} · {m.status} · {m.annotations.length} annotation{m.annotations.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => { setActiveMockupId(m.id); setEditingDetails(false); }}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                          <MapPin size={13} />
                        </button>
                        <button onClick={() => remMockup(m.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addMockup}
                  className="h-52 border border-dashed border-border rounded flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                  <Plus size={20} />
                  <span className="text-sm">Add screen</span>
                </button>
              </div>
            </div>
          ) : (
            // Active mockup detail + annotations
            <div>
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => { setActiveMockupId(null); setActiveAnnotationId(null); setEditingDetails(false); }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← All screens
                </button>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>{activeMockup?.name || 'Untitled screen'}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Screen info — view/edit toggle */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-card border border-border rounded overflow-hidden">
                    <div className="px-5 py-3 border-b border-border bg-muted flex items-center justify-between">
                      <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>Screen details</span>
                      <button onClick={() => setEditingDetails(e => !e)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${editingDetails ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
                        {editingDetails ? <><Check size={11} /> Done</> : <><Pencil size={11} /> Edit</>}
                      </button>
                    </div>
                    <div className="p-5">
                      {editingDetails ? (
                        <div className="space-y-3">
                          <div>
                            <FieldLabel label="Screen name" />
                            <TInput value={activeMockup?.name ?? ''} onChange={v => updMockup(activeMockupId, 'name', v)} placeholder="Home" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <FieldLabel label="Platform" />
                              <TSelect value={activeMockup?.platform ?? PLATFORMS[0]} onChange={v => updMockup(activeMockupId, 'platform', v)} options={PLATFORMS} />
                            </div>
                            <div>
                              <FieldLabel label="Status" />
                              <TSelect value={activeMockup?.status ?? STATUSES[0]} onChange={v => updMockup(activeMockupId, 'status', v)} options={STATUSES} />
                            </div>
                          </div>
                          <div>
                            <FieldLabel label="Version" />
                            <TInput value={activeMockup?.version ?? ''} onChange={v => updMockup(activeMockupId, 'version', v)} placeholder="v1" />
                          </div>
                          <div>
                            <FieldLabel label="Figma frame embed URL" />
                            <TInput value={activeMockup?.figmaUrl ?? ''} onChange={v => updMockup(activeMockupId, 'figmaUrl', v)} placeholder="https://figma.com/embed?…" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Screen name</p>
                            <p className="text-sm text-foreground" style={{ fontWeight: 600 }}>{activeMockup?.name || '—'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Platform</p>
                              <p className="text-sm text-foreground">{activeMockup?.platform || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Status</p>
                              <p className="text-sm text-foreground">{activeMockup?.status || '—'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Version</p>
                            <p className="text-sm text-foreground">{activeMockup?.version || '—'}</p>
                          </div>
                          {activeMockup?.figmaUrl && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Figma URL</p>
                              <p className="text-xs text-primary truncate">{activeMockup.figmaUrl}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Annotations list */}
                  <SectionCard title={`Annotations (${activeMockup?.annotations.length ?? 0})`}>
                    <div className="space-y-1 mb-3">
                      {(activeMockup?.annotations ?? []).map((ann, i) => (
                        <button key={ann.id} onClick={() => setActiveAnnotationId(ann.id === activeAnnotationId ? null : ann.id)}
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${ann.id === activeAnnotationId ? 'bg-secondary text-primary' : 'hover:bg-muted text-foreground'}`}>
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0" style={{ fontSize: '0.625rem' }}>{i + 1}</span>
                          <span className="truncate flex-1">{ann.element || 'Unnamed element'}</span>
                          <button onClick={e => { e.stopPropagation(); remAnnotation(activeMockupId, ann.id); }}
                            className="p-0.5 rounded hover:text-destructive transition-colors">
                            <X size={11} />
                          </button>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => addAnnotation(activeMockupId)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded hover:bg-muted w-full">
                      <Plus size={13} /> Add annotation
                    </button>
                  </SectionCard>
                </div>

                {/* Preview + annotation detail */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Figma embed */}
                  {activeMockup?.figmaUrl ? (
                    <div className="border border-border rounded overflow-hidden">
                      <iframe src={activeMockup.figmaUrl} className="w-full h-80 border-0" title={activeMockup.name} />
                    </div>
                  ) : (
                    <div className="border border-dashed border-border rounded h-64 flex items-center justify-center text-muted-foreground text-sm bg-card">
                      {editingDetails ? 'Add a Figma embed URL to preview the screen' : 'Click Edit to add a Figma embed URL'}
                    </div>
                  )}

                  {/* Annotation detail panel */}
                  {activeAnnotation && (
                    <SectionCard title={`Annotation ${(activeMockup?.annotations.findIndex(a => a.id === activeAnnotation.id) ?? 0) + 1} — ${activeAnnotation.element || 'Details'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <FieldLabel label="UI element" />
                            <TInput value={activeAnnotation.element} onChange={v => updAnnotation(activeMockupId, activeAnnotation.id, 'element', v)} placeholder="Primary CTA button" />
                          </div>
                          <div>
                            <FieldLabel label="Interaction type" />
                            <TSelect value={activeAnnotation.interactionType} onChange={v => updAnnotation(activeMockupId, activeAnnotation.id, 'interactionType', v)} options={INTERACTION_TYPES} />
                          </div>
                          <div>
                            <FieldLabel label="Behaviour" />
                            <TArea rows={3} value={activeAnnotation.behavior} onChange={v => updAnnotation(activeMockupId, activeAnnotation.id, 'behavior', v)} placeholder="Describe what happens when the user interacts…" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <FieldLabel label="States" hint="Comma-separated: default, hover, active, disabled…" />
                            <TInput value={(activeAnnotation.states ?? []).join(', ')} onChange={v => updAnnotation(activeMockupId, activeAnnotation.id, 'states', v.split(',').map(x => x.trim()))} placeholder="default, hover, active, disabled" />
                          </div>
                          <div>
                            <FieldLabel label="Developer notes" />
                            <TArea rows={3} value={activeAnnotation.developerNotes} onChange={v => updAnnotation(activeMockupId, activeAnnotation.id, 'developerNotes', v)} placeholder="API calls, edge cases, accessibility requirements…" />
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Flows ─────────────────────────────────────────────────────── */}
      {tab === 'flows' && (
        <div className="space-y-5">
          <SectionCard title="Flow embed">
            <FieldLabel label="Embed URL (Figma, Miro, Whimsical, etc.)" />
            <TInput value={s.flowEmbedUrl} onChange={v => upd({ flowEmbedUrl: v })} placeholder="https://figma.com/embed?…" />
          </SectionCard>

          {s.flowEmbedUrl && (
            <div className="border border-border rounded overflow-hidden">
              <iframe src={s.flowEmbedUrl} className="w-full h-96 border-0" title="User flow" />
            </div>
          )}

          <SectionCard title="Flow steps">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Step','Screen','Action','Transition','Destination','Condition',''].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.flowSteps.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">No steps added yet.</td></tr>
                  )}
                  {s.flowSteps.map((fs, i) => (
                    <tr key={fs.id} className="border-b border-border last:border-0 hover:bg-muted/30 group">
                      {(['step','screen','action','transition','destination','condition'] as const).map(k => (
                        <td key={k} className="px-2 py-1.5">
                          <input type="text" value={fs[k]} onChange={e => updFlow(i, k, e.target.value)}
                            placeholder="—"
                            className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                        </td>
                      ))}
                      <td className="px-1 py-1.5">
                        <button onClick={() => remFlow(i)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addFlowStep}
              className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded hover:bg-muted">
              <Plus size={13} /> Add step
            </button>
          </SectionCard>

          <SectionCard title="Flow notes">
            <TArea rows={4} value={s.flowNotes} onChange={v => upd({ flowNotes: v })}
              placeholder="Decision points, conditional logic, error paths, happy path description…" />
          </SectionCard>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { PageHeader, TInput, FieldLabel, TSelect, BulletList } from '../components/ui';
import { Plus, Trash2, ChevronDown, ChevronUp, Pencil, Check } from 'lucide-react';
import { uid, todayKey, todayLabel } from '../utils';
import { Meeting, ActionItem } from '../types';

const MEETING_TYPES = ['Design review','Stakeholder review','Team sync','Client workshop','Sprint planning','Research readout','Handoff','Ad hoc'];

export function S12Meetings() {
  const { currentProject, updateSection } = useStore();
  if (!currentProject) return null;

  const s   = currentProject.sections.meetings;
  const upd = (patch: Partial<typeof s>) => updateSection('meetings', { ...s, ...patch });

  // Per-meeting editing state
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const toggleEditing = (id: string) =>
    setEditingIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Auto-create today's meeting once
  useEffect(() => {
    const today = todayKey();
    if (s.todayMeetingAdded !== today) {
      const meeting: Meeting = {
        id: uid(),
        title: `Meeting — ${todayLabel()}`,
        date: today,
        type: MEETING_TYPES[0],
        agenda: [{ id: uid(), text: '' }],
        attendees: [{ id: uid(), text: '' }],
        discussion: '',
        decisions: [{ id: uid(), text: '' }],
        actionItems: [],
        expanded: true,
      };
      upd({ meetings: [meeting, ...s.meetings], todayMeetingAdded: today });
    }
  }, []);

  const addMeeting = () => {
    const meeting: Meeting = {
      id: uid(), title: 'New meeting', date: todayKey(), type: MEETING_TYPES[0],
      agenda: [{ id: uid(), text: '' }], attendees: [{ id: uid(), text: '' }],
      discussion: '', decisions: [{ id: uid(), text: '' }], actionItems: [], expanded: true,
    };
    upd({ meetings: [meeting, ...s.meetings] });
    setEditingIds(prev => new Set([...prev, meeting.id]));
  };

  const updMeeting = (id: string, patch: Partial<Meeting>) =>
    upd({ meetings: s.meetings.map(m => m.id === id ? { ...m, ...patch } : m) });
  const remMeeting = (id: string) => upd({ meetings: s.meetings.filter(m => m.id !== id) });
  const toggleExpand = (id: string) => updMeeting(id, { expanded: !s.meetings.find(m => m.id === id)?.expanded });

  const addAction = (mid: string) => {
    const m = s.meetings.find(x => x.id === mid);
    if (!m) return;
    updMeeting(mid, { actionItems: [...m.actionItems, { id: uid(), task: '', owner: '', dueDate: '', status: 'Open' }] });
  };
  const updAction = (mid: string, i: number, k: keyof ActionItem, v: string) => {
    const m = s.meetings.find(x => x.id === mid);
    if (!m) return;
    updMeeting(mid, { actionItems: m.actionItems.map((a, idx) => idx === i ? { ...a, [k]: v } : a) });
  };
  const remAction = (mid: string, i: number) => {
    const m = s.meetings.find(x => x.id === mid);
    if (!m) return;
    updMeeting(mid, { actionItems: m.actionItems.filter((_, idx) => idx !== i) });
  };

  return (
    <div>
      <PageHeader number="12" title="Meeting Notes"
        description="Document agenda, decisions, and action items for every project meeting." />

      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-muted-foreground">{s.meetings.length} meeting{s.meetings.length !== 1 ? 's' : ''}</p>
        <button onClick={addMeeting}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 transition-opacity">
          <Plus size={14} /> New meeting
        </button>
      </div>

      <div className="space-y-3">
        {s.meetings.map(m => {
          const isEditing = editingIds.has(m.id);
          return (
            <div key={m.id} className="bg-card border border-border rounded overflow-hidden">
              {/* Header / accordion toggle */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted">
                <button className="flex items-center gap-3 min-w-0 flex-1 text-left" onClick={() => toggleExpand(m.id)}>
                  {m.expanded ? <ChevronUp size={14} className="text-muted-foreground shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
                  <div className="min-w-0">
                    <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>{m.title}</span>
                    <span className="text-xs text-muted-foreground ml-3">{m.date} · {m.type}</span>
                  </div>
                </button>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button onClick={() => toggleEditing(m.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${isEditing ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
                    {isEditing ? <><Check size={11} /> Done</> : <><Pencil size={11} /> Edit</>}
                  </button>
                  <button onClick={() => remMeeting(m.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Body */}
              {m.expanded && (
                <div className="p-5 space-y-5">
                  {isEditing ? (
                    <>
                      {/* Edit mode: all fields */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <FieldLabel label="Meeting title" />
                          <TInput value={m.title} onChange={v => updMeeting(m.id, { title: v })} placeholder="Meeting name" />
                        </div>
                        <div>
                          <FieldLabel label="Type" />
                          <TSelect value={m.type} onChange={v => updMeeting(m.id, { type: v })} options={MEETING_TYPES} />
                        </div>
                        <div>
                          <FieldLabel label="Date" />
                          <TInput type="date" value={m.date} onChange={v => updMeeting(m.id, { date: v })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <FieldLabel label="Agenda" />
                          <BulletList items={m.agenda} onChange={items => updMeeting(m.id, { agenda: items })} placeholder="Agenda item…" />
                        </div>
                        <div>
                          <FieldLabel label="Attendees" />
                          <BulletList items={m.attendees} onChange={items => updMeeting(m.id, { attendees: items })} placeholder="Name / role…" />
                        </div>
                      </div>

                      <div>
                        <FieldLabel label="Discussion notes" />
                        <textarea rows={4} value={m.discussion} onChange={e => updMeeting(m.id, { discussion: e.target.value })}
                          placeholder="Key discussion points, questions raised, context shared…"
                          className="w-full border border-border rounded bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                      </div>

                      <div>
                        <FieldLabel label="Decisions made" />
                        <BulletList items={m.decisions} onChange={items => updMeeting(m.id, { decisions: items })} placeholder="Decision…" />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* View mode: formatted read-only display */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Date</p>
                          <p className="text-foreground">{m.date || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Type</p>
                          <p className="text-foreground">{m.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Attendees</p>
                          {m.attendees.filter(a => a.text.trim()).length > 0 ? (
                            <p className="text-foreground">{m.attendees.filter(a => a.text.trim()).map(a => a.text).join(', ')}</p>
                          ) : (
                            <p className="text-muted-foreground italic">None listed</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Agenda</p>
                          {m.agenda.filter(a => a.text.trim()).length > 0 ? (
                            <ul className="space-y-1">
                              {m.agenda.filter(a => a.text.trim()).map(a => (
                                <li key={a.id} className="flex items-start gap-2 text-sm text-foreground">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                  {a.text}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No agenda items. Click Edit to add.</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Decisions made</p>
                          {m.decisions.filter(d => d.text.trim()).length > 0 ? (
                            <ul className="space-y-1">
                              {m.decisions.filter(d => d.text.trim()).map(d => (
                                <li key={d.id} className="flex items-start gap-2 text-sm text-foreground">
                                  <span className="text-success mt-0.5 shrink-0">✓</span>
                                  {d.text}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No decisions recorded. Click Edit to add.</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Discussion notes</p>
                        {m.discussion.trim() ? (
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{m.discussion}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No discussion notes. Click Edit to add.</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Action items — always visible (table format) */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Action items</p>
                    {m.actionItems.length > 0 && (
                      <table className="w-full text-sm mb-2">
                        <thead>
                          <tr className="border-b border-border">
                            {['Task','Owner','Due date','Status',''].map(h => (
                              <th key={h} className="text-left px-2 py-1.5 text-xs text-muted-foreground uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {m.actionItems.map((a, i) => (
                            <tr key={a.id} className="border-b border-border last:border-0 group hover:bg-muted/30">
                              <td className="px-2 py-1.5">
                                {isEditing ? (
                                  <input type="text" value={a.task} onChange={e => updAction(m.id, i, 'task', e.target.value)} placeholder="Task…"
                                    className="w-full bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                                ) : (
                                  <span className="text-sm text-foreground">{a.task || '—'}</span>
                                )}
                              </td>
                              <td className="px-2 py-1.5">
                                {isEditing ? (
                                  <input type="text" value={a.owner} onChange={e => updAction(m.id, i, 'owner', e.target.value)} placeholder="Owner"
                                    className="w-24 bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                                ) : (
                                  <span className="text-sm text-muted-foreground">{a.owner || '—'}</span>
                                )}
                              </td>
                              <td className="px-2 py-1.5">
                                {isEditing ? (
                                  <input type="date" value={a.dueDate} onChange={e => updAction(m.id, i, 'dueDate', e.target.value)}
                                    className="bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-input-background rounded px-2 py-1 text-xs text-foreground focus:outline-none" />
                                ) : (
                                  <span className="text-xs text-muted-foreground">{a.dueDate || '—'}</span>
                                )}
                              </td>
                              <td className="px-2 py-1.5">
                                <select value={a.status} onChange={e => updAction(m.id, i, 'status', e.target.value)}
                                  className={`bg-transparent border border-transparent hover:border-border text-xs focus:outline-none cursor-pointer rounded px-1 py-1 ${a.status === 'Done' ? 'text-success' : a.status === 'In Progress' ? 'text-primary' : 'text-muted-foreground'}`}>
                                  <option>Open</option><option>In Progress</option><option>Done</option><option>Blocked</option>
                                </select>
                              </td>
                              <td className="px-1 py-1.5">
                                {isEditing && (
                                  <button onClick={() => remAction(m.id, i)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {m.actionItems.length === 0 && !isEditing && (
                      <p className="text-sm text-muted-foreground italic mb-2">No action items. Click Edit to add.</p>
                    )}
                    <button onClick={() => addAction(m.id)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded hover:bg-muted">
                      <Plus size={12} /> Add action item
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {s.meetings.length === 0 && (
          <div className="text-center py-16 bg-card border border-border rounded">
            <p className="text-muted-foreground mb-2">No meetings yet.</p>
            <p className="text-xs text-muted-foreground mb-4">A meeting note for today will be created automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}

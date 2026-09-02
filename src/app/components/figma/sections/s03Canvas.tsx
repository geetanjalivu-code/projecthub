import { useState } from 'react';
import { useStore } from '../store';
import { TArea, PageHeader, BtnSecondary } from '../components/ui';
import { ChevronLeft, ChevronRight, LayoutGrid, MessageSquare, CheckCircle } from 'lucide-react';

type CanvasKey = 'problemStatement' | 'targetUsersPrimary' | 'targetUsersSecondary' | 'goals' |
  'successMetrics' | 'userNeeds' | 'businessNeeds' | 'constraintsTechnical' |
  'constraintsTimeline' | 'constraintsBudget' | 'assumptions' | 'outOfScope' | 'risks';

const QA_QUESTIONS: { key: CanvasKey; q: string; hint: string }[] = [
  { key: 'problemStatement',      q: 'What problem are we solving?',           hint: 'Describe the core user or business problem. Be specific and evidence-based.' },
  { key: 'targetUsersPrimary',    q: 'Who is the primary target user?',         hint: 'Demographics, context, technical proficiency, and main job-to-be-done.' },
  { key: 'targetUsersSecondary',  q: 'Are there secondary users?',              hint: 'Other stakeholders or user groups that interact with the product indirectly.' },
  { key: 'goals',                 q: 'What are our goals?',                     hint: 'List 2–4 clear, measurable goals for the product or feature.' },
  { key: 'successMetrics',        q: 'How will we measure success?',            hint: 'KPIs, completion rates, NPS, task success, adoption targets, etc.' },
  { key: 'userNeeds',             q: 'What do users need most?',               hint: 'Core jobs-to-be-done, pain relief, and desired outcomes from user research.' },
  { key: 'businessNeeds',         q: 'What does the business need?',           hint: 'Revenue impact, compliance, strategic alignment, or operational efficiency.' },
  { key: 'constraintsTechnical',  q: 'What are the technical constraints?',    hint: 'Platform limits, existing systems, APIs, accessibility requirements, etc.' },
  { key: 'constraintsTimeline',   q: 'What are the timeline constraints?',     hint: 'Hard deadlines, release windows, dependent milestones.' },
  { key: 'constraintsBudget',     q: 'What are the budget constraints?',       hint: 'Resource limits, tooling costs, scope caps.' },
  { key: 'assumptions',           q: 'What assumptions are we making?',        hint: 'List hypotheses that need to be validated before or during design.' },
  { key: 'outOfScope',            q: 'What is explicitly out of scope?',       hint: 'Be explicit to prevent scope creep. What are we NOT solving?' },
  { key: 'risks',                 q: 'What are the key risks?',               hint: 'Technical debt, UX debt, regulatory risk, adoption risk, dependency risk.' },
];

const CANVAS_CELLS: { key: CanvasKey; label: string; col?: string }[] = [
  { key: 'problemStatement',     label: 'Problem Statement' },
  { key: 'targetUsersPrimary',   label: 'Primary Users' },
  { key: 'targetUsersSecondary', label: 'Secondary Users' },
  { key: 'goals',                label: 'Goals' },
  { key: 'successMetrics',       label: 'Success Metrics' },
  { key: 'userNeeds',            label: 'User Needs' },
  { key: 'businessNeeds',        label: 'Business Needs' },
  { key: 'constraintsTechnical', label: 'Technical Constraints' },
  { key: 'constraintsTimeline',  label: 'Timeline Constraints' },
  { key: 'constraintsBudget',    label: 'Budget Constraints' },
  { key: 'assumptions',          label: 'Assumptions' },
  { key: 'outOfScope',           label: 'Out of Scope' },
  { key: 'risks',                label: 'Risks' },
];

export function S03Canvas() {
  const { currentProject, updateSection } = useStore();
  if (!currentProject) return null;

  const s   = currentProject.sections.canvas;
  const upd = (patch: Partial<typeof s>) => updateSection('canvas', { ...s, ...patch });

  const mode = s.mode ?? 'qa';
  const qaStep = s.qaStep ?? 0;
  const q = QA_QUESTIONS[qaStep];

  const answered = QA_QUESTIONS.filter(x => s[x.key]?.trim().length > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <PageHeader number="03" title="Project Canvas" description="Define the scope, users, goals, and constraints for this project." />
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => upd({ mode: 'qa' })}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm border transition-colors ${mode === 'qa' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'}`}>
          <MessageSquare size={14} /> Q&amp;A mode
        </button>
        <button onClick={() => upd({ mode: 'canvas' })}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm border transition-colors ${mode === 'canvas' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'}`}>
          <LayoutGrid size={14} /> Canvas view
        </button>
        <span className="ml-auto text-xs text-muted-foreground">{answered} / {QA_QUESTIONS.length} answered</span>
      </div>

      {/* ── Q&A Mode ──────────────────────────────────────────────────────── */}
      {mode === 'qa' && (
        <div className="max-w-2xl">
          {/* Progress dots */}
          <div className="flex gap-1 mb-8">
            {QA_QUESTIONS.map((x, i) => (
              <button key={x.key} onClick={() => upd({ qaStep: i })}
                className={`h-1.5 rounded-full transition-all ${i === qaStep ? 'w-6 bg-primary' : s[x.key]?.trim() ? 'w-2.5 bg-success' : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground'}`} />
            ))}
          </div>

          <div className="bg-card border border-border rounded p-7">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Question {qaStep + 1} of {QA_QUESTIONS.length}</p>
            <h3 className="text-foreground mb-1">{q.q}</h3>
            <p className="text-sm text-muted-foreground mb-5">{q.hint}</p>
            <TArea
              rows={6}
              value={s[q.key]}
              onChange={v => upd({ [q.key]: v })}
              placeholder="Type your answer here…"
            />
            {/* Completion indicator */}
            {s[q.key]?.trim() && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-success">
                <CheckCircle size={12} /> Answered
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-5">
            <button onClick={() => upd({ qaStep: Math.max(0, qaStep - 1) })} disabled={qaStep === 0}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors">
              <ChevronLeft size={14} /> Previous
            </button>
            {qaStep < QA_QUESTIONS.length - 1 ? (
              <button onClick={() => upd({ qaStep: qaStep + 1 })}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={() => upd({ mode: 'canvas' })}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm bg-success text-primary-foreground hover:opacity-90 transition-opacity">
                <LayoutGrid size={14} /> View canvas
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Canvas view ───────────────────────────────────────────────────── */}
      {mode === 'canvas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CANVAS_CELLS.map((cell, i) => (
            <div key={cell.key}
              className={`bg-card border border-border rounded overflow-hidden flex flex-col ${i === 0 ? 'lg:col-span-2' : ''}`}>
              <div className="px-4 py-2 border-b border-border bg-muted flex items-center justify-between">
                <span className="text-xs text-foreground uppercase tracking-widest" style={{ fontWeight: 600 }}>{cell.label}</span>
                {s[cell.key]?.trim() && <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />}
              </div>
              <textarea
                rows={4}
                value={s[cell.key]}
                onChange={e => upd({ [cell.key]: e.target.value })}
                placeholder={`${cell.label}…`}
                className="flex-1 w-full p-4 text-sm text-foreground bg-transparent placeholder:text-muted-foreground focus:outline-none resize-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

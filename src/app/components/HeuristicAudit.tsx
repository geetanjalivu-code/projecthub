import { useState } from "react";
import { PageHeader, Section, StarRating } from "./shared";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

const HEURISTICS = [
  {
    id: 1,
    name: "Visibility of System Status",
    desc: "The system should always keep users informed about what is going on through appropriate feedback within reasonable time.",
    example: "Loading spinners, progress bars, confirmation messages.",
  },
  {
    id: 2,
    name: "Match Between System and the Real World",
    desc: "The system should speak the users' language using words, phrases, and concepts familiar to the user.",
    example: "Using 'Trash' instead of 'Delete', familiar icons and metaphors.",
  },
  {
    id: 3,
    name: "User Control and Freedom",
    desc: "Users often choose system functions by mistake and need a clearly marked 'emergency exit' to leave without extended dialogue.",
    example: "Undo/Redo, Cancel buttons, back navigation.",
  },
  {
    id: 4,
    name: "Consistency and Standards",
    desc: "Users should not have to wonder whether different words, situations, or actions mean the same thing.",
    example: "Consistent button styles, terminology, and interaction patterns.",
  },
  {
    id: 5,
    name: "Error Prevention",
    desc: "Even better than good error messages is a careful design which prevents a problem from occurring in the first place.",
    example: "Confirmation dialogs, form validation on input, disabling unavailable actions.",
  },
  {
    id: 6,
    name: "Recognition Rather Than Recall",
    desc: "Minimise the user's memory load by making objects, actions, and options visible.",
    example: "Visible menus, autocomplete, recently used items.",
  },
  {
    id: 7,
    name: "Flexibility and Efficiency of Use",
    desc: "Accelerators — unseen by the novice user — may often speed up the interaction for the expert user.",
    example: "Keyboard shortcuts, bulk actions, saved filters.",
  },
  {
    id: 8,
    name: "Aesthetic and Minimalist Design",
    desc: "Dialogues should not contain irrelevant or rarely needed information. Every extra unit of information competes with relevant info.",
    example: "Removing decorative clutter, hiding secondary actions, progressive disclosure.",
  },
  {
    id: 9,
    name: "Help Users Recognise, Diagnose, and Recover from Errors",
    desc: "Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.",
    example: "Inline validation errors, descriptive messages, suggested fixes.",
  },
  {
    id: 10,
    name: "Help and Documentation",
    desc: "Even though it is better if the system can be used without documentation, it may be necessary to provide help.",
    example: "Tooltips, onboarding tours, searchable help centre.",
  },
];

const SEVERITY_LABELS: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
  0: { label: "Not a problem", color: "text-muted-foreground", icon: <CheckCircle2 size={13} /> },
  1: { label: "Cosmetic", color: "text-chart-2", icon: <CheckCircle2 size={13} /> },
  2: { label: "Minor", color: "text-chart-1", icon: <AlertTriangle size={13} /> },
  3: { label: "Major", color: "text-destructive", icon: <AlertCircle size={13} /> },
  4: { label: "Catastrophic", color: "text-destructive font-bold", icon: <AlertCircle size={13} /> },
};

type HeuristicState = {
  score: number;
  severity: number;
  notes: string;
  issue: string;
};

export function HeuristicAudit() {
  const [states, setStates] = useState<HeuristicState[]>(
    HEURISTICS.map(() => ({ score: 0, severity: 0, notes: "", issue: "" }))
  );

  const update = (idx: number, field: keyof HeuristicState, value: string | number) =>
    setStates(states.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));

  const totalScore = states.reduce((acc, s) => acc + s.score, 0);
  const maxScore = HEURISTICS.length * 5;
  const scorePercent = Math.round((totalScore / maxScore) * 100);

  const issues = states
    .map((s, i) => ({ ...s, heuristic: HEURISTICS[i].name, idx: i + 1 }))
    .filter((s) => s.severity >= 2 && s.issue.trim())
    .sort((a, b) => b.severity - a.severity);

  return (
    <div>
      <PageHeader
        number="07"
        title="Heuristic Audit"
        description="Evaluate the product against Nielsen's 10 usability heuristics. Score 1–5 and note issues found."
      />

      <div className="space-y-6">
        {/* Score summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Overall Score</p>
            <p className="text-3xl font-bold text-foreground">{totalScore}<span className="text-base font-normal text-muted-foreground">/{maxScore}</span></p>
            <div className="mt-3 w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{scorePercent}% rating</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Issues Found</p>
            <p className="text-3xl font-bold text-foreground">{issues.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {issues.filter((i) => i.severity >= 3).length} major or critical
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Heuristics Assessed</p>
            <p className="text-3xl font-bold text-foreground">
              {states.filter((s) => s.score > 0).length}
              <span className="text-base font-normal text-muted-foreground">/10</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {10 - states.filter((s) => s.score > 0).length} remaining
            </p>
          </div>
        </div>

        {/* Heuristic cards */}
        <Section title="Heuristic Scores">
          <div className="space-y-4">
            {HEURISTICS.map((h, i) => {
              const s = states[i];
              return (
                <div key={h.id} className="border border-border rounded-lg overflow-hidden">
                  <div className="px-5 py-3 bg-muted flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-muted-foreground mt-0.5">
                      {h.id}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{h.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{h.desc}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5 italic">e.g. {h.example}</p>
                    </div>
                  </div>
                  <div className="px-5 py-4 bg-card grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Score (1 = poor, 5 = excellent)</p>
                      <StarRating value={s.score} onChange={(v) => update(i, "score", v)} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Severity</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {Object.entries(SEVERITY_LABELS).map(([val, { label, color }]) => (
                          <button
                            key={val}
                            onClick={() => update(i, "severity", Number(val))}
                            className={`text-xs px-2 py-1 rounded border transition-all ${
                              s.severity === Number(val)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border text-muted-foreground hover:border-foreground"
                            }`}
                          >
                            {val} — {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Issue observed</p>
                        <textarea
                          rows={2}
                          value={s.issue}
                          onChange={(e) => update(i, "issue", e.target.value)}
                          placeholder="Describe the specific usability issue you observed…"
                          className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Notes & recommendations</p>
                        <textarea
                          rows={2}
                          value={s.notes}
                          onChange={(e) => update(i, "notes", e.target.value)}
                          placeholder="How should this be fixed? Link to specific screen if applicable."
                          className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Priority fix list */}
        {issues.length > 0 && (
          <Section title="Priority Fix List">
            <p className="text-xs text-muted-foreground mb-4">Issues with severity ≥ 2, ordered by priority. Fill in the issue field above to populate this list.</p>
            <div className="space-y-2">
              {issues.map((issue, i) => {
                const sev = SEVERITY_LABELS[issue.severity];
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                    <span className={`shrink-0 mt-0.5 ${sev.color}`}>{sev.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-foreground">#{issue.idx} {issue.heuristic}</span>
                        <span className={`text-xs ${sev.color}`}>{sev.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{issue.issue}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

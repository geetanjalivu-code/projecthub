import { useState } from "react";
import { Plus, Trash2, ClipboardList, Users, AlertTriangle, Lightbulb } from "lucide-react";
import { PageHeader, Section, Field, TextInput, TextArea, EditableTable, StatusBadge } from "./shared";

type FindingEntry = {
  id: string;
  participant: string;
  screen: string;
  observation: string;
  severity: string;
  theme: string;
};

const defaultFindings: FindingEntry[] = [
  { id: "1", participant: "P1", screen: "Onboarding Step 2", observation: "User didn't notice the skip button — spent 3 min on optional profile photo.", severity: "Medium", theme: "Visibility", },
  { id: "2", participant: "P1, P3", screen: "Dashboard", observation: "All 3 users looked for a 'Create new' button in the top nav but it lives in a sidebar panel.", severity: "High", theme: "Navigation", },
  { id: "3", participant: "P2", screen: "Settings > Billing", observation: "Couldn't find how to cancel subscription. Checked 3 wrong places.", severity: "Critical", theme: "Navigation", },
];

const SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"];

export function UsabilityTesting() {
  const [activeTab, setActiveTab] = useState<"plan" | "participants" | "findings" | "recommendations">("plan");
  const [findings, setFindings] = useState<FindingEntry[]>(defaultFindings);

  const addFinding = () =>
    setFindings([...findings, { id: String(Date.now()), participant: "", screen: "", observation: "", severity: "Medium", theme: "" }]);
  const removeFinding = (id: string) => setFindings(findings.filter((f) => f.id !== id));
  const updateFinding = (id: string, field: keyof FindingEntry, value: string) =>
    setFindings(findings.map((f) => (f.id === id ? { ...f, [field]: value } : f)));

  const highFindings = findings.filter((f) => f.severity === "High" || f.severity === "Critical");

  const tabs = [
    { id: "plan", label: "Test Plan", icon: ClipboardList },
    { id: "participants", label: "Participant Log", icon: Users },
    { id: "findings", label: "Findings", icon: AlertTriangle },
    { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  ] as const;

  return (
    <div>
      <PageHeader
        number="10"
        title="Usability Testing"
        description="Plan your research, log participants, capture findings, and generate recommendations."
      />

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6 w-fit flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* TEST PLAN */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          <Section title="Research Objective">
            <Field label="What questions are you trying to answer?">
              <TextArea rows={4} placeholder="e.g. Can new users successfully complete onboarding without assistance? Do users understand the pricing model?" />
            </Field>
          </Section>

          <Section title="What You're Testing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Prototype / Feature being tested">
                <TextInput placeholder="e.g. Onboarding flow v2, New checkout page" />
              </Field>
              <Field label="Figma prototype link">
                <TextInput placeholder="https://figma.com/proto/…" />
              </Field>
              <Field label="Test format">
                <select className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none">
                  {["Moderated — remote", "Moderated — in person", "Unmoderated — remote", "Guerrilla / hallway"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Session duration">
                <TextInput placeholder="e.g. 45 minutes" />
              </Field>
            </div>
          </Section>

          <Section title="Participants">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Number of participants">
                <TextInput placeholder="e.g. 5" />
              </Field>
              <Field label="Recruitment criteria">
                <TextInput placeholder="e.g. Active users, 25–45, non-technical" />
              </Field>
              <Field label="Incentive">
                <TextInput placeholder="e.g. $50 gift card" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Participant profile description">
                <TextArea rows={3} placeholder="Describe the characteristics of ideal participants — demographics, experience level, usage behaviour, etc." />
              </Field>
            </div>
          </Section>

          <Section title="Tasks">
            <EditableTable
              columns={[
                { key: "num",   label: "#",           width: "6%" },
                { key: "task",  label: "Task Prompt", width: "55%" },
                { key: "goal",  label: "Success Goal", width: "30%" },
                { key: "time",  label: "Time Limit",  width: "9%" },
              ]}
              initialRows={[
                { num: "1", task: "You've just signed up. Please complete the setup to get your workspace ready.", goal: "Completes all 3 steps without assistance", time: "5 min" },
                { num: "2", task: "Find where to upgrade your account to the Pro plan.", goal: "Navigates to billing page", time: "3 min" },
                { num: "3", task: "Create a new project and invite a team member.", goal: "Project created + invite sent", time: "5 min" },
              ]}
            />
          </Section>

          <Section title="Metrics">
            <EditableTable
              columns={[
                { key: "metric",   label: "Metric",            width: "30%" },
                { key: "method",   label: "How to measure",    width: "45%" },
                { key: "target",   label: "Target",            width: "25%" },
              ]}
              initialRows={[
                { metric: "Task completion rate", method: "Observer marks pass/fail per task per participant", target: "≥80% success" },
                { metric: "Time on task", method: "Timed from task start to goal completion", target: "<5 min avg" },
                { metric: "Error rate", method: "Count distinct wrong paths per task", target: "<2 errors avg" },
                { metric: "SUS Score", method: "10-question survey at end of session", target: "≥75 / 100" },
              ]}
            />
          </Section>
        </div>
      )}

      {/* PARTICIPANT LOG */}
      {activeTab === "participants" && (
        <div className="space-y-6">
          <Section title="Participant Log">
            <EditableTable
              columns={[
                { key: "id",        label: "ID",          width: "6%" },
                { key: "name",      label: "Name / Code", width: "15%" },
                { key: "date",      label: "Session Date",width: "12%" },
                { key: "format",    label: "Format",      width: "15%", type: "select", options: ["Remote", "In person", "Unmoderated"] },
                { key: "profile",   label: "Profile",     width: "20%" },
                { key: "completed", label: "Completed",   width: "12%", type: "select", options: ["Yes", "No", "Partial"] },
                { key: "notes",     label: "Notes",       width: "20%" },
              ]}
              initialRows={[
                { id: "P1", name: "Participant 1", date: "DD MMM YYYY", format: "Remote", profile: "Marketing manager, mid-level tech", completed: "Yes", notes: "Very vocal, gave detailed feedback" },
                { id: "P2", name: "Participant 2", date: "DD MMM YYYY", format: "Remote", profile: "Freelancer, power user", completed: "Yes", notes: "Completed all tasks quickly" },
                { id: "P3", name: "Participant 3", date: "DD MMM YYYY", format: "In person", profile: "SMB owner, low tech literacy", completed: "Partial", notes: "Struggled with task 3, ran out of time" },
              ]}
            />
          </Section>
        </div>
      )}

      {/* FINDINGS */}
      {activeTab === "findings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {SEVERITY_LEVELS.map((level) => {
              const count = findings.filter((f) => f.severity === level).length;
              return (
                <div key={level} className="rounded-lg border border-border bg-card p-4 text-center">
                  <StatusBadge status={level} />
                  <p className="text-2xl font-bold text-foreground mt-2">{count}</p>
                  <p className="text-xs text-muted-foreground">findings</p>
                </div>
              );
            })}
          </div>

          <Section title="Finding Log">
            <div className="space-y-3">
              {findings.map((f, i) => (
                <div key={f.id} className="border border-border rounded-lg p-4 bg-card group">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Participant(s)</p>
                        <input value={f.participant} onChange={(e) => updateFinding(f.id, "participant", e.target.value)} placeholder="P1, P2…" className="w-full bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-border focus:bg-input-background" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Screen / Area</p>
                        <input value={f.screen} onChange={(e) => updateFinding(f.id, "screen", e.target.value)} placeholder="Screen name…" className="w-full bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-border focus:bg-input-background" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Severity</p>
                        <select value={f.severity} onChange={(e) => updateFinding(f.id, "severity", e.target.value)} className="w-full bg-input-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none">
                          {SEVERITY_LEVELS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Theme</p>
                        <input value={f.theme} onChange={(e) => updateFinding(f.id, "theme", e.target.value)} placeholder="Navigation, Clarity…" className="w-full bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-border focus:bg-input-background" />
                      </div>
                      <div className="md:col-span-4">
                        <p className="text-xs text-muted-foreground mb-1">Observation</p>
                        <textarea value={f.observation} onChange={(e) => updateFinding(f.id, "observation", e.target.value)} rows={2} placeholder="What did the user do or say? Be specific and behavioural, not evaluative." className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none" />
                      </div>
                    </div>
                    <button onClick={() => removeFinding(f.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={addFinding} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-muted">
                <Plus size={13} /> Add finding
              </button>
            </div>
          </Section>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      {activeTab === "recommendations" && (
        <div className="space-y-6">
          {highFindings.length > 0 && (
            <Section title="Priority Recommendations (from High + Critical findings)">
              <div className="space-y-3">
                {highFindings.map((f, i) => (
                  <div key={f.id} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={f.severity} />
                      <span className="text-xs text-muted-foreground">{f.screen}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Finding: {f.observation}</p>
                    <Field label="Recommended solution">
                      <TextArea rows={2} placeholder="What change should be made? Be specific about the design fix." />
                    </Field>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <Field label="Effort">
                        <select className="w-full bg-input-background border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none">
                          {["Low", "Medium", "High"].map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </Field>
                      <Field label="Impact">
                        <select className="w-full bg-input-background border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none">
                          {["Low", "Medium", "High"].map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </Field>
                      <Field label="Owner">
                        <TextInput placeholder="Name or team" />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="All Recommendations">
            <EditableTable
              columns={[
                { key: "finding",     label: "Finding Ref",  width: "10%" },
                { key: "rec",         label: "Recommendation", width: "35%" },
                { key: "effort",      label: "Effort",       width: "10%", type: "select", options: ["Low", "Medium", "High"] },
                { key: "impact",      label: "Impact",       width: "10%", type: "select", options: ["Low", "Medium", "High"] },
                { key: "owner",       label: "Owner",        width: "15%" },
                { key: "status",      label: "Status",       width: "15%", type: "select", options: ["Not Started", "In Progress", "Complete"] },
              ]}
              initialRows={[
                { finding: "#2", rec: "Move 'Create new' to the top nav or add a persistent floating action button", effort: "Medium", impact: "High", owner: "Design", status: "Not Started" },
                { finding: "#3", rec: "Add a clear 'Cancel subscription' link in Billing settings, above the fold", effort: "Low", impact: "High", owner: "Design + Dev", status: "Not Started" },
              ]}
            />
          </Section>
        </div>
      )}
    </div>
  );
}

import { PageHeader, Section, Field, TextArea, TwoCol, EditableList, EditableTable } from "./shared";

export function ProjectCanvas() {
  return (
    <div>
      <PageHeader
        number="03"
        title="Project Canvas"
        description="A single-page strategic brief. Fill this out before any design work begins."
      />

      <div className="space-y-6">
        {/* Problem statement */}
        <Section title="Problem Statement">
          <Field
            label="What is the core problem you are solving?"
            hint="Be specific. Name who is affected, what they cannot do, and what the consequence is."
          >
            <TextArea
              rows={5}
              placeholder="[User type] cannot [do something] because [root cause], which results in [negative outcome]."
            />
          </Field>
        </Section>

        {/* Target users */}
        <Section title="Target Users">
          <Field label="Who are the primary users? Describe them clearly.">
            <TextArea
              rows={3}
              placeholder="Describe your primary user segment — demographics, technical literacy, goals, context of use."
            />
          </Field>
          <div className="mt-4">
            <EditableTable
              columns={[
                { key: "segment",  label: "User Segment", width: "30%" },
                { key: "desc",     label: "Description",  width: "45%" },
                { key: "priority", label: "Priority",     width: "25%", type: "select", options: ["Primary", "Secondary", "Edge Case"] },
              ]}
              initialRows={[
                { segment: "Segment A", desc: "Describe who they are and what they need", priority: "Primary" },
                { segment: "Segment B", desc: "Describe who they are and what they need", priority: "Secondary" },
              ]}
            />
          </div>
        </Section>

        {/* Goals & metrics */}
        <Section title="Goals & Success Metrics">
          <EditableTable
            columns={[
              { key: "goal",      label: "Goal",             width: "30%" },
              { key: "metric",    label: "Success Metric",   width: "30%" },
              { key: "baseline",  label: "Baseline",         width: "15%" },
              { key: "target",    label: "Target",           width: "15%" },
              { key: "priority",  label: "Priority",         width: "10%", type: "select", options: ["P0", "P1", "P2"] },
            ]}
            initialRows={[
              { goal: "Reduce onboarding drop-off", metric: "Activation rate (7-day)", baseline: "32%", target: "55%", priority: "P0" },
              { goal: "Improve feature discoverability", metric: "Feature adoption rate", baseline: "18%", target: "40%", priority: "P1" },
              { goal: "Decrease support tickets", metric: "Tickets per 100 users/mo", baseline: "12", target: "6", priority: "P1" },
            ]}
          />
        </Section>

        <TwoCol>
          {/* User needs */}
          <Section title="User Needs">
            <Field label="What do users need to accomplish?">
              <EditableList
                initialItems={[
                  "Understand the product value within minutes of signing up",
                  "Complete their first key action without guidance",
                  "Find help quickly when they get stuck",
                ]}
                placeholder="Add a user need…"
              />
            </Field>
          </Section>

          {/* Business needs */}
          <Section title="Business Needs">
            <Field label="What does the business require from this project?">
              <EditableList
                initialItems={[
                  "Increase free-to-paid conversion by 20%",
                  "Reduce churn in the first 30 days",
                  "Lower customer acquisition cost through better activation",
                ]}
                placeholder="Add a business need…"
              />
            </Field>
          </Section>
        </TwoCol>

        <TwoCol>
          {/* Constraints */}
          <Section title="Constraints">
            <Field label="What are the known limitations?">
              <EditableList
                initialItems={[
                  "No backend changes in Phase 1 — frontend only",
                  "Must support legacy browsers (Chrome 90+)",
                  "WCAG 2.1 AA accessibility required",
                  "Engineering capacity: 2 FE engineers for handoff sprint",
                ]}
                placeholder="Add a constraint…"
              />
            </Field>
          </Section>

          {/* Assumptions */}
          <Section title="Assumptions">
            <Field label="What are you assuming to be true?">
              <EditableList
                initialItems={[
                  "Users are primarily on desktop (>70% per analytics)",
                  "A/B testing infrastructure is in place",
                  "Stakeholder sign-off at end of each phase",
                  "Content strategy is handled separately",
                ]}
                placeholder="Add an assumption…"
              />
            </Field>
          </Section>
        </TwoCol>

        {/* Out of scope */}
        <Section title="Out of Scope">
          <Field label="What are you explicitly NOT solving in this project?">
            <EditableList
              initialItems={[
                "Mobile app redesign (separate project)",
                "Backend API changes",
                "Marketing site updates",
                "Admin panel or internal tooling",
              ]}
              placeholder="Add an out-of-scope item…"
            />
          </Field>
        </Section>

        {/* Risks */}
        <Section title="Risks">
          <EditableTable
            columns={[
              { key: "risk",        label: "Risk",        width: "35%" },
              { key: "likelihood",  label: "Likelihood",  width: "15%", type: "select", options: ["Low", "Medium", "High"] },
              { key: "impact",      label: "Impact",      width: "15%", type: "select", options: ["Low", "Medium", "High"] },
              { key: "mitigation",  label: "Mitigation",  width: "35%" },
            ]}
            initialRows={[
              { risk: "Stakeholder misalignment on scope", likelihood: "Medium", impact: "High", mitigation: "Weekly syncs + documented decisions" },
              { risk: "Engineering capacity constraints", likelihood: "High", impact: "Medium", mitigation: "Prioritise must-have flows only in MVP" },
              { risk: "Research timeline slippage", likelihood: "Low", impact: "Medium", mitigation: "Recruit participants 3 weeks in advance" },
            ]}
          />
        </Section>
      </div>
    </div>
  );
}

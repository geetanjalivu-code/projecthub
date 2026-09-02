import { PageHeader, Section, Field, TextInput, TextArea, TwoCol, EditableTable, EditableList } from "./shared";

const teamRows = [
  { name: "Designer Name", role: "Lead UX Designer", email: "email@company.com", availability: "Full-time" },
  { name: "PM Name", role: "Product Manager", email: "email@company.com", availability: "Part-time" },
  { name: "Dev Name", role: "Frontend Engineer", email: "email@company.com", availability: "50%" },
];

const linkRows = [
  { title: "Figma Design File", type: "Design", url: "https://figma.com/file/…" },
  { title: "Project Brief", type: "Document", url: "https://…" },
  { title: "Analytics Dashboard", type: "Data", url: "https://…" },
];

export function ProjectOverview() {
  return (
    <div>
      <PageHeader
        number="02"
        title="Project Overview"
        description="High-level summary of the project — objective, team, and key documents in one place."
      />

      <div className="space-y-6">
        {/* Objective */}
        <Section title="Objective">
          <Field label="What is this project trying to achieve?">
            <TextArea
              rows={5}
              placeholder="Describe the primary objective of this project. What problem does it solve? What is the desired outcome? Keep it to 3–5 sentences."
            />
          </Field>
        </Section>

        {/* Project meta */}
        <Section title="Project Meta">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Product / Feature">
              <TextInput placeholder="e.g. Onboarding Flow" />
            </Field>
            <Field label="Platform">
              <TextInput placeholder="Web, iOS, Android…" />
            </Field>
            <Field label="Domain">
              <TextInput placeholder="e.g. SaaS, E-Commerce, Healthcare" />
            </Field>
            <Field label="Start Date">
              <TextInput placeholder="DD MMM YYYY" />
            </Field>
            <Field label="End Date">
              <TextInput placeholder="DD MMM YYYY" />
            </Field>
            <Field label="Current Phase">
              <TextInput placeholder="e.g. Discovery, Wireframing…" />
            </Field>
            <Field label="Priority">
              <TextInput placeholder="P0 / P1 / P2" />
            </Field>
            <Field label="Budget / Resources">
              <TextInput placeholder="e.g. $X, 2 designers, 3 sprints" />
            </Field>
            <Field label="Version">
              <TextInput placeholder="v1.0" />
            </Field>
          </div>
        </Section>

        {/* Team members */}
        <Section title="Team Members">
          <EditableTable
            columns={[
              { key: "name",         label: "Name",         width: "25%" },
              { key: "role",         label: "Role",         width: "25%" },
              { key: "email",        label: "Email",        width: "30%" },
              { key: "availability", label: "Availability", width: "20%" },
            ]}
            initialRows={teamRows}
          />
        </Section>

        {/* Stakeholders */}
        <Section title="Stakeholders">
          <EditableTable
            columns={[
              { key: "name",    label: "Name",         width: "25%" },
              { key: "title",   label: "Title",        width: "25%" },
              { key: "type",    label: "Type",         width: "20%", type: "select", options: ["Approver", "Reviewer", "Informed", "Consulted"] },
              { key: "contact", label: "Contact",      width: "30%" },
            ]}
            initialRows={[
              { name: "Stakeholder Name", title: "VP of Product", type: "Approver", contact: "email@company.com" },
              { name: "Stakeholder Name", title: "Head of Design", type: "Reviewer", contact: "email@company.com" },
            ]}
          />
        </Section>

        {/* Related documents */}
        <Section title="Related Documents & Links">
          <EditableTable
            columns={[
              { key: "title", label: "Document Title", width: "40%" },
              { key: "type",  label: "Type",           width: "20%", type: "select", options: ["Design", "Research", "Document", "Data", "Prototype", "Spec", "Other"] },
              { key: "url",   label: "URL / Link",     width: "40%" },
            ]}
            initialRows={linkRows}
          />
        </Section>

        {/* Additional notes */}
        <Section title="Notes & Context">
          <Field label="Any additional background, history, or context the team should know">
            <TextArea
              rows={4}
              placeholder="Previous attempts, why this is being revisited, organizational context, technical constraints inherited from earlier decisions, etc."
            />
          </Field>
        </Section>
      </div>
    </div>
  );
}

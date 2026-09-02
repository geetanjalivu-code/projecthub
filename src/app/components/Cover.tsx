import { Field, TextInput, SelectInput } from "./shared";

export function Cover() {
  return (
    <div className="min-h-full flex flex-col">
      {/* Hero area */}
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center border-b border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">
          UX Design Project
        </p>

        {/* Editable project name */}
        <input
          type="text"
          defaultValue="Project Name"
          className="text-center bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full max-w-2xl"
          style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 }}
        />

        <div className="mt-3 w-full max-w-xl">
          <input
            type="text"
            defaultValue="A short description of what this project is about and the problem it solves."
            className="text-center w-full bg-transparent border-none outline-none text-sm text-muted-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Status pill */}
        <div className="mt-8">
          <select
            defaultValue="In Progress"
            className="appearance-none bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-full border-none focus:outline-none cursor-pointer"
          >
            {["Planning", "In Progress", "In Review", "Complete", "On Hold", "Blocked"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-border">
        {[
          { label: "Owner", placeholder: "Your Name" },
          { label: "Team", placeholder: "Design, Product, Eng" },
          { label: "Client", placeholder: "Client Name" },
          { label: "Version", placeholder: "v1.0" },
          { label: "Start Date", placeholder: "DD MMM YYYY" },
          { label: "Target Date", placeholder: "DD MMM YYYY" },
        ].map(({ label, placeholder }) => (
          <div key={label} className="p-5 bg-card">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {label}
            </p>
            <input
              type="text"
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        ))}
      </div>

      {/* Additional fields */}
      <div className="p-8 bg-muted/40 border-t border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Project Type">
            <SelectInput
              options={["Product Redesign", "New Feature", "MVP", "Research Sprint", "Design System", "Audit", "Other"]}
              defaultValue="Product Redesign"
            />
          </Field>
          <Field label="Platform">
            <TextInput placeholder="Web, iOS, Android…" />
          </Field>
          <Field label="Figma File Link">
            <TextInput placeholder="https://figma.com/file/…" />
          </Field>
          <Field label="Jira / Linear / Notion Link">
            <TextInput placeholder="https://…" />
          </Field>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-8 py-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          This is a living document. Keep it up to date throughout the project lifecycle.
        </p>
      </div>
    </div>
  );
}

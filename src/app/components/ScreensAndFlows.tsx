import { useState } from "react";
import { Plus, Trash2, Upload, Link, Layers, GitBranch, MapPin } from "lucide-react";
import { PageHeader, Section, Field, TextInput, TextArea, EditableTable } from "./shared";

type Annotation = {
  id: string;
  element: string;
  behavior: string;
  state: string;
  notes: string;
};

type Mockup = {
  id: string;
  name: string;
  screen: string;
  annotations: Annotation[];
};

const defaultMockups: Mockup[] = [
  {
    id: "1",
    name: "Onboarding — Step 1",
    screen: "",
    annotations: [
      { id: "1", element: "CTA Button — Get Started", behavior: "Navigates to Step 2. Disabled until email is entered.", state: "Default / Hover / Disabled", notes: "Primary button style. Full width on mobile." },
      { id: "2", element: "Email input", behavior: "Validates on blur. Shows inline error if format invalid.", state: "Default / Focus / Error / Success", notes: "Auto-focus on page load." },
    ],
  },
];

const flowRows = [
  { step: "1", screen: "Landing page", action: "User clicks 'Get Started'", transition: "Slide in →", destination: "Sign-up form", condition: "—" },
  { step: "2", screen: "Sign-up form", action: "Fills email + password, submits", transition: "Fade + redirect", destination: "Email verification", condition: "Valid form" },
  { step: "3", screen: "Email verification", action: "Opens email, clicks magic link", transition: "Redirect", destination: "Onboarding Step 1", condition: "Link not expired" },
  { step: "4", screen: "Onboarding Step 1", action: "Completes profile setup", transition: "Slide in →", destination: "Onboarding Step 2", condition: "All required fields filled" },
];

function MockupCard({ mockup, onRemove }: { mockup: Mockup; onRemove: () => void }) {
  const [name, setName] = useState(mockup.name);
  const [annotations, setAnnotations] = useState<Annotation[]>(mockup.annotations);
  const [figmaUrl, setFigmaUrl] = useState("");

  const addAnnotation = () =>
    setAnnotations([...annotations, { id: String(Date.now()), element: "", behavior: "", state: "", notes: "" }]);
  const removeAnnotation = (id: string) =>
    setAnnotations(annotations.filter((a) => a.id !== id));
  const updateAnnotation = (id: string, field: keyof Annotation, value: string) =>
    setAnnotations(annotations.map((a) => (a.id === id ? { ...a, [field]: value } : a)));

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-5 py-3 bg-muted border-b border-border flex items-center gap-3">
        <Layers size={14} className="text-muted-foreground" />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-foreground"
        />
        <button onClick={onRemove} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
          <Trash2 size={13} />
        </button>
      </div>

      <div className="p-5 bg-card">
        {/* Image area */}
        <div className="mb-5">
          {figmaUrl ? (
            <iframe
              src={figmaUrl}
              className="w-full h-96 rounded-lg border border-border"
              title={name}
            />
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-10 text-center">
              <Upload size={20} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-1">Upload mockup or embed Figma frame</p>
              <p className="text-xs text-muted-foreground mb-4">PNG, JPG, or Figma prototype embed URL</p>
              <input
                type="text"
                placeholder="Paste Figma embed URL…"
                onChange={(e) => setFigmaUrl(e.target.value)}
                className="w-full max-w-md mx-auto block bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Annotations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={13} className="text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Annotations</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide w-6">#</th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Element / Component</th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Behavior</th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">States</th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes / CSS / Specs</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {annotations.map((a, i) => (
                  <tr key={a.id} className="border-b border-border last:border-0 group">
                    <td className="px-2 py-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">{i + 1}</span>
                    </td>
                    {(["element", "behavior", "state", "notes"] as const).map((field) => (
                      <td key={field} className="px-2 py-1.5">
                        <input
                          type="text"
                          value={a[field]}
                          onChange={(e) => updateAnnotation(a.id, field, e.target.value)}
                          placeholder="—"
                          className="w-full bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-input-background"
                        />
                      </td>
                    ))}
                    <td className="px-1 py-1.5">
                      <button onClick={() => removeAnnotation(a.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={addAnnotation}
              className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-muted"
            >
              <Plus size={12} /> Add annotation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScreensAndFlows() {
  const [activeTab, setActiveTab] = useState<"mockups" | "flows">("mockups");
  const [mockups, setMockups] = useState(defaultMockups);

  const addMockup = () =>
    setMockups([...mockups, { id: String(Date.now()), name: `Screen ${mockups.length + 1}`, screen: "", annotations: [] }]);
  const removeMockup = (id: string) => setMockups(mockups.filter((m) => m.id !== id));

  return (
    <div>
      <PageHeader
        number="08"
        title="Screens & Flows"
        description="Document all screens with annotations, and map the user flows between them."
      />

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6 w-fit">
        {(["mockups", "flows"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "mockups" ? <Layers size={14} /> : <GitBranch size={14} />}
            {tab === "mockups" ? "Mockups" : "Flows"}
          </button>
        ))}
      </div>

      {activeTab === "mockups" && (
        <div className="space-y-6">
          {mockups.map((m) => (
            <MockupCard key={m.id} mockup={m} onRemove={() => removeMockup(m.id)} />
          ))}
          <button
            onClick={addMockup}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-4 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
          >
            <Plus size={16} /> Add screen / mockup
          </button>
        </div>
      )}

      {activeTab === "flows" && (
        <div className="space-y-6">
          {/* Figma prototype embed */}
          <Section title="Prototype / Flow Embed">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Link size={20} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-1">Embed Figma prototype or flow diagram</p>
              <input
                type="url"
                placeholder="https://www.figma.com/embed?embed_host=share&url=…"
                className="w-full max-w-lg bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none mx-auto block"
              />
            </div>
          </Section>

          {/* Flow table */}
          <Section title="Flow Step-by-Step">
            <EditableTable
              columns={[
                { key: "step",        label: "Step",        width: "6%" },
                { key: "screen",      label: "Screen",      width: "20%" },
                { key: "action",      label: "User Action", width: "28%" },
                { key: "transition",  label: "Transition",  width: "14%" },
                { key: "destination", label: "Destination", width: "20%" },
                { key: "condition",   label: "Condition",   width: "12%" },
              ]}
              initialRows={flowRows}
            />
          </Section>

          {/* Flow notes */}
          <Section title="Flow Notes">
            <Field label="Edge cases, error paths, and decision points">
              <TextArea
                rows={5}
                placeholder="Document alternate paths, error states, empty states, and decision points not captured in the step table above."
              />
            </Field>
          </Section>
        </div>
      )}
    </div>
  );
}

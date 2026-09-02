import { useState } from "react";
import { Plus, Trash2, ExternalLink, Link } from "lucide-react";
import { PageHeader, Section, Field, TextInput, TextArea, SelectInput, StatusBadge } from "./shared";

type PrototypeEntry = {
  id: string;
  name: string;
  url: string;
  version: string;
  status: string;
  platform: string;
  notes: string;
};

const defaultPrototypes: PrototypeEntry[] = [
  {
    id: "1",
    name: "Onboarding Redesign — v1",
    url: "",
    version: "v1.0",
    status: "In Review",
    platform: "Web",
    notes: "First iteration based on lo-fi wireframes. Test with 5 users.",
  },
];

function PrototypeCard({ entry, onRemove }: { entry: PrototypeEntry; onRemove: () => void }) {
  const [data, setData] = useState(entry);
  const update = (field: keyof PrototypeEntry, value: string) =>
    setData({ ...data, [field]: value });

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-5 py-3 bg-muted border-b border-border flex items-center gap-3">
        <Link size={14} className="text-muted-foreground" />
        <input
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-foreground"
        />
        <StatusBadge status={data.status} />
        <button onClick={onRemove} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
          <Trash2 size={13} />
        </button>
      </div>

      <div className="p-5 bg-card space-y-5">
        {/* Meta row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Version">
            <TextInput placeholder="v1.0" defaultValue={data.version} />
          </Field>
          <Field label="Platform">
            <SelectInput options={["Web", "iOS", "Android", "Cross-platform"]} defaultValue={data.platform} />
          </Field>
          <Field label="Status">
            <SelectInput
              options={["Planning", "In Progress", "In Review", "Complete", "Archived"]}
              defaultValue={data.status}
            />
          </Field>
          <Field label="Last Updated">
            <TextInput placeholder="DD MMM YYYY" />
          </Field>
        </div>

        {/* Figma URL */}
        <Field label="Figma Prototype URL">
          <div className="flex gap-2">
            <input
              type="url"
              value={data.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://www.figma.com/proto/…"
              className="flex-1 bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {data.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:opacity-90 transition-opacity"
              >
                <ExternalLink size={13} /> Open
              </a>
            )}
          </div>
        </Field>

        {/* Embed area */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Embed Preview</p>
          {data.url ? (
            <iframe
              src={data.url}
              className="w-full h-[540px] rounded-lg border border-border"
              title={data.name}
              allowFullScreen
            />
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg h-60 flex flex-col items-center justify-center text-muted-foreground">
              <Link size={22} className="mb-3" />
              <p className="text-sm">Paste a Figma embed URL above to preview the prototype here</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <Field label="Notes">
          <textarea
            value={data.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            placeholder="What should testers focus on? What interactions are not yet linked? What's the intended flow?"
            className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
          />
        </Field>
      </div>
    </div>
  );
}

export function Prototypes() {
  const [prototypes, setPrototypes] = useState(defaultPrototypes);

  const addPrototype = () =>
    setPrototypes([
      ...prototypes,
      { id: String(Date.now()), name: `Prototype v${prototypes.length + 1}`, url: "", version: `v${prototypes.length + 1}.0`, status: "In Progress", platform: "Web", notes: "" },
    ]);

  const removePrototype = (id: string) => setPrototypes(prototypes.filter((p) => p.id !== id));

  return (
    <div>
      <PageHeader
        number="09"
        title="Prototypes"
        description="Track all prototype versions with live embeds, status, and feedback notes."
      />

      <div className="space-y-6">
        {prototypes.map((p) => (
          <PrototypeCard key={p.id} entry={p} onRemove={() => removePrototype(p.id)} />
        ))}

        <button
          onClick={addPrototype}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-4 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
        >
          <Plus size={16} /> Add prototype version
        </button>
      </div>
    </div>
  );
}

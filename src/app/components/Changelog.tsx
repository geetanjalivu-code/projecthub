import { useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { PageHeader, Section, Field } from "./shared";

type ChangeType = "Added" | "Changed" | "Fixed" | "Removed" | "Research" | "Decision" | "Review";

const TYPE_STYLES: Record<ChangeType, string> = {
  "Added":    "bg-chart-2/15 text-chart-3 border-chart-2/30",
  "Changed":  "bg-primary/10 text-primary border-primary/20",
  "Fixed":    "bg-chart-2/20 text-chart-2 border-chart-2/40",
  "Removed":  "bg-destructive/10 text-destructive border-destructive/20",
  "Research": "bg-chart-4/15 text-chart-4 border-chart-4/30",
  "Decision": "bg-chart-5/15 text-chart-5 border-chart-5/30",
  "Review":   "bg-chart-1/15 text-chart-1 border-chart-1/30",
};

const CHANGE_TYPES: ChangeType[] = ["Added", "Changed", "Fixed", "Removed", "Research", "Decision", "Review"];

type ChangeEntry = {
  id: string;
  version: string;
  date: string;
  type: ChangeType;
  author: string;
  description: string;
  screen: string;
};

const defaultEntries: ChangeEntry[] = [
  { id: "1", version: "v1.3", date: "03 Aug 2026", type: "Changed", author: "Designer Name", description: "Revised onboarding Step 2 copy to clarify optional profile photo. Reduced cognitive load.", screen: "Onboarding / Step 2" },
  { id: "2", version: "v1.3", date: "03 Aug 2026", type: "Added", author: "Designer Name", description: "Added persistent 'Create new' button to top navigation bar.", screen: "Global / Nav" },
  { id: "3", version: "v1.2", date: "28 Jul 2026", type: "Research", author: "Designer Name", description: "Conducted 5-participant usability test on onboarding flow. 3 critical findings logged.", screen: "All" },
  { id: "4", version: "v1.2", date: "25 Jul 2026", type: "Decision", author: "PM Name", description: "Agreed to scope mobile to Phase 2. Web-first for current sprint.", screen: "—" },
  { id: "5", version: "v1.1", date: "18 Jul 2026", type: "Added", author: "Designer Name", description: "Published hi-fi wireframes for Screens 01–07 to Figma.", screen: "Onboarding" },
  { id: "6", version: "v1.1", date: "15 Jul 2026", type: "Review", author: "Stakeholder Name", description: "Stakeholder review completed. Two change requests: tone of CTA and colour of progress bar.", screen: "Onboarding" },
  { id: "7", version: "v1.0", date: "06 Jan 2026", type: "Added", author: "Designer Name", description: "Project workspace created. Initial canvas, team, and goals documented.", screen: "—" },
];

export function Changelog() {
  const [entries, setEntries] = useState<ChangeEntry[]>(defaultEntries);
  const [filterType, setFilterType] = useState<ChangeType | "All">("All");

  const addEntry = () => {
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const lastVersion = entries[0]?.version ?? "v1.0";
    setEntries([
      {
        id: String(Date.now()),
        version: lastVersion,
        date: today,
        type: "Changed",
        author: "",
        description: "",
        screen: "",
      },
      ...entries,
    ]);
  };

  const removeEntry = (id: string) => setEntries(entries.filter((e) => e.id !== id));
  const update = (id: string, field: keyof ChangeEntry, value: string) =>
    setEntries(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const filtered = filterType === "All" ? entries : entries.filter((e) => e.type === filterType);

  const versions = [...new Set(entries.map((e) => e.version))];

  return (
    <div>
      <PageHeader
        number="13"
        title="Changelog"
        description="A complete log of every design decision, change, and milestone. Add a row whenever something significant happens."
      />

      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterType("All")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all border ${filterType === "All" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-foreground"}`}
            >
              All ({entries.length})
            </button>
            {CHANGE_TYPES.map((t) => {
              const count = entries.filter((e) => e.type === t).length;
              if (count === 0) return null;
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all border ${filterType === t ? `${TYPE_STYLES[t]} border-current` : "bg-card text-muted-foreground border-border hover:border-foreground"}`}
                >
                  {t} ({count})
                </button>
              );
            })}
          </div>
          <button
            onClick={addEntry}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> Log change
          </button>
        </div>

        {/* Version groups */}
        {versions.map((version) => {
          const versionEntries = filtered.filter((e) => e.version === version);
          if (versionEntries.length === 0) return null;
          return (
            <div key={version}>
              <div className="flex items-center gap-3 mb-3">
                <Tag size={13} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{version}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2">
                {versionEntries.map((entry) => (
                  <div key={entry.id} className="border border-border rounded-lg bg-card p-4 group">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 pt-0.5">
                        <select
                          value={entry.type}
                          onChange={(e) => update(entry.id, "type", e.target.value)}
                          className={`text-xs font-medium px-2 py-0.5 rounded border appearance-none focus:outline-none cursor-pointer ${TYPE_STYLES[entry.type]}`}
                        >
                          {CHANGE_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-2 flex-wrap">
                          <input
                            value={entry.description}
                            onChange={(e) => update(entry.id, "description", e.target.value)}
                            placeholder="Describe the change…"
                            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
                          />
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Screen:</span>
                            <input value={entry.screen} onChange={(e) => update(entry.id, "screen", e.target.value)} placeholder="Screen name" className="text-xs text-muted-foreground bg-transparent border-none outline-none focus:bg-input-background focus:rounded focus:px-1.5 focus:py-0.5 focus:text-foreground" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Author:</span>
                            <input value={entry.author} onChange={(e) => update(entry.id, "author", e.target.value)} placeholder="Name" className="text-xs text-muted-foreground bg-transparent border-none outline-none focus:bg-input-background focus:rounded focus:px-1.5 focus:py-0.5 focus:text-foreground" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Date:</span>
                            <input value={entry.date} onChange={(e) => update(entry.id, "date", e.target.value)} placeholder="DD MMM YYYY" className="text-xs text-muted-foreground bg-transparent border-none outline-none focus:bg-input-background focus:rounded focus:px-1.5 focus:py-0.5 focus:text-foreground" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Version:</span>
                            <input value={entry.version} onChange={(e) => update(entry.id, "version", e.target.value)} placeholder="v1.0" className="text-xs text-muted-foreground bg-transparent border-none outline-none focus:bg-input-background focus:rounded focus:px-1.5 focus:py-0.5 focus:text-foreground w-14" />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

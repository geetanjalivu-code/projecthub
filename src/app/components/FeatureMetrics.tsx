import { useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PageHeader, Section, Field, TextArea } from "./shared";

type MetricRow = {
  id: string;
  feature: string;
  metric: string;
  frequency: string;
  baseline: string;
  target: string;
  current: string;
  owner: string;
  notes: string;
};

const FREQUENCIES = ["Daily", "Weekly", "Bi-weekly", "Monthly", "Per sprint", "Ad hoc"];

function getStatus(target: string, current: string): { label: string; color: string; icon: React.ReactNode } {
  const t = parseFloat(target.replace(/[^0-9.]/g, ""));
  const c = parseFloat(current.replace(/[^0-9.]/g, ""));
  if (isNaN(t) || isNaN(c) || !current.trim()) {
    return { label: "No data", color: "text-muted-foreground", icon: <Minus size={12} /> };
  }
  const pct = (c / t) * 100;
  if (pct >= 100) return { label: "On track", color: "text-chart-2", icon: <TrendingUp size={12} /> };
  if (pct >= 70) return { label: "At risk", color: "text-chart-1", icon: <Minus size={12} /> };
  return { label: "Off track", color: "text-destructive", icon: <TrendingDown size={12} /> };
}

const defaultRows: MetricRow[] = [
  { id: "1", feature: "Onboarding flow", metric: "7-day activation rate", frequency: "Weekly", baseline: "32%", target: "55%", current: "41%", owner: "Product", notes: "Improving after Step 2 copy change" },
  { id: "2", feature: "Feature discovery", metric: "Feature adoption (90-day)", frequency: "Monthly", baseline: "18%", target: "40%", current: "22%", owner: "Design", notes: "Tooltip added in last release" },
  { id: "3", feature: "Support self-serve", metric: "Support tickets / 100 users", frequency: "Weekly", baseline: "12", target: "6", current: "9", owner: "Product", notes: "FAQ updated, monitoring closely" },
  { id: "4", feature: "Subscription upgrade", metric: "Free-to-paid conversion rate", frequency: "Monthly", baseline: "4%", target: "8%", current: "5.2%", owner: "Growth", notes: "A/B test on pricing page live" },
];

export function FeatureMetrics() {
  const [rows, setRows] = useState<MetricRow[]>(defaultRows);

  const addRow = () =>
    setRows([...rows, { id: String(Date.now()), feature: "", metric: "", frequency: "Weekly", baseline: "", target: "", current: "", owner: "", notes: "" }]);

  const removeRow = (id: string) => setRows(rows.filter((r) => r.id !== id));

  const update = (id: string, field: keyof MetricRow, value: string) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const onTrack = rows.filter((r) => getStatus(r.target, r.current).label === "On track").length;
  const atRisk = rows.filter((r) => getStatus(r.target, r.current).label === "At risk").length;
  const offTrack = rows.filter((r) => getStatus(r.target, r.current).label === "Off track").length;

  return (
    <div>
      <PageHeader
        number="11"
        title="Feature Metrics"
        description="Track success metrics for each feature. Set a target, log the current value, and monitor status."
      />

      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Metrics", value: rows.length, color: "text-foreground", bg: "bg-card" },
            { label: "On Track", value: onTrack, color: "text-chart-2", bg: "bg-card" },
            { label: "At Risk", value: atRisk, color: "text-chart-1", bg: "bg-card" },
            { label: "Off Track", value: offTrack, color: "text-destructive", bg: "bg-card" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-lg border border-border ${bg} p-5`}>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Metrics table */}
        <Section title="Feature Metrics Table">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Feature", "Metric", "Frequency", "Baseline", "Target", "Current", "Status", "Owner", "Notes"].map((col) => (
                    <th key={col} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const status = getStatus(row.target, row.current);
                  return (
                    <tr key={row.id} className="border-b border-border last:border-0 group hover:bg-muted/30 transition-colors">
                      <td className="px-2 py-2">
                        <input value={row.feature} onChange={(e) => update(row.id, "feature", e.target.value)} placeholder="Feature name" className="w-full min-w-[120px] bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-input-background" />
                      </td>
                      <td className="px-2 py-2">
                        <input value={row.metric} onChange={(e) => update(row.id, "metric", e.target.value)} placeholder="Metric name" className="w-full min-w-[160px] bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-input-background" />
                      </td>
                      <td className="px-2 py-2">
                        <select value={row.frequency} onChange={(e) => update(row.id, "frequency", e.target.value)} className="bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-border focus:bg-input-background">
                          {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                        </select>
                      </td>
                      {(["baseline", "target", "current"] as const).map((field) => (
                        <td key={field} className="px-2 py-2">
                          <input value={row[field]} onChange={(e) => update(row.id, field, e.target.value)} placeholder="—" className="w-20 bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground text-center placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-input-background" />
                        </td>
                      ))}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <input value={row.owner} onChange={(e) => update(row.id, "owner", e.target.value)} placeholder="Owner" className="w-24 bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-input-background" />
                      </td>
                      <td className="px-2 py-2">
                        <input value={row.notes} onChange={(e) => update(row.id, "notes", e.target.value)} placeholder="Notes…" className="w-full min-w-[180px] bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-input-background" />
                      </td>
                      <td className="px-1 py-2">
                        <button onClick={() => removeRow(row.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button onClick={addRow} className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-muted">
              <Plus size={13} /> Add metric
            </button>
          </div>
        </Section>

        <Section title="Measurement Notes">
          <Field label="How are these metrics collected? What tools? Any caveats?">
            <TextArea rows={4} placeholder="e.g. Activation rate pulled from Mixpanel cohort analysis. Tickets pulled from Zendesk weekly. Note: numbers lag by 48h." />
          </Field>
        </Section>
      </div>
    </div>
  );
}

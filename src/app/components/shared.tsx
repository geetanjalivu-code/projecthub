import { useState } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";

// ── Section card ──────────────────────────────────────────────────────────────
export function Section({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
      <div className="px-5 py-3 border-b border-border bg-muted flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <div className="p-5 bg-card">{children}</div>
    </div>
  );
}

// ── Field: label + input ──────────────────────────────────────────────────────
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {hint && <p className="text-xs text-muted-foreground -mt-1">{hint}</p>}
      {children}
    </div>
  );
}

// ── Editable text input ───────────────────────────────────────────────────────
export function TextInput({
  placeholder,
  defaultValue,
  className = "",
}: {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={`w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
    />
  );
}

// ── Editable textarea ─────────────────────────────────────────────────────────
export function TextArea({
  placeholder,
  defaultValue,
  rows = 4,
  className = "",
}: {
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      rows={rows}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={`w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${className}`}
    />
  );
}

// ── Select dropdown ───────────────────────────────────────────────────────────
export function SelectInput({
  options,
  defaultValue,
}: {
  options: string[];
  defaultValue?: string;
}) {
  return (
    <div className="relative">
      <select
        defaultValue={defaultValue}
        className="w-full appearance-none bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-8"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  "Planning":     "bg-muted text-muted-foreground",
  "In Progress":  "bg-primary/10 text-primary",
  "In Review":    "bg-chart-2/20 text-chart-2",
  "Complete":     "bg-chart-2/30 text-chart-3",
  "On Hold":      "bg-chart-1/15 text-chart-1",
  "Blocked":      "bg-destructive/15 text-destructive",
  "At Risk":      "bg-chart-1/15 text-chart-1",
  "Not Started":  "bg-muted text-muted-foreground",
  "Low":          "bg-chart-2/20 text-chart-3",
  "Medium":       "bg-chart-1/15 text-chart-1",
  "High":         "bg-destructive/15 text-destructive",
  "Critical":     "bg-destructive text-destructive-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusStyles[status] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

// ── Editable table with add/remove rows ───────────────────────────────────────
export function EditableTable({
  columns,
  initialRows,
}: {
  columns: { key: string; label: string; width?: string; type?: "text" | "select" | "textarea"; options?: string[] }[];
  initialRows: Record<string, string>[];
}) {
  const [rows, setRows] = useState(initialRows);

  const addRow = () => {
    const empty: Record<string, string> = {};
    columns.forEach((c) => (empty[c.key] = ""));
    setRows([...rows, empty]);
  };

  const removeRow = (idx: number) => setRows(rows.filter((_, i) => i !== idx));

  const updateCell = (rowIdx: number, key: string, value: string) => {
    setRows(rows.map((r, i) => (i === rowIdx ? { ...r, [key]: value } : r)));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((c) => (
              <th
                key={c.key}
                className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                style={{ width: c.width }}
              >
                {c.label}
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border last:border-0 group">
              {columns.map((c) => (
                <td key={c.key} className="px-2 py-1.5">
                  {c.type === "select" ? (
                    <select
                      value={row[c.key]}
                      onChange={(e) => updateCell(ri, c.key, e.target.value)}
                      className="w-full bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-border"
                    >
                      {(c.options ?? []).map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={row[c.key]}
                      onChange={(e) => updateCell(ri, c.key, e.target.value)}
                      placeholder="—"
                      className="w-full bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-input-background"
                    />
                  )}
                </td>
              ))}
              <td className="px-1 py-1.5">
                <button
                  onClick={() => removeRow(ri)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-muted"
      >
        <Plus size={13} /> Add row
      </button>
    </div>
  );
}

// ── Bullet list with add/remove ───────────────────────────────────────────────
export function EditableList({
  initialItems,
  placeholder = "Add item…",
}: {
  initialItems: string[];
  placeholder?: string;
}) {
  const [items, setItems] = useState(initialItems);

  const update = (i: number, val: string) =>
    setItems(items.map((it, idx) => (idx === i ? val : it)));
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const add = () => setItems([...items, ""]);

  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0 mt-0.5" />
          <input
            type="text"
            value={it}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border border-transparent hover:border-border rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-input-background"
          />
          <button
            onClick={() => remove(i)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
      >
        <Plus size={12} /> Add item
      </button>
    </div>
  );
}

// ── Page header ───────────────────────────────────────────────────────────────
export function PageHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 pb-6 border-b border-border">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
        {number}
      </p>
      <h1 className="text-foreground mb-1">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

// ── Two-column grid ───────────────────────────────────────────────────────────
export function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

// ── Rating stars (1-5) ────────────────────────────────────────────────────────
export function StarRating({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-5 h-5 rounded text-xs transition-colors ${
            n <= value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

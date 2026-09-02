import { useState } from "react";
import { Plus, Trash2, ChevronRight, Link } from "lucide-react";
import { PageHeader, Section, Field, TextArea, EditableTable } from "./shared";

type SitemapNode = {
  id: string;
  label: string;
  children: SitemapNode[];
};

const defaultSitemap: SitemapNode[] = [
  {
    id: "1", label: "Home", children: [
      { id: "1.1", label: "Dashboard", children: [] },
      { id: "1.2", label: "Notifications", children: [] },
    ],
  },
  {
    id: "2", label: "Product", children: [
      {
        id: "2.1", label: "Catalogue", children: [
          { id: "2.1.1", label: "Product Detail", children: [] },
        ],
      },
      { id: "2.2", label: "Search Results", children: [] },
    ],
  },
  {
    id: "3", label: "Account", children: [
      { id: "3.1", label: "Profile", children: [] },
      { id: "3.2", label: "Settings", children: [] },
      { id: "3.3", label: "Billing", children: [] },
    ],
  },
  {
    id: "4", label: "Help", children: [
      { id: "4.1", label: "FAQ", children: [] },
      { id: "4.2", label: "Contact Support", children: [] },
    ],
  },
];

function SitemapNode({ node, depth = 0 }: { node: SitemapNode; depth?: number }) {
  const [label, setLabel] = useState(node.label);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={depth > 0 ? "ml-6 border-l border-border pl-4" : ""}>
      <div className="flex items-center gap-2 py-1 group">
        {node.children.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight size={12} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        )}
        {node.children.length === 0 && <span className="w-3" />}
        <div
          className={`px-2 py-0.5 rounded border text-xs font-medium ${
            depth === 0
              ? "border-primary bg-primary text-primary-foreground"
              : depth === 1
              ? "border-border bg-secondary text-secondary-foreground"
              : "border-border bg-card text-foreground"
          }`}
        >
          {node.id}
        </div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-foreground focus:bg-input-background focus:rounded focus:px-1 hover:bg-muted rounded px-1 py-0.5 flex-1 min-w-0"
        />
      </div>
      {expanded && node.children.length > 0 && (
        <div className="mt-0.5 mb-1">
          {node.children.map((child) => (
            <SitemapNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

const pageInventoryRows = [
  { id: "1",   page: "Home",            url: "/",              parent: "—",       description: "Main landing / dashboard", priority: "P0", status: "Exists" },
  { id: "1.1", page: "Dashboard",       url: "/dashboard",     parent: "Home",    description: "User's main workspace",    priority: "P0", status: "Redesign" },
  { id: "2",   page: "Product",         url: "/product",       parent: "—",       description: "Product catalogue root",   priority: "P0", status: "Exists" },
  { id: "2.1", page: "Catalogue",       url: "/product/list",  parent: "Product", description: "Filterable product grid",  priority: "P0", status: "Redesign" },
  { id: "3",   page: "Account",         url: "/account",       parent: "—",       description: "User account hub",         priority: "P1", status: "Exists" },
  { id: "3.3", page: "Billing",         url: "/account/billing", parent: "Account", description: "Subscription management", priority: "P1", status: "New" },
];

export function InformationArchitecture() {
  return (
    <div>
      <PageHeader
        number="06"
        title="Information Architecture"
        description="Sitemap, page hierarchy, and content inventory for the product."
      />

      <div className="space-y-6">
        {/* Figma embed option */}
        <Section title="Figma / FigJam Embed">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Link size={20} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">Embed Figma Sitemap or FigJam board</p>
            <p className="text-xs text-muted-foreground mb-4">Paste a Figma prototype or FigJam embed URL below</p>
            <input
              type="url"
              placeholder="https://www.figma.com/embed?embed_host=share&url=…"
              className="w-full max-w-lg bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mx-auto block"
            />
          </div>
        </Section>

        {/* Visual sitemap */}
        <Section title="Visual Sitemap">
          <p className="text-xs text-muted-foreground mb-4">
            Click node labels to rename. Add or remove nodes below.
          </p>
          <div className="bg-muted/40 rounded-lg p-5 border border-border space-y-1">
            {defaultSitemap.map((node) => (
              <SitemapNode key={node.id} node={node} depth={0} />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary inline-block" /> Level 1 (Primary nav)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-secondary border border-border inline-block" /> Level 2 (Sub-pages)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-card border border-border inline-block" /> Level 3 (Detail pages)</span>
          </div>
        </Section>

        {/* Page inventory */}
        <Section title="Page Inventory">
          <EditableTable
            columns={[
              { key: "id",          label: "ID",          width: "8%" },
              { key: "page",        label: "Page Name",   width: "18%" },
              { key: "url",         label: "URL Pattern", width: "20%" },
              { key: "parent",      label: "Parent",      width: "12%" },
              { key: "description", label: "Description", width: "24%" },
              { key: "priority",    label: "Priority",    width: "8%", type: "select", options: ["P0", "P1", "P2"] },
              { key: "status",      label: "Status",      width: "10%", type: "select", options: ["Exists", "Redesign", "New", "Deprecated"] },
            ]}
            initialRows={pageInventoryRows}
          />
        </Section>

        {/* User flows */}
        <Section title="Key User Flows">
          <p className="text-xs text-muted-foreground mb-4">
            List the primary journeys users take through the product.
          </p>
          <EditableTable
            columns={[
              { key: "flow",   label: "Flow Name",      width: "25%" },
              { key: "entry",  label: "Entry Point",    width: "20%" },
              { key: "exit",   label: "Exit / Goal",    width: "20%" },
              { key: "steps",  label: "Key Steps",      width: "25%" },
              { key: "status", label: "Status",         width: "10%", type: "select", options: ["Mapped", "In Progress", "To Do"] },
            ]}
            initialRows={[
              { flow: "New user onboarding",    entry: "Sign-up page",  exit: "First value moment", steps: "Sign up → Verify → Setup → Dashboard", status: "Mapped" },
              { flow: "Core task completion",   entry: "Dashboard",     exit: "Task saved",          steps: "Navigate → Create → Configure → Save", status: "In Progress" },
              { flow: "Subscription upgrade",   entry: "Settings > Billing", exit: "Payment confirmed", steps: "View plan → Compare → Checkout → Confirm", status: "To Do" },
            ]}
          />
        </Section>

        {/* Notes */}
        <Section title="IA Notes & Decisions">
          <Field label="Architecture decisions, rationale, open questions">
            <textarea
              rows={5}
              placeholder="Document key decisions made about the structure, any debates resolved, and open questions that need answers."
              className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </Field>
        </Section>
      </div>
    </div>
  );
}

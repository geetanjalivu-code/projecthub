import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Section, Field, TextArea } from "./shared";

const RATINGS = ["—", "✗", "△", "✓", "★"] as const;
type Rating = typeof RATINGS[number];

const RATING_STYLES: Record<Rating, string> = {
  "—": "text-muted-foreground",
  "✗": "text-destructive",
  "△": "text-chart-1",
  "✓": "text-chart-2",
  "★": "text-primary font-medium",
};

const defaultCompetitors = ["Your Product", "Competitor A", "Competitor B", "Competitor C"];

const defaultFeatures: { name: string; ratings: Rating[] }[] = [
  { name: "Onboarding flow", ratings: ["★", "✓", "△", "✗"] },
  { name: "Mobile responsiveness", ratings: ["✓", "★", "✓", "△"] },
  { name: "Pricing transparency", ratings: ["✓", "△", "✗", "✓"] },
  { name: "Collaboration tools", ratings: ["△", "✓", "★", "✗"] },
  { name: "Offline support", ratings: ["✗", "✗", "△", "✓"] },
  { name: "API / integrations", ratings: ["★", "✓", "△", "△"] },
];

export function CompetitiveAnalysis() {
  const [competitors, setCompetitors] = useState(defaultCompetitors);
  const [features, setFeatures] = useState(defaultFeatures);

  const addCompetitor = () =>
    setCompetitors([...competitors, `Competitor ${String.fromCharCode(65 + competitors.length - 1)}`]);
  const removeCompetitor = (idx: number) => {
    setCompetitors(competitors.filter((_, i) => i !== idx));
    setFeatures(features.map((f) => ({ ...f, ratings: f.ratings.filter((_, i) => i !== idx) })));
  };

  const addFeature = () =>
    setFeatures([...features, { name: "New feature", ratings: competitors.map(() => "—" as Rating) }]);
  const removeFeature = (idx: number) => setFeatures(features.filter((_, i) => i !== idx));

  const updateRating = (fi: number, ci: number) => {
    const current = features[fi].ratings[ci];
    const next = RATINGS[(RATINGS.indexOf(current) + 1) % RATINGS.length];
    setFeatures(
      features.map((f, i) =>
        i === fi ? { ...f, ratings: f.ratings.map((r, j) => (j === ci ? next : r)) } : f
      )
    );
  };

  const updateFeatureName = (fi: number, val: string) =>
    setFeatures(features.map((f, i) => (i === fi ? { ...f, name: val } : f)));

  const updateCompetitorName = (ci: number, val: string) =>
    setCompetitors(competitors.map((c, i) => (i === ci ? val : c)));

  return (
    <div>
      <PageHeader
        number="04"
        title="Competitive Analysis"
        description="Compare your product against competitors feature by feature. Click a cell to cycle through ratings."
      />

      <div className="space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 text-sm p-4 bg-muted rounded-lg border border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-2">Rating legend:</span>
          {(Object.entries(RATING_STYLES) as [Rating, string][]).map(([symbol, cls]) => (
            <span key={symbol} className="flex items-center gap-1.5">
              <span className={`${cls} text-base`}>{symbol}</span>
              <span className="text-xs text-muted-foreground">
                {symbol === "—" ? "Not assessed" : symbol === "✗" ? "Missing" : symbol === "△" ? "Partial" : symbol === "✓" ? "Present" : "Excellent"}
              </span>
            </span>
          ))}
          <span className="text-xs text-muted-foreground ml-auto italic">Click any cell to change rating</span>
        </div>

        {/* Comparison table */}
        <Section title="Feature Comparison Matrix">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-3 w-52 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Feature / Product
                  </th>
                  {competitors.map((c, ci) => (
                    <th key={ci} className="px-3 py-2 min-w-[130px]">
                      <div className="flex items-center gap-1.5 justify-center group">
                        <input
                          value={c}
                          onChange={(e) => updateCompetitorName(ci, e.target.value)}
                          className={`text-center text-sm font-medium bg-transparent border-none outline-none focus:bg-input-background focus:rounded px-1 w-full ${ci === 0 ? "text-primary" : "text-foreground"}`}
                        />
                        {ci > 0 && (
                          <button
                            onClick={() => removeCompetitor(ci)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {features.map((f, fi) => (
                  <tr key={fi} className="border-b border-border last:border-0 group hover:bg-muted/40 transition-colors">
                    <td className="px-2 py-2">
                      <input
                        value={f.name}
                        onChange={(e) => updateFeatureName(fi, e.target.value)}
                        className="w-full bg-transparent border-transparent hover:border-border border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-border focus:bg-input-background"
                      />
                    </td>
                    {f.ratings.map((r, ci) => (
                      <td key={ci} className="px-3 py-2 text-center">
                        <button
                          onClick={() => updateRating(fi, ci)}
                          className={`text-lg hover:scale-110 transition-transform ${RATING_STYLES[r]}`}
                          title="Click to change rating"
                        >
                          {r}
                        </button>
                      </td>
                    ))}
                    <td className="px-1 py-2">
                      <button
                        onClick={() => removeFeature(fi)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex gap-3 mt-4 pt-3 border-t border-border">
              <button
                onClick={addFeature}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-muted"
              >
                <Plus size={13} /> Add feature row
              </button>
              <button
                onClick={addCompetitor}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-muted"
              >
                <Plus size={13} /> Add competitor column
              </button>
            </div>
          </div>
        </Section>

        {/* Competitor profiles */}
        <Section title="Competitor Profiles">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitors.slice(1).map((c, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-card">
                <p className="text-sm font-medium text-foreground mb-3">{c}</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Strengths</p>
                    <textarea
                      rows={2}
                      placeholder="What do they do well?"
                      className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Weaknesses</p>
                    <textarea
                      rows={2}
                      placeholder="Where do they fall short?"
                      className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Insight summary */}
        <Section title="Key Insights & Opportunities">
          <Field label="What patterns emerged? Where is your differentiation opportunity?">
            <TextArea
              rows={5}
              placeholder="Summarise the most important findings from this analysis. What gaps exist in the market? Where are competitors weakest? What should your product double down on?"
            />
          </Field>
        </Section>
      </div>
    </div>
  );
}

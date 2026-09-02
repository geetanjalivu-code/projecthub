// ── Enums / unions ────────────────────────────────────────────────────────────

export type ProjectStatus = 'Not Started' | 'In Progress' | 'In Review' | 'Completed' | 'On Hold';
export type ProjectPhase  = 'Planning' | 'Discovery' | 'Research' | 'IA & Flows' | 'Wireframing' | 'UI Design' | 'Prototyping' | 'Testing' | 'Handoff';
export type ChangelogType = 'MAJOR' | 'MINOR' | 'PATCH' | 'INFO';

export interface Version { major: number; minor: number; patch: number; }
export const versionStr = (v: Version) => `v${v.major}.${v.minor}.${v.patch}`;

// ── Shared primitives ─────────────────────────────────────────────────────────

export interface ListItem   { id: string; text: string; }
export interface ActionItem { id: string; task: string; owner: string; dueDate: string; status: string; }

// ── Section 01 — Cover ────────────────────────────────────────────────────────

export interface CoverSection {
  tagline: string;
  projectType: string;
  platform: string;
  figmaLink: string;
  jiraLink: string;
  owner: string;
  team: string;
  client: string;
  startDate: string;
  targetDate: string;
}

// ── Section 02 — Overview ─────────────────────────────────────────────────────

export interface TeamMember { id: string; name: string; role: string; email: string; }
export interface DocumentLink { id: string; type: string; title: string; url: string; }
export interface OverviewSection {
  objective: string;
  teamMembers: TeamMember[];
  documents: DocumentLink[];
}

// ── Section 03 — Canvas ───────────────────────────────────────────────────────

export interface CanvasSection {
  problemStatement: string;
  targetUsersPrimary: string;
  targetUsersSecondary: string;
  goals: string;
  successMetrics: string;
  userNeeds: string;
  businessNeeds: string;
  constraintsTechnical: string;
  constraintsTimeline: string;
  constraintsBudget: string;
  assumptions: string;
  outOfScope: string;
  risks: string;
  qaStep: number;
  mode: 'qa' | 'canvas';
}

// ── Section 04 — Competitive Analysis ─────────────────────────────────────────

export type CompRating = 'strong' | 'partial' | 'missing' | '';
export interface Competitor { id: string; name: string; url: string; description: string; }
export interface CompFeature { id: string; name: string; }
export interface CompRatingEntry { featureId: string; competitorId: string; rating: CompRating; }
export interface CompetitiveSection {
  step: 1 | 2 | 3;
  competitors: Competitor[];
  features: CompFeature[];
  ratings: CompRatingEntry[];
  opportunities: string;
  problems: string;
}

// ── Section 05 — Research & Insights ─────────────────────────────────────────

export interface Persona {
  id: string; name: string; age: string; role: string;
  goals: ListItem[]; painPoints: ListItem[]; quote: string;
}
export interface ResearchFinding {
  id: string; description: string; task: string;
  type: string; severity: 'High' | 'Medium' | 'Low';
}
export interface PainPoint { id: string; text: string; severity: 'High' | 'Medium' | 'Low'; }
export interface JourneyMap {
  id: string; title: string; url: string; description: string;
}

export interface ResearchSection {
  activeTab: string;
  personas: Persona[];
  findings: ResearchFinding[];
  journeyMaps: JourneyMap[];
  painPoints: PainPoint[];
  opportunities: ListItem[];
}

// ── Section 06 — Information Architecture ─────────────────────────────────────

export interface IAPage {
  id: string; pageName: string; url: string; parent: string;
  priority: string; status: string; notes: string;
}
export interface IASection {
  activeTab: string;
  pages: IAPage[];
  embedUrl: string;
  iaType: string;
  description: string;
}

// ── Section 07 — Heuristic Audit ─────────────────────────────────────────────

export interface HeuristicScore {
  score: number; severity: number; issue: string; notes: string;
}
export interface HeuristicSection { scores: HeuristicScore[]; }

// ── Section 08 — Screens & Flows ─────────────────────────────────────────────

export interface Annotation {
  id: string; x: number; y: number;
  element: string; behavior: string; interactionType: string;
  states: string[]; developerNotes: string;
  css: Record<string, string>;
}
export interface Mockup {
  id: string; name: string; platform: string;
  status: string; version: string; figmaUrl: string;
  annotations: Annotation[];
  annotationMode: boolean;
}
export interface FlowStep {
  id: string; step: string; screen: string; action: string;
  transition: string; destination: string; condition: string;
}
export interface ScreensSection {
  activeTab: string;
  mockups: Mockup[];
  flowEmbedUrl: string;
  flowSteps: FlowStep[];
  flowNotes: string;
}

// ── Section 09 — Prototypes ───────────────────────────────────────────────────

export interface Prototype {
  id: string; name: string; version: string;
  status: string; description: string; embedUrl: string; lastUpdated: string;
}

// ── Section 10 — Usability Testing ───────────────────────────────────────────

export interface TestPlan {
  whatTesting: string; researchQuestions: string;
  participants: string; tasks: string; measuring: string;
  format: string; location: string; duration: string; submitted: boolean;
  qaStep: number;
}
export interface Participant {
  id: string; name: string; date: string; format: string;
  profile: string; completed: string; notes: string;
}
export interface UTFinding {
  id: string; ref: string; description: string; task: string;
  type: string; severity: string; screen: string;
}
export interface Recommendation {
  id: string; findingRef: string; recommendation: string;
  effort: string; impact: string; owner: string; status: string;
}
export interface TestingSection {
  activeTab: string;
  testPlan: TestPlan;
  participants: Participant[];
  todayParticipantAdded: string;
  findings: UTFinding[];
  recommendations: Recommendation[];
}

// ── Section 11 — Feature Metrics ──────────────────────────────────────────────

export interface MetricRow {
  id: string; feature: string; metric: string; frequency: string;
  baseline: string; target: string; current: string;
  owner: string; lowerIsBetter: boolean;
}
export interface MetricsSection { metrics: MetricRow[]; notes: string; }

// ── Section 12 — Meeting Notes ────────────────────────────────────────────────

export interface Meeting {
  id: string; title: string; date: string; type: string;
  agenda: ListItem[]; attendees: ListItem[];
  discussion: string; decisions: ListItem[];
  actionItems: ActionItem[];
  expanded: boolean;
}
export interface MeetingsSection { meetings: Meeting[]; todayMeetingAdded: string; }

// ── Changelog ─────────────────────────────────────────────────────────────────

export interface ChangelogEntry {
  id: string; type: ChangelogType; version: string;
  date: string; category: string; description: string; screens: string;
}

// ── Full Project ──────────────────────────────────────────────────────────────

export interface ProjectSections {
  cover:       CoverSection;
  overview:    OverviewSection;
  canvas:      CanvasSection;
  competitive: CompetitiveSection;
  research:    ResearchSection;
  ia:          IASection;
  heuristic:   HeuristicSection;
  screens:     ScreensSection;
  prototypes:  Prototype[];
  testing:     TestingSection;
  metrics:     MetricsSection;
  meetings:    MeetingsSection;
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  startDate: string;
  deadline: string;
  description: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  version: Version;
  createdAt: string;
  lastUpdated: string;
  progress: number;
  sections: ProjectSections;
  changelog: ChangelogEntry[];
}

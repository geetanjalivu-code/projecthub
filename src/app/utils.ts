import { Project, Version, ChangelogEntry, ChangelogType, ProjectSections, ProjectStatus, ProjectPhase } from './types';

// ── ID generator ──────────────────────────────────────────────────────────────
export const uid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);

// ── Date helpers ──────────────────────────────────────────────────────────────
export const nowISO  = () => new Date().toISOString();
export const nowLabel = () => new Date().toLocaleString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});
export const todayLabel = () => new Date().toLocaleDateString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
});
export const todayKey = () => new Date().toISOString().slice(0, 10);

// ── Version helpers ───────────────────────────────────────────────────────────
export const versionStr = (v: Version) => `v${v.major}.${v.minor}.${v.patch}`;

export function bumpVersion(v: Version, type: 'MAJOR' | 'MINOR' | 'PATCH'): Version {
  if (type === 'MAJOR') return { major: v.major + 1, minor: 0, patch: 0 };
  if (type === 'MINOR') return { major: v.major, minor: v.minor + 1, patch: 0 };
  return { major: v.major, minor: v.minor, patch: v.patch + 1 };
}

// ── Progress calculation ──────────────────────────────────────────────────────
export function calcProgress(p: Project): number {
  const s = p.sections;
  const filled: boolean[] = [
    // 01 Cover
    p.name.trim().length > 0 && p.phase !== 'Planning',
    // 02 Overview
    s.overview.objective.trim().length > 0 && s.overview.teamMembers.length >= 1,
    // 03 Canvas
    (() => {
      const cells = [
        s.canvas.problemStatement, s.canvas.targetUsersPrimary, s.canvas.goals,
        s.canvas.successMetrics, s.canvas.userNeeds, s.canvas.businessNeeds,
        s.canvas.assumptions, s.canvas.outOfScope, s.canvas.risks,
      ];
      return cells.filter(c => c.trim().length > 0).length >= 6;
    })(),
    // 04 Competitive
    s.competitive.competitors.length >= 1 && s.competitive.ratings.length >= 3,
    // 05 Research
    s.research.personas.length >= 1 || s.research.findings.length >= 1,
    // 06 IA
    s.ia.pages.length >= 3 || s.ia.embedUrl.trim().length > 0,
    // 07 Heuristic
    s.heuristic.scores.every(sc => sc.score > 0),
    // 08 Screens
    s.screens.mockups.length >= 1,
    // 09 Prototypes
    s.prototypes.length >= 1,
    // 10 Testing
    s.testing.testPlan.submitted && s.testing.participants.length >= 1,
    // 11 Metrics
    s.metrics.metrics.length >= 1 && s.metrics.metrics.some(m => m.target.trim().length > 0),
    // 12 Meetings
    s.meetings.meetings.length >= 1,
    // 13 Changelog — always counts
    true,
  ];
  return Math.round((filled.filter(Boolean).length / 13) * 100);
}

// ── Metric status ─────────────────────────────────────────────────────────────
export function metricStatus(target: string, current: string, lowerIsBetter: boolean) {
  const t = parseFloat(target.replace(/[^0-9.-]/g, ''));
  const c = parseFloat(current.replace(/[^0-9.-]/g, ''));
  if (!current.trim() || isNaN(t) || isNaN(c)) return { label: 'Not tracked', color: 'text-ifx-eng-400' };
  if (!lowerIsBetter) {
    const pct = (c / t) * 100;
    if (pct >= 100) return { label: 'On track',  color: 'text-success' };
    if (pct >= 80)  return { label: 'At risk',   color: 'text-warning' };
    return                 { label: 'Off track', color: 'text-destructive' };
  } else {
    if (c <= t)           return { label: 'On track',  color: 'text-success' };
    if (c <= t * 1.2)     return { label: 'At risk',   color: 'text-warning' };
    return                       { label: 'Off track', color: 'text-destructive' };
  }
}

// ── Default scaffolded sections for new project ───────────────────────────────
export function scaffoldSections(): ProjectSections {
  const h10 = Array.from({ length: 10 }, () => ({ score: 0, severity: 0, issue: '', notes: '' }));
  return {
    cover: {
      tagline: '', projectType: 'Product Redesign', platform: '',
      figmaLink: '', jiraLink: '', owner: '', team: '', client: '',
      startDate: '', targetDate: '',
    },
    overview:    { objective: '', teamMembers: [], documents: [] },
    canvas: {
      problemStatement: '', targetUsersPrimary: '', targetUsersSecondary: '',
      goals: '', successMetrics: '', userNeeds: '', businessNeeds: '',
      constraintsTechnical: '', constraintsTimeline: '', constraintsBudget: '',
      assumptions: '', outOfScope: '', risks: '', qaStep: 0, mode: 'qa',
    },
    competitive: { step: 1, competitors: [{ id: uid(), name: 'Our product', url: '', description: '' }], features: [], ratings: [], opportunities: '', problems: '' },
    research:    { activeTab: 'personas', personas: [], findings: [], journeyMaps: [], painPoints: [], opportunities: [] },
    ia:          { activeTab: 'inventory', pages: [], embedUrl: '', iaType: 'Sitemap', description: '' },
    heuristic:   { scores: h10 },
    screens:     { activeTab: 'mockups', mockups: [], flowEmbedUrl: '', flowSteps: [], flowNotes: '' },
    prototypes:  [],
    testing: {
      activeTab: 'plan',
      testPlan: { whatTesting: '', researchQuestions: '', participants: '', tasks: '', measuring: '', format: 'Moderated', location: 'Remote', duration: '', submitted: false, qaStep: 0 },
      participants: [], todayParticipantAdded: '',
      findings: [], recommendations: [],
    },
    metrics:     { metrics: [], notes: '' },
    meetings:    { meetings: [], todayMeetingAdded: '' },
  };
}

// ── Create new project ────────────────────────────────────────────────────────
export function createProject(params: {
  name: string; owner: string; startDate: string;
  deadline: string; description: string;
}): Project {
  const id = uid();
  const now = nowISO();
  const version: Version = { major: 1, minor: 0, patch: 0 };
  const sections = scaffoldSections();
  // pre-fill cover owner/startDate from project meta
  sections.cover.owner = params.owner;
  sections.cover.startDate = params.startDate;
  sections.cover.targetDate = params.deadline;

  const initEntry: ChangelogEntry = {
    id: uid(), type: 'INFO', version: versionStr(version),
    date: nowLabel(), category: 'Project',
    description: 'Project initialised — v1.0.0', screens: '—',
  };

  const project: Project = {
    id, name: params.name, owner: params.owner,
    startDate: params.startDate, deadline: params.deadline,
    description: params.description,
    status: 'Not Started', phase: 'Planning',
    version, createdAt: now, lastUpdated: now,
    progress: 0, sections, changelog: [initEntry],
  };
  project.progress = calcProgress(project);
  return project;
}

// ── localStorage I/O ──────────────────────────────────────────────────────────
const LEGACY_PROJECTS_KEY = 'uxHub_projects';
export const GUEST_PROJECTS_KEY = 'uxHub_guest_projects';
const RECOVERY_KEY = 'uxHub_recovery_projects';

export const userProjectsKey = (userId: string) => `uxHub_user_${userId}`;

function allAccountProjectIds(): Set<string> {
  const ids = new Set<string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith('uxHub_user_')) continue;
      for (const p of parseProjects(localStorage.getItem(k))) ids.add(p.id);
    }
  } catch { /* ignore */ }
  return ids;
}

function stripAccountCopies(list: Project[]): Project[] {
  const accountIds = allAccountProjectIds();
  return list.filter(p => !accountIds.has(p.id));
}

function looksLikeProject(v: unknown): v is Project {
  if (!v || typeof v !== 'object') return false;
  const p = v as Record<string, unknown>;
  return typeof p.id === 'string' && !!p.sections && typeof p.sections === 'object';
}

export function unwrapProject(v: unknown): Project | null {
  if (looksLikeProject(v)) return v;
  if (v && typeof v === 'object' && looksLikeProject((v as { data?: unknown }).data)) {
    return (v as { data: Project }).data;
  }
  return null;
}

export function parseProjects(raw: string | null): Project[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data.map(unwrapProject).filter((p): p is Project => !!p);
    const one = unwrapProject(data);
    return one ? [one] : [];
  } catch {
    return [];
  }
}

export function mergeProjectLists(...lists: Project[][]): Project[] {
  const map = new Map<string, Project>();
  for (const list of lists) {
    for (const p of list) {
      const existing = map.get(p.id);
      if (!existing || new Date(p.lastUpdated || 0).getTime() >= new Date(existing.lastUpdated || 0).getTime()) {
        map.set(p.id, p);
      }
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime(),
  );
}

export function loadUserProjectsLocal(userId: string): Project[] {
  return parseProjects(localStorage.getItem(userProjectsKey(userId)));
}

export const saveUserProjectsLocal = (userId: string, projects: Project[]) => {
  localStorage.setItem(userProjectsKey(userId), JSON.stringify(projects));
};

export function loadGuestProjects(): Project[] {
  try { localStorage.removeItem(RECOVERY_KEY); } catch { /* ignore */ }

  const legacy = parseProjects(localStorage.getItem(LEGACY_PROJECTS_KEY));
  const rawGuest = parseProjects(localStorage.getItem(GUEST_PROJECTS_KEY));
  const isolated = stripAccountCopies(mergeProjectLists(rawGuest, stripAccountCopies(legacy)));

  try { localStorage.removeItem(LEGACY_PROJECTS_KEY); } catch { /* ignore */ }
  if (isolated.length !== rawGuest.length || legacy.length > 0) {
    localStorage.setItem(GUEST_PROJECTS_KEY, JSON.stringify(isolated));
  }
  return isolated;
}

export const saveGuestProjects = (projects: Project[]) => {
  localStorage.setItem(GUEST_PROJECTS_KEY, JSON.stringify(stripAccountCopies(projects)));
};

export const clearGuestProjects = () => {
  localStorage.removeItem(GUEST_PROJECTS_KEY);
  localStorage.removeItem(LEGACY_PROJECTS_KEY);
  localStorage.removeItem(RECOVERY_KEY);
};

export function clearUserProjectCache(userId?: string) {
  if (userId) localStorage.removeItem(userProjectsKey(userId));
}

export const loadProjects = (): Project[] => loadGuestProjects();
export const saveProjects = (projects: Project[]) => saveGuestProjects(projects);

// ── Debounce ──────────────────────────────────────────────────────────────────
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

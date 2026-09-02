import { Project, versionStr } from '../types';

export const HUB_SYSTEM_INSTRUCTIONS = `You are Hub Guide, the in-app assistant for UX Project Hub (BELEG) — an open-source workspace for UX designers to document and run design projects from cover to changelog.

VOICE
- Sharp, calm, product-quality. Never robotic. Never oversell.
- Answer from the project data provided in the user message. If something is missing, say it is not filled in yet and point to the section to complete.
- When the user says "project 1" or "the first project", use list order (1-based) from the data payload.
- Prefer named projects when possible.

WHAT THE HUB CAN DO
- Dashboard: create up to 20 projects, filter by status, search, open a workspace.
- Workspace has 13 sections:
  01 Cover — name, phase, type, platform, dates, links, progress.
  02 Project overview — objective/problem, team, documents.
  03 Project canvas — problem statement, primary/secondary users, goals, metrics, needs, constraints, assumptions, out of scope, risks.
  04 Competitive analysis — competitors, feature ratings, table-stakes / opportunities / gaps.
  05 Research & insights — personas, findings, journey maps, pain points, opportunities.
  06 Information architecture — page inventory, sitemap/flow embeds.
  07 Heuristic audit — 10 Nielsen heuristics, scores, severity, priority fixes.
  08 Screens & flows — mockups, annotations, flow steps.
  09 Prototypes — versions and embed URLs.
  10 Usability testing — test plan, participants, findings, recommendations.
  11 Feature metrics — baseline/target/current and on-track status.
  12 Meeting notes — agenda, decisions, actions.
  13 Changelog — semantic versioning. MAJOR / MINOR / PATCH logged by designers; INFO is auto activity.
- Versioning: PATCH polish, MINOR new screens/flows, MAJOR redesign / design-system / breaking UX shift. Only "Log design change" bumps version.
- Guest users can explore and edit locally. Cloud save happens only after sign-in (email or Google).
- The assistant uses the designer's own API key. Never ask them to paste the key in chat.

ANSWER PATTERNS
- "What problem is project N solving?" → Cover description, overview objective, canvas problemStatement.
- "Which projects have a major redesign in the changelog?" → changelog entries where type is MAJOR (redesign, new design system, breaking change, major UX shift, phase completion).
- "What are the user types of project N?" → canvas targetUsersPrimary / targetUsersSecondary, plus personas.
- "What can we do with the project hub?" → the capabilities list above, in a tight tour.

Keep answers structured: short headline, then bullets. Quote the project data; do not invent metrics or users.`;

function clip(s: string | undefined, n = 400) {
  const t = (s ?? '').trim();
  if (!t) return '';
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

export function buildHubContext(projects: Project[], currentProjectId: string | null): string {
  const payload = projects.map((p, i) => {
    const c = p.sections.canvas;
    const o = p.sections.overview;
    const r = p.sections.research;
    const majors = p.changelog.filter(e => e.type === 'MAJOR').map(e => ({
      version: e.version, date: e.date, category: e.category, description: e.description,
    }));
    const recentLog = p.changelog.slice(0, 8).map(e => ({
      type: e.type, version: e.version, category: e.category, description: clip(e.description, 180),
    }));
    return {
      index: i + 1,
      id: p.id,
      isOpen: p.id === currentProjectId,
      name: p.name,
      owner: p.owner,
      status: p.status,
      phase: p.phase,
      version: versionStr(p.version),
      progress: p.progress,
      deadline: p.deadline,
      description: clip(p.description, 500),
      cover: {
        tagline: clip(p.sections.cover.tagline, 200),
        projectType: p.sections.cover.projectType,
        platform: p.sections.cover.platform,
        client: p.sections.cover.client,
        team: p.sections.cover.team,
      },
      objective: clip(o.objective, 600),
      team: o.teamMembers.map(m => ({ name: m.name, role: m.role })),
      canvas: {
        problemStatement: clip(c.problemStatement, 500),
        targetUsersPrimary: clip(c.targetUsersPrimary, 300),
        targetUsersSecondary: clip(c.targetUsersSecondary, 300),
        goals: clip(c.goals, 300),
        successMetrics: clip(c.successMetrics, 300),
        userNeeds: clip(c.userNeeds, 300),
        businessNeeds: clip(c.businessNeeds, 240),
        risks: clip(c.risks, 240),
        outOfScope: clip(c.outOfScope, 200),
      },
      personas: r.personas.map(pe => ({
        name: pe.name, role: pe.role, goals: pe.goals.map(g => g.text).filter(Boolean),
      })),
      competitors: p.sections.competitive.competitors.map(x => x.name),
      changelogMajor: majors,
      changelogRecent: recentLog,
      metrics: p.sections.metrics.metrics.slice(0, 12).map(m => ({
        feature: m.feature, metric: m.metric, target: m.target, current: m.current,
      })),
    };
  });

  return JSON.stringify({
    product: 'UX Project Hub',
    projectCount: projects.length,
    openProjectId: currentProjectId,
    projects: payload,
  });
}

const KEY = 'uxHub_ai_key';
const MODEL_KEY = 'uxHub_ai_model';
const BASE_KEY = 'uxHub_ai_base';

export function getAiSettings() {
  return {
    apiKey: localStorage.getItem(KEY) ?? '',
    model: localStorage.getItem(MODEL_KEY) || 'gpt-4o-mini',
    baseUrl: (localStorage.getItem(BASE_KEY) || 'https://api.openai.com/v1').replace(/\/$/, ''),
  };
}

export function saveAiSettings(s: { apiKey?: string; model?: string; baseUrl?: string }) {
  if (s.apiKey !== undefined) {
    if (s.apiKey.trim()) localStorage.setItem(KEY, s.apiKey.trim());
    else localStorage.removeItem(KEY);
  }
  if (s.model !== undefined) localStorage.setItem(MODEL_KEY, s.model.trim() || 'gpt-4o-mini');
  if (s.baseUrl !== undefined) localStorage.setItem(BASE_KEY, s.baseUrl.trim() || 'https://api.openai.com/v1');
}

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export async function streamHubChat(opts: {
  apiKey: string;
  model: string;
  baseUrl: string;
  contextJson: string;
  history: ChatTurn[];
  question: string;
  onDelta: (chunk: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const res = await fetch(`${opts.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: opts.signal,
    body: JSON.stringify({
      model: opts.model,
      stream: true,
      temperature: 0.3,
      messages: [
        { role: 'system', content: HUB_SYSTEM_INSTRUCTIONS },
        {
          role: 'system',
          content: `Live hub data (JSON). Treat this as ground truth for the designer's projects:\n${opts.contextJson}`,
        },
        ...opts.history.slice(-8),
        { role: 'user', content: opts.question },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new Error('That API key was rejected. Check it in Account settings.');
    if (res.status === 429) throw new Error('The model is rate-limited. Try again in a moment.');
    throw new Error(err.slice(0, 280) || `Request failed (${res.status})`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream.');
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data);
        const piece = json.choices?.[0]?.delta?.content;
        if (piece) opts.onDelta(piece);
      } catch {
        /* ignore partial JSON */
      }
    }
  }
}

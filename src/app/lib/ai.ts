import { Project, versionStr } from '../types';

export const HUB_SYSTEM_INSTRUCTIONS = `You are Hub Guide, the in-app assistant for Project Hub (BELEG) — an open-source workspace for UX designers to document and run design projects from cover to changelog.

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
    product: 'Project Hub',
    projectCount: projects.length,
    openProjectId: currentProjectId,
    projects: payload,
  });
}

export type AiProvider = 'openai' | 'gemini';

export type AiSettings = {
  apiKey: string;
  provider: AiProvider;
  model: string;
};

export const EMPTY_AI: AiSettings = { apiKey: '', provider: 'openai', model: 'gpt-4o-mini' };

const LEGACY_KEY = 'uxHub_ai_key';
const LEGACY_MODEL = 'uxHub_ai_model';
const LEGACY_PROVIDER = 'uxHub_ai_provider';
export const GUEST_AI_KEY = 'uxHub_guest_ai';

export const OPENAI_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4.1-mini',
  'gpt-4.1',
  'gpt-4.1-nano',
  'o4-mini',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
];

export const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
];

export function detectAiProvider(apiKey: string, explicit?: AiProvider | ''): AiProvider {
  const k = apiKey.trim();
  if (k.startsWith('AIza')) return 'gemini';
  if (k.startsWith('sk-')) return 'openai';
  if (explicit === 'gemini' || explicit === 'openai') return explicit;
  return 'openai';
}

export function normalizeAiSettings(partial: Partial<AiSettings> | null | undefined): AiSettings {
  const apiKey = (partial?.apiKey ?? '').trim();
  const provider = detectAiProvider(apiKey, partial?.provider ?? '');
  const fallback = provider === 'gemini' ? GEMINI_MODELS[0] : OPENAI_MODELS[0];
  return { apiKey, provider, model: (partial?.model || fallback).trim() || fallback };
}

function absorbLegacyAiIntoGuest() {
  try {
    const legacyKey = localStorage.getItem(LEGACY_KEY);
    if (legacyKey && !localStorage.getItem(GUEST_AI_KEY)) {
      saveGuestAi(normalizeAiSettings({
        apiKey: legacyKey,
        model: localStorage.getItem(LEGACY_MODEL) ?? undefined,
        provider: (localStorage.getItem(LEGACY_PROVIDER) as AiProvider | null) ?? undefined,
      }));
    }
    localStorage.removeItem(LEGACY_KEY);
    localStorage.removeItem(LEGACY_MODEL);
    localStorage.removeItem(LEGACY_PROVIDER);
  } catch { /* ignore */ }
}

export function loadGuestAi(): AiSettings {
  absorbLegacyAiIntoGuest();
  try {
    return normalizeAiSettings(JSON.parse(localStorage.getItem(GUEST_AI_KEY) ?? 'null'));
  } catch {
    return { ...EMPTY_AI };
  }
}

export function saveGuestAi(s: AiSettings) {
  localStorage.setItem(GUEST_AI_KEY, JSON.stringify(normalizeAiSettings(s)));
}

export function clearGuestAi() {
  absorbLegacyAiIntoGuest();
  localStorage.removeItem(GUEST_AI_KEY);
  localStorage.removeItem(LEGACY_KEY);
  localStorage.removeItem(LEGACY_MODEL);
  localStorage.removeItem(LEGACY_PROVIDER);
}

export function guestAiHasKey() {
  return !!loadGuestAi().apiKey;
}

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

function uniqueModels(preferred: string, catalog: string[]) {
  return [preferred, ...catalog.filter(m => m !== preferred)];
}

function toGeminiContents(history: ChatTurn[], question: string) {
  const contents = history.slice(-8).map(t => ({
    role: t.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: t.content }],
  }));
  contents.push({ role: 'user', parts: [{ text: question }] });
  return contents;
}

async function readSseText(res: Response, onDelta: (chunk: string) => void, pick: (json: any) => string | undefined) {
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream.');
  const decoder = new TextDecoder();
  let buffer = '';
  let got = false;
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
      if (!data || data === '[DONE]') continue;
      try {
        const piece = pick(JSON.parse(data));
        if (piece) { got = true; onDelta(piece); }
      } catch { /* ignore */ }
    }
  }
  return got;
}

async function openaiOnce(opts: {
  apiKey: string; model: string; contextJson: string; history: ChatTurn[]; question: string;
  onDelta: (c: string) => void; signal?: AbortSignal;
}) {
  const body = {
    model: opts.model,
    temperature: 0.3,
    messages: [
      { role: 'system', content: HUB_SYSTEM_INSTRUCTIONS },
      { role: 'system', content: `Live hub data (JSON). Treat this as ground truth for the designer's projects:\n${opts.contextJson}` },
      ...opts.history.slice(-8),
      { role: 'user', content: opts.question },
    ],
  };

  const streamRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.apiKey}`, 'Content-Type': 'application/json' },
    signal: opts.signal,
    body: JSON.stringify({ ...body, stream: true }),
  });
  if (streamRes.ok) {
    const got = await readSseText(streamRes, opts.onDelta, json => json.choices?.[0]?.delta?.content);
    if (got) return;
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.apiKey}`, 'Content-Type': 'application/json' },
    signal: opts.signal,
    body: JSON.stringify({ ...body, stream: false }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${opts.model}: ${err.slice(0, 180) || res.status}`);
  }
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${opts.model}: empty response`);
  opts.onDelta(text);
}

async function geminiOnce(opts: {
  apiKey: string; model: string; contextJson: string; history: ChatTurn[]; question: string;
  onDelta: (c: string) => void; signal?: AbortSignal;
}) {
  const payload = {
    systemInstruction: {
      parts: [{ text: `${HUB_SYSTEM_INSTRUCTIONS}\n\nLive hub data (JSON):\n${opts.contextJson}` }],
    },
    contents: toGeminiContents(opts.history, opts.question),
    generationConfig: { temperature: 0.3 },
  };

  const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(opts.apiKey)}`;
  const streamRes = await fetch(streamUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: opts.signal,
    body: JSON.stringify(payload),
  });
  if (streamRes.ok) {
    const got = await readSseText(streamRes, opts.onDelta, json => json.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') ?? '');
    if (got) return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: opts.signal,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${opts.model}: ${err.slice(0, 180) || res.status}`);
  }
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('');
  if (!text) throw new Error(`${opts.model}: empty response`);
  opts.onDelta(text);
}

export async function streamHubChat(opts: {
  apiKey: string;
  model: string;
  provider?: AiProvider;
  contextJson: string;
  history: ChatTurn[];
  question: string;
  onDelta: (chunk: string) => void;
  onModel?: (model: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const provider = detectAiProvider(opts.apiKey, opts.provider);
  const catalog = provider === 'gemini' ? GEMINI_MODELS : OPENAI_MODELS;
  const queue = uniqueModels(opts.model || catalog[0], catalog);
  const errors: string[] = [];

  for (const model of queue) {
    if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      opts.onModel?.(model);
      if (provider === 'gemini') await geminiOnce({ ...opts, model });
      else await openaiOnce({ ...opts, model });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
      errors.push((e as Error).message || String(e));
    }
  }

  const last = errors[errors.length - 1] || '';
  if (last.toLowerCase().includes('401') || last.toLowerCase().includes('api key') || last.toLowerCase().includes('invalid')) {
    throw new Error('That API key was rejected. Check the key and that it matches OpenAI (sk-…) or Gemini (AIza…).');
  }
  throw new Error(`Every ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} model failed. Last error: ${last.slice(0, 220)}`);
}

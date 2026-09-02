import { useEffect, useRef, useState } from 'react';
import { Bot, KeyRound, Send, Sparkles, X, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { buildHubContext, getAiSettings, saveAiSettings, streamHubChat, ChatTurn, detectAiProvider, OPENAI_MODELS, GEMINI_MODELS, AiProvider } from '../lib/ai';

const SUGGESTIONS = [
  'What can we do with the Project Hub?',
  'What problem is project 1 solving?',
  'Which projects have a MAJOR redesign in the changelog?',
  'What are the user types of project 2?',
];

export function AiAssistant() {
  const { projects, currentProjectId } = useStore();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [provider, setProvider] = useState<AiProvider>('openai');
  const [hasKey, setHasKey] = useState(false);
  const [activeModel, setActiveModel] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadSettings = () => {
    const s = getAiSettings();
    setApiKey(s.apiKey);
    setModel(s.model);
    setProvider(s.provider);
    setHasKey(!!s.apiKey);
  };

  useEffect(() => { loadSettings(); }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [turns, busy, open]);

  const persistKey = () => {
    const nextProvider = detectAiProvider(apiKey, provider);
    saveAiSettings({ apiKey, model, provider: nextProvider });
    setProvider(nextProvider);
    setHasKey(!!apiKey.trim());
    setSettingsOpen(false);
    setError(null);
  };

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    const s = getAiSettings();
    if (!s.apiKey) {
      setSettingsOpen(true);
      setError('Add your Gemini or OpenAI API key to talk to Hub Guide.');
      return;
    }
    setInput('');
    setError(null);
    setTurns(t => [...t, { role: 'user', content: q }, { role: 'assistant', content: '' }]);
    setBusy(true);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      await streamHubChat({
        apiKey: s.apiKey,
        model: s.model,
        provider: s.provider,
        contextJson: buildHubContext(projects, currentProjectId),
        history: turns,
        question: q,
        signal: ac.signal,
        onModel: setActiveModel,
        onDelta: chunk => {
          setTurns(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'assistant') next[next.length - 1] = { ...last, content: last.content + chunk };
            return next;
          });
        },
      });
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError((e as Error).message || 'The assistant could not complete that.');
      setTurns(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === 'assistant' && !last.content) return next.slice(0, -2).concat([{ role: 'user', content: q }]);
        return next;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-primary text-primary-foreground pl-3 pr-4 py-2.5 shadow-lg hover:bg-neutral-700 transition-all"
        style={{ fontWeight: 600 }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
          <Sparkles size={14} />
        </span>
        Hub Guide
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:p-5 p-0">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:max-w-[420px] h-[min(720px,100vh)] sm:h-[min(720px,calc(100vh-2.5rem))] bg-card border border-border sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden">
            <header className="px-4 py-3 border-b border-border flex items-center gap-3 bg-muted/50">
              <span className="flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground">
                <Bot size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground" style={{ fontWeight: 650 }}>Hub Guide</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {currentProjectId
                    ? `Knows all ${projects.length} projects · focused on the open workspace`
                    : `Knows ${projects.length} project${projects.length === 1 ? '' : 's'} in this hub`}
                </p>
              </div>
              <button onClick={() => setSettingsOpen(s => !s)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="API key">
                <KeyRound size={15} />
              </button>
              <button onClick={() => setTurns([])} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="Clear chat">
                <Trash2 size={15} />
              </button>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={16} />
              </button>
            </header>

            {settingsOpen && (
              <div className="px-4 py-3 border-b border-border bg-muted/40 space-y-2">
                <p className="text-xs text-muted-foreground">Your key stays in this browser. Gemini keys usually start with AIza; OpenAI with sk-. Preferred model is tried first; others are used automatically until one works.</p>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => {
                    setApiKey(e.target.value);
                    setProvider(detectAiProvider(e.target.value, provider));
                  }}
                  placeholder="Gemini AIza… or OpenAI sk-…"
                  className="w-full border border-border bg-card px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select value={provider} onChange={e => {
                    const p = e.target.value as AiProvider;
                    setProvider(p);
                    setModel(p === 'gemini' ? GEMINI_MODELS[0] : OPENAI_MODELS[0]);
                  }} className="border border-border bg-card px-3 py-2 text-xs">
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Gemini</option>
                  </select>
                  <select value={model} onChange={e => setModel(e.target.value)}
                    className="border border-border bg-card px-3 py-2 text-xs">
                    {(provider === 'gemini' ? GEMINI_MODELS : OPENAI_MODELS).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <button onClick={persistKey} className="w-full py-2 bg-primary text-primary-foreground text-xs" style={{ fontWeight: 600 }}>
                  Save key
                </button>
              </div>
            )}

            <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {turns.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground" style={{ fontWeight: 600 }}>Ask anything about this hub.</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    I read your live project data — problems, users, changelog majors, research, metrics. Add an API key once, then talk.
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => ask(s)}
                        className="text-left text-xs px-3 py-2 border border-border hover:border-primary hover:bg-muted transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {turns.map((t, i) => (
                <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                    t.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    {t.content || (busy && i === turns.length - 1 ? `Trying ${activeModel || 'models'}…` : '')}
                  </div>
                </div>
              ))}
              {error && <p className="text-xs text-destructive">{error}</p>}
              {!hasKey && turns.length === 0 && (
                <p className="text-[11px] text-muted-foreground">No key saved yet — open the key icon to add yours.</p>
              )}
            </div>

            <form
              className="p-3 border-t border-border flex gap-2"
              onSubmit={e => { e.preventDefault(); ask(input); }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about a project…"
                className="flex-1 border border-border px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="submit" disabled={busy || !input.trim()}
                className="h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-neutral-700">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, ArrowLeft, BookOpen,
  FileText, Map, BarChart2, Users, GitBranch, Search,
  Layers, Cpu, FlaskConical, TrendingUp, MessageSquare, Clock, Plus,
} from 'lucide-react';
import { useStore } from './store';
import { InfineonLogo, Avatar, BtnPrimary } from './components/ui';
import { NotificationsPanel } from './components/NotificationsPanel';
import { ProfileModal } from './components/ProfileModal';
import { GuestBanner } from './components/GuestBanner';
import { versionStr } from './utils';
import { useAuth } from './auth/AuthProvider';

import { S01Cover }       from './sections/s01Cover';
import { S02Overview }    from './sections/s02Overview';
import { S03Canvas }      from './sections/s03Canvas';
import { S04Competitive } from './sections/s04Competitive';
import { S05Research }    from './sections/s05Research';
import { S06IA }          from './sections/s06IA';
import { S07Heuristic }   from './sections/s07Heuristic';
import { S08Screens }     from './sections/s08Screens';
import { S09Prototypes }  from './sections/s09Prototypes';
import { S10Testing }     from './sections/s10Testing';
import { S11Metrics }     from './sections/s11Metrics';
import { S12Meetings }    from './sections/s12Meetings';
import { S13Changelog }   from './sections/s13Changelog';
import { LogChangeModal } from './components/LogChangeModal';

const SECTIONS = [
  { id: 'cover',       num: '01', label: 'Cover',                    icon: BookOpen },
  { id: 'overview',    num: '02', label: 'Project overview',         icon: FileText },
  { id: 'canvas',      num: '03', label: 'Project canvas',           icon: Map },
  { id: 'competitive', num: '04', label: 'Competitive analysis',     icon: BarChart2 },
  { id: 'research',    num: '05', label: 'Research & insights',      icon: Users },
  { id: 'ia',          num: '06', label: 'Information architecture', icon: GitBranch },
  { id: 'heuristic',   num: '07', label: 'Heuristic audit',          icon: Search },
  { id: 'screens',     num: '08', label: 'Screens & flows',          icon: Layers },
  { id: 'prototypes',  num: '09', label: 'Prototypes',               icon: Cpu },
  { id: 'testing',     num: '10', label: 'Usability testing',        icon: FlaskConical },
  { id: 'metrics',     num: '11', label: 'Feature metrics',          icon: TrendingUp },
  { id: 'meetings',    num: '12', label: 'Meeting notes',            icon: MessageSquare },
  { id: 'changelog',   num: '13', label: 'Changelog',                icon: Clock },
];

const SECTION_COMPONENTS: Record<string, React.FC> = {
  cover:       S01Cover,
  overview:    S02Overview,
  canvas:      S03Canvas,
  competitive: S04Competitive,
  research:    S05Research,
  ia:          S06IA,
  heuristic:   S07Heuristic,
  screens:     S08Screens,
  prototypes:  S09Prototypes,
  testing:     S10Testing,
  metrics:     S11Metrics,
  meetings:    S12Meetings,
  changelog:   S13Changelog,
};

export function Workspace() {
  const { currentProject, closeProject, updateMeta, saving } = useStore();
  const { profile, isGuest, exitGuest } = useAuth();
  const [sectionId, setSection]     = useState('cover');
  const [sidebarOpen, setSidebar]   = useState(true);
  const [showLogModal, setLogModal] = useState(false);
  const [showProfile, setProfile]   = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]     = useState('');

  if (!currentProject) return null;

  const idx   = SECTIONS.findIndex(s => s.id === sectionId);
  const prev  = SECTIONS[idx - 1];
  const next  = SECTIONS[idx + 1];
  const cur   = SECTIONS[idx];

  const SectionComp = SECTION_COMPONENTS[sectionId] ?? (() => null);

  const progress = currentProject.progress;
  const progressMsg = progress === 100
    ? { text: 'All sections complete ✓', cls: 'text-success' }
    : progress > 70
    ? { text: 'Great progress!', cls: 'text-success' }
    : progress >= 30
    ? { text: 'Keep going, good progress.', cls: 'text-warning' }
    : { text: 'Fill in every section before moving to the next phase.', cls: 'text-destructive' };

  const STATUS_OPTIONS = ['Not Started', 'In Progress', 'In Review', 'Completed', 'On Hold'];

  const displayName = profile?.display_name || currentProject.owner || (isGuest ? 'Guest' : 'Me');

  return (
    <div className="flex h-screen overflow-hidden bg-background hub-page-glow">

      {/* Sidebar */}
      <aside className={`shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ${sidebarOpen ? 'w-64' : 'w-14'}`}>

        {/* Logo — click to collapse/expand */}
        <div className="flex items-center px-4 py-4 border-b border-sidebar-border">
          <button
            onClick={() => setSidebar(o => !o)}
            className="flex items-center gap-2.5 hover:opacity-70 transition-opacity text-left w-full"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <InfineonLogo collapsed={!sidebarOpen} />
          </button>
        </div>

        {/* Back to hub */}
        <div className="px-2 py-2 border-b border-sidebar-border">
          <button onClick={closeProject}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all">
            <ArrowLeft size={14} className="shrink-0" />
            {sidebarOpen && 'Back to Hub'}
          </button>
        </div>

        {/* Section nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {sidebarOpen && (
            <p className="px-3 py-1 text-xs text-muted-foreground uppercase tracking-widest mb-1">Project sections</p>
          )}
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const active = s.id === sectionId;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                title={!sidebarOpen ? `${s.num} — ${s.label}` : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-all mb-0.5 border-l-2 ${
                  active
                    ? 'bg-[--sidebar-active-bg] text-[--sidebar-active-fg] border-primary pl-[calc(0.75rem-2px)]'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent border-transparent'
                }`}>
                <Icon size={14} className="shrink-0" />
                {sidebarOpen && (
                  <span className="flex items-center gap-2 truncate min-w-0">
                    <span className="text-xs opacity-50 shrink-0">{s.num}</span>
                    <span className="truncate">{s.label}</span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Progress */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-sidebar-border">
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground" style={{ fontWeight: 600 }}>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <p className={`text-xs ${progressMsg.cls}`}>{progressMsg.text}</p>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="shrink-0 flex items-center gap-3 px-5 py-2.5 border-b border-border glass-header">
          {/* Project name (editable) */}
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={() => { if (nameInput.trim()) updateMeta({ name: nameInput.trim() }); setEditingName(false); }}
              onKeyDown={e => {
                if (e.key === 'Enter') { if (nameInput.trim()) updateMeta({ name: nameInput.trim() }); setEditingName(false); }
                if (e.key === 'Escape') setEditingName(false);
              }}
              className="text-sm border border-primary rounded px-2 py-1 text-foreground bg-input-background focus:outline-none"
            />
          ) : (
            <button
              onClick={() => { setNameInput(currentProject.name); setEditingName(true); }}
              className="text-sm text-foreground hover:text-primary transition-colors truncate max-w-xs"
              style={{ fontWeight: 600 }}
              title="Click to edit project name"
            >
              {currentProject.name}
            </button>
          )}

          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-xs text-muted-foreground truncate">{cur?.num} — {cur?.label}</span>

          {/* Prev / Next */}
          <div className="flex items-center gap-1 ml-2">
            <button onClick={() => prev && setSection(prev.id)} disabled={!prev}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-muted-foreground w-10 text-center">{idx + 1} / {SECTIONS.length}</span>
            <button onClick={() => next && setSection(next.id)} disabled={!next}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Save indicator */}
          <span className={`text-xs ml-1 transition-opacity ${saving ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
            {saving ? 'Saving…' : 'All changes saved'}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {/* Status select */}
            <select
              value={currentProject.status}
              onChange={e => updateMeta({ status: e.target.value as any })}
              className="appearance-none border border-border rounded px-3 py-1 text-xs bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary cursor-pointer"
            >
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>

            {/* Version badge */}
            <span className="text-xs px-2 py-1 bg-muted border border-border rounded text-muted-foreground">
              {versionStr(currentProject.version)}
            </span>

            {/* Log change */}
            <BtnPrimary onClick={() => setLogModal(true)} className="py-1.5 text-xs">
              <Plus size={12} /> Log change
            </BtnPrimary>

            <NotificationsPanel />

            <button
              onClick={() => setProfile(true)}
              className="rounded-full hover:opacity-80 transition-opacity"
              title="Account settings"
            >
              <Avatar name={displayName} size={7} />
            </button>
          </div>
        </header>

        {/* Section content */}
        <main className="flex-1 overflow-y-auto pb-16">
          <div className={`${sectionId === 'cover' ? '' : 'px-6 md:px-10 py-7 max-w-5xl mx-auto w-full'}`}>
            {sectionId !== 'cover' && (
              <div className="mb-4">
                <GuestBanner onSignIn={exitGuest} />
              </div>
            )}
            {sectionId === 'cover' && (
              <div className="px-6 md:px-10 pt-6 max-w-5xl mx-auto w-full">
                <GuestBanner onSignIn={exitGuest} />
              </div>
            )}
            <SectionComp />
          </div>
        </main>

        {/* Bottom nav */}
        <footer className="shrink-0 border-t border-border bg-card/90 px-5 py-2 flex items-center justify-between">
          <button onClick={() => prev && setSection(prev.id)} disabled={!prev}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">
            <ChevronLeft size={13} />
            <span className="hidden sm:block text-xs">{prev?.num} {prev?.label}</span>
          </button>

          <div className="flex gap-1">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)} title={s.label}
                className={`h-1.5 rounded-full transition-all ${s.id === sectionId ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground'}`} />
            ))}
          </div>

          <button onClick={() => next && setSection(next.id)} disabled={!next}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">
            <span className="hidden sm:block text-xs">{next?.num} {next?.label}</span>
            <ChevronRight size={13} />
          </button>
        </footer>
      </div>

      {showLogModal && <LogChangeModal onClose={() => setLogModal(false)} />}
      {showProfile  && <ProfileModal  onClose={() => setProfile(false)} />}
    </div>
  );
}

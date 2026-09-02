import { useState } from 'react';
import { Plus, Search, Trash2, FolderOpen, LayoutGrid, CircleDot, PauseCircle, CheckCircle2, Eye } from 'lucide-react';
import { useStore } from './store';
import { useAuth } from './auth/AuthProvider';
import { InfineonLogo, StatusPill, BtnPrimary, Avatar } from './components/ui';
import { NotificationsPanel } from './components/NotificationsPanel';
import { ProfileModal } from './components/ProfileModal';
import { NewProjectModal } from './components/NewProjectModal';
import { GuestBanner } from './components/GuestBanner';
import { Project, ProjectStatus } from './types';

type Filter = 'All' | ProjectStatus;

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ProjectCard({ project, onOpen, onDelete }: { project: Project; onOpen: () => void; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all group relative"
      onClick={onOpen}
    >
      <button
        onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
      >
        <Trash2 size={13} />
      </button>

      {confirmDelete && (
        <div className="absolute inset-0 bg-card/95 rounded-2xl z-10 flex flex-col items-center justify-center gap-3 p-4"
          onClick={e => e.stopPropagation()}>
          <p className="text-sm text-foreground text-center">Delete &ldquo;{project.name}&rdquo;?<br /><span className="text-xs text-muted-foreground">This cannot be undone.</span></p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-sm border border-border rounded-xl hover:bg-muted transition-colors">Cancel</button>
            <button onClick={onDelete} className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-xl hover:opacity-90 transition-opacity">Delete</button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0 pr-6">
          <p className="text-primary uppercase tracking-[0.16em] mb-1" style={{ fontSize: '0.625rem', fontWeight: 600 }}>{project.phase}</p>
          <h3 className="text-foreground truncate">{project.name}</h3>
        </div>
        <StatusPill status={project.status} />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs text-foreground" style={{ fontWeight: 600 }}>{project.progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: `${project.progress}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Avatar name={project.owner || '?'} size={5} />
          <span>{project.owner || 'No owner'}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {project.deadline && <span>Due {new Date(project.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>}
          <span>{relativeTime(project.lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { projects, openProject, deleteProject } = useStore();
  const { profile, isGuest, exitGuest } = useAuth();
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setProfile] = useState(false);

  const atMax = projects.length >= 20;

  const filtered = projects.filter(p => {
    const f = filter !== 'All' ? p.status === filter : true;
    const s = search ? p.name.toLowerCase().includes(search.toLowerCase()) : true;
    return f && s;
  });

  const stats = [
    { label: 'Total', value: projects.length, hint: 'In this hub' },
    { label: 'Active', value: projects.filter(p => p.status === 'In Progress').length, hint: 'In progress' },
    { label: 'In Review', value: projects.filter(p => p.status === 'In Review').length, hint: 'Awaiting critique' },
    { label: 'Completed', value: projects.filter(p => p.status === 'Completed').length, hint: 'Shipped' },
    { label: 'On Hold', value: projects.filter(p => p.status === 'On Hold').length, hint: 'Paused' },
  ];

  const nav: { id: Filter; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'All', label: 'All projects', icon: LayoutGrid },
    { id: 'In Progress', label: 'Active', icon: CircleDot },
    { id: 'In Review', label: 'In review', icon: Eye },
    { id: 'Completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'On Hold', label: 'On hold', icon: PauseCircle },
  ];

  const FILTERS: Filter[] = ['All', 'Not Started', 'In Progress', 'In Review', 'Completed', 'On Hold'];
  const displayName = profile?.display_name || profile?.email || (isGuest ? 'Guest' : 'Me');

  return (
    <div className="flex h-screen overflow-hidden bg-background hub-page-glow">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="px-4 py-5 border-b border-sidebar-border">
          <InfineonLogo />
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(item => {
            const Icon = item.icon;
            const active = filter === item.id || (item.id === 'All' && !['In Progress', 'In Review', 'Completed', 'On Hold'].includes(filter));
            const count = item.id === 'All' ? projects.length : projects.filter(p => p.status === item.id).length;
            return (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left border-l-2 transition-all ${
                  active
                    ? 'bg-[--sidebar-active-bg] text-[--sidebar-active-fg] border-primary'
                    : 'border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                }`}
                style={{ fontWeight: active ? 600 : 500 }}
              >
                <Icon size={15} className="shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="text-[11px] opacity-60">{count}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border text-[11px] text-muted-foreground space-y-1">
          <p>Terms · Imprint · Privacy</p>
          <p>© 1999–2026 Infineon Technologies AG</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 flex items-center gap-4 px-6 py-3 border-b border-border glass-header">
          <div className="flex-1 min-w-0 md:hidden">
            <InfineonLogo />
          </div>
          <div className="hidden md:block flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">UX Project Hub</p>
            <p className="text-sm text-foreground" style={{ fontWeight: 600 }}>
              {isGuest ? 'Guest session' : `Hello, ${displayName.split(' ')[0]}`}
            </p>
          </div>
          <NotificationsPanel />
          <button
            onClick={() => setProfile(true)}
            className="rounded-full hover:opacity-80 transition-opacity"
            title="Account settings"
          >
            <Avatar name={displayName} size={8} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 pb-24">
          <GuestBanner onSignIn={exitGuest} />

          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h2 className="text-foreground">All projects</h2>
              <p className="text-sm text-muted-foreground">Manage and track your UX design projects — cover to changelog.</p>
            </div>
            <BtnPrimary
              onClick={() => !atMax && setShowModal(true)}
              disabled={atMax}
            >
              <Plus size={15} /> New project
            </BtnPrimary>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {stats.map(({ label, value, hint }) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <p className="text-2xl text-foreground tracking-tight" style={{ fontWeight: 650 }}>{value}</p>
                <p className="text-xs text-foreground mt-1" style={{ fontWeight: 600 }}>{label}</p>
                <p className="text-[11px] text-muted-foreground">{hint}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded text-xs transition-all border ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search projects…"
                className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary w-56"
              />
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onOpen={() => openProject(p.id)}
                  onDelete={() => deleteProject(p.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-card border border-dashed border-border rounded-2xl">
              <FolderOpen size={48} className="text-primary/30 mb-4" />
              <h3 className="text-foreground mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm">Create a workspace and the thirteen sections scaffold themselves — versioned from v1.0.0.</p>
              <BtnPrimary onClick={() => setShowModal(true)}><Plus size={15} /> Create new project</BtnPrimary>
            </div>
          )}
        </main>
      </div>

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}
      {showProfile && <ProfileModal onClose={() => setProfile(false)} />}
    </div>
  );
}

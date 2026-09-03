import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { Project, ChangelogEntry } from './types';
import {
  saveGuestProjects, saveUserProjectsLocal, loadUserProjectsLocal, loadGuestProjects,
  clearGuestProjects, mergeProjectLists, unwrapProject, uid,
  calcProgress, nowISO, nowLabel, versionStr, bumpVersion,
} from './utils';
import { supabase, isSupabaseConfigured, DbProject } from './lib/supabase';
import { useAuth } from './auth/AuthProvider';
import { ImportGuestModal } from './components/ImportGuestModal';
import { guestAiHasKey, clearGuestAi } from './lib/ai';
import { importGuestAiToUser } from './ai/AiSettingsProvider';

interface StoreState {
  projects: Project[];
  currentProjectId: string | null;
  saving: boolean;
}

type Action =
  | { type: 'RESET' }
  | { type: 'SET_PROJECTS'; projects: Project[] }
  | { type: 'ADD_PROJECT'; project: Project }
  | { type: 'DELETE_PROJECT'; id: string }
  | { type: 'SET_CURRENT'; id: string | null }
  | { type: 'UPDATE_PROJECT'; project: Project }
  | { type: 'SET_SAVING'; saving: boolean };

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'RESET':          return { projects: [], currentProjectId: null, saving: false };
    case 'SET_PROJECTS':   return { ...state, projects: action.projects };
    case 'ADD_PROJECT':    return { ...state, projects: [...state.projects, action.project] };
    case 'DELETE_PROJECT': return { ...state, projects: state.projects.filter(p => p.id !== action.id), currentProjectId: state.currentProjectId === action.id ? null : state.currentProjectId };
    case 'SET_CURRENT':    return { ...state, currentProjectId: action.id };
    case 'UPDATE_PROJECT': return { ...state, projects: state.projects.map(p => p.id === action.project.id ? action.project : p) };
    case 'SET_SAVING':     return { ...state, saving: action.saving };
    default: return state;
  }
}

interface StoreCtx {
  projects: Project[];
  currentProjectId: string | null;
  saving: boolean;
  currentProject: Project | null;
  addProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  openProject: (id: string) => void;
  closeProject: () => void;
  updateSection: (sectionKey: keyof Project['sections'], data: unknown) => void;
  updateMeta: (fields: Partial<Pick<Project, 'name' | 'status' | 'phase'>>) => void;
  bumpProjectVersion: (type: 'MAJOR' | 'MINOR' | 'PATCH', category: string, description: string, screens: string) => void;
  addChangelogEntry: (entry: Omit<ChangelogEntry, 'id'>) => void;
}

const Ctx = createContext<StoreCtx>(null!);
export const useStore = () => useContext(Ctx);

async function loadFromSupabase(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('Failed to load projects from cloud:', error.message);
    return [];
  }
  if (!data) return [];
  return (data as DbProject[])
    .map(row => unwrapProject(row.data) ?? unwrapProject(row))
    .filter((p): p is Project => !!p);
}

async function upsertToSupabase(userId: string, projects: Project[]): Promise<string | null> {
  if (projects.length === 0) return null;
  const rows = projects.map(p => ({
    id: p.id,
    user_id: userId,
    workspace_id: null,
    data: p as unknown,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('projects').upsert(rows, { onConflict: 'user_id,id' });
  if (error) {
    console.error('Failed to save projects to cloud:', error.message);
    return error.message;
  }
  return null;
}

async function deleteFromSupabase(userId: string, projectId: string) {
  await supabase.from('projects').delete().eq('id', projectId).eq('user_id', userId);
}

const empty: StoreState = { projects: [], currentProjectId: null, saving: false };

let flushPending: () => Promise<void> = async () => {};
export async function flushHubSaves() {
  await flushPending();
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isGuest, passwordRecovery } = useAuth();
  const [state, dispatch] = useReducer(reducer, empty);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [guestImport, setGuestImport] = useState<{ projects: Project[]; hasAi: boolean } | null>(null);

  const userRef = useRef(user);
  const authRef = useRef(isAuthenticated);
  const guestRef = useRef(isGuest);
  const wasAuth = useRef(false);
  const projectsRef = useRef<Project[]>([]);
  const remoteRef = useRef<Project[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { authRef.current = isAuthenticated; }, [isAuthenticated]);
  useEffect(() => { guestRef.current = isGuest; }, [isGuest]);
  useEffect(() => { projectsRef.current = state.projects; }, [state.projects]);

  const writeNow = useCallback(async (projects: Project[]) => {
    const u = userRef.current;
    if (authRef.current && u) {
      saveUserProjectsLocal(u.id, projects);
      if (isSupabaseConfigured) {
        const err = await upsertToSupabase(u.id, projects);
        setSaveError(err);
      }
    } else if (guestRef.current) {
      saveGuestProjects(projects);
    }
  }, []);

  const persist = useCallback((projects: Project[]) => {
    projectsRef.current = projects;
    dispatch({ type: 'SET_SAVING', saving: true });
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await writeNow(projects);
      dispatch({ type: 'SET_SAVING', saving: false });
    }, 400);
  }, [writeNow]);

  const flush = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    await writeNow(projectsRef.current);
    dispatch({ type: 'SET_SAVING', saving: false });
  }, [writeNow]);

  useEffect(() => {
    flushPending = flush;
    const onHide = () => { if (document.hidden) void flush(); };
    window.addEventListener('beforeunload', () => { void flush(); });
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [flush]);

  useEffect(() => {
    if (passwordRecovery) return;

    if (wasAuth.current && !isAuthenticated) {
      dispatch({ type: 'RESET' });
      remoteRef.current = [];
      projectsRef.current = [];
      setSaveError(null);
      setGuestImport(null);
    }
    wasAuth.current = isAuthenticated;

    if (isAuthenticated && user) {
      const mine = loadUserProjectsLocal(user.id);
      projectsRef.current = mine;
      dispatch({ type: 'SET_PROJECTS', projects: mine });

      const guestLeft = loadGuestProjects();
      const hasAi = guestAiHasKey();
      if (guestLeft.length > 0 || hasAi) {
        setGuestImport({ projects: guestLeft, hasAi });
      } else {
        setGuestImport(null);
      }

      if (!isSupabaseConfigured) return;

      void loadFromSupabase(user.id).then(async remote => {
        const merged = mergeProjectLists(mine, remote);
        remoteRef.current = merged;
        projectsRef.current = merged;
        dispatch({ type: 'SET_PROJECTS', projects: merged });
        saveUserProjectsLocal(user.id, merged);
        const err = await upsertToSupabase(user.id, merged);
        setSaveError(err);
      });
      return;
    }

    if (isGuest) {
      const local = loadGuestProjects();
      projectsRef.current = local;
      dispatch({ type: 'SET_PROJECTS', projects: local });
      dispatch({ type: 'SET_CURRENT', id: null });
      return;
    }

    dispatch({ type: 'RESET' });
    projectsRef.current = [];
  }, [user?.id, isAuthenticated, isGuest, passwordRecovery]);

  const currentProject = state.projects.find(p => p.id === state.currentProjectId) ?? null;

  const touch = useCallback((p: Project): Project => ({
    ...p,
    lastUpdated: nowISO(),
    progress: calcProgress(p),
  }), []);

  const addProject = useCallback((p: Project) => {
    const updated = [...projectsRef.current, p];
    dispatch({ type: 'ADD_PROJECT', project: p });
    persist(updated);
    dispatch({ type: 'SET_CURRENT', id: p.id });
  }, [persist]);

  const deleteProject = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_PROJECT', id });
    const updated = projectsRef.current.filter(p => p.id !== id);
    projectsRef.current = updated;
    const u = userRef.current;
    if (authRef.current && u) {
      saveUserProjectsLocal(u.id, updated);
      if (isSupabaseConfigured) await deleteFromSupabase(u.id, id);
    } else if (guestRef.current) {
      saveGuestProjects(updated);
    }
  }, []);

  const openProject  = useCallback((id: string) => dispatch({ type: 'SET_CURRENT', id }), []);
  const closeProject = useCallback(() => dispatch({ type: 'SET_CURRENT', id: null }), []);

  const updateSection = useCallback((sectionKey: keyof Project['sections'], data: unknown) => {
    const current = projectsRef.current.find(p => p.id === state.currentProjectId);
    if (!current) return;
    const updated = touch({
      ...current,
      sections: { ...current.sections, [sectionKey]: data },
    });
    dispatch({ type: 'UPDATE_PROJECT', project: updated });
    persist(projectsRef.current.map(p => p.id === updated.id ? updated : p));
  }, [state.currentProjectId, touch, persist]);

  const updateMeta = useCallback((fields: Partial<Pick<Project, 'name' | 'status' | 'phase'>>) => {
    const currentProject = projectsRef.current.find(p => p.id === state.currentProjectId);
    if (!currentProject) return;
    const prev = { status: currentProject.status, phase: currentProject.phase };
    const updated = touch({ ...currentProject, ...fields });

    const entries: Omit<ChangelogEntry, 'id'>[] = [];
    if (fields.status && fields.status !== prev.status) {
      entries.push({ type: 'INFO', version: versionStr(updated.version), date: nowLabel(), category: 'Status', description: `Status changed from ${prev.status} to ${fields.status}`, screens: '—' });
    }
    if (fields.phase && fields.phase !== prev.phase) {
      entries.push({ type: 'INFO', version: versionStr(updated.version), date: nowLabel(), category: 'Phase', description: `Phase updated to ${fields.phase}`, screens: '—' });
    }
    const withLog: Project = {
      ...updated,
      changelog: [...entries.map(e => ({ ...e, id: uid() })), ...updated.changelog],
    };
    dispatch({ type: 'UPDATE_PROJECT', project: withLog });
    persist(projectsRef.current.map(p => p.id === withLog.id ? withLog : p));
  }, [state.currentProjectId, touch, persist]);

  const bumpProjectVersion = useCallback((type: 'MAJOR' | 'MINOR' | 'PATCH', category: string, description: string, screens: string) => {
    const currentProject = projectsRef.current.find(p => p.id === state.currentProjectId);
    if (!currentProject) return;
    const newVersion = bumpVersion(currentProject.version, type);
    const entry: ChangelogEntry = {
      id: uid(), type, version: versionStr(newVersion),
      date: nowLabel(), category, description, screens,
    };
    const updated = touch({
      ...currentProject,
      version: newVersion,
      changelog: [entry, ...currentProject.changelog],
    });
    dispatch({ type: 'UPDATE_PROJECT', project: updated });
    persist(projectsRef.current.map(p => p.id === updated.id ? updated : p));
  }, [state.currentProjectId, touch, persist]);

  const addChangelogEntry = useCallback((entry: Omit<ChangelogEntry, 'id'>) => {
    const currentProject = projectsRef.current.find(p => p.id === state.currentProjectId);
    if (!currentProject) return;
    const full: ChangelogEntry = { ...entry, id: uid() };
    const updated = touch({ ...currentProject, changelog: [full, ...currentProject.changelog] });
    dispatch({ type: 'UPDATE_PROJECT', project: updated });
    persist(projectsRef.current.map(p => p.id === updated.id ? updated : p));
  }, [state.currentProjectId, touch, persist]);

  return (
    <Ctx.Provider value={{
      projects: state.projects,
      currentProjectId: state.currentProjectId,
      saving: state.saving,
      currentProject,
      addProject, deleteProject, openProject, closeProject,
      updateSection, updateMeta, bumpProjectVersion, addChangelogEntry,
    }}>
      {children}
      {saveError && (
        <div className="fixed top-3 left-1/2 z-[80] max-w-lg -translate-x-1/2 rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-900 shadow-sm">
          Could not save to the cloud: {saveError}. Your work is still kept on this device.
        </div>
      )}
      {guestImport && (
        <ImportGuestModal
          projectCount={guestImport.projects.length}
          hasAiKey={guestImport.hasAi}
          onImport={async () => {
            if (!user) { setGuestImport(null); return; }
            const cloned = guestImport.projects.map(p => ({ ...p, id: uid() }));
            const merged = mergeProjectLists(cloned, projectsRef.current);
            remoteRef.current = merged;
            projectsRef.current = merged;
            dispatch({ type: 'SET_PROJECTS', projects: merged });
            saveUserProjectsLocal(user.id, merged);
            if (cloned.length > 0 && isSupabaseConfigured) {
              const err = await upsertToSupabase(user.id, merged);
              setSaveError(err);
            }
            if (guestImport.hasAi) {
              await importGuestAiToUser(user.id);
              window.dispatchEvent(new Event('uxhub:ai-reload'));
            }
            clearGuestProjects();
            clearGuestAi();
            setGuestImport(null);
          }}
          onLater={() => setGuestImport(null)}
          onDiscard={() => {
            clearGuestProjects();
            clearGuestAi();
            setGuestImport(null);
          }}
        />
      )}
    </Ctx.Provider>
  );
}

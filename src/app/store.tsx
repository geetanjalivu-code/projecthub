import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { Project, ChangelogEntry } from './types';
import {
  loadGuestProjects, saveGuestProjects, clearGuestProjects, clearUserProjectCache,
  calcProgress, nowISO, nowLabel, uid, versionStr, bumpVersion,
} from './utils';
import { supabase, isSupabaseConfigured, DbProject } from './lib/supabase';
import { useAuth } from './auth/AuthProvider';
import { ImportGuestModal } from './components/ImportGuestModal';

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
  if (error || !data) return [];
  return (data as DbProject[]).map(row => row.data as Project).filter(Boolean);
}

async function upsertToSupabase(userId: string, projects: Project[]) {
  if (projects.length === 0) return;
  const rows = projects.map(p => ({
    id: p.id,
    user_id: userId,
    workspace_id: null,
    data: p as unknown,
    updated_at: new Date().toISOString(),
  }));
  await supabase.from('projects').upsert(rows);
}

async function deleteFromSupabase(userId: string, projectId: string) {
  await supabase.from('projects').delete().eq('id', projectId).eq('user_id', userId);
}

const empty: StoreState = { projects: [], currentProjectId: null, saving: false };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isGuest, passwordRecovery } = useAuth();
  const [state, dispatch] = useReducer(reducer, empty);
  const [guestImport, setGuestImport] = useState<Project[] | null>(null);

  const userRef = useRef(user);
  const authRef = useRef(isAuthenticated);
  const guestRef = useRef(isGuest);
  const wasAuth = useRef(false);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { authRef.current = isAuthenticated; }, [isAuthenticated]);
  useEffect(() => { guestRef.current = isGuest; }, [isGuest]);

  const remoteRef = useRef<Project[]>([]);

  useEffect(() => {
    if (passwordRecovery) return;

    if (wasAuth.current && !isAuthenticated) {
      dispatch({ type: 'RESET' });
      clearUserProjectCache();
      remoteRef.current = [];
    }
    wasAuth.current = isAuthenticated;

    if (isAuthenticated && user) {
      dispatch({ type: 'RESET' });
      clearUserProjectCache();
      const pendingGuest = loadGuestProjects();
      loadFromSupabase(user.id).then(remote => {
        remoteRef.current = remote;
        dispatch({ type: 'SET_PROJECTS', projects: remote });
        if (pendingGuest.length > 0) setGuestImport(pendingGuest);
      });
      return;
    }

    if (isGuest) {
      dispatch({ type: 'SET_PROJECTS', projects: loadGuestProjects() });
      dispatch({ type: 'SET_CURRENT', id: null });
      return;
    }

    dispatch({ type: 'RESET' });
  }, [user?.id, isAuthenticated, isGuest, passwordRecovery]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persist = useCallback((projects: Project[]) => {
    dispatch({ type: 'SET_SAVING', saving: true });
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const u = userRef.current;
      if (authRef.current && u && isSupabaseConfigured) {
        await upsertToSupabase(u.id, projects);
      } else if (guestRef.current) {
        saveGuestProjects(projects);
      }
      dispatch({ type: 'SET_SAVING', saving: false });
    }, 800);
  }, []);

  const currentProject = state.projects.find(p => p.id === state.currentProjectId) ?? null;

  const touch = useCallback((p: Project): Project => ({
    ...p,
    lastUpdated: nowISO(),
    progress: calcProgress(p),
  }), []);

  const addProject = useCallback((p: Project) => {
    dispatch({ type: 'ADD_PROJECT', project: p });
    persist([...state.projects, p]);
    dispatch({ type: 'SET_CURRENT', id: p.id });
  }, [state.projects, persist]);

  const deleteProject = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_PROJECT', id });
    const updated = state.projects.filter(p => p.id !== id);
    const u = userRef.current;
    if (isSupabaseConfigured && authRef.current && u) {
      await deleteFromSupabase(u.id, id);
    } else if (guestRef.current) {
      saveGuestProjects(updated);
    }
  }, [state.projects]);

  const openProject  = useCallback((id: string) => dispatch({ type: 'SET_CURRENT', id }), []);
  const closeProject = useCallback(() => dispatch({ type: 'SET_CURRENT', id: null }), []);

  const updateSection = useCallback((sectionKey: keyof Project['sections'], data: unknown) => {
    if (!currentProject) return;
    const updated = touch({
      ...currentProject,
      sections: { ...currentProject.sections, [sectionKey]: data },
    });
    dispatch({ type: 'UPDATE_PROJECT', project: updated });
    persist(state.projects.map(p => p.id === updated.id ? updated : p));
  }, [currentProject, state.projects, touch, persist]);

  const updateMeta = useCallback((fields: Partial<Pick<Project, 'name' | 'status' | 'phase'>>) => {
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
    persist(state.projects.map(p => p.id === withLog.id ? withLog : p));
  }, [currentProject, state.projects, touch, persist]);

  const bumpProjectVersion = useCallback((type: 'MAJOR' | 'MINOR' | 'PATCH', category: string, description: string, screens: string) => {
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
    persist(state.projects.map(p => p.id === updated.id ? updated : p));
  }, [currentProject, state.projects, touch, persist]);

  const addChangelogEntry = useCallback((entry: Omit<ChangelogEntry, 'id'>) => {
    if (!currentProject) return;
    const full: ChangelogEntry = { ...entry, id: uid() };
    const updated = touch({ ...currentProject, changelog: [full, ...currentProject.changelog] });
    dispatch({ type: 'UPDATE_PROJECT', project: updated });
    persist(state.projects.map(p => p.id === updated.id ? updated : p));
  }, [currentProject, state.projects, touch, persist]);

  const importGuest = async () => {
    if (!guestImport || !user) { setGuestImport(null); clearGuestProjects(); return; }
    const cloned = guestImport.map(p => ({ ...p, id: uid() }));
    const merged = [...cloned, ...remoteRef.current];
    remoteRef.current = merged;
    dispatch({ type: 'SET_PROJECTS', projects: merged });
    await upsertToSupabase(user.id, cloned);
    clearGuestProjects();
    setGuestImport(null);
  };

  const discardGuest = () => {
    clearGuestProjects();
    setGuestImport(null);
  };

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
      {guestImport && guestImport.length > 0 && (
        <ImportGuestModal
          count={guestImport.length}
          onImport={importGuest}
          onDiscard={discardGuest}
        />
      )}
    </Ctx.Provider>
  );
}

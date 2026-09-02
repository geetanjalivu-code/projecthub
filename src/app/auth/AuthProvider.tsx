import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, DbProfile } from '../lib/supabase';

const GUEST_KEY = 'uxHub_guest';

interface AuthCtx {
  user: User | null;
  profile: DbProfile | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  continueAsGuest: () => void;
  exitGuest: () => void;
  signOut: () => Promise<void>;
  updateProfile: (fields: Partial<Pick<DbProfile, 'display_name' | 'avatar_url'>>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

function profileFromUser(user: User): DbProfile {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    display_name: (meta.full_name || meta.name || meta.display_name || user.email?.split('@')[0] || 'Designer') as string,
    email: user.email ?? '',
    avatar_url: (meta.avatar_url || meta.picture || null) as string | null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === '1');

  const fetchProfile = async (u: User) => {
    const fallback = profileFromUser(u);
    setProfile(fallback);
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
    if (data) {
      setProfile(data as DbProfile);
      return;
    }
    await supabase.from('profiles').upsert({
      id: u.id,
      display_name: fallback.display_name,
      email: fallback.email,
      avatar_url: fallback.avatar_url,
      updated_at: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        localStorage.removeItem(GUEST_KEY);
        setIsGuest(false);
        fetchProfile(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        localStorage.removeItem(GUEST_KEY);
        setIsGuest(false);
        fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. You can continue as a guest.' };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    return { error: error?.message ?? null };
  };

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_KEY, '1');
    setIsGuest(true);
  };

  const exitGuest = () => {
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  };

  const signOut = async () => {
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (fields: Partial<Pick<DbProfile, 'display_name' | 'avatar_url'>>) => {
    if (!user) {
      setProfile(prev => (prev ? { ...prev, ...fields } : null));
      return;
    }
    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: fields.display_name ?? profile?.display_name ?? '',
      email: profile?.email ?? user.email ?? '',
      avatar_url: fields.avatar_url ?? profile?.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    });
    setProfile(prev => (prev ? { ...prev, ...fields } : { ...profileFromUser(user), ...fields }));
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error: error?.message ?? null };
  };

  const isAuthenticated = !!user;
  const authReady = isAuthenticated || isGuest;

  return (
    <Ctx.Provider value={{
      user, profile, session, loading, isGuest, isAuthenticated, authReady,
      signIn, signUp, signInWithGoogle, continueAsGuest, exitGuest,
      signOut, updateProfile, resetPassword,
    }}>
      {children}
    </Ctx.Provider>
  );
}
